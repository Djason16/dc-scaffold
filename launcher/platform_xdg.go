//go:build !windows && !darwin

// Linux (and the other Unix systems with a freedesktop desktop): browsers and terminals of the PATH, zenity / kdialog, xdg-open
package main

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// Chromium browsers, as their packages name them
func findBrowser() string {
	for _, name := range []string{"google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
		"microsoft-edge", "microsoft-edge-stable", "brave-browser", "brave"} {
		if path, err := exec.LookPath(name); err == nil {
			return path
		}
	}
	return ""
}

// Name of the window for the desktop (StartupWMClass of dc-scaffold.desktop): the icon of DC Scaffold in the dock
func browserArgs() []string { return []string{"--class=DCScaffold"} }

func openPath(path string) error { return startDetached(exec.Command("xdg-open", path)) }

func findCode() string {
	if path, err := exec.LookPath("code"); err == nil {
		return path
	}
	home, _ := os.UserHomeDir()
	return firstExisting("/usr/share/code/bin/code", "/snap/bin/code", "/var/lib/flatpak/exports/bin/com.visualstudio.code",
		filepath.Join(home, ".local", "share", "flatpak", "exports", "bin", "com.visualstudio.code"))
}

// Terminals and the option that runs a command in them. The default terminal of the system first (Debian, Ubuntu).
var terminals = [][2]string{
	{"x-terminal-emulator", "-e"},
	{"gnome-terminal", "--"},
	{"kgx", "--"},
	{"konsole", "-e"},
	{"xfce4-terminal", "-x"},
	{"mate-terminal", "-x"},
	{"tilix", "-e"},
	{"terminator", "-x"},
	{"alacritty", "-e"},
	{"kitty", ""},
	{"foot", ""},
	{"xterm", "-e"},
}

func findTerminal() (string, string) {
	for _, terminal := range terminals {
		if path, err := exec.LookPath(terminal[0]); err == nil {
			return path, terminal[1]
		}
	}
	return "", ""
}

func canOpenTerminal() bool {
	path, _ := findTerminal()
	return path != ""
}

// A new terminal window running the command (a script file: one argument, the same for every terminal)
func openTerminal(dir string, command []string) error {
	terminal, option := findTerminal()
	if terminal == "" {
		return errors.New("terminal not found")
	}
	script, err := terminalScript(dir, command, ".sh")
	if err != nil {
		return err
	}
	args := []string{script}
	if option != "" {
		args = []string{option, script}
	}
	cmd := exec.Command(terminal, args...)
	cmd.Dir = dir
	return startDetached(cmd)
}

func canPickFolderNative() bool {
	for _, name := range []string{"zenity", "kdialog"} {
		if _, err := exec.LookPath(name); err == nil {
			return true
		}
	}
	return false
}

// Folder picker of the desktop: zenity (GNOME...), otherwise kdialog (KDE). Cancelled: "" without error.
func pickFolderNative(title, start string) (string, error) {
	if info, err := os.Stat(start); err != nil || !info.IsDir() {
		start, _ = os.UserHomeDir()
	}
	var cmd *exec.Cmd
	if path, err := exec.LookPath("zenity"); err == nil {
		cmd = exec.Command(path, "--file-selection", "--directory", "--title="+title, "--filename="+strings.TrimSuffix(start, "/")+"/")
	} else if path, err := exec.LookPath("kdialog"); err == nil {
		cmd = exec.Command(path, "--title", title, "--getexistingdirectory", start)
	} else {
		return "", errors.New("folder picker not found")
	}
	output, err := cmd.Output()
	var exitErr *exec.ExitError
	if errors.As(err, &exitErr) && exitErr.ExitCode() == 1 {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(output)), nil
}

// Linux: the language comes from the environment only (LANG...)
func systemLanguage() string { return "" }

func errorDialog(message string) {
	if path, err := exec.LookPath("zenity"); err == nil {
		exec.Command(path, "--error", "--no-markup", "--title="+productName, "--text="+message).Run()
	} else if path, err := exec.LookPath("kdialog"); err == nil {
		exec.Command(path, "--title", productName, "--error", message).Run()
	}
}
