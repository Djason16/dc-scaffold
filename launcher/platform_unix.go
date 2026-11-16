//go:build !windows

// macOS and Linux: the parts shared by both (PowerShell 7, PATH, browser window, terminal, language).
// What differs is in platform_darwin.go and platform_linux.go.
package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"syscall"
	"time"
)

const (
	windowWidth  = 1200
	windowHeight = 800
)

// PowerShell 7: in the PATH, or where its installers put it
func findPwsh() string {
	if path, err := exec.LookPath("pwsh"); err == nil {
		return path
	}
	for _, path := range []string{"/usr/local/bin/pwsh", "/opt/homebrew/bin/pwsh", "/usr/bin/pwsh", "/snap/bin/pwsh",
		"/opt/microsoft/powershell/7/pwsh", "/usr/local/microsoft/powershell/7/pwsh"} {
		if fileExists(path) {
			return path
		}
	}
	return ""
}

func powershell() (string, []string) {
	shell := findPwsh()
	if shell == "" {
		shell = "pwsh"
	}
	return shell, []string{"-NoProfile", "-NonInteractive"}
}

// PowerShell 7 missing: what to install, for this system
func runtimeProblem() string {
	if findPwsh() != "" {
		return ""
	}
	how := text("pwsh_linux")
	if runtime.GOOS == "darwin" {
		how = text("pwsh_mac")
	}
	return text("pwsh_missing", how)
}

// A program opened from the Finder or an application menu gets a short PATH (/usr/bin:/bin...): the PATH of the
// login shell of the user is added (Homebrew, nvm, ~/.local/bin...), then the usual folders of the tools
func prepareEnvironment() {
	var paths []string
	if os.Getenv("TERM") == "" {
		paths = append(paths, filepath.SplitList(loginShellPath())...)
	}
	paths = append(paths, filepath.SplitList(os.Getenv("PATH"))...)
	home, _ := os.UserHomeDir()
	paths = append(paths, "/opt/homebrew/bin", "/opt/homebrew/sbin", "/usr/local/bin", "/usr/bin", "/bin", "/usr/sbin", "/sbin",
		"/snap/bin", filepath.Join(home, ".local", "bin"))

	seen := map[string]bool{}
	var kept []string
	for _, path := range paths {
		if path == "" || seen[path] {
			continue
		}
		seen[path] = true
		if info, err := os.Stat(path); err == nil && info.IsDir() {
			kept = append(kept, path)
		}
	}
	os.Setenv("PATH", strings.Join(kept, string(os.PathListSeparator)))
}

// PATH printed by the login shell of the user (3 s at most, empty if it fails)
func loginShellPath() string {
	shell := os.Getenv("SHELL")
	if shell == "" {
		shell = "/bin/sh"
		if runtime.GOOS == "darwin" {
			shell = "/bin/zsh"
		}
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, shell, "-ilc", `printf '\n__DCS_PATH__%s__DCS_PATH__\n' "$PATH"`)
	cmd.WaitDelay = time.Second
	output, _ := cmd.Output()
	parts := strings.Split(string(output), "__DCS_PATH__")
	if len(parts) < 3 {
		return ""
	}
	return strings.TrimSpace(parts[len(parts)-2])
}

var (
	frenchOnce sync.Once
	french     bool
)

// French when the language of the session (LC_ALL, LC_MESSAGES, LANG) or, on macOS, of the system is French
func systemIsFrench() bool {
	frenchOnce.Do(func() {
		language := ""
		for _, name := range []string{"LC_ALL", "LC_MESSAGES", "LANG", "LANGUAGE"} {
			if value := os.Getenv(name); value != "" && value != "C" && value != "POSIX" && !strings.HasPrefix(value, "C.") {
				language = value
				break
			}
		}
		if language == "" {
			language = systemLanguage()
		}
		french = strings.HasPrefix(strings.ToLower(language), "fr")
	})
	return french
}

// The message in the terminal, and in a dialog box when there is a desktop
func showError(message string) {
	fmt.Fprintln(os.Stderr, message)
	errorDialog(message)
}

