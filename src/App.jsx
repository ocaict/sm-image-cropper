import { useState, useCallback, useRef, useEffect } from "react";
import { platforms, getAspectRatio } from "./utils/presets";
import { generateFilename } from "./utils/export";
import { useExportWorker } from "./hooks/useExportWorker";
import {
  IMAGE_CONFIG,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
} from "./config";

// Components
import Header from "./components/Header";
import PlatformTabs from "./components/PlatformTabs";
import PresetPanel from "./components/PresetPanel";
import CanvasArea from "./components/CanvasArea";
import TabbedControls from "./components/TabbedControls";
import BatchSidebar from "./components/BatchSidebar";
import SettingsModal from "./components/SettingsModal";
import TextOverlayPanel from "./components/TextOverlayPanel";

function App() {
  const [activePlatform, setActivePlatform] = useState(platforms[0]);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Batch State
  const [batch, setBatch] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Active Image State (Working Copy)
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [outputSize, setOutputSize] = useState({ width: 1280, height: 720 });
  const [customWidth, setCustomWidth] = useState(1280);
  const [customHeight, setCustomHeight] = useState(720);
  const [mode, setMode] = useState("crop");
  const [activeTab, setActiveTab] = useState("home"); // Lifted state

  // Scale mode settings
  const [paddingStyle, setPaddingStyle] = useState(
    IMAGE_CONFIG.DEFAULT_PADDING || "black",
  );
  const [customPaddingColor, setCustomPaddingColor] = useState(
    IMAGE_CONFIG.DEFAULT_PADDING_COLOR || "#000000",
  );
  const [scalePosition, setScalePosition] = useState({ x: 0, y: 0 });
  const [scaleZoom, setScaleZoom] = useState(1);
  const [vAlign, setVAlign] = useState(
    IMAGE_CONFIG.DEFAULT_V_ALIGN || "center",
  );
  const [hAlign, setHAlign] = useState(
    IMAGE_CONFIG.DEFAULT_H_ALIGN || "center",
  );
  const [showGrid, setShowGrid] = useState(IMAGE_CONFIG.GRID_ENABLED ?? true);
  const [showGuidelines, setShowGuidelines] = useState(
    IMAGE_CONFIG.SHOW_GUIDELINES ?? true,
  );
  const [safeZonePercentage, setSafeZonePercentage] = useState(
    IMAGE_CONFIG.SAFE_ZONE_PERCENTAGE || 10,
  );
  const [jpegQuality, setJpegQuality] = useState(IMAGE_CONFIG.JPEG_QUALITY * 100);
  const [recentPresets, setRecentPresets] = useState([]);
  const [adjustments, setAdjustments] = useState({ brightness: 100, contrast: 100, saturation: 100 });
  const [textLayers, setTextLayers] = useState([]);
  const [watermark, setWatermark] = useState({
    image: null,
    opacity: 50,
    scale: 20,
    position: "bottom-right",
  });

  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warning, setWarning] = useState(null);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const { processImage } = useExportWorker();

  // Load User OS Settings on Startup
  useEffect(() => {
    if (window.go?.main?.App?.LoadSettings) {
      window.go.main.App.LoadSettings()
        .then((settings) => {
          if (settings) {
            if (settings.jpegQuality > 0) setJpegQuality(settings.jpegQuality);
            if (settings.showGrid !== undefined) setShowGrid(settings.showGrid);
            if (settings.showGuidelines !== undefined)
              setShowGuidelines(settings.showGuidelines);
            if (settings.safeZonePercentage > 0)
              setSafeZonePercentage(settings.safeZonePercentage);
            if (settings.paddingStyle) setPaddingStyle(settings.paddingStyle);
            if (settings.customPaddingColor)
              setCustomPaddingColor(settings.customPaddingColor);
            if (settings.watermarkImage) {
              setWatermark({
                image: settings.watermarkImage,
                opacity: settings.watermarkOpacity || 50,
                scale: settings.watermarkScale || 20,
                position: settings.watermarkPosition || "bottom-right",
              });
            }
          }
        })
        .catch(() => {
          // Settings file doesn't exist yet (first run)
        });
    }
  }, []);

  // Save Settings when they change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.go?.main?.App?.SaveSettings) {
        const settings = {
          jpegQuality,
          showGrid,
          showGuidelines,
          safeZonePercentage,
          paddingStyle,
          customPaddingColor,
          watermarkImage: watermark.image,
          watermarkOpacity: watermark.opacity,
          watermarkScale: watermark.scale,
          watermarkPosition: watermark.position,
        };

        window.go.main.App.LoadSettings().then((current) => {
          window.go.main.App.SaveSettings({
            ...current,
            ...settings,
          });
        });
      }
    }, 1000); // Wait 1 second after last change

    return () => clearTimeout(timer);
  }, [
    jpegQuality,
    showGrid,
    showGuidelines,
    safeZonePercentage,
    paddingStyle,
    customPaddingColor,
    watermark,
  ]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (error || success || warning) {
      toastTimeoutRef.current = setTimeout(() => {
        setError(null);
        setSuccess(null);
        setWarning(null);
      }, UI_CONFIG.TOAST_DURATION);
    }
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [error, success, warning]);

  // Sync active item back to batch when it changes
  useEffect(() => {
    if (batch.length > 0 && batch[activeIndex]) {
      setBatch((prev) =>
        prev.map((item, i) =>
          i === activeIndex
            ? {
                ...item,
                crop,
                zoom,
                croppedAreaPixels,
                image,
                originalImage,
                imageSize,
                scalePosition,
                scaleZoom,
                adjustments,
                textLayers,
              }
            : item,
        ),
      );
    }
  }, [
    crop,
    zoom,
    croppedAreaPixels,
    image,
    originalImage,
    imageSize,
    scalePosition,
    scaleZoom,
    adjustments,
    textLayers,
    activeIndex,
    batch.length,
    watermark,
  ]);

  const handleTextLayerAdd = useCallback((layer) => {
    setTextLayers((prev) => [...prev, layer]);
  }, []);

  const handleTextLayerUpdate = useCallback((id, updates) => {
    setTextLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    );
  }, []);

  const handleTextLayerRemove = useCallback((id) => {
    setTextLayers((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const processFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const fullResUrl = img.src;
          let previewUrl = fullResUrl;

          // Proxy large images
          if (
            img.width > IMAGE_CONFIG.LARGE_IMAGE_THRESHOLD ||
            img.height > IMAGE_CONFIG.LARGE_IMAGE_THRESHOLD ||
            file.size > IMAGE_CONFIG.FILE_SIZE_THRESHOLD
          ) {
            const canvas = document.createElement("canvas");
            const maxDim = IMAGE_CONFIG.PREVIEW_MAX_DIMENSION;
            let w = img.width;
            let h = img.height;
            if (w > h) {
              if (w > maxDim) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              }
            } else {
              if (h > maxDim) {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            previewUrl = canvas.toDataURL(
              "image/jpeg",
              IMAGE_CONFIG.JPEG_QUALITY,
            );
          }

          resolve({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            image: previewUrl,
            originalImage: fullResUrl,
            imageSize: { width: img.width, height: img.height },
            crop: { x: 0, y: 0 },
            zoom: 1,
            croppedAreaPixels: null,
            adjustments: { brightness: 100, contrast: 100, saturation: 100 },
            textLayers: [],
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(
    async (files) => {
      if (!files || files.length === 0) return;

      const fileList = Array.from(files);

      // Validate file types
      const validFiles = fileList.filter((f) => f.type.startsWith("image/"));
      const invalidTypeCount = fileList.length - validFiles.length;

      if (invalidTypeCount > 0) {
        setError(ERROR_MESSAGES.FILE_TYPE_INVALID);
      }

      // Validate file sizes
      const fileSizeErrors = validFiles.filter(
        (f) => f.size > IMAGE_CONFIG.MAX_FILE_SIZE,
      );
      const filesWithValidSize = validFiles.filter(
        (f) => f.size <= IMAGE_CONFIG.MAX_FILE_SIZE,
      );

      if (fileSizeErrors.length > 0) {
        setError(ERROR_MESSAGES.FILE_SIZE_TOO_LARGE);
      }

      // Validate batch size
      const totalAfterUpload = batch.length + filesWithValidSize.length;
      if (totalAfterUpload > IMAGE_CONFIG.MAX_BATCH_SIZE) {
        setError(
          `Too many images. Maximum ${IMAGE_CONFIG.MAX_BATCH_SIZE} images allowed.`,
        );
        return;
      }

      if (filesWithValidSize.length === 0) {
        return;
      }

      setLoading(true);

      try {
        const newItems = await Promise.all(filesWithValidSize.map(processFile));
        const insertIndex = batch.length;
        setBatch((prev) => [...prev, ...newItems]);

        // Auto-switch to the first newly added image
        const first = newItems[0];
        setImage(first.image);
        setOriginalImage(first.originalImage);
        setImageSize(first.imageSize);
        setCrop(first.crop);
        setZoom(1);
        setCroppedAreaPixels(first.croppedAreaPixels);
        setScalePosition(first.scalePosition || { x: 0, y: 0 });
        setScaleZoom(first.scaleZoom || 1);
        setAdjustments(
          first.adjustments || {
            brightness: 100,
            contrast: 100,
            saturation: 100,
          },
        );
        setTextLayers(first.textLayers || []);
        setActiveIndex(insertIndex);

        // Show success message
        const count = newItems.length;
        setSuccess(
          `${count} ${count === 1 ? "image" : "images"} ${SUCCESS_MESSAGES.IMAGES_UPLOADED}`,
        );

        // Check for upscaling warning
        if (
          outputSize.width > first.imageSize.width ||
          outputSize.height > first.imageSize.height
        ) {
          setWarning(WARNING_MESSAGES.UPSCALING);
        } else {
          setWarning(null);
        }
      } catch (err) {
        setError(ERROR_MESSAGES.UPLOAD_FAILED);
      } finally {
        setLoading(false);
      }
    },
    [batch.length, outputSize],
  );

  const handleNativeFilePaths = useCallback(async (filePaths) => {
    if (!filePaths || filePaths.length === 0) return;

    setLoading(true);
    const files = [];
    
    for (const path of filePaths) {
      try {
        const dataUrl = await window.go.main.App.ReadFileAsBase64(path);
        const name = path.split('\\').pop().split('/').pop();
        
        // Decode base64 manually to bypass CSP connect-src issues with fetch()
        const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const base64Data = dataUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: mimeType });
        const file = new File([blob], name, { type: mimeType });
        
        files.push(file);
      } catch (err) {
        console.error("Failed to load native file:", path, err);
      }
    }
    
    handleFileSelect(files);
    setLoading(false);
  }, [handleFileSelect]);

  const handleNativeFileClick = useCallback(async () => {
    if (window.go?.main?.App?.SelectImages) {
      try {
        const filePaths = await window.go.main.App.SelectImages();
        await handleNativeFilePaths(filePaths);
      } catch (err) {
        console.error("Native file select failed", err);
        setLoading(false);
      }
    } else {
      fileInputRef.current?.click();
    }
  }, [handleNativeFilePaths]);

  // Hook into Wails native drag and drop
  useEffect(() => {
    if (window.runtime?.EventsOn) {
      const off = window.runtime.EventsOn("wails:file-drop", (x, y, paths) => {
        handleNativeFilePaths(paths);
      });
      return () => {
         if (window.runtime?.EventsOff) {
             window.runtime.EventsOff("wails:file-drop");
         }
      };
    }
  }, [handleNativeFilePaths]);

  const handleRemoveItem = useCallback(
    (index) => {
      const newBatch = batch.filter((_, i) => i !== index);

      if (newBatch.length === 0) {
        setBatch([]);
        setImage(null);
        setOriginalImage(null);
        setActiveIndex(0);
        return;
      }

      let nextIndex = activeIndex;
      if (index === activeIndex) {
        nextIndex = Math.max(0, index - 1);
      } else if (index < activeIndex) {
        nextIndex = activeIndex - 1;
      }

      setBatch(newBatch);
      handleSwitchImage(nextIndex);
    },
    [batch, activeIndex],
  );

  const handleReorder = useCallback(
    (fromIndex, toIndex) => {
      const newBatch = [...batch];
      const [moved] = newBatch.splice(fromIndex, 1);
      newBatch.splice(toIndex, 0, moved);
      setBatch(newBatch);

      // Keep the active image tracked correctly after reorder
      let nextActive = activeIndex;
      if (activeIndex === fromIndex) {
        nextActive = toIndex;
      } else if (fromIndex < activeIndex && toIndex >= activeIndex) {
        nextActive = activeIndex - 1;
      } else if (fromIndex > activeIndex && toIndex <= activeIndex) {
        nextActive = activeIndex + 1;
      }
      setActiveIndex(nextActive);
    },
    [batch, activeIndex],
  );

  const handleSwitchImage = useCallback(
    (index) => {
      const next = batch[index];
      if (next) {
        setActiveIndex(index);
        setImage(next.image);
        setOriginalImage(next.originalImage);
        setImageSize(next.imageSize);
        setCrop(next.crop);
        setZoom(next.zoom);
        setCroppedAreaPixels(next.croppedAreaPixels);
        setScalePosition(next.scalePosition || { x: 0, y: 0 });
        setScaleZoom(next.scaleZoom || 1);
        setAdjustments(next.adjustments || { brightness: 100, contrast: 100, saturation: 100 });
        setTextLayers(next.textLayers || []);
        // Note: global watermark is intentionally not part of local batch item switch
      }
    },
    [batch],
  );

  const handleApplyAdjustmentsToAll = useCallback(() => {
    if (batch.length <= 1) return;
    setBatch(prev => prev.map(item => ({
      ...item,
      adjustments: { ...adjustments }
    })));
    setSuccess("Adjustments applied to all images in batch");
  }, [batch.length, adjustments]);

  const handleApplyScaleToAll = useCallback(() => {
    if (batch.length <= 1) return;
    setBatch(prev => prev.map(item => ({
      ...item,
      scaleZoom,
      scalePosition: { ...scalePosition }
    })));
    setSuccess("Scale and position applied to all images in batch");
  }, [batch.length, scaleZoom, scalePosition]);

  const handleExportAll = useCallback(
    async (format) => {
      if (batch.length === 0) return;

      try {
        setLoading(true);
        let exportDir = null;

        if (window.go?.main?.App?.SelectDirectory) {
           try {
             exportDir = await window.go.main.App.SelectDirectory();
           } catch(err) {
              setLoading(false);
              return; // User cancelled directory selection
           }
        }

        setBatchProgress({ current: 0, total: batch.length });

        for (let index = 0; index < batch.length; index++) {
          const item = batch[index];
          // Load high-res source
          const img = new Image();
          img.src = item.originalImage;
          await new Promise((resolve) => (img.onload = resolve));
          const imageBitmap = await createImageBitmap(img);

          const blob = await processImage(
            {
              imageBitmap,
              croppedAreaPixels: item.croppedAreaPixels,
              outputSize,
              mode,
              format,
              quality: jpegQuality / 100,
              paddingStyle,
              customColor:
                paddingStyle === "custom" ? customPaddingColor : undefined,
              vAlign,
              hAlign,
              scalePosition: mode === "scale" ? item.scalePosition : undefined,
              scaleZoom: mode === "scale" ? (item.scaleZoom || scaleZoom) : undefined,
              adjustments: item.adjustments || adjustments,
              textLayers: item.textLayers || [],
              watermark,
            },
            [imageBitmap],
          );

          imageBitmap.close();

          const filename = generateFilename(
            activePlatform.id,
            selectedPreset?.id || "batch",
            outputSize.width,
            outputSize.height,
            format,
          );

          // Append unique identifier for batch items to avoid naming collisions
          const finalFilename = `${item.id}_${filename}`;

          if (window.go?.main?.App?.SaveImageToPath && exportDir) {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            await new Promise((resolve) => {
              reader.onloadend = async () => {
                 try {
                   const fullPath = await window.go.main.App.JoinPath(exportDir, finalFilename);
                   await window.go.main.App.SaveImageToPath(reader.result, fullPath);
                 } catch(err) { console.error(err); }
                 resolve();
              }
            });
          } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }

          // Update progress
          setBatchProgress({ current: index + 1, total: batch.length });
        }

        setLoading(false);
        setBatchProgress({ current: 0, total: 0 });
        setShowDownloadMenu(false);
        setSuccess(SUCCESS_MESSAGES.BATCH_EXPORT_COMPLETE);
      } catch (err) {
        console.error("Batch export failed:", err);
        setLoading(false);
        setBatchProgress({ current: 0, total: 0 });
        setError(ERROR_MESSAGES.BATCH_EXPORT_FAILED + err.message);
      }
    },
    [
      batch,
      outputSize,
      mode,
      activePlatform,
      selectedPreset,
      processImage,
      paddingStyle,
      customPaddingColor,
      vAlign,
      hAlign,
      scaleZoom,
      jpegQuality,
    ],
  );

  const handlePresetSelect = useCallback((preset) => {
    setSelectedPreset(preset);
    setOutputSize({ width: preset.width, height: preset.height });
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    
    // Reset scale-specific settings when selecting a new preset
    setScalePosition({ x: 0, y: 0 });
    setScaleZoom(1);

    // Add to recent presets (max 5)
    setRecentPresets(prev => {
      const filtered = prev.filter(p => p.id !== preset.id);
      return [preset, ...filtered].slice(0, 5);
    });

    if (imageSize.width > 0) {
      if (preset.width > imageSize.width || preset.height > imageSize.height) {
        setWarning(WARNING_MESSAGES.UPSCALING);
      } else {
        setWarning(null);
      }
    }
  }, [imageSize]);

  const handleCustomApply = useCallback(() => {
    setSelectedPreset(null);
    setOutputSize({ width: customWidth, height: customHeight });
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    // Reset scale-specific settings
    setScalePosition({ x: 0, y: 0 });
    setScaleZoom(1);

    if (imageSize.width > 0) {
      if (customWidth > imageSize.width || customHeight > imageSize.height) {
        setWarning(WARNING_MESSAGES.UPSCALING);
      } else {
        setWarning(null);
      }
    }
  }, [customWidth, customHeight, imageSize]);

  const handleQuickSizeSelect = useCallback((size) => {
    const preset = {
      id: `quick-${size.width}x${size.height}`,
      name: size.name || `${size.width}×${size.height}`,
      width: size.width,
      height: size.height,
    };
    setSelectedPreset(preset);
    setOutputSize({ width: size.width, height: size.height });
    setCustomWidth(size.width);
    setCustomHeight(size.height);
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    // Reset scale-specific settings
    setScalePosition({ x: 0, y: 0 });
    setScaleZoom(1);

    // Add to recent presets
    setRecentPresets(prev => {
      const filtered = prev.filter(p => p.id !== preset.id);
      return [preset, ...filtered].slice(0, 5);
    });

    if (imageSize.width > 0) {
      if (size.width > imageSize.width || size.height > imageSize.height) {
        setWarning(WARNING_MESSAGES.UPSCALING);
      } else {
        setWarning(null);
      }
    }
  }, [imageSize]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDownload = useCallback(
    async (format) => {
      if (!originalImage) return;

      try {
        setLoading(true);

        const img = new Image();
        img.src = originalImage;
        await new Promise((resolve) => (img.onload = resolve));
        const imageBitmap = await createImageBitmap(img);

        const blob = await processImage(
          {
            imageBitmap,
            croppedAreaPixels,
            outputSize,
            mode,
            format,
            quality: jpegQuality / 100,
            paddingStyle,
            customColor:
              paddingStyle === "custom" ? customPaddingColor : undefined,
            vAlign,
            hAlign,
            scalePosition: mode === "scale" ? scalePosition : undefined,
            scaleZoom: mode === "scale" ? scaleZoom : undefined,
            adjustments,
            textLayers,
            watermark,
          },
          [imageBitmap],
        );

        imageBitmap.close();

        const filename = generateFilename(
          activePlatform.id,
          selectedPreset?.id || "custom",
          outputSize.width,
          outputSize.height,
          format,
        );

        if (window.go?.main?.App?.SaveImage) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
             try {
                const savedPath = await window.go.main.App.SaveImage(reader.result, filename);
                if (savedPath) {
                   setSuccess(`${SUCCESS_MESSAGES.EXPORT_COMPLETE} to ${savedPath}`);
                }
             } catch(err) {
                if (err && !err.message?.includes("dialog cancelled") && !err.includes("dialog cancelled")) {
                   setError(ERROR_MESSAGES.EXPORT_FAILED + err);
                }
             } finally {
                setLoading(false);
                setShowDownloadMenu(false);
             }
          }
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setLoading(false);
        setShowDownloadMenu(false);
        setSuccess(SUCCESS_MESSAGES.EXPORT_COMPLETE);
      } catch (err) {
        console.error("Export failed:", err);
        setLoading(false);
        setShowDownloadMenu(false);
        setError(ERROR_MESSAGES.EXPORT_FAILED + err.message);
      }
    },
    [
      originalImage,
      outputSize,
      croppedAreaPixels,
      mode,
      activePlatform,
      selectedPreset,
      processImage,
      paddingStyle,
      customPaddingColor,
      vAlign,
      hAlign,
      scalePosition,
      scaleZoom,
      jpegQuality,
    ],
  );

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcuts if the user is typing in an input/textarea
      if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;

      if (e.key === 'ArrowLeft') {
        if (batch.length > 1 && activeIndex > 0) {
          handleSwitchImage(activeIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (batch.length > 1 && activeIndex < batch.length - 1) {
          handleSwitchImage(activeIndex + 1);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (batch.length > 0) {
          handleRemoveItem(activeIndex);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleNativeFileClick();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (batch.length > 1) {
          handleExportAll('jpeg');
        } else if (batch.length === 1) {
          handleDownload('jpeg');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    batch.length,
    activeIndex,
    handleSwitchImage,
    handleRemoveItem,
    handleNativeFileClick,
    handleExportAll,
    handleDownload,
  ]);

  return (
    <div className="app">
      <Header />

      <PlatformTabs
        platforms={platforms}
        activePlatform={activePlatform}
        onPlatformSelect={(platform) => {
          setActivePlatform(platform);
          setSelectedPreset(null);
        }}
      />

      <div className={`main-content ${batch.length > 0 ? "has-batch" : ""}`}>
        <BatchSidebar
          batch={batch}
          activeIndex={activeIndex}
          onSelect={handleSwitchImage}
          onRemove={handleRemoveItem}
          onAddMore={handleNativeFileClick}
          onReorder={handleReorder}
        />

        <PresetPanel
          activePlatform={activePlatform}
          selectedPreset={selectedPreset}
          onPresetSelect={handlePresetSelect}
          customWidth={customWidth}
          setCustomWidth={setCustomWidth}
          customHeight={customHeight}
          setCustomHeight={setCustomHeight}
          mode={mode}
          setMode={setMode}
          onCustomApply={handleCustomApply}
          imageSize={imageSize}
        />

        <CanvasArea
          image={image}
          dragOver={dragOver}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onFileClick={handleNativeFileClick}
          loading={loading}
          imageSize={imageSize}
          outputSize={outputSize}
          crop={crop}
          setCrop={setCrop}
          zoom={zoom}
          setZoom={setZoom}
          onCropComplete={onCropComplete}
          mode={mode}
          containerRef={containerRef}
          onScalePositionChange={setScalePosition}
          showGrid={showGrid}
          showGuidelines={showGuidelines}
          safeZonePercentage={safeZonePercentage}
          vAlign={vAlign}
          hAlign={hAlign}
          paddingStyle={paddingStyle}
          customColor={customPaddingColor}
          scaleZoom={scaleZoom}
          onScaleZoomChange={setScaleZoom}
          adjustments={adjustments}
          textLayers={textLayers}
          onTextLayerUpdate={handleTextLayerUpdate}
          watermark={watermark}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: "none" }}
      />

      {image && (
        <TabbedControls
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          zoom={Math.round(zoom * 100)}
          setZoom={(val) => setZoom(val / 100)}
          imageSize={imageSize}
          outputSize={outputSize}
          mode={mode}
          setMode={setMode}
          onReset={handleReset}
          onClear={() => {
            setBatch([]);
            setImage(null);
            setOriginalImage(null);
            setSelectedPreset(null);
          }}
          onDownload={handleDownload}
          onExportAll={handleExportAll}
          isBatch={batch.length > 1}
          loading={loading}
          batchProgress={batchProgress}
          onOpenSettings={() => setShowSettingsModal(true)}
          vAlign={vAlign}
          onVAlignChange={setVAlign}
          hAlign={hAlign}
          onHAlignChange={setHAlign}
          paddingStyle={paddingStyle}
          onPaddingStyleChange={setPaddingStyle}
          customColor={customPaddingColor}
          onCustomColorChange={setCustomPaddingColor}
          showGrid={showGrid}
          onShowGridChange={setShowGrid}
          showGuidelines={showGuidelines}
          onShowGuidelinesChange={setShowGuidelines}
          safeZonePercentage={safeZonePercentage}
          onSafeZonePercentageChange={setSafeZonePercentage}
          selectedPreset={selectedPreset}
          activePlatform={activePlatform}
          jpegQuality={jpegQuality}
          onJpegQualityChange={setJpegQuality}
          recentPresets={recentPresets}
          adjustments={adjustments}
          onAdjustmentsChange={setAdjustments}
          textLayers={textLayers}
          onTextLayerAdd={handleTextLayerAdd}
          onTextLayerUpdate={handleTextLayerUpdate}
          onTextLayerRemove={handleTextLayerRemove}
          onQuickSizeSelect={handleQuickSizeSelect}
          watermark={watermark}
          onWatermarkUpload={(image) => setWatermark(prev => ({ ...prev, image }))}
          onWatermarkUpdate={(updates) => setWatermark(prev => ({ ...prev, ...updates }))}
          onWatermarkRemove={() => setWatermark(prev => ({ ...prev, image: null }))}
          onApplyAdjustmentsToAll={handleApplyAdjustmentsToAll}
          onApplyScaleToAll={handleApplyScaleToAll}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        mode={mode}
        setMode={setMode}
        vAlign={vAlign}
        onVAlignChange={setVAlign}
        hAlign={hAlign}
        onHAlignChange={setHAlign}
        paddingStyle={paddingStyle}
        onPaddingStyleChange={setPaddingStyle}
        customColor={customPaddingColor}
        onCustomColorChange={setCustomPaddingColor}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        showGuidelines={showGuidelines}
        onShowGuidelinesChange={setShowGuidelines}
        safeZonePercentage={safeZonePercentage}
        onSafeZonePercentageChange={setSafeZonePercentage}
        image={image}
        imageSize={imageSize}
        outputSize={outputSize}
      />

      {error && (
        <div className="error-toast" onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-toast" onClick={() => setSuccess(null)}>
          {success}
        </div>
      )}

      {warning && (
        <div className="warning-toast" onClick={() => setWarning(null)}>
          {warning}
        </div>
      )}
    </div>
  );
}

export default App;
