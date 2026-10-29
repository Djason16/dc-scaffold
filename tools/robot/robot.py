#!/usr/bin/env python3
"""Compatibility robot of DC Scaffold (run by .github/workflows/compatibility.yml every Monday).

    robot.py plan                     every stack to test, with the latest versions of its packages (JSON)
    robot.py infra-plan               PHP and MySQL of the Docker images: current and stable candidate (JSON)
    robot.py test <kind> <id> <out>   creates a project with this stack and checks it works
    robot.py infra-test <out>         checks the candidate PHP / MySQL: Docker images, a database query,
                                      every PHP back end (run with the candidate PHP)
    robot.py publish <results> <dist> [previous catalog.json]
                                      raises the validated versions, writes catalog.json + stacks.zip

How it works:
1. "plan" reads the "versions" of every stack.json and asks npm / Packagist for the latest versions.
   Stable only: a new major version is tested once its first release is at least STABLE_DAYS old.
2. "infra-plan" picks the stable versions of the Docker images (stacks/infra/versions.json):
   the latest MySQL LTS, the latest PHP out for at least PHP_STABLE_DAYS and still supported.
3. "test" creates a project with DC Scaffold (on Linux, with PowerShell) and checks it:
   build of the front (and its type check), start of the back end. A stack with a new major version is first tested
   with it (-UseLatest); if that fails, it is tested again with the version already validated.
   A back end that goes inside a front ("inside" of its stack.json, e.g. Nitro inside Nuxt) is also tested
   in that front ("combos/nuxt-nitro"): one build, then the site and /api answer.
4. "publish" raises "stable" in stack.json for every new major version that works (and the PHP /
   MySQL versions when "infra-test" passed), bumps stacks/version.txt when the stacks changed, and
   prepares the online catalog (catalog.json, stacks.zip).
   Broken stacks are listed in issue.md: the workflow opens a GitHub issue with it.
"""

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STACKS = ROOT / "stacks"
ENGINE = ROOT / "engine" / "dc-scaffold.ps1"
WORK = Path(os.environ.get("RUNNER_TEMP", "/tmp")) / "dcs-robot"
API_PORT = "8299"  # port of the back ends during the tests
STABLE_DAYS = 30  # a new major version waits this long after its first release (x.0.0 fixes)
PHP_STABLE_DAYS = 180  # a new PHP version waits 6 months
INFRA = STACKS / "infra" / "versions.json"


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------

def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def get_json(url):
    """JSON of a URL, None when it cannot be read"""
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            return json.load(response)
    except Exception:
        return None


def version_key(text):
    return [int(part) for part in re.findall(r"\d+", text)]


def major(text):
    return int(str(text).split(".")[0])


def latest_version(package, registry):
    """Latest stable version on npm or Packagist ("16.2.1"), None when unreachable"""
    if registry == "npm":
        data = get_json(f"https://registry.npmjs.org/{package}/latest")
        return data and data.get("version")
    data = get_json(f"https://repo.packagist.org/p2/{package}.json")
    if not data:
        return None
    versions = [v["version"].lstrip("v") for v in data["packages"].get(package, [])]
    versions = [v for v in versions if re.fullmatch(r"\d+\.\d+\.\d+", v)]
    return max(versions, key=version_key) if versions else None


def first_release_age(package, registry, major_version):
    """Days since the first stable release of a major version (x.0.0), None when unknown"""
    if registry == "npm":
        data = get_json(f"https://registry.npmjs.org/{package}")
        times = (data or {}).get("time", {})
        dates = [date for version, date in times.items()
                 if re.fullmatch(rf"{major_version}\.\d+\.\d+", version)]
    else:
        data = get_json(f"https://repo.packagist.org/p2/{package}.json")
        releases = (data or {}).get("packages", {}).get(package, [])
        dates = [r.get("time") for r in releases
                 if re.fullmatch(rf"v?{major_version}\.\d+\.\d+", r.get("version", "")) and r.get("time")]
    if not dates:
        return None
    first = min(datetime.fromisoformat(date.replace("Z", "+00:00")) for date in dates)
    return (datetime.now(timezone.utc) - first).days


