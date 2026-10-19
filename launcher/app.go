package main

import (
	"crypto/rand"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"time"
)

// Interface of the window: HTML, CSS, JavaScript, fonts and images, built into the exe
//
//go:embed ui
var uiFiles embed.FS

// The local server behind the window. Only 127.0.0.1 can reach it, and every /api/ call
// must carry the random token of this run (so no other web page can use it).
type app struct {
	root        string
	token       string
	checkUpdate bool

	mu       sync.Mutex
	job      *job
	lastSeen time.Time // last call of the window (or end of the last one)
	windows  int       // windows connected to /api/alive
	calls    int       // calls in progress (the folder picker can stay open for minutes)
	update   *release
}

func newApp(root string, checkUpdate bool) *app {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return &app{root: root, token: hex.EncodeToString(bytes), checkUpdate: checkUpdate, lastSeen: time.Now()}
}

// Starts the server, opens the window, and stops once the window has been closed for a while
func (a *app) serve(openWindow bool) error {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return err
	}
	url := fmt.Sprintf("http://%s/#%s", listener.Addr().String(), a.token)

	// Stacks downloaded during the last run, then the online catalog (newest stacks)
	promoteNextStacks()
	if a.checkUpdate {
		go a.findUpdate()
		go a.refreshCatalog()
	}
	if openWindow {
		if err := openAppWindow(url, a.root); err != nil {
			listener.Close()
			return err
		}
	} else {
		fmt.Println(url)
	}

	go a.stopWhenClosed()
	return http.Serve(listener, a.routes())
}

// The window keeps a connection open to /api/alive (a browser never slows down an open connection,
// unlike the timers of a window left in the background). No window, no call and nothing being created
// for 20 s (time to reload the page) = the window was closed.
func (a *app) stopWhenClosed() {
	for range time.Tick(2 * time.Second) {
		a.mu.Lock()
		idle := a.windows == 0 && a.calls == 0 && time.Since(a.lastSeen) > 20*time.Second
		busy := a.job != nil && !a.job.finished()
		a.mu.Unlock()
		if idle && !busy {
			os.Exit(0)
		}
	}
}

func (a *app) routes() http.Handler {
	static, _ := fs.Sub(uiFiles, "ui")
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.FS(static)))
	api := map[string]http.HandlerFunc{
		"/api/info":     a.handleInfo,
		"/api/settings": a.handleSettings,
		"/api/browse":   a.handleBrowse,
		"/api/check":    a.handleCheck,
		"/api/create":   a.handleCreate,
		"/api/events":   a.handleEvents,
		"/api/cancel":   a.handleCancel,
		"/api/open":     a.handleOpen,
		"/api/update":   a.handleUpdate,
		"/api/alive":    a.handleAlive,
		"/api/answer":   a.handleAnswer,
		"/api/console":  a.handleConsole,
		"/api/author":   a.handleAuthor,
	}
	for path, handler := range api {
		mux.HandleFunc(path, a.guard(handler))
	}
	return noCache(mux)
}

// Token of this run in the X-DCS-Token header (or ?token= for EventSource, which cannot send headers)
func (a *app) guard(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("X-DCS-Token")
		if token == "" {
			token = r.URL.Query().Get("token")
		}
		if token != a.token {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		a.mu.Lock()
		a.calls++
		a.mu.Unlock()
		defer func() {
			a.mu.Lock()
			a.calls--
			a.lastSeen = time.Now()
			a.mu.Unlock()
		}()
		next(w, r)
	}
}

func noCache(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(value)
}

func readJSON(r *http.Request, target any) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(target)
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

// Everything the window needs to start: version, settings, stacks, MySQL version, VS Code
func (a *app) handleInfo(w http.ResponseWriter, r *http.Request) {
	settings := readSettings()
	lang, _ := settings["lang"].(string)
	if lang != "fr" && lang != "en" {
		lang = "en"
		if systemIsFrench() {
			lang = "fr"
		}
	}
	writeJSON(w, map[string]any{
		"version":     version,
		"author":      productAuthor,
		"lang":        lang,
		"destination": defaultDestination(settings),
		"separator":   string(filepath.Separator),
		"fronts":      readStacks(a.root, "fronts"),
		"backs":       readStacks(a.root, "backs"),
		"mysql":       infraVersion(a.root, "mysql"),
		"hasCode":     findCode() != "",
		"canBrowse":   canPickFolder(),
		"hasConsole":  runtime.GOOS == "windows",
	})
}

