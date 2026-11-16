package main

import (
	"os"
	"path/filepath"
	"runtime"
)

// Folder of DC Scaffold on macOS and Linux: settings, custom stacks, downloaded catalog and window profile
// (Windows keeps %APPDATA%\DC Scaffold and %LOCALAPPDATA%\DC Scaffold, see settingsDir and catalogDir).
// The engine computes the same folder (Get-DataDir in engine/dc-scaffold.ps1).
//
//	macOS  ~/Library/Application Support/DC Scaffold
//	Linux  $XDG_CONFIG_HOME/dc-scaffold, by default ~/.config/dc-scaffold
func userDataDir() string {
	home, _ := os.UserHomeDir()
	if runtime.GOOS == "darwin" {
		return filepath.Join(home, "Library", "Application Support", productName)
	}
	if config := os.Getenv("XDG_CONFIG_HOME"); filepath.IsAbs(config) {
		return filepath.Join(config, "dc-scaffold")
	}
	return filepath.Join(home, ".config", "dc-scaffold")
}

// Folder of the installation: next to the program, or Contents/Resources in the macOS app bundle
// (DC Scaffold.app/Contents/MacOS/DCScaffold). A link to the program (~/.local/bin/dcscaffold) is followed.
func installRoot(exe string) string {
	if real, err := filepath.EvalSymlinks(exe); err == nil {
		exe = real
	}
	dir := filepath.Dir(exe)
	if !fileExists(enginePath(dir)) {
		if resources := filepath.Join(dir, "..", "Resources"); fileExists(enginePath(resources)) {
			return filepath.Clean(resources)
		}
	}
	return dir
}
