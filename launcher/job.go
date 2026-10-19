package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
)

// One run of the engine: its output, line by line, kept for the window (which can reconnect at any time)
type job struct {
	mu        sync.Mutex
	cmd       *exec.Cmd
	events    []map[string]any
	changed   chan struct{}
	ended     bool
	cancelled bool
	root      string // project folder, sent by the engine ("root" event)
	removable bool   // created by this run: deleted when the run is cancelled
	answers   string // folder where the answers to the questions of the engine are written
}

// Colors and cursor moves of some tools (npm, Composer): useless in the window
var ansiCodes = regexp.MustCompile(`\x1b\[[0-9;?]*[A-Za-z]`)

// Starts the engine without a console window, output read through a pipe
func startJob(root string, args []string) (*job, error) {
	shell, shellArgs := powershell()
	cmd := exec.Command(shell, append(append(shellArgs, "-File", enginePath(root)), args...)...)
	cmd.Dir = root
	hideWindow(cmd)

	// Questions of the engine (install Node.js, new major version...): asked in the window,
	// each answer written as a file the engine waits for (see Confirm-Choice in the engine)
	answers, err := os.MkdirTemp("", "dc-scaffold-answers-")
	if err != nil {
		return nil, err
	}
	cmd.Env = append(os.Environ(), "DCS_ANSWERS="+answers)

	reader, writer := io.Pipe()
	cmd.Stdout, cmd.Stderr = writer, writer
	j := &job{cmd: cmd, changed: make(chan struct{}), answers: answers}
	if err := cmd.Start(); err != nil {
		os.RemoveAll(answers)
		return nil, err
	}

	reading := make(chan struct{})
	go func() {
		j.read(reader)
		close(reading)
	}()
	go func() {
		err := cmd.Wait()
		writer.Close()
		<-reading // every line is in the log before the end
		os.RemoveAll(answers)
		code := 0
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			code = exitErr.ExitCode()
		} else if err != nil {
			code = 1
		}
		j.finish(code)
	}()
	return j, nil
}

// Splits the output into events: "##DCS {json}" lines are progress, the others are shown in the log
func (j *job) read(reader io.Reader) {
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)
	for scanner.Scan() {
		line := strings.ToValidUTF8(scanner.Text(), "?")
		// Progress bars rewrite their line with \r: only the last version counts
		if index := strings.LastIndex(strings.TrimRight(line, "\r"), "\r"); index >= 0 {
			line = line[index+1:]
		}
		line = strings.TrimRight(ansiCodes.ReplaceAllString(line, ""), "\r ")

		if strings.HasPrefix(line, "##DCS ") {
			var event map[string]any
			if json.Unmarshal([]byte(line[6:]), &event) == nil {
				if event["type"] == "root" {
					j.mu.Lock()
					j.root, _ = event["root"].(string)
					j.removable, _ = event["removable"].(bool)
					j.mu.Unlock()
				}
				j.add(event)
			}
			continue
		}
		j.add(map[string]any{"type": "line", "text": line})
	}
}

func (j *job) add(event map[string]any) {
	j.mu.Lock()
	defer j.mu.Unlock()
	j.events = append(j.events, event)
	close(j.changed)
	j.changed = make(chan struct{})
}

func (j *job) finish(code int) {
	j.mu.Lock()
	cancelled, root, removable := j.cancelled, j.root, j.removable
	j.mu.Unlock()
	// Cancelled: the engine was stopped before cleaning up, the half-created folder goes here
	if cancelled && removable && root != "" {
		os.RemoveAll(root)
	}
	j.add(map[string]any{"type": "end", "code": code, "cancelled": cancelled})
	j.mu.Lock()
	j.ended = true
	j.mu.Unlock()
}

func (j *job) finished() bool {
	j.mu.Lock()
	defer j.mu.Unlock()
	return j.ended
}

// Events from number "from", a channel closed at the next event, and whether the run is over
func (j *job) since(from int) ([]map[string]any, chan struct{}, bool) {
	j.mu.Lock()
	defer j.mu.Unlock()
	if from < 0 {
		from = 0
	}
	if from > len(j.events) {
		from = len(j.events)
	}
	return append([]map[string]any(nil), j.events[from:]...), j.changed, j.ended
}

// Answer to a question of the engine: "y" or "n" in the file it waits for
func (j *job) answer(id string, yes bool) error {
	if !questionID.MatchString(id) {
		return errors.New("bad question id")
	}
	value := "n"
	if yes {
		value = "y"
	}
	return os.WriteFile(filepath.Join(j.answers, id), []byte(value), 0o644)
}

var questionID = regexp.MustCompile(`^[0-9a-f]{32}$`)

// Stops the engine and every program it started (npm, Composer...)
func (j *job) cancel() {
	if !j.finished() && j.cmd.Process != nil {
		j.mu.Lock()
		j.cancelled = true
		j.mu.Unlock()
		killTree(j.cmd)
	}
}