def run(command, cwd, log, timeout=1500, env=None):
    """Runs a command, adds its output to the log, returns True when it worked"""
    with open(log, "a", encoding="utf-8") as out:
        out.write(f"\n$ {' '.join(command)}   (in {cwd})\n")
        out.flush()
        try:
            result = subprocess.run(command, cwd=cwd, stdout=out, stderr=subprocess.STDOUT,
                                    timeout=timeout, env={**os.environ, **(env or {})})
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError) as error:
            out.write(f"!! {error}\n")
            return False


def http_status(url, tries=30):
    """HTTP status of a URL (0 = nothing answers), retried while the server starts"""
    for _ in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=5) as response:
                return response.status
        except urllib.error.HTTPError as error:
            return error.code
        except Exception:
            time.sleep(1)
    return 0


# ---------------------------------------------------------------------------
# 1. plan
# ---------------------------------------------------------------------------

def plan():
    """One entry per stack: its packages, the validated version and the latest one"""
    entries = []
    for kind in ("fronts", "backs"):
        for stack_file in sorted(STACKS.glob(f"{kind}/*/stack.json")):
            stack_id = stack_file.parent.name
            # "onlyInside" ("API inside the site"): no project of its own, tested inside its fronts (combos)
            if stack_id == "none" or read_json(stack_file).get("onlyInside"):
                continue
            packages = []
            for entry in read_json(stack_file).get("versions", []):
                registry = entry.get("registry", "npm")
                latest = latest_version(entry["package"], registry)
                new_major = bool(latest) and major(latest) > major(entry["stable"])
                # Stable only: a new major version waits STABLE_DAYS after its first release
                age = first_release_age(entry["package"], registry, major(latest)) if new_major else None
                waiting = new_major and (age is None or age < STABLE_DAYS)
                packages.append({
                    "package": entry["package"],
                    "stable": str(entry["stable"]),
                    "latest": latest,
                    "newMajor": new_major and not waiting,
                    "waiting": waiting,
                })
            entries.append({
                "kind": kind,
                "id": stack_id,
                "packages": packages,
                "newMajor": any(p["newMajor"] for p in packages),
            })
    # Back ends inside a front (Nitro inside Nuxt): the pair is tested with the validated versions
    for stack_file in sorted(STACKS.glob("backs/*/stack.json")):
        for front in read_json(stack_file).get("inside", {}):
            if (STACKS / "fronts" / front / "stack.json").exists():
                entries.append({"kind": "combos", "id": f"{front}-{stack_file.parent.name}", "front": front,
                                "back": stack_file.parent.name, "packages": [], "newMajor": False})
    print(json.dumps(entries))


def infra_plan():
    """PHP and MySQL of the Docker images: the current versions and a stable candidate (or None)"""
    current = read_json(INFRA)
    today = datetime.now(timezone.utc).date()
    result = {"php": {"current": current["php"], "candidate": None},
              "mysql": {"current": current["mysql"], "candidate": None}}

    # PHP: the newest version out for PHP_STABLE_DAYS and still in active support
    cycles = get_json("https://endoflife.date/api/php.json") or []
    for cycle in sorted(cycles, key=lambda c: version_key(c["cycle"]), reverse=True):
        released = datetime.fromisoformat(cycle["releaseDate"]).date()
        support = cycle.get("support")
        supported = support is True or (isinstance(support, str) and datetime.fromisoformat(support).date() > today)
        if (today - released).days >= PHP_STABLE_DAYS and supported:
            if version_key(cycle["cycle"]) > version_key(current["php"]):
                result["php"]["candidate"] = cycle["cycle"]
            break

    # MySQL: the newest LTS (long-term support) version
    cycles = get_json("https://endoflife.date/api/mysql.json") or []
    lts = [c["cycle"] for c in cycles if c.get("lts") is True]
    if lts:
        newest = max(lts, key=version_key)
        if version_key(newest) > version_key(current["mysql"]):
            result["mysql"]["candidate"] = newest

    result["change"] = bool(result["php"]["candidate"] or result["mysql"]["candidate"])
    print(json.dumps(result))


