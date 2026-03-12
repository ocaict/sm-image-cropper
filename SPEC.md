# Social Image Resizer - Specification

## Project Overview
- **Project Name**: Social Image Resizer
- **Type**: Single-page web application (React)
- **Core Functionality**: Client-side image resizing and cropping for social media platforms
- **Target Users**: Content creators, social media managers, marketers

## UI/UX Specification

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ HEADER (Logo + Title)                                    │
├─────────────────────────────────────────────────────────┤
│ PLATFORM TABS (YouTube | Facebook | Instagram | TikTok)│
├──────────────────────┬──────────────────────────────────┤
│                      │                                   │
│   PRESET PANEL       │      CANVAS PREVIEW AREA         │
│   - Size presets     │      - Image preview              │
│   - Custom size      │      - Crop overlay               │
│                      │                                   │
├──────────────────────┴──────────────────────────────────┤
│ CONTROLS (Zoom, Scale/Crop toggle, Download)            │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- Mobile: < 768px (stacked layout)
- Tablet: 768px - 1024px
- Desktop: > 1024px (side-by-side layout)

### Visual Design

#### Color Palette
- **Background**: #0a0a0f (deep dark)
- **Surface**: #14141f (card background)
- **Surface Elevated**: #1e1e2e (hover states)
- **Primary**: #6366f1 (indigo)
- **Primary Hover**: #818cf8
- **Accent**: #22d3ee (cyan)
- **Text Primary**: #f1f5f9
- **Text Secondary**: #94a3b8
- **Border**: #2e2e3e
- **Success**: #10b981
- **Platform Colors**:
  - YouTube: #ff0000
  - Facebook: #1877f2
  - Instagram: #e4405f
  - TikTok: #00f2ea

#### Typography
- **Font Family**: "Sora", sans-serif (from Google Fonts)
- **Headings**: 
  - H1: 28px, weight 700
  - H2: 20px, weight 600
  - H3: 16px, weight 600
- **Body**: 14px, weight 400
- **Small**: 12px, weight 400

#### Spacing System
- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

#### Visual Effects
- Border radius: 8px (cards), 6px (buttons), 4px (inputs)
- Box shadows: 0 4px 20px rgba(0,0,0,0.3)
- Transitions: 200ms ease-out for all interactive elements
- Glassmorphism on header: backdrop-filter blur

### Components

#### 1. Header
- App logo (SVG icon)
- App title "Social Image Resizer"
- Subtle gradient underline

#### 2. Platform Tabs
- 4 tabs: YouTube, Facebook, Instagram, TikTok
- Each tab has platform-specific color indicator
- Active state: highlighted background + color underline
- Hover: subtle background change
- Icons for each platform

#### 3. Preset Panel (Left Sidebar)
- **Section: Platform Presets**
  - List of preset cards
  - Each card shows: name, dimensions, aspect ratio
  - "Select" button on each
  - Selected state: primary color border

- **Section: Custom Size**
  - Width input (number)
  - Height input (number)
  - Mode toggle: Scale / Crop
  - "Apply" button

#### 4. Upload Area
- Drag & drop zone when no image
- Click to browse fallback
- Supported formats indicator
- Animated dashed border on drag-over

#### 5. Canvas Preview
- Main preview area with checkerboard transparency pattern
- Image displayed with crop overlay
- Draggable crop box with resize handles
- Visual crop boundary overlay (dimmed outside crop)
- Loading spinner for large images

#### 6. Controls Bar
- Zoom slider (50% - 200%)
- Mode indicator (Scale/Fill)
- Reset button
- Download dropdown (JPG/PNG)

## Functionality Specification

### Core Features

#### 1. Image Upload
- Drag and drop support
- Click to browse file picker
- Accept: image/jpeg, image/png, image/webp
- Max file size: 50MB (client-side check)
- Display preview immediately after load

#### 2. Platform Presets
| Platform | Preset | Dimensions | Aspect Ratio |
|----------|--------|------------|--------------|
| YouTube | Thumbnail | 1280x720 | 16:9 |
| YouTube | Channel Banner | 2560x1440 | 16:9 |
| YouTube | Profile | 800x800 | 1:1 |
| Facebook | Post | 1200x630 | 1.91:1 |
| Facebook | Profile | 170x170 | 1:1 |
| Facebook | Cover | 820x312 | 2.63:1 |
| Instagram | Square Post | 1080x1080 | 1:1 |
| Instagram | Portrait | 1080x1350 | 4:5 |
| Instagram | Landscape | 1080x566 | 1.91:1 |
| Instagram | Story | 1080x1920 | 9:16 |
| TikTok | Profile | 200x200 | 1:1 |
| TikTok | Video | 1080x1920 | 9:16 |

#### 3. Custom Size
- Width: 1-4096px
- Height: 1-4096px
- Lock aspect ratio option
- Scale mode: resize to fit (letterbox)
- Crop mode: resize to fill + crop overflow

#### 4. Crop Functionality
- Draggable crop box
- Resize handles on corners and edges
- Minimum size: 50x50px
- Snap to image edges
- Visual guides (rule of thirds grid)

#### 5. Zoom & Pan
- Zoom slider: 50% - 200%
- Default: fit to canvas
- Click and drag to pan image
- Smooth zoom transitions

#### 6. Export
- Format: JPG or PNG
- Quality: 92% for JPG
- Filename: `{platform}_{preset}_{width}x{height}.jpg`
- Use canvas.toBlob() for download
- Maintain exact pixel dimensions

### User Interactions
1. User uploads image → appears in preview
2. User selects platform tab → shows relevant presets
3. User clicks preset → crop area updates to that size
4. User adjusts crop → real-time preview updates
5. User adjusts zoom/pan → image position updates
6. User clicks download → file downloads

### Edge Cases
- Very large images: show loading state, process in chunks
- Very small images: warn user about quality loss
- Invalid file type: show error message
- Custom size larger than image: auto-scale up with warning

## Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with indigo/cyan accents renders correctly
- [ ] All 4 platform tabs visible and clickable
- [ ] Preset cards display with correct dimensions
- [ ] Canvas shows checkerboard pattern when empty
- [ ] Crop overlay has visible boundaries
- [ ] Responsive layout works on mobile/tablet/desktop

### Functional Checkpoints
- [ ] Image uploads via drag-drop and click
- [ ] Preset selection updates crop area
- [ ] Custom size inputs work
- [ ] Scale vs Crop toggle changes behavior
- [ ] Crop box is draggable and resizable
- [ ] Zoom slider works
- [ ] Download produces correct file
- [ ] Filename format is correct
