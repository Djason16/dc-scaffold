//go:build !windows

package main

import (
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

// File of the releases for this system and processor: DCScaffold-1.6.0-mac-arm64.dmg, DCScaffold-1.6.0-linux-x64.tar.gz...
func assetMatches(name string) bool {
	if !strings.HasPrefix(name, "DCScaffold-") {
		return false
	}
	if runtime.GOOS == "darwin" {
		return strings.HasSuffix(name, "-mac-"+releaseArch()+".dmg") || strings.HasSuffix(name, "-mac-"+releaseArch()+".zip")
	}
	return strings.HasSuffix(name, "-"+runtime.GOOS+"-"+releaseArch()+".tar.gz")
}

// macOS: the new version is downloaded into Downloads and shown in the Finder (disk image opened, or zip
// extracted and the app selected): the user drags it into Applications ("opened").
// Linux: the archive is extracted and its install.sh run, which replaces ~/.local/share/dc-scaffold ("installed").
func installUpdate(update *release) (string, error) {
	if runtime.GOOS == "darwin" {
		return "opened", openMacUpdate(update)
	}
	folder, err := os.MkdirTemp("", "dc-scaffold-update-")
	if err != nil {
		return "", err
	}
	defer os.RemoveAll(folder)
	archive := filepath.Join(folder, update.Name)
	if err := download(update.URL, archive); err != nil {
		return "", err
	}
	if err := extractTarGz(archive, folder); err != nil {
		return "", err
	}
	install := filepath.Join(folder, strings.TrimSuffix(update.Name, ".tar.gz"), "install.sh")
	output, err := exec.Command("sh", install, "--update").CombinedOutput()
	if err != nil {
		lines := strings.Split(strings.TrimSpace(string(output)), "\n")
		return "", fmt.Errorf("install.sh: %s", lines[len(lines)-1])
	}
	return "installed", nil
}

func openMacUpdate(update *release) error {
	home, _ := os.UserHomeDir()
	folder := filepath.Join(home, "Downloads")
	if info, err := os.Stat(folder); err != nil || !info.IsDir() {
		folder = os.TempDir()
	}
	file := filepath.Join(folder, update.Name)
	if err := download(update.URL, file); err != nil {
		return err
	}
	if strings.HasSuffix(file, ".dmg") {
		return exec.Command("open", file).Run()
	}
	target := strings.TrimSuffix(file, ".zip")
	os.RemoveAll(target)
	if err := extractZip(file, target); err != nil {
		return err
	}
	os.Remove(file)
	return exec.Command("open", "-R", filepath.Join(target, productName+".app")).Run()
}

// Path of an entry of an archive inside folder; refuses any path that would go outside of it
func entryPath(folder, name string) (string, error) {
	base, _ := filepath.Abs(folder)
	target := filepath.Join(base, filepath.FromSlash(name))
	if target != base && !strings.HasPrefix(target, base+string(filepath.Separator)) {
		return "", errors.New("bad path in the archive: " + name)
	}
	return target, nil
}

// Writes a file of an archive with its permissions (the programs stay executable)
func writeEntry(target string, mode os.FileMode, source io.Reader) error {
	os.MkdirAll(filepath.Dir(target), 0o755)
	file, err := os.OpenFile(target, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, mode.Perm()|0o600)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = io.Copy(file, source)
	return err
}

func extractTarGz(archive, folder string) error {
	file, err := os.Open(archive)
	if err != nil {
		return err
	}
	defer file.Close()
	unzipped, err := gzip.NewReader(file)
	if err != nil {
		return err
	}
	reader := tar.NewReader(unzipped)
	for {
		header, err := reader.Next()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		target, err := entryPath(folder, header.Name)
		if err != nil {
			return err
		}
		switch header.Typeflag {
		case tar.TypeDir:
			os.MkdirAll(target, 0o755)
		case tar.TypeReg:
			if err := writeEntry(target, header.FileInfo().Mode(), reader); err != nil {
				return err
			}
		}
	}
}

// The zip of the app: made by ditto (macOS) or zip (Linux), both keep the permissions of the files
func extractZip(archive, folder string) error {
	reader, err := zip.OpenReader(archive)
	if err != nil {
		return err
	}
	defer reader.Close()
	for _, entry := range reader.File {
		target, err := entryPath(folder, entry.Name)
		if err != nil {
			return err
		}
		if entry.FileInfo().IsDir() {
			os.MkdirAll(target, 0o755)
			continue
		}
		if entry.Mode()&os.ModeSymlink != 0 {
			continue
		}
		source, err := entry.Open()
		if err != nil {
			return err
		}
		err = writeEntry(target, entry.Mode(), source)
		source.Close()
		if err != nil {
			return err
		}
	}
	return nil
}