# ---------------------------------------------------------------------------
# 2. test
# ---------------------------------------------------------------------------

def create_project(kind, stack_id, use_latest, log):
    """Creates a project with DC Scaffold, returns its folder (None when the creation failed)"""
    name = f"robot-{stack_id}" + ("-latest" if use_latest else "")
    WORK.mkdir(parents=True, exist_ok=True)
    shutil.rmtree(WORK / name, ignore_errors=True)
    if kind == "combos":
        front, back = stack_id.split("-", 1)
        choice = ["-Front", front, "-Back", back, "-Database", "sqlite", "-Languages", "fr,en"]
    elif kind == "fronts":
        choice = ["-Front", stack_id, "-Back", "none", "-Languages", "fr,en"]
    else:
        database = "mysql" if read_json(STACKS / kind / stack_id / "stack.json").get("database") is True else "sqlite"
        choice = ["-Front", "none", "-Back", stack_id, "-Database", database, "-Languages", "fr", "-ApiPort", API_PORT]
    command = ["pwsh", "-NoProfile", "-File", str(ENGINE), "-Lang", "en", "-Name", name,
               "-Destination", str(WORK), *choice, "-SkipToolCheck", "-NoGit", "-Force"]
    if use_latest:
        command.append("-UseLatest")
    return WORK / name if run(command, ROOT, log) else None


def check_front(stack_id, project, log):
    """The front builds (SvelteKit and Svelte pass svelte-check, Angular passes the TypeScript check of VS Code; Qwik checks its types while it builds)"""
    frontend = project / "frontend"
    package = frontend / "package.json"
    if not package.exists():
        return True  # HTML/CSS/JS: nothing to build
    scripts = read_json(package).get("scripts", {})
    script = "generate" if stack_id == "nuxt" else "build"
    if script in scripts and not run(["npm", "run", script], frontend, log):
        return False
    if stack_id in ("sveltekit", "svelte"):
        return run(["npx", "svelte-check", "--threshold", "error"], frontend, log)
    if stack_id == "angular":
        # Same check as VS Code (it shows these errors even when the build works)
        ok = run(["npx", "tsc", "-p", "tsconfig.app.json"], frontend, log)
        shutil.rmtree(frontend / "out-tsc", ignore_errors=True)
        return ok
    return True


