package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// Folder of the settings shared with the engine: %APPDATA%\DC Scaffold (settings.json, custom stacks)
func settingsDir() string {
	if appData := os.Getenv("APPDATA"); appData != "" {
		return filepath.Join(appData, productName)
	}
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".dc-scaffold")
}

func readSettings() map[string]any {
	settings := map[string]any{}
	if data, err := os.ReadFile(filepath.Join(settingsDir(), "settings.json")); err == nil {
		// The engine may write a BOM with Windows PowerShell
		json.Unmarshal([]byte(strings.TrimPrefix(string(data), "\ufeff")), &settings)
	}
	return settings
}

func saveSettings(values map[string]any) {
	settings := readSettings()
	for key, value := range values {
		settings[key] = value
	}
	data, _ := json.MarshalIndent(settings, "", "    ")
	os.MkdirAll(settingsDir(), 0o755)
	os.WriteFile(filepath.Join(settingsDir(), "settings.json"), data, 0o644)
}

// Folder proposed for the new project: the last one used, otherwise Documents
func defaultDestination(settings map[string]any) string {
	if last, ok := settings["destination"].(string); ok && last != "" {
		if info, err := os.Stat(last); err == nil && info.IsDir() {
			return last
		}
	}
	home, _ := os.UserHomeDir()
	for _, folder := range []string{filepath.Join(home, "Documents"), home} {
		if info, err := os.Stat(folder); err == nil && info.IsDir() {
			return folder
		}
	}
	return home
}

// Stacks of DC Scaffold (stacks/fronts, stacks/backs), then the custom ones of %APPDATA%\DC Scaffold\stacks
// (same id = replaces), sorted like the console menu: "order", then label. The "steps" stay with the engine.
func readStacks(root, kind string) []map[string]any {
	byID := map[string]map[string]any{}
	builtIn := filepath.Join(stacksDir(root), kind) // downloaded stacks (catalog.go) or those of the installation
	for _, folder := range []string{builtIn, filepath.Join(settingsDir(), "stacks", kind)} {
		entries, _ := os.ReadDir(folder)
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			data, err := os.ReadFile(filepath.Join(folder, entry.Name(), "stack.json"))
			if err != nil {
				continue
			}
			var stack map[string]any
			if json.Unmarshal([]byte(strings.TrimPrefix(string(data), "\ufeff")), &stack) != nil {
				continue
			}
			view := map[string]any{"id": entry.Name(), "custom": folder != builtIn}
			for _, field := range []string{"label", "order", "description", "database", "drivers", "fallbackDatabase", "noDatabase", "port", "runtime", "requires", "docker", "inside", "onlyInside"} {
				if value, ok := stack[field]; ok {
					view[field] = value
				}
			}
			byID[entry.Name()] = view
		}
	}

	stacks := make([]map[string]any, 0, len(byID))
	for _, stack := range byID {
		stacks = append(stacks, stack)
	}
	order := func(stack map[string]any) float64 {
		if value, ok := stack["order"].(float64); ok {
			return value
		}
		return 50
	}
	sort.SliceStable(stacks, func(i, j int) bool {
		if order(stacks[i]) != order(stacks[j]) {
			return order(stacks[i]) < order(stacks[j])
		}
		return strings.ToLower(label(stacks[i])) < strings.ToLower(label(stacks[j]))
	})
	return stacks
}

func label(stack map[string]any) string {
	value, _ := stack["label"].(string)
	return value
}

// Version of a Docker image of the projects (stacks/infra/versions.json): "php" or "mysql"
func infraVersion(root, name string) string {
	var versions map[string]any
	data, _ := os.ReadFile(filepath.Join(stacksDir(root), "infra", "versions.json"))
	json.Unmarshal([]byte(strings.TrimPrefix(string(data), "\ufeff")), &versions)
	value, _ := versions[name].(string)
	return value
}
