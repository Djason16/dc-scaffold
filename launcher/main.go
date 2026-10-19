// DC Scaffold - by Djason CHERY.
//
// DCScaffold.exe opens the DC Scaffold window: a small local web server (127.0.0.1 only) shows the
// interface of ui/ in Microsoft Edge in application mode (no address bar, no tabs), and runs the engine
// (engine/dc-scaffold.ps1, next to the exe) with the choices made in the window.
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
	root := filepath.Dir(exe)
	// "go run ." during development: the repository is the parent folder of launcher/
	if dir := os.Getenv("DCS_ROOT"); dir != "" {
		root = dir
	}

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

	// Arguments for the engine (-Name "Site" -Front vue...) or --console: the console version
	if options["--console"] || len(engineArgs) > 0 {
		os.Exit(runConsoleEngine(root, engineArgs))
	}

	app := newApp(root, !options["--no-update"])
	if err := app.serve(!options["--no-window"]); err != nil {
		// No browser to show the window: the console version still works
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
}

func text(key string, values ...any) string {
	pair := messages[key]
	message := pair[1]
	if systemIsFrench() {
		message = pair[0]
	}
	return fmt.Sprintf(message, values...)
}
