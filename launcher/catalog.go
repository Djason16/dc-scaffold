package main

// Online catalog: the newest stacks (tested every week by the compatibility robot, see
// .github/workflows/compatibility.yml).
//
// The robot publishes two files in the GitHub release "catalog" of the repository:
//
//	catalog.json   { "version", "minApp", "stacks": { "url", "sha256" } }
//	stacks.zip     the stacks/ folder
//
// DC Scaffold downloads them when it opens, into %LOCALAPPDATA%\DC Scaffold\catalog:
//
//	current\stacks    the stacks used (the engine reads the same folder)
//	next\stacks       a new download, used as soon as nothing is being created
//
// No network, no repository (local build), a bad file: DC Scaffold keeps the stacks of the installation.

import (
	"archive/zip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type catalog struct {
	Version string `json:"version"`
	MinApp  string `json:"minApp"`
	Stacks  struct {
		URL    string `json:"url"`
		Sha256 string `json:"sha256"`
	} `json:"stacks"`
}

// %LOCALAPPDATA%\DC Scaffold\catalog (removed by the uninstaller)
func catalogDir() string {
	if local := os.Getenv("LOCALAPPDATA"); local != "" {
		return filepath.Join(local, productName, "catalog")
	}
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".dc-scaffold", "catalog")
}

// Address of catalog.json: the "catalog" release of the repository (DCS_CATALOG_URL for the tests)
func catalogURL() string {
	if url := os.Getenv("DCS_CATALOG_URL"); url != "" {
		return url
	}
	if updateRepo == "" {
		return ""
	}
	return "https://github.com/" + updateRepo + "/releases/download/catalog/catalog.json"
}

// Folder of the stacks: the downloaded ones when they fit this version of DC Scaffold and are newer
// than the ones of the installation, otherwise the ones of the installation. Same rule as $StacksDir in the engine.
func stacksDir(root string) string {
	downloaded, ok := readCatalogFile(filepath.Join(catalogDir(), "current"))
	if ok && fitsThisApp(downloaded) && isNewer(downloaded.Version, installedStacksVersion(root)) {
		return filepath.Join(catalogDir(), "current", "stacks")
	}
	return filepath.Join(root, "stacks")
}

// Version of the stacks of the installation (stacks/version.txt, "2026.10.19.1")
func installedStacksVersion(root string) string {
	data, _ := os.ReadFile(filepath.Join(root, "stacks", "version.txt"))
	return strings.TrimSpace(strings.TrimPrefix(string(data), "\ufeff"))
}

func fitsThisApp(c catalog) bool {
	return c.MinApp == "" || !isNewer(c.MinApp, version)
}

// catalog.json of a folder (current or next), if it has its stacks next to it
func readCatalogFile(folder string) (catalog, bool) {
	var c catalog
	data, err := os.ReadFile(filepath.Join(folder, "catalog.json"))
	if err != nil || json.Unmarshal(data, &c) != nil {
		return c, false
	}
	if _, err := os.Stat(filepath.Join(folder, "stacks", "fronts")); err != nil {
		return c, false
	}
	return c, true
}

// Reads the online catalog: downloads its stacks when they are newer
func (a *app) refreshCatalog() {
	url := catalogURL()
	if url == "" || os.Getenv("DCS_NO_UPDATE") != "" {
		return
	}
	client := http.Client{Timeout: 5 * time.Second}
	response, err := client.Get(url)
	if err != nil {
		return
	}
	data, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	response.Body.Close()
	var online catalog
	if err != nil || response.StatusCode != http.StatusOK || json.Unmarshal(data, &online) != nil {
		return
	}
	// Only stacks newer than the ones in use (downloaded or of the installation)
	newest := installedStacksVersion(a.root)
	if current, ok := readCatalogFile(filepath.Join(catalogDir(), "current")); ok && isNewer(current.Version, newest) {
		newest = current.Version
	}
	if !isNewer(online.Version, newest) {
		return
	}
	if !fitsThisApp(online) || online.Stacks.URL == "" {
		return
	}
	if downloadStacks(online, data) == nil {
		a.useNewStacks()
	}
}

// stacks.zip -> next\stacks, only if its sha256 is the one written in catalog.json
func downloadStacks(online catalog, catalogJSON []byte) error {
	os.MkdirAll(catalogDir(), 0o755)
	next := filepath.Join(catalogDir(), "next")
	os.RemoveAll(next)
	zipPath := filepath.Join(catalogDir(), "stacks.zip")
	if err := download(online.Stacks.URL, zipPath); err != nil {
		return err
	}
	defer os.Remove(zipPath)

	file, err := os.Open(zipPath)
	if err != nil {
		return err
	}
	hash := sha256.New()
	io.Copy(hash, file)
	file.Close()
	if !strings.EqualFold(hex.EncodeToString(hash.Sum(nil)), online.Stacks.Sha256) {
		return errors.New("stacks.zip: wrong sha256")
	}

	if err := unzip(zipPath, next); err != nil {
		os.RemoveAll(next)
		return err
	}
	// catalog.json last: a folder without it is never used
	return os.WriteFile(filepath.Join(next, "catalog.json"), catalogJSON, 0o644)
}

// Extracts the zip into a folder; refuses any path that would go outside of it
func unzip(zipPath, folder string) error {
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return err
	}
	defer reader.Close()
	base, _ := filepath.Abs(folder)
	for _, entry := range reader.File {
		target := filepath.Join(base, filepath.FromSlash(entry.Name))
		if target != base && !strings.HasPrefix(target, base+string(filepath.Separator)) {
			return errors.New("stacks.zip: bad path " + entry.Name)
		}
		if entry.FileInfo().IsDir() {
			os.MkdirAll(target, 0o755)
			continue
		}
		os.MkdirAll(filepath.Dir(target), 0o755)
		if err := extractFile(entry, target); err != nil {
			return err
		}
	}
	return nil
}

func extractFile(entry *zip.File, target string) error {
	source, err := entry.Open()
	if err != nil {
		return err
	}
	defer source.Close()
	file, err := os.Create(target)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = io.Copy(file, source)
	return err
}

// next -> current, unless a project is being created (then at the next opening of DC Scaffold)
func (a *app) useNewStacks() {
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.job != nil && !a.job.finished() {
		return
	}
	promoteNextStacks()
}

func promoteNextStacks() {
	next := filepath.Join(catalogDir(), "next")
	if _, ok := readCatalogFile(next); !ok {
		return
	}
	current := filepath.Join(catalogDir(), "current")
	old := filepath.Join(catalogDir(), "old")
	os.RemoveAll(old)
	os.Rename(current, old)
	if os.Rename(next, current) != nil {
		os.Rename(old, current)
		return
	}
	os.RemoveAll(old)
}
