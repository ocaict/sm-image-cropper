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

## Development

1.  Install dependencies: `npm install`
2.  Start dev server: `npm run dev`
3.  Build for production: `npm run build`

## Getting Started (Quick Start)

- Prerequisites: Node.js >= 18 and npm (or pnpm/yarn if you prefer)
- Install: `npm install`
- Run dev server: `npm run dev`
- Build for production: `npm run build`
- Preview built app: `npm run preview`

## Repository Hygiene

- Build outputs should be ignored (dist/). This repo now ignores dist/ and node_modules/ via .gitignore.
- Commit lockfile (package-lock.json) to ensure reproducible installs.
- Do not commit large binary assets or build artifacts. Regenerate them via the build script when needed.
