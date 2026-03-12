package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// SelectImages opens a native file dialog to select multiple images
func (a *App) SelectImages() []string {
	files, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Images",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Images",
				Pattern:     "*.jpg;*.jpeg;*.png;*.webp;*.bmp;*.gif",
			},
		},
	})
	if err != nil {
		return nil
	}
	return files
}

// ReadFileAsBase64 reads a local file and returns it as a data URL
func (a *App) ReadFileAsBase64(path string) (string, error) {
	bytes, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	
	mimeType := "image/jpeg"
	lowerPath := strings.ToLower(path)
	if strings.HasSuffix(lowerPath, ".png") {
		mimeType = "image/png"
	} else if strings.HasSuffix(lowerPath, ".webp") {
		mimeType = "image/webp"
	} else if strings.HasSuffix(lowerPath, ".gif") {
		mimeType = "image/gif"
	} else if strings.HasSuffix(lowerPath, ".bmp") {
		mimeType = "image/bmp"
	}

	encoded := base64.StdEncoding.EncodeToString(bytes)
	return fmt.Sprintf("data:%s;base64,%s", mimeType, encoded), nil
}

// SaveImage asks the user where to save the image, then writes the base64 data to it
func (a *App) SaveImage(base64Data string, defaultFilename string) (string, error) {
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Output Image",
		DefaultFilename: defaultFilename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Images",
				Pattern:     "*.jpg;*.jpeg;*.png;*.webp",
			},
		},
	})

	if err != nil || filePath == "" {
		return "", err // User cancelled Dialog
	}

	err = a.SaveImageToPath(base64Data, filePath)
	if err != nil {
		return "", err
	}
	return filePath, nil
}

// SelectDirectory opens a native file dialog to select a directory
func (a *App) SelectDirectory() (string, error) {
	dir, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Export Folder",
	})
	if err != nil {
		return "", err
	}
	if dir == "" {
		return "", fmt.Errorf("dialog cancelled")
	}
	return dir, nil
}

// SaveImageToPath writes the base64 data to a pre-selected path
func (a *App) SaveImageToPath(base64Data string, fullPath string) error {
	commaIdx := strings.Index(base64Data, ",")
	if commaIdx != -1 {
		base64Data = base64Data[commaIdx+1:]
	}
	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return fmt.Errorf("failed to decode image data: %v", err)
	}
	return os.WriteFile(fullPath, data, 0644)
}

// JoinPath is a helper for React to construct correct file paths on any OS
func (a *App) JoinPath(dir string, filename string) string {
	return filepath.Join(dir, filename)
}
