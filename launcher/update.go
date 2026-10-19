package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// Name of the installer attached to every GitHub release (see .github/workflows/build.yml)
const setupAsset = "DCScaffold-Setup.exe"

type release struct {
	Version string
	URL     string
}

// Latest GitHub release with an installer, or nil: no repository set (local build), no network,
// private repository... DC Scaffold then simply works without update.
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
		TagName string `json:"tag_name"`
		Assets  []struct {
			Name string `json:"name"`
			URL  string `json:"browser_download_url"`
		} `json:"assets"`
	}
	if json.NewDecoder(response.Body).Decode(&data) != nil {
		return nil
	}
	for _, asset := range data.Assets {
		if asset.Name == setupAsset {
			return &release{Version: strings.TrimPrefix(data.TagName, "v"), URL: asset.URL}
		}
	}
	return nil
}

// Downloads the new installer and opens it: it updates the same folder once this exe has closed
func installUpdate(update *release) error {
	setup := filepath.Join(os.TempDir(), setupAsset)
	if err := download(update.URL, setup); err != nil {
		return err
	}
	return exec.Command(setup).Start()
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
