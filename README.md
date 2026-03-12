# Image Cropper & Exporter

A React-based application for cropping and exporting images for various social media platforms.

## Features

-   **Platform Presets**: predefined aspect ratios and resolutions for popular platforms (Instagram, Twitter/X, LinkedIn, etc.).
-   **Batch Processing**: Import and process multiple images at once.
-   **Cropping & Zooming**: Interactive canvas for precise image adjustment.
-   **High Performance**: Uses Web Workers for background image processing and export, ensuring the UI remains responsive even with large files.
-   **Large Image Support**: Automatically downscales large images for preview while preserving the original resolution for the final export.

## Technical Details

### Web Worker Export

Image processing and export operations are offloaded to a dedicated Web Worker. This prevents the main thread from freezing during computationally intensive tasks like:

-   High-resolution image resizing
-   Canvas to Blob conversion
-   Format encoding (JPEG/PNG)

The worker is managed via a custom hook `useExportWorker`, which maintains a persistent worker instance to avoid the overhead of repeated worker creation/termination.

### Large Image Handling

To optimize memory usage and rendering performance, images larger than 2000px (or >5MB) are automatically downscaled for the UI preview. The original full-resolution image is kept in memory and used only during the final export process within the Web Worker.

## Development (Desktop App)

This application has been upgraded to a native Desktop Application using [Wails](https://wails.io/).

### Prerequisites
- Node.js >= 18
- Go >= 1.24
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Running Locally
1. Install frontend dependencies: `npm install`
2. Run the desktop app in development mode: `wails dev`
*(This will automatically spin up the Vite dev server and hot-reload the Go Native UI)*

### Building the Executable
To build a standalone `.exe` for distribution:
```bash
wails build
```
The compiled executable will be output to `build/bin/image-cropper.exe`.

## Repository Hygiene

- Build outputs are ignored (`dist/`, `build/bin/`, `build/obj/`).
- Only core source files (`app.go`, `main.go`, `wails.json`, `src/`) and build asset templates (`build/windows/*`) should be committed.
- Commit lockfile (`package-lock.json` and `go.mod`/`go.sum`) to ensure reproducible installs.