// The window: a Chromium browser (Chrome, Edge, Brave, Chromium) in application mode, with its own profile
// (window/ in userDataDir()) so it stays apart from the browsing of the user; otherwise a tab of the default browser.
// DCS_BROWSER: the browser to use (tests).
func openAppWindow(url, root string) error {
	browser := os.Getenv("DCS_BROWSER")
	if browser == "" {
		browser = findBrowser()
	}
	if browser == "" {
		return openWebPage(url)
	}
	args := []string{
		"--app=" + url,
		fmt.Sprintf("--window-size=%d,%d", windowWidth, windowHeight),
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-sync",
		"--disable-extensions",
		"--hide-crash-restore-bubble",
		"--disable-background-timer-throttling",
		"--disable-backgrounding-occluded-windows",
		"--disable-renderer-backgrounding",
		"--disable-features=Translate",
	}
	// A snap browser (Ubuntu) cannot write in the hidden folders of the home: its own profile then
	if real, _ := filepath.EvalSymlinks(browser); !strings.HasPrefix(real, "/snap/") && !strings.HasPrefix(browser, "/snap/") {
		args = append(args, "--user-data-dir="+filepath.Join(userDataDir(), "window"))
	}
	args = append(args, browserArgs()...)
	return startDetached(exec.Command(browser, args...))
}

// Starts a program without waiting for it (its end is collected in the background)
func startDetached(cmd *exec.Cmd) error {
	if err := cmd.Start(); err != nil {
		return err
	}
	go cmd.Wait()
	return nil
}

// Own process group, so cancel stops npm & co with the engine
func hideWindow(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
}

func killTree(cmd *exec.Cmd) {
	syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
}

// Started from a terminal (its keyboard is the input): the console version can ask its questions there
func consoleAvailable() bool {
	info, err := os.Stdin.Stat()
	return err == nil && info.Mode()&os.ModeCharDevice != 0
}

// The engine in this terminal, with its questions (--console, the dcscaffold command)
func runConsoleEngine(root string, args []string) int {
	shell, _ := powershell()
	cmd := exec.Command(shell, append([]string{"-NoProfile", "-File", enginePath(root)}, args...)...)
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			return exitErr.ExitCode()
		}
		return 1
	}
	return 0
}

// "Console version" button: the engine in a new terminal window, which stays open at the end (-NoExit)
func startConsoleEngine(root string) error {
	shell, _ := powershell()
	return openTerminal(root, []string{shell, "-NoProfile", "-NoExit", "-File", enginePath(root)})
}

// "Start" button: start.ps1 -Action D in a new terminal window (Docker, API and front start in their own windows)
func startProject(path string) error {
	shell, _ := powershell()
	return openTerminal(path, []string{shell, "-NoProfile", "-NoExit", "-File", filepath.Join(path, "start.ps1"), "-Action", "D"})
}

// Script run by the new terminal window: goes to the folder and runs the command (then deletes itself).
// A file instead of arguments: every terminal runs it the same way, whatever the spaces in the paths.
func terminalScript(dir string, command []string, extension string) (string, error) {
	quoted := make([]string, len(command))
	for i, part := range command {
		quoted[i] = shellQuote(part)
	}
	script := fmt.Sprintf("#!/bin/sh\nrm -f \"$0\"\ncd %s || exit 1\nexec %s\n", shellQuote(dir), strings.Join(quoted, " "))
	file, err := os.CreateTemp("", "dc-scaffold-*"+extension)
	if err != nil {
		return "", err
	}
	defer file.Close()
	if _, err := file.WriteString(script); err != nil {
		return "", err
	}
	return file.Name(), os.Chmod(file.Name(), 0o755)
}

// Text between single quotes for sh (a quote inside: close the quotes, escaped quote, open them again)
func shellQuote(value string) string {
	return "'" + strings.ReplaceAll(value, "'", `'\''`) + "'"
}

// Tests: DCS_PICK_RESULT is the folder "picked"
func canPickFolder() bool { return os.Getenv("DCS_PICK_RESULT") != "" || canPickFolderNative() }

func pickFolder(title, start string) (string, error) {
	if result := os.Getenv("DCS_PICK_RESULT"); result != "" {
		return result, nil
	}
	return pickFolderNative(title, start)
}

func openFolder(path string) error { return openPath(path) }
func openWebPage(url string) error { return openPath(url) }
func openInCode(path string) error {
	code := findCode()
	if code == "" {
		return errors.New("VS Code not found")
	}
	return startDetached(exec.Command(code, path))
}

// First existing file of a list ("" when none)
func firstExisting(paths ...string) string {
	for _, path := range paths {
		if fileExists(path) {
			return path
		}
	}
	return ""
}
