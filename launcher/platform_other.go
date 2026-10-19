//go:build !windows

// Development on Linux / macOS (DC Scaffold itself is a Windows program): same server and window,
// shown in the browser given by DCS_BROWSER, engine run with pwsh.
package main

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"syscall"
)

func powershell() (string, []string) {
	return "pwsh", []string{"-NoProfile", "-NonInteractive"}
}

func systemIsFrench() bool {
	return strings.HasPrefix(os.Getenv("LANG"), "fr")
}

func showError(message string) {
	fmt.Fprintln(os.Stderr, message)
}

func openAppWindow(url, root string) error {
	browser := os.Getenv("DCS_BROWSER")
	if browser == "" {
		fmt.Println(url)
		return nil
	}
	return exec.Command(browser, "--app="+url).Start()
}

// Own process group, so cancel stops npm & co with the engine
func hideWindow(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
}

func killTree(cmd *exec.Cmd) {
	syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
}

func runConsoleEngine(root string, args []string) int {
	shell, shellArgs := powershell()
	cmd := exec.Command(shell, append(append(shellArgs[:1], "-File", enginePath(root)), args...)...)
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

func startConsoleEngine(root string) error {
	return errors.New("console window only on Windows")
}

func canPickFolder() bool { return os.Getenv("DCS_PICK_RESULT") != "" }

// Tests: DCS_PICK_RESULT is the folder "picked"
func pickFolder(title, start string) (string, error) {
	if result := os.Getenv("DCS_PICK_RESULT"); result != "" {
		return result, nil
	}
	return "", errors.New("folder picker only on Windows")
}

func openFolder(path string) error { return exec.Command("xdg-open", path).Start() }
func openInCode(path string) error { return exec.Command("code", path).Start() }
func findCode() string {
	path, _ := exec.LookPath("code")
	return path
}
func openWebPage(url string) error   { return exec.Command("xdg-open", url).Start() }
func startProject(path string) error { return errors.New("start.bat only on Windows") }
