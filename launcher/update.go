package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// Files attached to every GitHub release (see .github/workflows/release.yml), one per system:
//
//	Windows  DCScaffold-Setup.exe                         (assetMatches in update_windows.go)
//	macOS    DCScaffold-<version>-mac-<arm64|x64>.dmg / .zip  (update_unix.go)
//	Linux    DCScaffold-<version>-linux-<x64|arm64>.tar.gz
type release struct {
	Version string
	Name    string // file of this system
	URL     string
}

// Processor in the names of the files: x64 for Intel / AMD, arm64 for Apple Silicon and ARM
func releaseArch() string {
	if runtime.GOARCH == "amd64" {
		return "x64"
	}
	return runtime.GOARCH
}

// Latest GitHub release with a file for this system, or nil: no repository set (local build), no network,
// private repository, no file for this system... DC Scaffold then simply works without update.
func latestRelease() *release {
	if updateRepo == "" || os.Getenv("DCS_NO_UPDATE") != "" {
		return nil
	}
	client := http.Client{Timeout: 5 * time.Second}
	response, err := client.Get("https://api.github.com/repos/" + updateRepo + "/releases/latest")
	if err != nil {
		return nil
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil
	}

	var data struct {
		TagName string  `json:"tag_name"`
		Assets  []asset `json:"assets"`
	}
	if json.NewDecoder(response.Body).Decode(&data) != nil {
		return nil
	}
	return pickAsset(strings.TrimPrefix(data.TagName, "v"), data.Assets)
}

type asset struct {
	Name string `json:"name"`
	URL  string `json:"browser_download_url"`
}

// The file of this system; macOS: the disk image before the zip
func pickAsset(version string, assets []asset) *release {
	var found *release
	for _, file := range assets {
		if !assetMatches(file.Name) {
			continue
		}
		if found == nil || strings.HasSuffix(file.Name, ".dmg") {
			found = &release{Version: version, Name: file.Name, URL: file.URL}
		}
	}
	return found
}

func download(url, path string) error {
	client := http.Client{Timeout: 3 * time.Minute}
	response, err := client.Get(url)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d", response.StatusCode)
	}
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = io.Copy(file, response.Body)
	return err
}

// "1.10.0" is newer than "1.9.2"
func isNewer(candidate, current string) bool {
	a, b := strings.Split(candidate, "."), strings.Split(current, ".")
	for i := 0; i < len(a) || i < len(b); i++ {
		x, y := part(a, i), part(b, i)
		if x != y {
			return x > y
		}
	}
	return false
}

func part(parts []string, i int) int {
	if i >= len(parts) {
		return 0
	}
	n, _ := strconv.Atoi(parts[i])
	return n
}
