"""Writes stacks/backs/site/stack.json ("API inside the site": the API in the server of Next.js, SvelteKit, Astro or Qwik).
The steps shared by every front are written once here: python tools/stacks/site_stack.py"""
import json
from pathlib import Path

STACK = Path(__file__).resolve().parents[2] / "stacks" / "backs" / "site" / "stack.json"
DB_SQLITE = {"DB_CONNECTION": "sqlite", "DB_HOST": "", "DB_NAME": "", "DB_USER": "", "DB_PASS": "", "DB_PORT": ""}

# Address of the API for api.js: same site; on the server (first display of a page) the full local address
# The folder of a qualif (QUALIF_BASE_PATH on the server, Reflect.get(globalThis, '__QUALIF_BASE__') in the browser), empty in dev and online
SERVER_BASE = "(typeof window === 'undefined' ? `http://localhost:${process.env.PORT ?? {{APP_PORT}}}${process.env.QUALIF_BASE_PATH ?? ''}` : (Reflect.get(globalThis, '__QUALIF_BASE__') ?? '')) + '/api'"


def common(dir):
    """Core of the API (controllers, helpers, router), settings and MySQL driver, in frontend/<dir>"""
    return [
        {"copy": "core", "to": dir},
        {"copy": "@shared/js-core", "to": dir},
        {"copy": "env"},
        *({"env": {"file": f, "values": DB_SQLITE}, "when": "noDb"} for f in (".env", ".env.production", ".env.preprod", ".env.example")),
        {"npm": {"set": {"dependencies.mysql2": "^3.24.0"}}},
    ]


def inside(front, label, dir, entry, steps, online, versions=(), api=None):
    return {
        "dir": dir,
        "label": {"fr": "API dans le site", "en": "API inside the site"},
        "message": {
            "fr": f"API dans le site : l'API est rangée dans frontend/{dir}/ et répond sous /api, avec le serveur de {label}. Un seul dossier, un seul serveur à lancer et à mettre en ligne (hébergement Node.js).",
            "en": f"API inside the site: the API goes into frontend/{dir}/ and answers under /api, with the server of {label}. One folder, one server to start and to put online (Node.js host).",
        },
        "versions": list(versions),
        "api": {"base": SERVER_BASE, "source": "same site, under /api",
                "usage": "Same site: api.get('/products') calls /api/products.", **(api or {})},
        "steps": common(dir) + [{"copy": f"inside/{front}/files"}, {"copy": "@shared/node-start"}] + steps,
        "guide": {"entry": entry},
        "online": online,
        "doc": f"inside/{front}/doc.md",
    }


def online(fr_build, en_build):
    return {
        "fr": f"Site + API : `start.bat` puis `B` ({fr_build}), envoie `frontend/` sur un hébergement Node.js 22.13+ et lance `npm start`",
        "en": f"Site + API: `start.bat` then `B` ({en_build}), upload `frontend/` to a Node.js 22.13+ host and run `npm start`",
    }