def check_back(stack_id, project, log):
    """The back end starts: PHP framework console, or a server that answers"""
    backend = project / "backend"
    runtime = read_json(STACKS / "backs" / stack_id / "stack.json").get("runtime")
    if stack_id == "laravel":
        return run(["php", "artisan", "about"], backend, log)
    if stack_id == "symfony":
        return run(["php", "bin/console", "about"], backend, log) and run(["php", "bin/console", "lint:container"], backend, log)

    if runtime == "php":
        command, url = ["php", "-S", "127.0.0.1:8199", "-t", "public"], "http://127.0.0.1:8199/"
        good = lambda status: 0 < status < 500  # base route without MySQL
    else:
        if (backend / "package.json").exists() and "build" in read_json(backend / "package.json").get("scripts", {}):
            if not run(["npm", "run", "build"], backend, log):
                return False
        command, url = ["npm", "run", "dev"], f"http://127.0.0.1:{API_PORT}/"
        good = lambda status: status > 0  # the server answers

    with open(log, "a", encoding="utf-8") as out:
        server = subprocess.Popen(command, cwd=backend, stdout=out, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        status = http_status(url)
        with open(log, "a", encoding="utf-8") as out:
            out.write(f"\nGET {url} -> {status}\n")
        return good(status)
    finally:
        os.killpg(server.pid, 9)


def check_inside(stack_id, project, log):
    """Back end inside the front: one build, then "npm start" (the server online) answers the site and /api"""
    frontend = project / "frontend"
    if not run(["npm", "run", "build"], frontend, log):
        return False
    # Same type check as the front alone (SvelteKit: svelte-check), the API code included
    if stack_id.startswith("sveltekit-") and not run(["npx", "svelte-check", "--threshold", "error"], frontend, log):
        return False
    with open(log, "a", encoding="utf-8") as out:
        server = subprocess.Popen(["npm", "start"], cwd=frontend, stdout=out,
                                  stderr=subprocess.STDOUT, start_new_session=True, env={**os.environ, "PORT": API_PORT})
    try:
        site = http_status(f"http://127.0.0.1:{API_PORT}/")
        api_body = ""
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{API_PORT}/api", timeout=5) as response:
                api_body = response.read().decode()
        except Exception as error:
            api_body = f"!! {error}"
        with open(log, "a", encoding="utf-8") as out:
            out.write(f"\nGET / -> {site}\nGET /api -> {api_body[:300]}\n")
        return site == 200 and '"success":true' in "".join(api_body.split())
    finally:
        os.killpg(server.pid, 9)


def test(kind, stack_id, out):
    """Tests a stack, writes its result (JSON) to "out" and its log next to it"""
    entry = next(e for e in json.loads(os.environ.get("ROBOT_PLAN", "[]")) if e["kind"] == kind and e["id"] == stack_id) \
        if os.environ.get("ROBOT_PLAN") else {"kind": kind, "id": stack_id, "packages": [], "newMajor": False}
    log = Path(out).with_suffix(".log")
    log.parent.mkdir(parents=True, exist_ok=True)  # results/ does not exist in a fresh checkout
    log.write_text("", encoding="utf-8")
    check = {"fronts": check_front, "combos": check_inside}.get(kind, check_back)

    def works(use_latest):
        project = create_project(kind, stack_id, use_latest, log)
        return bool(project) and check(stack_id, project, log)

    result = {**entry, "latestWorks": None, "stableWorks": None}
    if entry["newMajor"]:
        result["latestWorks"] = works(True)
    if not result["latestWorks"]:
        result["stableWorks"] = works(False)
    Path(out).write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result))


# Test controller added to a Slim project: a real query on MySQL, through the PHP Docker image
ROBOT_CONTROLLER = """<?php

namespace App\\Controllers;

use App\\Helper\\ResponseHelper;
use Psr\\Http\\Message\\ResponseInterface as Response;
use Psr\\Http\\Message\\ServerRequestInterface as Request;

class RobotController extends Controller
{
    public function getAll(Request $request, Response $response): Response
    {
        return ResponseHelper::success($response, $this->fetchOne('SELECT VERSION() AS mysql, 1 + 1 AS two'));
    }
}
"""


def write_infra(versions):
    """Writes PHP / MySQL versions into stacks/infra/versions.json (formatting kept)"""
    text = INFRA.read_text(encoding="utf-8")
    for name, value in versions.items():
        text = re.sub(rf'("{name}"\s*:\s*")[^"]+(")', rf"\g<1>{value}\g<2>", text)
    INFRA.write_text(text, encoding="utf-8")


