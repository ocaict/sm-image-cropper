# Image Cropper & Exporter Documentation

## Overview

Image Cropper & Exporter is a React-based web application designed for cropping and exporting images tailored for various social media platforms. It provides a fast, user-friendly interface with support for batch processing, platform presets, and high-performance image export using Web Workers.

---

## Features

- **Platform Presets:** Predefined aspect ratios and resolutions for platforms like Instagram, Twitter/X, LinkedIn, YouTube, Facebook, and TikTok.
- **Batch Processing:** Import and process multiple images at once.
- **Cropping & Zooming:** Interactive canvas for precise image adjustment, including draggable and resizable crop boxes.
- **Custom Sizes:** Users can define custom export sizes with aspect ratio locking and scale/crop modes.
- **High Performance:** Web Workers handle image processing and export, keeping the UI responsive.
- **Large Image Support:** Downscales large images for preview, but exports at original resolution.
- **Export Options:** Download images as JPG or PNG with platform-appropriate filenames.

---

## User Interface Structure

- **Header:** Logo and app title.
- **Platform Tabs:** Switch between YouTube, Facebook, Instagram, and TikTok presets.
- **Preset Panel:** Sidebar with platform presets and custom size options.
- **Upload Area:** Drag-and-drop or click to upload images (supports JPEG, PNG, WEBP).
- **Canvas Preview:** Main area for image preview, cropping, and zooming.
- **Controls Bar:** Zoom slider, mode toggle (scale/crop), reset, and download options.

---

## How It Works

1. **Upload Image:** Drag and drop or click to select an image (max 50MB).
2. **Select Platform/Preset:** Choose a platform tab and preset, or enter a custom size.
3. **Adjust Crop/Zoom:** Use the canvas to crop, zoom, and pan the image as needed.
4. **Export:** Download the processed image in the desired format (JPG/PNG).

---

## Technical Details

- **Web Worker Export:** All heavy image processing is offloaded to a Web Worker, managed by a custom React hook (`useExportWorker`).
- **Large Image Handling:** UI previews are downscaled for performance, but exports use the original image data.
- **Preset Management:** Presets are defined for each platform, with easy extension for new platforms or sizes.
- **Responsive Design:** Works on desktop, tablet, and mobile with a dark theme and modern UI.

---

## Development

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build for production: `npm run build`

---

## Future Features (Planned)

- Image adjustments (brightness, contrast, saturation, hue)
- Filters and Instagram-style presets
- Watermarking and branding tools
- PWA support (offline, installable)
- Direct social sharing
- Keyboard shortcuts
- Creative tools (text overlay, templates)
- Batch reordering and undo/redo stack

---

## Acceptance Criteria

- Dark theme with indigo/cyan accents
- All platform tabs and presets function as expected
- Canvas and crop overlay work smoothly
- Responsive layout for all devices
- Exported files match selected settings and filename conventions

---

## License

MIT (or specify your license here)

---

## Contact

For questions or contributions, see the project repository or contact the maintainer.