// Language of the window (shared with the engine: settings.json)
func (a *app) handleSettings(w http.ResponseWriter, r *http.Request) {
	var body map[string]any
	if readJSON(r, &body) != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	if lang, ok := body["lang"].(string); ok && (lang == "fr" || lang == "en") {
		saveSettings(map[string]any{"lang": lang})
	}
	writeJSON(w, map[string]any{"ok": true})
}

// Windows folder picker
func (a *app) handleBrowse(w http.ResponseWriter, r *http.Request) {
	var body struct{ Start, Title string }
	readJSON(r, &body)
	path, err := pickFolder(body.Title, body.Start)
	if err != nil {
		writeJSON(w, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, map[string]any{"path": path, "cancelled": path == ""})
}

// Does the destination exist, and is the project folder free?
func (a *app) handleCheck(w http.ResponseWriter, r *http.Request) {
	var body struct{ Destination, Slug string }
	readJSON(r, &body)
	destination := strings.TrimSpace(body.Destination)
	info, err := os.Stat(destination)
	result := map[string]any{"destination": err == nil && info.IsDir(), "folderUsed": false}
	if body.Slug != "" && err == nil {
		folder := filepath.Join(destination, body.Slug)
		if entries, err := os.ReadDir(folder); err == nil && len(entries) > 0 {
			result["folderUsed"] = true
			result["folder"] = folder
		}
	}
	writeJSON(w, result)
}

// Choices of the window -> parameters of the engine
type createRequest struct {
	Lang        string `json:"lang"`
	Name        string `json:"name"`
	Destination string `json:"destination"`
	Front       string `json:"front"`
	Back        string `json:"back"`
	Database    string `json:"database"`
	Driver      string `json:"driver"`
	Languages   string `json:"languages"`
	AppPort     int    `json:"appPort"`
	ApiPort     int    `json:"apiPort"`
	PmaPort     int    `json:"pmaPort"`
	DbPort      int    `json:"dbPort"`
	Git         bool   `json:"git"`
	Editor      bool   `json:"editor"`
	UseLatest   bool   `json:"useLatest"`
}

var safeValue = regexp.MustCompile(`^[a-z0-9,_-]*$`)

func (a *app) handleCreate(w http.ResponseWriter, r *http.Request) {
	var body createRequest
	if readJSON(r, &body) != nil || strings.TrimSpace(body.Name) == "" || body.Front == "" || body.Back == "" {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	for _, value := range []string{body.Lang, body.Front, body.Back, body.Database, body.Driver, body.Languages} {
		if !safeValue.MatchString(value) {
			http.Error(w, "bad request", http.StatusBadRequest)
			return
		}
	}

	a.mu.Lock()
	defer a.mu.Unlock()
	if a.job != nil && !a.job.finished() {
		http.Error(w, "busy", http.StatusConflict)
		return
	}

	args := []string{"-Ui", "-Lang", body.Lang, "-Name", body.Name, "-Destination", body.Destination, "-Front", body.Front, "-Back", body.Back}
	optional := [][2]string{{"-Database", body.Database}, {"-Driver", body.Driver}, {"-Languages", body.Languages}}
	for _, pair := range optional {
		if pair[1] != "" {
			args = append(args, pair[0], pair[1])
		}
	}
	ports := []struct {
		flag  string
		value int
	}{{"-AppPort", body.AppPort}, {"-ApiPort", body.ApiPort}, {"-PmaPort", body.PmaPort}, {"-DbPort", body.DbPort}}
	for _, port := range ports {
		if port.value > 0 && port.value < 65536 {
			args = append(args, port.flag, fmt.Sprint(port.value))
		}
	}
	if !body.Git {
		args = append(args, "-NoGit")
	}
	if !body.Editor {
		args = append(args, "-NoEditor")
	}
	if body.UseLatest {
		args = append(args, "-UseLatest")
	}
	if os.Getenv("DCS_ENGINE_ARGS") != "" { // tests: -SkipToolCheck -SkipInstall...
		args = append(args, strings.Fields(os.Getenv("DCS_ENGINE_ARGS"))...)
	}

	job, err := startJob(a.root, args)
	if err != nil {
		writeJSON(w, map[string]any{"error": err.Error()})
		return
	}
	a.job = job
	saveSettings(map[string]any{"lang": body.Lang})
	writeJSON(w, map[string]any{"ok": true})
}

// Output of the engine as Server-Sent Events, from the event number "from" (or Last-Event-ID)
func (a *app) handleEvents(w http.ResponseWriter, r *http.Request) {
	a.mu.Lock()
	job := a.job
	a.mu.Unlock()
	if job == nil {
		http.Error(w, "no job", http.StatusNotFound)
		return
	}
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Connection", "keep-alive")

	next := 0
	fmt.Sscan(r.URL.Query().Get("from"), &next)
	if id := r.Header.Get("Last-Event-ID"); id != "" {
		fmt.Sscan(id, &next)
		next++
	}
	for {
		events, changed, ended := job.since(next)
		for _, event := range events {
			data, _ := json.Marshal(event)
			fmt.Fprintf(w, "id: %d\ndata: %s\n\n", next, data)
			next++
		}
		flusher.Flush()
		if ended && len(events) == 0 {
			return
		}
		select {
		case <-changed:
		case <-r.Context().Done():
			return
		case <-time.After(15 * time.Second):
			fmt.Fprint(w, ": keep-alive\n\n")
		}
	}
}

func (a *app) handleCancel(w http.ResponseWriter, r *http.Request) {
	a.mu.Lock()
	job := a.job
	a.mu.Unlock()
	if job != nil {
		job.cancel()
	}
	writeJSON(w, map[string]any{"ok": true})
}

// Buttons of the last screen: open the folder, open it in VS Code, start the project
func (a *app) handleOpen(w http.ResponseWriter, r *http.Request) {
	var body struct{ Action, Path string }
	readJSON(r, &body)
	info, err := os.Stat(body.Path)
	if err != nil || !info.IsDir() {
		writeJSON(w, map[string]any{"error": "folder not found"})
		return
	}
	switch body.Action {
	case "folder":
		err = openFolder(body.Path)
	case "code":
		err = openInCode(body.Path)
	case "start":
		err = startProject(body.Path)
	default:
		err = errors.New("unknown action")
	}
	if err != nil {
		writeJSON(w, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, map[string]any{"ok": true})
}

// GET: is a newer version published? POST: download and open its installer, then quit
func (a *app) handleUpdate(w http.ResponseWriter, r *http.Request) {
	a.mu.Lock()
	update := a.update
	a.mu.Unlock()
	if r.Method != http.MethodPost {
		if update == nil {
			writeJSON(w, map[string]any{"available": false, "current": version})
			return
		}
		writeJSON(w, map[string]any{"available": true, "current": version, "latest": update.Version})
		return
	}
	if update == nil {
		writeJSON(w, map[string]any{"error": "no update"})
		return
	}
	if err := installUpdate(update); err != nil {
		writeJSON(w, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, map[string]any{"ok": true})
	// The installer replaces this exe: leave a moment for the answer, then quit
	go func() {
		time.Sleep(1500 * time.Millisecond)
		os.Exit(0)
	}()
}

func (a *app) findUpdate() {
	if update := latestRelease(); update != nil && isNewer(update.Version, version) {
		a.mu.Lock()
		a.update = update
		a.mu.Unlock()
	}
}

// Answer of the window to a question of the engine
func (a *app) handleAnswer(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ID  string `json:"id"`
		Yes bool   `json:"yes"`
	}
	a.mu.Lock()
	job := a.job
	a.mu.Unlock()
	if readJSON(r, &body) != nil || job == nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	if err := job.answer(body.ID, body.Yes); err != nil {
		writeJSON(w, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, map[string]any{"ok": true})
}

// The console version of the engine, in its own window: every question asked in the console
func (a *app) handleConsole(w http.ResponseWriter, r *http.Request) {
	if err := startConsoleEngine(a.root); err != nil {
		writeJSON(w, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, map[string]any{"ok": true})
}

// Logo of the window: the site of the author in the default browser (not in the window of DC Scaffold)
func (a *app) handleAuthor(w http.ResponseWriter, r *http.Request) {
	if err := openWebPage(authorSite); err != nil {
		writeJSON(w, map[string]any{"error": err.Error()})
		return
	}
	writeJSON(w, map[string]any{"ok": true})
}

// Open as long as the window is: DCScaffold.exe stops a little after the last window closed
func (a *app) handleAlive(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	a.mu.Lock()
	a.windows++
	a.calls-- // a window, not a call in progress
	a.mu.Unlock()
	defer func() {
		a.mu.Lock()
		a.windows--
		a.calls++ // given back to guard, which takes it away again
		a.mu.Unlock()
	}()
	for {
		fmt.Fprint(w, ": alive\n\n")
		flusher.Flush()
		select {
		case <-r.Context().Done():
			return
		case <-time.After(15 * time.Second):
		}
	}
}