def infra_test(out):
    """Candidate PHP / MySQL: Docker images of a Slim project, a query on MySQL, every PHP back end"""
    infra = json.loads(os.environ["ROBOT_INFRA"])
    log = Path(out).with_suffix(".log")
    log.parent.mkdir(parents=True, exist_ok=True)  # results/ does not exist in a fresh checkout
    log.write_text("", encoding="utf-8")
    original = INFRA.read_text(encoding="utf-8")
    php = infra["php"]["candidate"] or infra["php"]["current"]
    mysql = infra["mysql"]["candidate"] or infra["mysql"]["current"]
    result = {"infra": True, "php": infra["php"], "mysql": infra["mysql"], "dockerWorks": False, "backs": {}}
    try:
        write_infra({"php": php, "mysql": mysql})

        # 1. Slim project with MySQL in Docker: build, start, query
        project = create_project("backs", "slim", False, log)
        if project:
            (project / "backend" / "src" / "Controllers" / "RobotController.php").write_text(ROBOT_CONTROLLER, encoding="utf-8")
            compose = ["docker", "compose"]
            if run(compose + ["up", "-d", "--build", "--wait"], project, log, timeout=1800):
                # Until MySQL really answers: an error (500 while MySQL finishes its first start) is tried again
                body = ""
                for _ in range(30):
                    try:
                        with urllib.request.urlopen(f"http://127.0.0.1:{API_PORT}/robot", timeout=5) as response:
                            body = response.read().decode()
                    except urllib.error.HTTPError as error:
                        body = error.read().decode(errors="replace")
                    except Exception:
                        body = ""
                    if '"two"' in body:
                        break
                    time.sleep(2)
                with open(log, "a", encoding="utf-8") as file:
                    file.write(f"\nGET /robot -> {body}\n")
                result["dockerWorks"] = mysql in body and '"two"' in body
            run(compose + ["down", "-v"], project, log)

        # 2. Every PHP back end, with the candidate PHP of the runner
        for stack_id in ("slim", "laravel", "symfony", "php"):
            project = create_project("backs", stack_id, False, log)
            result["backs"][stack_id] = bool(project) and check_back(stack_id, project, log)
    finally:
        INFRA.write_text(original, encoding="utf-8")

    result["works"] = result["dockerWorks"] and all(result["backs"].values())
    Path(out).write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result))


# ---------------------------------------------------------------------------
# 3. publish
# ---------------------------------------------------------------------------

def raise_stable(stack_file, package, latest):
    """"stable" of a package in stack.json -> the new major (or major.minor if the stack uses one)"""
    raw = stack_file.read_bytes()
    bom = raw.startswith(b"\xef\xbb\xbf")
    text = raw.decode("utf-8-sig")  # line breaks kept as they are
    pattern = re.compile(r'("package"\s*:\s*"' + re.escape(package) + r'".*?"stable"\s*:\s*")([^"]+)(")', re.DOTALL)
    match = pattern.search(text)
    if not match:
        return None
    old = match.group(2)
    new = ".".join(latest.split(".")[:2]) if "." in old else latest.split(".")[0]
    text = text[:match.start(2)] + new + text[match.end(2):]
    stack_file.write_bytes((b"\xef\xbb\xbf" if bom else b"") + text.encode("utf-8"))
    return old, new


def stacks_hash():
    """Fingerprint of the stacks (every file except version.txt)"""
    digest = hashlib.sha256()
    for path in sorted(p for p in STACKS.rglob("*") if p.is_file() and p.name != "version.txt"):
        digest.update(str(path.relative_to(STACKS)).encode())
        digest.update(path.read_bytes())
    return digest.hexdigest()


def next_version(current):
    """2026.10.19.1 -> 2026.10.26.1, or 2026.10.19.2 the same day"""
    today = datetime.now(timezone.utc)
    base = f"{today.year}.{today.month}.{today.day}"
    if current.startswith(base + "."):
        return f"{base}.{int(current.split('.')[-1]) + 1}"
    return f"{base}.1"


