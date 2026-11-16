// macOS: browsers in /Applications, folder picker and dialogs of AppleScript (osascript), Terminal, open
package main

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// Applications folders: the one of the computer, then the one of the user
func applicationFolders() []string {
	home, _ := os.UserHomeDir()
	return []string{"/Applications", filepath.Join(home, "Applications")}
}

// The program inside a Chromium browser bundle (started directly: its own profile, application mode)
func findBrowser() string {
	apps := [][2]string{
		{"Google Chrome.app", "Google Chrome"},
		{"Microsoft Edge.app", "Microsoft Edge"},
		{"Brave Browser.app", "Brave Browser"},
		{"Chromium.app", "Chromium"},
	}
	for _, app := range apps {
		for _, folder := range applicationFolders() {
			if path := filepath.Join(folder, app[0], "Contents", "MacOS", app[1]); fileExists(path) {
				return path
			}
		}
	}
	return ""
}

func browserArgs() []string { return nil }

func openPath(path string) error { return startDetached(exec.Command("open", path)) }

// "code" in the PATH, or the command line inside Visual Studio Code.app
func findCode() string {
	if path, err := exec.LookPath("code"); err == nil {
		return path
	}
	var candidates []string
	for _, folder := range applicationFolders() {
		candidates = append(candidates, filepath.Join(folder, "Visual Studio Code.app", "Contents", "Resources", "app", "bin", "code"))
	}
	return firstExisting(candidates...)
}

// A new Terminal window: a .command file opened by Terminal (no permission to ask, unlike AppleScript)
func openTerminal(dir string, command []string) error {
	script, err := terminalScript(dir, command, ".command")
	if err != nil {
		return err
	}
	return startDetached(exec.Command("open", "-a", "Terminal", script))
}

func canOpenTerminal() bool { return true }

// AppleScript run with arguments (never written into the script: no quote to escape)
func runAppleScript(lines []string, args ...string) (string, error) {
	command := []string{}
	for _, line := range lines {
		command = append(command, "-e", line)
	}
	output, err := exec.Command("osascript", append(command, args...)...).Output()
	return strings.TrimSpace(string(output)), err
}

func canPickFolderNative() bool { return true }

// Folder picker of the Finder, in front of the window. Cancelled: "" without error.
func pickFolderNative(title, start string) (string, error) {
	if info, err := os.Stat(start); err != nil || !info.IsDir() {
		start = ""
	}
	path, err := runAppleScript([]string{
		"on run argv",
		"activate",
		"try",
		"if item 2 of argv is \"\" then",
		"set picked to choose folder with prompt (item 1 of argv)",
		"else",
		"set picked to choose folder with prompt (item 1 of argv) default location (POSIX file (item 2 of argv))",
		"end if",
		"return POSIX path of picked",
		"on error number -128",
		"return \"\"",
		"end try",
		"end run",
	}, title, start)
	if err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) && len(exitErr.Stderr) > 0 {
			return "", errors.New(strings.TrimSpace(string(exitErr.Stderr)))
		}
		return "", err
	}
	if len(path) > 1 {
		path = strings.TrimSuffix(path, "/")
	}
	return path, nil
}

// Language of macOS: first preferred language (AppleLanguages), otherwise the region (AppleLocale)
func systemLanguage() string {
	if output, err := exec.Command("defaults", "read", "-g", "AppleLanguages").Output(); err == nil {
		for _, line := range strings.Split(string(output), "\n") {
			value := strings.Trim(strings.TrimSpace(line), `",()`)
			if value != "" {
				return value
			}
		}
	}
	output, _ := exec.Command("defaults", "read", "-g", "AppleLocale").Output()
	return strings.TrimSpace(string(output))
}

func errorDialog(message string) {
	runAppleScript([]string{
		"on run argv",
		"display dialog (item 1 of argv) with title \"" + productName + "\" buttons {\"OK\"} default button 1 with icon stop",
		"end run",
	}, message)
}
