package main

import (
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"unsafe"
)

const (
	createNewConsole = 0x00000010
	createNoWindow   = 0x08000000
	windowWidth      = 1200
	windowHeight     = 800
	spiGetWorkArea   = 0x0030
)

var (
	user32                   = syscall.NewLazyDLL("user32.dll")
	kernel32                 = syscall.NewLazyDLL("kernel32.dll")
	procMessageBox           = user32.NewProc("MessageBoxW")
	procGetSystemMetrics     = user32.NewProc("GetSystemMetrics")
	procSystemParametersInfo = user32.NewProc("SystemParametersInfoW")
	procGetUILanguage        = kernel32.NewProc("GetUserDefaultUILanguage")
)

// PowerShell 7 when installed, Windows PowerShell otherwise
func powershell() (string, []string) {
	shell := "powershell.exe"
	if _, err := exec.LookPath("pwsh.exe"); err == nil {
		shell = "pwsh.exe"
	}
	return shell, []string{"-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass"}
}

// French when Windows is in French
func systemIsFrench() bool {
	language, _, _ := procGetUILanguage.Call()
	return language&0x3ff == 0x0c
}

func showError(message string) {
	text, _ := syscall.UTF16PtrFromString(message)
	title, _ := syscall.UTF16PtrFromString(productName)
	procMessageBox.Call(0, uintptr(unsafe.Pointer(text)), uintptr(unsafe.Pointer(title)), 0x10)
}

// The window: Microsoft Edge (or Chrome) in application mode, with its own profile
// (%LOCALAPPDATA%\DC Scaffold\window) so it stays apart from the browsing of the user
func openAppWindow(url, root string) error {
	browser := findBrowser()
	if browser == "" {
		return errors.New("Microsoft Edge / Google Chrome not found")
	}
	profile := filepath.Join(os.Getenv("LOCALAPPDATA"), productName, "window")
	// The window fits the screen without the taskbar (a small laptop screen: smaller window, nothing hidden)
	areaLeft, areaTop, areaWidth, areaHeight := workArea()
	width := min(windowWidth, areaWidth-40)
	height := min(windowHeight, areaHeight-20)
	left := areaLeft + max(0, (areaWidth-width)/2)
	top := areaTop + max(0, (areaHeight-height)/2)

	cmd := exec.Command(browser,
		"--app="+url,
		"--user-data-dir="+profile,
		fmt.Sprintf("--window-size=%d,%d", width, height),
		fmt.Sprintf("--window-position=%d,%d", left, top),
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-sync",
		"--disable-extensions",
		"--hide-crash-restore-bubble",
		// The window keeps working at full speed even behind other windows or the folder picker
		"--disable-background-timer-throttling",
		"--disable-backgrounding-occluded-windows",
		"--disable-renderer-backgrounding",
		"--disable-features=Translate,msEdgeSidebarV2,msHubApps,msUndersideButton,EdgeCollections",
	)
	return cmd.Start()
}

// Part of the screen free of the taskbar (SystemParametersInfo SPI_GETWORKAREA), the whole screen if it fails
func workArea() (left, top, width, height int) {
	var area struct{ Left, Top, Right, Bottom int32 }
	if ok, _, _ := procSystemParametersInfo.Call(spiGetWorkArea, 0, uintptr(unsafe.Pointer(&area)), 0); ok != 0 {
		return int(area.Left), int(area.Top), int(area.Right - area.Left), int(area.Bottom - area.Top)
	}
	screenWidth, _, _ := procGetSystemMetrics.Call(0)
	screenHeight, _, _ := procGetSystemMetrics.Call(1)
	return 0, 0, int(screenWidth), int(screenHeight)
}

func findBrowser() string {
	candidates := []string{
		filepath.Join(os.Getenv("ProgramFiles(x86)"), `Microsoft\Edge\Application\msedge.exe`),
		filepath.Join(os.Getenv("ProgramFiles"), `Microsoft\Edge\Application\msedge.exe`),
		filepath.Join(os.Getenv("LOCALAPPDATA"), `Microsoft\Edge\Application\msedge.exe`),
		filepath.Join(os.Getenv("ProgramFiles"), `Google\Chrome\Application\chrome.exe`),
		filepath.Join(os.Getenv("ProgramFiles(x86)"), `Google\Chrome\Application\chrome.exe`),
		filepath.Join(os.Getenv("LOCALAPPDATA"), `Google\Chrome\Application\chrome.exe`),
	}
	for _, path := range candidates {
		if fileExists(path) {
			return path
		}
	}
	return ""
}

