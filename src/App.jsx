import { useState, useCallback, useRef, useEffect } from "react";
import { platforms, getAspectRatio } from "./utils/presets";
import { generateFilename } from "./utils/export";

import {
  IMAGE_CONFIG,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
} from "./config";

// Hooks
import { useExportWorker } from "./hooks/useExportWorker";
import { useAppSettings } from "./hooks/useAppSettings";
import { useBatchProcessor } from "./hooks/useBatchProcessor";


// Components
import Header from "./components/Header";
import PlatformTabs from "./components/PlatformTabs";
import PresetPanel from "./components/PresetPanel";
import CanvasArea from "./components/CanvasArea";
import TabbedControls from "./components/TabbedControls";
import BatchSidebar from "./components/BatchSidebar";
import SettingsModal from "./components/SettingsModal";
import TextOverlayPanel from "./components/TextOverlayPanel";
import StatusBar from "./components/StatusBar";


function App() {
  const [activePlatform, setActivePlatform] = useState(platforms[0]);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // App Settings & Native Sync
  const [settings, setSettings] = useAppSettings(IMAGE_CONFIG);
  
  // Batch State Management
  const {
    batch,
    setBatch,
    activeIndex,
    setActiveIndex,
    addItemToBatch,
    removeItemFromBatch,
    updateActiveItem,
    reorderBatch,
    activeItem,
  } = useBatchProcessor();

  // Active Image State (Working Copy) - Initialized from activeItem if it exists
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedAreaPercent, setCroppedAreaPercent] = useState(null);


  const [outputSize, setOutputSize] = useState({ width: 1280, height: 720 });
  const [customWidth, setCustomWidth] = useState(1280);
  const [customHeight, setCustomHeight] = useState(720);
  const [mode, setMode] = useState("crop");
  const [activeTab, setActiveTab] = useState("home");

  // Scale mode settings
  const [scalePosition, setScalePosition] = useState({ x: 0, y: 0 });
  const [scaleZoom, setScaleZoom] = useState(1);
  const [vAlign, setVAlign] = useState(IMAGE_CONFIG.DEFAULT_V_ALIGN || "center");
  const [hAlign, setHAlign] = useState(IMAGE_CONFIG.DEFAULT_H_ALIGN || "center");
  
  const [recentPresets, setRecentPresets] = useState([]);
  const [adjustments, setAdjustments] = useState({ brightness: 100, contrast: 100, saturation: 100 });
  const [textLayers, setTextLayers] = useState([]);

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

  const {
    jpegQuality,
    showGrid,
    showGuidelines,
    safeZonePercentage,
    paddingStyle,
    customPaddingColor,
    watermark,
  } = settings;

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

  // Sync active item back to batch when editor state changes
  useEffect(() => {
    if (batch.length > 0 && activeItem) {
      updateActiveItem({
        crop,
        zoom,
        croppedAreaPixels,
        croppedAreaPercent,
        image,
        originalImage,
        imageSize,
        scalePosition,
        scaleZoom,
        adjustments,
        textLayers,
      });
    }
  }, [
    crop,
    zoom,
    croppedAreaPixels,
    croppedAreaPercent,
    image,
    originalImage,
    imageSize,
    scalePosition,
    scaleZoom,
    adjustments,
    textLayers,
    activeIndex,
    batch.length,
    updateActiveItem,
    activeItem
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
            croppedAreaPercent: null,
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
        addItemToBatch(newItems);

        // Effect will handle loading the first one
        setActiveIndex(insertIndex);

        // Show success message
        const count = newItems.length;
        setSuccess(
          `${count} ${count === 1 ? "image" : "images"} ${SUCCESS_MESSAGES.IMAGES_UPLOADED}`,
        );

        // Check for upscaling warning
        const first = newItems[0];
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

  // Sync editor state from activeItem when activeIndex changes
  useEffect(() => {
    if (activeItem) {
      setImage(activeItem.image);
      setOriginalImage(activeItem.originalImage);
      setImageSize(activeItem.imageSize);
      setCrop(activeItem.crop || { x: 0, y: 0 });
      setZoom(activeItem.zoom || 1);
      setCroppedAreaPixels(activeItem.croppedAreaPixels);
      setCroppedAreaPercent(activeItem.croppedAreaPercent);
      setScalePosition(activeItem.scalePosition || { x: 0, y: 0 });

      setScaleZoom(activeItem.scaleZoom || 1);
      setAdjustments(activeItem.adjustments || { brightness: 100, contrast: 100, saturation: 100 });
      setTextLayers(activeItem.textLayers || []);
    } else {
      setImage(null);
      setOriginalImage(null);
    }
  }, [activeIndex, activeItem?.id]);


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

          // Calculate high-res crop pixels based on percentage
          const finalCropPixels = item.croppedAreaPercent ? {
            x: Math.round((item.croppedAreaPercent.x / 100) * img.width),
            y: Math.round((item.croppedAreaPercent.y / 100) * img.height),
            width: Math.round((item.croppedAreaPercent.width / 100) * img.width),
            height: Math.round((item.croppedAreaPercent.height / 100) * img.height),
          } : item.croppedAreaPixels;

          const blob = await processImage(
            {
              imageBitmap,
              croppedAreaPixels: finalCropPixels,
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
    setCroppedAreaPercent(croppedArea);
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

        // Calculate high-res crop pixels based on percentage to avoid downscaling issues
        const finalCropPixels = croppedAreaPercent ? {
          x: Math.round((croppedAreaPercent.x / 100) * img.width),
          y: Math.round((croppedAreaPercent.y / 100) * img.height),
          width: Math.round((croppedAreaPercent.width / 100) * img.width),
          height: Math.round((croppedAreaPercent.height / 100) * img.height),
        } : croppedAreaPixels;

        const blob = await processImage(
          {
            imageBitmap,
            croppedAreaPixels: finalCropPixels,
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
          setActiveIndex(activeIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (batch.length > 1 && activeIndex < batch.length - 1) {
          setActiveIndex(activeIndex + 1);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (batch.length > 0) {
          removeItemFromBatch(activeIndex);
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
    setActiveIndex,
    removeItemFromBatch,
    handleNativeFileClick,
    handleExportAll,
    handleDownload,
  ]);

  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
    };

    const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
    events.forEach(eventName => {
      window.addEventListener(eventName, preventDefault, true);
      document.body.addEventListener(eventName, preventDefault, true);
    });

    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, preventDefault, true);
        document.body.removeEventListener(eventName, preventDefault, true);
      });
    };
  }, []);


  const handleApplyToAll = useCallback((type) => {
    if (type === 'adjustments') handleApplyAdjustmentsToAll();
    if (type === 'scale') handleApplyScaleToAll();
  }, [handleApplyAdjustmentsToAll, handleApplyScaleToAll]);

  return (
    <div className="app-main-layout">
      <Header 
        onImport={handleNativeFileClick}
        onExport={handleDownload}
        onExportAll={handleExportAll}
        onClear={() => {
          setBatch([]);
          setImage(null);
          setOriginalImage(null);
          setSelectedPreset(null);
        }}
        onApplyToAll={handleApplyToAll}
        onToggleGrid={() => setSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))}
        onToggleGuides={() => setSettings(prev => ({ ...prev, showGuidelines: !prev.showGuidelines }))}
        onResetZoom={handleReset}
        onOpenSettings={() => setShowSettingsModal(true)}
        isBatch={batch.length > 0}
        mode={mode}
        outputSize={outputSize}
      />

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
          onSelect={setActiveIndex}
          onRemove={removeItemFromBatch}
          onAddMore={handleNativeFileClick}
          onReorder={reorderBatch}
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
          croppedAreaPixels={croppedAreaPixels}
          croppedAreaPercent={croppedAreaPercent}
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
          onPaddingStyleChange={(val) => setSettings(prev => ({ ...prev, paddingStyle: val }))}
          customColor={customPaddingColor}
          onCustomColorChange={(val) => setSettings(prev => ({ ...prev, customPaddingColor: val }))}
          showGrid={showGrid}
          onShowGridChange={(val) => setSettings(prev => ({ ...prev, showGrid: val }))}
          showGuidelines={showGuidelines}
          onShowGuidelinesChange={(val) => setSettings(prev => ({ ...prev, showGuidelines: val }))}
          safeZonePercentage={safeZonePercentage}
          onSafeZonePercentageChange={(val) => setSettings(prev => ({ ...prev, safeZonePercentage: val }))}
          selectedPreset={selectedPreset}
          activePlatform={activePlatform}
          jpegQuality={jpegQuality}
          onJpegQualityChange={(val) => setSettings(prev => ({ ...prev, jpegQuality: val }))}
          recentPresets={recentPresets}
          adjustments={adjustments}
          onAdjustmentsChange={setAdjustments}
          textLayers={textLayers}
          onTextLayerAdd={handleTextLayerAdd}
          onTextLayerUpdate={handleTextLayerUpdate}
          onTextLayerRemove={handleTextLayerRemove}
          onQuickSizeSelect={handleQuickSizeSelect}
          watermark={watermark}
          onWatermarkUpload={(image) => setSettings(prev => ({ ...prev, watermark: { ...prev.watermark, image } }))}
          onWatermarkUpdate={(updates) => setSettings(prev => ({ ...prev, watermark: { ...prev.watermark, ...updates } }))}
          onWatermarkRemove={() => setSettings(prev => ({ ...prev, watermark: { ...prev.watermark, image: null } }))}
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
        onPaddingStyleChange={(val) => setSettings(prev => ({ ...prev, paddingStyle: val }))}
        customColor={customPaddingColor}
        onCustomColorChange={(val) => setSettings(prev => ({ ...prev, customPaddingColor: val }))}
        showGrid={showGrid}
        onShowGridChange={(val) => setSettings(prev => ({ ...prev, showGrid: val }))}
        showGuidelines={showGuidelines}
        onShowGuidelinesChange={(val) => setSettings(prev => ({ ...prev, showGuidelines: val }))}
        safeZonePercentage={safeZonePercentage}
        onSafeZonePercentageChange={(val) => setSettings(prev => ({ ...prev, safeZonePercentage: val }))}
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

      <StatusBar 
        imageSize={imageSize}
        outputSize={outputSize}
        mode={mode}
        loading={loading}
        batchProgress={batchProgress}
      />
    </div>
  );
}


export default App;