stack = {
    "label": {"fr": "API dans le site", "en": "API inside the site"},
    "order": 70,
    "description": {
        "fr": "L'API rangée dans le site lui-même (Next.js, SvelteKit, Astro, Qwik) : un seul projet, un seul serveur",
        "en": "The API placed inside the site itself (Next.js, SvelteKit, Astro, Qwik): one project, one server",
    },
    "requires": ["node", "docker"],
    "runtime": "node",
    "database": "optional",
    "noDatabase": {"fr": "Les données dans un simple fichier, rien à installer", "en": "The data in a plain file, nothing to install"},
    "fallbackDatabase": "SQLite",
    "nodeEngine": ">=22.13.0",
    # Only with a front that has its own server: offered with those fronts only
    "onlyInside": True,
    "controllers": "controllers",
    "controllerExt": "js",
    "guide": {
        "helpers": ".",
        "middleware": "handler.js",
        "envDev": ".env",
        "envProd": ".env.production",
        "custom": "static routes = { markShipped: ['POST', '/{id}/mark-shipped'] }",
        "success": "ResponseHelper.success({ products })",
        "body": "await this.body(request)",
        "missing": "RequestHelper.missing(data, ['name', 'price'])",
        "db": "await this.fetchAll('SELECT * FROM products WHERE active = ?', [1])",
    },
    "inside": {
        "sveltekit": inside(
            "sveltekit", "SvelteKit", "src/lib/server", "../../routes/api/[...path]/+server.js",
            versions=[{"package": "@sveltejs/adapter-node", "registry": "npm", "stable": "6", "token": "V_SVELTE_ADAPTER_NODE"}],
            api={"imports": "import { dev } from '$app/env'"},
            steps=[
                # Node.js server instead of a static site: the pages stay prerendered, /api answers on each request
                # sitemap.xml: a prerendered route (src/routes/sitemap.xml), the Node.js server only serves the files of the build
                # server.js (inside/sveltekit/files): www. redirect and security headers in front of build/handler.js
                {"npm": {"delete": ["devDependencies.@sveltejs/adapter-static", "scripts.postbuild"],
                         "set": {"devDependencies.@sveltejs/adapter-node": "^{{V_SVELTE_ADAPTER_NODE}}",
                                 "scripts.start": "node --disable-warning=ExperimentalWarning --env-file=.env.production server.js"}}},
                {"remove": ["scripts/sitemap.mjs"]},
                {"replace": {"file": "vite.config.js", "find": "@sveltejs/adapter-static", "with": "@sveltejs/adapter-node"}},
                {"replace": {"file": "vite.config.js", "find": r"adapter: adapter\(\{ fallback: '200.html' \}\)", "with": "adapter: adapter()"}},
            ],
            online=online("pages et API compilées dans `frontend/build`", "pages and API built into `frontend/build`"),
        ),
        "astro": inside(
            "astro", "Astro", "src/server", "../pages/api/[...path].js",
            versions=[{"package": "@astrojs/node", "registry": "npm", "stable": "11", "token": "V_ASTRO_NODE"}],
            steps=[
                # Node.js adapter: the pages stay prerendered (dist/client), /api answers on each request (dist/server)
                {"npm": {"set": {"dependencies.@astrojs/node": "^{{V_ASTRO_NODE}}",
                                 "scripts.start": "node --disable-warning=ExperimentalWarning --env-file=.env.production dist/server/entry.mjs",
                                 "scripts.postbuild": "node scripts/sitemap.mjs dist/client --pages src/pages"}}},
                {"replace": {"file": "astro.config.mjs", "find": r"import \{ defineConfig \} from 'astro/config'",
                             "with": "import node from '@astrojs/node'\nimport { defineConfig } from 'astro/config'"}},
                # The comment above defineConfig (already in the language of the project): replaced by its position
                {"replace": {"file": "astro.config.mjs", "find": r"(?m)^//[^\n]*\n(?=export default defineConfig)",
                             "with": "// Pages prerendered in dist/client, the API (src/pages/api) answered by the Node.js server (dist/server)\n"}},
                # /api/products and /api/products/ both reach the API (the links of the site keep their final /)
                {"replace": {"file": "astro.config.mjs", "find": "trailingSlash: 'always',",
                             "with": "trailingSlash: 'ignore',\n    adapter: node({ mode: 'standalone' }),"}},
                # The Node.js server of Astro listens on localhost only by default: online (npm start), every address
                {"insert": {"file": ".env.production", "after": r"APP_NAME=[^\n]*",
                            "text": "# Server of the site online (npm start): listens on every address of the host\nHOST=0.0.0.0"}},
            ],
            online=online("pages et API compilées dans `frontend/dist`", "pages and API built into `frontend/dist`"),
        ),
        "next": inside(
            "next", "Next.js", "server", "../app/api/[[...path]]/route.js",
            steps=[
                # Node.js server (next start) instead of the static export of out/
                {"replace": {"file": "next.config.mjs", "find": r"(?m)^ *//[^\n]*\n *//[^\n]*\n *output: 'export',\n",
                             "with": "    // Node.js server (npm start): the pages and the API (app/api) together\n"}},
                {"replace": {"file": "next.config.mjs", "find": r"trailingSlash: true,",
                             "with": "trailingSlash: true,\n    // /api/products and /api/products/ both reach the API, without a redirect\n    skipTrailingSlashRedirect: true,"}},
                # Security headers on every page and answer, www. -> address without www. (the server of Next.js does both)
                {"replace": {"file": "next.config.mjs", "find": r"(?m)^/\*\* @type",
                             "with": "import { SecurityHelper } from './server/SecurityHelper.js'\n\n/** @type"}},
                {"replace": {"file": "next.config.mjs", "find": r"images: \{ unoptimized: true \},",
                             "with": "images: { unoptimized: true },\n"
                                     "    // Security headers on every page and every answer of the API (server/SecurityHelper.js)\n"
                                     "    async headers() {\n"
                                     "        return [{ source: '/:path*', headers: Object.entries(SecurityHelper.headers(true)).map(([key, value]) => ({ key, value })) }]\n"
                                     "    },\n"
                                     "    // www.my-site.com -> my-site.com (path kept): not every host does it, the site does it itself\n"
                                     "    async redirects() {\n"
                                     "        return [\n"
                                     "            { source: '/:path*', has: [{ type: 'host', value: 'www[.](?<host>.+)' }], destination: 'https://:host/:path*', permanent: true },\n"
                                     "            { source: '/:path*', has: [{ type: 'header', key: 'x-forwarded-host', value: 'www[.](?<host>.+)' }], destination: 'https://:host/:path*', permanent: true },\n"
                                     "        ]\n"
                                     "    },"}},
                {"npm": {"set": {"scripts.start": "next start",
                                 "scripts.postbuild": "node scripts/sitemap.mjs .next/server/pages --pages pages --to public"}}},
            ],
            online=online("pages et API compilées dans `frontend/.next`", "pages and API built into `frontend/.next`"),
        ),
        "qwik": inside(
            "qwik", "Qwik", "src/server", "../routes/api/[...path]/index.ts",
            steps=[
                # Node.js server adapter instead of the static one: the pages stay prerendered in dist/
                {"remove": ["adapters/static"]},
                {"npm": {"set": {"scripts[build.server]": "qwik check-client src dist && vite build -c adapters/node-server/vite.config.ts",
                                 "scripts.postbuild": "node scripts/sitemap.mjs dist --pages src/routes",
                                 "scripts.start": "node --disable-warning=ExperimentalWarning --env-file=.env.production server/entry.node-server.js"}}},
            ],
            online=online("pages et API compilées dans `frontend/dist` et `frontend/server`",
                          "pages and API built into `frontend/dist` and `frontend/server`"),
        ),
    },
}

STACK.write_text(json.dumps(stack, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"written: {STACK}")