func hideWindow(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: createNoWindow}
}

// taskkill /T stops the engine and every program it started (npm, node, composer...)
func killTree(cmd *exec.Cmd) {
	kill := exec.Command("taskkill", "/T", "/F", "/PID", fmt.Sprint(cmd.Process.Pid))
	hideWindow(kill)
	kill.Run()
}

// The engine in its own console window, with its questions (no browser, or --console): waits for its end
func runConsoleEngine(root string, args []string) int {
	process, err := startConsole(root, args)
	if err != nil {
		showError(err.Error())
		return 1
	}
	defer syscall.CloseHandle(process)
	syscall.WaitForSingleObject(process, syscall.INFINITE)
	var code uint32
	syscall.GetExitCodeProcess(process, &code)
	return int(code)
}

// "Console version" button of the window: same console, the window stays open
func startConsoleEngine(root string) error {
	process, err := startConsole(root, nil)
	if err == nil {
		syscall.CloseHandle(process)
	}
	return err
}

// Opens a new console window running the engine. Not with exec.Command: Go would connect the input and
// output of the console to NUL (DCScaffold.exe has no console of its own), and the window would show
// nothing and close at once. CreateProcess without redirection gives the console its own keyboard and screen.
func startConsole(root string, args []string) (syscall.Handle, error) {
	shell, _ := powershell()
	quoted := make([]string, len(args))
	for i, arg := range args {
		quoted[i] = `"` + strings.ReplaceAll(arg, `"`, `\"`) + `"`
	}
	// chcp 65001: UTF-8 console for the accents and frames of the engine; pause: the last message stays readable
	line := fmt.Sprintf(`cmd.exe /c "chcp 65001 >nul & "%s" -NoProfile -ExecutionPolicy Bypass -File "%s" %s & pause"`,
		shell, enginePath(root), strings.Join(quoted, " "))

	commandLine, err := syscall.UTF16PtrFromString(line)
	if err != nil {
		return 0, err
	}
	folder, _ := syscall.UTF16PtrFromString(root)
	title, _ := syscall.UTF16PtrFromString(productName)
	startup := &syscall.StartupInfo{Title: title}
	startup.Cb = uint32(unsafe.Sizeof(*startup))
	info := &syscall.ProcessInformation{}
	if err := syscall.CreateProcess(nil, commandLine, nil, nil, false, createNewConsole, nil, folder, startup, info); err != nil {
		return 0, err
	}
	syscall.CloseHandle(info.Thread)
	return info.Process, nil
}