def publish(results_dir, dist, previous_catalog=None):
    results = [read_json(p) for p in sorted(Path(results_dir).rglob("*.json"))]
    dist = Path(dist)
    dist.mkdir(parents=True, exist_ok=True)
    changes, broken = [], []

    for result in results:
        if result.get("infra"):
            candidates = {name: result[name]["candidate"] for name in ("php", "mysql") if result[name]["candidate"]}
            names = ", ".join(f"{name.upper()} {value}" for name, value in candidates.items())
            if result.get("works"):
                write_infra(candidates)
                changes.append(f"- Docker images: {names}")
            else:
                failed = [stack for stack, works in result["backs"].items() if not works]
                why = "the Docker images do not start" if not result["dockerWorks"] else "broken: " + ", ".join(failed)
                broken.append(f"- **Docker images** ({names}): not used yet, {why}. "
                              f"DC Scaffold stays on the current versions.")
            continue
        stack_file = STACKS / result["kind"] / result["id"] / "stack.json"
        if result.get("latestWorks"):
            for package in result["packages"]:
                if package["newMajor"]:
                    change = raise_stable(stack_file, package["package"], package["latest"])
                    if change:
                        changes.append(f"- {result['id']}: {package['package']} {change[0]} -> {change[1]}")
        elif result.get("newMajor") and result.get("stableWorks"):
            new = ", ".join(f"{p['package']} {p['latest']}" for p in result["packages"] if p["newMajor"])
            broken.append(f"- **{result['id']}**: the new major version does not work yet ({new}); "
                          f"DC Scaffold stays on the validated version, which still works.")
        if result.get("stableWorks") is False:
            broken.append(f"- **{result['id']}**: does not work, even with the validated version. "
                          f"To fix quickly: see the log of the job \"{result['kind']}/{result['id']}\".")

    # New version of the stacks when they changed since the last catalog (catalog.json of the last run)
    version_file = STACKS / "version.txt"
    version = version_file.read_text(encoding="utf-8").strip()
    previous = read_json(previous_catalog) if previous_catalog and Path(previous_catalog).exists() else {}
    fingerprint = stacks_hash()
    if previous.get("hash") != fingerprint:  # also the first catalog (no previous one)
        if not changes:
            changes.append("- stacks changed in the repository")
        version = next_version(max(version, previous.get("version", version), key=version_key))
        version_file.write_text(version + "\n", encoding="utf-8")

    # stacks.zip: the whole stacks/ folder
    zip_path = dist / "stacks.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(p for p in STACKS.rglob("*") if p.is_file()):
            archive.write(path, "stacks/" + str(path.relative_to(STACKS)).replace(os.sep, "/"))
    sha256 = hashlib.sha256(zip_path.read_bytes()).hexdigest()

    repository = os.environ.get("GITHUB_REPOSITORY", "owner/repo")
    catalog = {
        "version": version,
        "minApp": (ROOT / "VERSION").read_text(encoding="utf-8").strip(),
        "hash": fingerprint,
        "stacks": {"url": f"https://github.com/{repository}/releases/download/catalog/stacks.zip", "sha256": sha256},
    }
    (dist / "catalog.json").write_text(json.dumps(catalog, indent=2, ensure_ascii=False), encoding="utf-8")

    waiting = sorted({f"{p['package']} {p['latest']}" for r in results if not r.get("infra")
                      for p in r.get("packages", []) if p.get("waiting")})
    if waiting:
        changes.append(f"- waiting to be stable ({STABLE_DAYS} days after their first release): " + ", ".join(waiting))
    summary = [f"Stacks {version}"] + (changes or ["- no change"])
    (dist / "summary.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
    if broken:
        (dist / "issue.md").write_text(
            "The compatibility robot found stacks that do not work with the latest versions:\n\n"
            + "\n".join(broken) + "\n\nThe stacks that work were published as usual.\n", encoding="utf-8")
    print("\n".join(summary + broken))


if __name__ == "__main__":
    command, args = (sys.argv[1], sys.argv[2:]) if len(sys.argv) > 1 else ("", [])
    if command == "plan":
        plan()
    elif command == "infra-plan":
        infra_plan()
    elif command == "infra-test" and len(args) == 1:
        infra_test(*args)
    elif command == "test" and len(args) == 3:
        test(*args)
    elif command == "publish" and len(args) in (2, 3):
        publish(*args)
    else:
        print(__doc__)
        sys.exit(1)
