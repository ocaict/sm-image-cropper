package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// AppSettings defines persistent app configs
type AppSettings struct {
	LastExportDir      string `json:"lastExportDir"`
	JpegQuality        int    `json:"jpegQuality"`
	ShowGrid           bool   `json:"showGrid"`
	ShowGuidelines     bool   `json:"showGuidelines"`
	SafeZonePercentage int    `json:"safeZonePercentage"`
	PaddingStyle       string `json:"paddingStyle"`
	CustomPaddingColor string `json:"customPaddingColor"`
	WatermarkImage     string `json:"watermarkImage"`
	WatermarkOpacity   int    `json:"watermarkOpacity"`
	WatermarkScale     int    `json:"watermarkScale"`
	WatermarkPosition  string `json:"watermarkPosition"`
}

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
	// Try to get last saved directory
	defaultDir := ""
	settings, _ := a.LoadSettings()
	if settings.LastExportDir != "" {
		defaultDir = settings.LastExportDir
	}

	dir, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Export Folder",
		DefaultDirectory: defaultDir,
	})
	if err != nil {
		return "", err
	}
	if dir == "" {
		return "", fmt.Errorf("dialog cancelled")
	}

	// Save back the chosen directory
	settings.LastExportDir = dir
	a.SaveSettings(settings)

	return dir, nil
}

// Settings file path helper
func (a *App) getSettingsPath() string {
	home, _ := os.UserConfigDir() // Use OS config path (AppData on win)
	appDir := filepath.Join(home, "SocialImageResizer")
	os.MkdirAll(appDir, os.ModePerm)
	return filepath.Join(appDir, "settings.json")
}

// LoadSettings loads persistent app settings
func (a *App) LoadSettings() (AppSettings, error) {
	var settings AppSettings
	path := a.getSettingsPath()
	data, err := os.ReadFile(path)
	if err == nil {
		json.Unmarshal(data, &settings)
	}
	return settings, err
}

// SaveSettings writes persistent app settings
func (a *App) SaveSettings(settings AppSettings) error {
	path := a.getSettingsPath()
	data, err := json.Marshal(settings)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
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