// Folder picker of Windows (the modern one, as in the Explorer), shown above the window.
// Windows PowerShell compiles a few lines of C# for it; the old picker is used if that fails.
const folderPickerScript = `
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$title = $env:DCS_PICK_TITLE
$start = $env:DCS_PICK_START
try {
    Add-Type -ErrorAction Stop -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class DcsFolderPicker {
    [ComImport, Guid("DC1C5A9C-E88A-4dde-A5A1-60F82A20AEF7")] class FileOpenDialog { }
    [ComImport, Guid("42f85136-db7e-439c-85f1-e4075d135fc8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IFileDialog {
        [PreserveSig] int Show(IntPtr parent);
        void SetFileTypes(uint count, IntPtr filters);
        void SetFileTypeIndex(uint index);
        void GetFileTypeIndex(out uint index);
        void Advise(IntPtr events, out uint cookie);
        void Unadvise(uint cookie);
        void SetOptions(uint options);
        void GetOptions(out uint options);
        void SetDefaultFolder(IShellItem item);
        void SetFolder(IShellItem item);
        void GetFolder(out IShellItem item);
        void GetCurrentSelection(out IShellItem item);
        void SetFileName([MarshalAs(UnmanagedType.LPWStr)] string name);
        void GetFileName([MarshalAs(UnmanagedType.LPWStr)] out string name);
        void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string title);
        void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string text);
        void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string label);
        void GetResult(out IShellItem item);
    }
    [ComImport, Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    interface IShellItem {
        void BindToHandler(IntPtr context, ref Guid handler, ref Guid id, out IntPtr result);
        void GetParent(out IShellItem parent);
        void GetDisplayName(uint type, [MarshalAs(UnmanagedType.LPWStr)] out string name);
    }
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
    static extern void SHCreateItemFromParsingName(string path, IntPtr context, ref Guid id, out IShellItem item);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();

    public static string Pick(string title, string start) {
        IFileDialog dialog = (IFileDialog)new FileOpenDialog();
        dialog.SetOptions(0x20 | 0x40 | 0x800); // pick folders, file system only, path must exist
        if (!string.IsNullOrEmpty(title)) dialog.SetTitle(title);
        if (!string.IsNullOrEmpty(start) && System.IO.Directory.Exists(start)) {
            Guid id = typeof(IShellItem).GUID;
            IShellItem folder;
            SHCreateItemFromParsingName(start, IntPtr.Zero, ref id, out folder);
            dialog.SetFolder(folder);
        }
        if (dialog.Show(GetForegroundWindow()) != 0) return "";
        IShellItem result;
        dialog.GetResult(out result);
        string path;
        result.GetDisplayName(0x80058000, out path);
        return path;
    }
}
'@
    [DcsFolderPicker]::Pick($title, $start)
} catch {
    Add-Type -AssemblyName System.Windows.Forms
    $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $dialog.Description = $title
    $dialog.SelectedPath = $start
    $owner = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true }
    if ($dialog.ShowDialog($owner) -eq 'OK') { $dialog.SelectedPath } else { '' }
}
`

func canPickFolder() bool { return true }

func pickFolder(title, start string) (string, error) {
	// -EncodedCommand: the script as UTF-16 in base64, so no quote of it can be misread
	utf16, _ := syscall.UTF16FromString(folderPickerScript)
	bytes := make([]byte, 0, len(utf16)*2)
	for _, unit := range utf16[:len(utf16)-1] {
		bytes = append(bytes, byte(unit), byte(unit>>8))
	}
	encoded := base64.StdEncoding.EncodeToString(bytes)
	cmd := exec.Command("powershell.exe", "-NoProfile", "-STA", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encoded)
	cmd.Env = append(os.Environ(), "DCS_PICK_TITLE="+title, "DCS_PICK_START="+start)
	hideWindow(cmd)
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	lines := strings.Split(strings.TrimSpace(strings.TrimPrefix(string(output), "\ufeff")), "\n")
	return strings.TrimSpace(lines[len(lines)-1]), nil
}

func openFolder(path string) error {
	return exec.Command("explorer.exe", path).Start()
}

// Web page in the default browser (rundll32: no console window, unlike "start")
func openWebPage(url string) error {
	return exec.Command("rundll32.exe", "url.dll,FileProtocolHandler", url).Start()
}

// VS Code: "code" is a .cmd script, started through cmd without a window
func openInCode(path string) error {
	code := findCode()
	if code == "" {
		return errors.New("VS Code not found")
	}
	cmd := exec.Command("cmd.exe", "/c", code, path)
	hideWindow(cmd)
	return cmd.Start()
}

// code.cmd: in the PATH, or in the folders of VS Code (installed during this run, PATH not updated yet)
func findCode() string {
	if path, err := exec.LookPath("code"); err == nil {
		return path
	}
	for _, folder := range []string{os.Getenv("LOCALAPPDATA"), os.Getenv("ProgramFiles")} {
		for _, path := range []string{
			filepath.Join(folder, "Programs", "Microsoft VS Code", "bin", "code.cmd"),
			filepath.Join(folder, "Microsoft VS Code", "bin", "code.cmd"),
		} {
			if folder != "" && fileExists(path) {
				return path
			}
		}
	}
	return ""
}

// start.ps1 -Action D in its own console: Docker, API and front start in their windows
func startProject(path string) error {
	shell, _ := powershell()
	cmd := exec.Command(shell, "-NoExit", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", filepath.Join(path, "start.ps1"), "-Action", "D")
	cmd.Dir = path
	cmd.SysProcAttr = &syscall.SysProcAttr{CreationFlags: createNewConsole}
	return cmd.Start()
}
