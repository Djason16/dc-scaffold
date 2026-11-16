package main

import (
	"os"
	"os/exec"
	"path/filepath"
)

// Asset of the releases for Windows: the installer (the same name since 1.0, older versions look for it)
func assetMatches(name string) bool { return name == "DCScaffold-Setup.exe" }

// Downloads the new installer and opens it: it updates the same folder once this exe has closed
func installUpdate(update *release) (string, error) {
	setup := filepath.Join(os.TempDir(), update.Name)
	if err := download(update.URL, setup); err != nil {
		return "", err
	}
	return "installer", exec.Command(setup).Start()
}
