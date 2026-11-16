// DC Scaffold - by Djason CHERY.
//
// DCScaffold.exe opens the DC Scaffold window: a small local web server (127.0.0.1 only) shows the
// interface of ui/ in Microsoft Edge in application mode (no address bar, no tabs), and runs the engine
// (engine/dc-scaffold.ps1, next to the exe) with the choices made in the window.
// macOS and Linux: the same program (DC Scaffold.app, DCScaffold), the window in Chrome, Edge, Brave or Chromium
// (otherwise the default browser), the engine run with PowerShell 7 (pwsh).
//
// Options:
//
//	--console   the engine in a console window, with its questions (also used when no browser is found)
//	--no-update no update check
//	--no-window starts the server and prints its address without opening a window (tests)
package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const productName = "DC Scaffold"
const productAuthor = "Djason CHERY"

// Site of the author, opened by the logo of the window
const authorSite = "https://djason-chery.dev/"

// Set at build time (installer/build.sh, GitHub workflow): -ldflags "-X main.version=1.0.0 -X main.updateRepo=owner/repo"
var (
	version    = "0.0.0"
	updateRepo = ""
)

func main() {
	exe, err := os.Executable()
	if err != nil {
		showError(err.Error())
		os.Exit(1)
	}
	root := installRoot(exe)
	// "go run ." during development: the repository is the parent folder of launcher/
	if dir := os.Getenv("DCS_ROOT"); dir != "" {
		root = dir
	}
	// macOS / Linux: the PATH of the terminal (Homebrew, ~/.local/bin...), even when opened from the Finder or a menu
	prepareEnvironment()

	options := map[string]bool{}
	var engineArgs []string
	for _, arg := range os.Args[1:] {
		switch strings.ToLower(arg) {
		case "--console", "--no-update", "--no-window":
			options[strings.ToLower(arg)] = true
		default:
			engineArgs = append(engineArgs, arg)
		}
	}

	if !fileExists(enginePath(root)) {
		showError(text("engine_missing", enginePath(root)))
		os.Exit(1)
	}
	// macOS / Linux: the engine needs PowerShell 7, which is not there by default
	if problem := runtimeProblem(); problem != "" {
		showError(problem)
		os.Exit(1)
	}

	// Arguments for the engine (-Name "Site" -Front vue...) or --console: the console version
	if options["--console"] || len(engineArgs) > 0 {
		os.Exit(runConsoleEngine(root, engineArgs))
	}

	app := newApp(root, !options["--no-update"])
	if err := app.serve(!options["--no-window"]); err != nil {
		// No browser to show the window: the console version still works (macOS / Linux: only in a terminal)
		if !consoleAvailable() {
			showError(err.Error())
			os.Exit(1)
		}
		fmt.Println(err)
		os.Exit(runConsoleEngine(root, nil))
	}
}

func enginePath(root string) string {
	return filepath.Join(root, "engine", "dc-scaffold.ps1")
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// Messages of the launcher itself (the window has its own texts in ui/app.js)
var messages = map[string][2]string{
	"engine_missing": {"Moteur introuvable : %s. Réinstalle DC Scaffold.", "Engine not found: %s. Install DC Scaffold again."},
	"pwsh_missing": {
		"DC Scaffold a besoin de PowerShell 7 (la commande pwsh) pour créer les projets.\n\n%s\n\nInstalle-le, puis rouvre DC Scaffold.",
		"DC Scaffold needs PowerShell 7 (the pwsh command) to create projects.\n\n%s\n\nInstall it, then open DC Scaffold again.",
	},
	"pwsh_mac": {
		"Avec Homebrew : brew install --cask powershell\nSans Homebrew : le paquet .pkg de https://aka.ms/powershell-release?tag=stable",
		"With Homebrew: brew install --cask powershell\nWithout Homebrew: the .pkg package of https://aka.ms/powershell-release?tag=stable",
	},
	"pwsh_linux": {
		"sudo snap install powershell --classic\nou le paquet de ta distribution : https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-linux",
		"sudo snap install powershell --classic\nor the package of your distribution: https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-linux",
	},
}

func text(key string, values ...any) string {
	pair := messages[key]
	message := pair[1]
	if systemIsFrench() {
		message = pair[0]
	}
	return fmt.Sprintf(message, values...)
}
