import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import Cropper from "react-easy-crop";
import { calculateScalePlacement, calculateScalePlacementMemo } from "../utils/scaling";

const DraggableText = ({
  layer,
  onUpdate,
  containerWidth,
  containerHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: layer.x,
      startY: layer.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaX = ((e.clientX - dragStartRef.current.x) / containerWidth) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / containerHeight) * 100;

      onUpdate(layer.id, {
        x: Math.max(0, Math.min(100, dragStartRef.current.startX + deltaX)),
        y: Math.max(0, Math.min(100, dragStartRef.current.startY + deltaY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, containerWidth, containerHeight, layer.id, onUpdate]);

  return (
    <div
      className={`canvas-text-layer ${isDragging ? "dragging" : ""} ${layer.shadow ? "text-shadow-effect" : ""}`}
      onMouseDown={handleMouseDown}
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        transform: `translate(${layer.textAlign === "center" ? "-50%" : layer.textAlign === "right" ? "-100%" : "0"}, ${layer.y > 90 ? "-100%" : "0"})`,
        fontSize: `${(layer.fontSize / 1000) * containerWidth}px`,
        color: layer.color,
        fontFamily: layer.fontFamily,
        fontWeight: layer.fontWeight,
        textAlign: layer.textAlign,
      }}
    >
      {layer.text}
    </div>
  );
};

// Calculate offset bounds based on alignment
const calculateOffsetBounds = (previewPlacement, previewWidth, previewHeight) => {
  const { x: alignX, y: alignY, drawWidth, drawHeight } = previewPlacement;
  
  // Available space on each side based on alignment
  const leftSpace = alignX;
  const rightSpace = previewWidth - (alignX + drawWidth);
  const topSpace = alignY;
  const bottomSpace = previewHeight - (alignY + drawHeight);
  
  return {
    minX: -leftSpace,
    maxX: rightSpace,
    minY: -topSpace,
    maxY: bottomSpace,
  };
};

const InteractiveScalePreview = memo(({
  image,
  imageSize,
  outputSize,
  onPositionChange,
  showGrid = true,
  showGuidelines = true,
  safeZonePercentage = 10,
  vAlign = "center",
  hAlign = "center",
  paddingStyle = "black",
  customColor = "#000000",
  scaleZoom = 1,
  onScaleZoomChange,
  adjustments = { brightness: 100, contrast: 100, saturation: 100 },
  textLayers = [],
  onTextLayerUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const resizeTimeoutRef = useRef(null);

  const aspect = outputSize.width / outputSize.height;

  // Responsive preview sizing with debounced resize
  const containerRef = useRef(null);
  const [previewSize, setPreviewSize] = useState({ width: 300, height: 300 / aspect });

  useEffect(() => {
    const updateSize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        if (containerRef.current) {
          const container = containerRef.current.parentElement;
          if (container) {
            const maxWidth = Math.min(container.clientWidth - 40, 500);
            const maxHeight = Math.min(container.clientHeight - 160, 500);
            const size = Math.min(maxWidth, maxHeight * aspect, maxWidth / aspect, maxHeight);
            setPreviewSize({ width: size, height: size / aspect });
          }
        }
      }, 100);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [aspect, outputSize]);

  const previewWidth = previewSize.width;
  const previewHeight = previewSize.height;

  // Use memoized calculation for better performance
  const previewPlacement = calculateScalePlacementMemo(
    imageSize.width,
    imageSize.height,
    previewWidth,
    previewHeight,
    vAlign,
    hAlign,
  );

  // Calculate bounds based on alignment
  const offsetBounds = calculateOffsetBounds(previewPlacement, previewWidth, previewHeight);

  // Handle arrow key navigation
  const handleKeyDown = useCallback((e) => {
    if (!previewRef.current?.contains(document.activeElement)) return;
    
    const step = e.shiftKey ? 20 : 5;
    let newOffset = { ...offset };
    let changed = false;

    switch (e.key) {
      case "ArrowUp":
        newOffset.y += step;
        changed = true;
        e.preventDefault();
        break;
      case "ArrowDown":
        newOffset.y -= step;
        changed = true;
        e.preventDefault();
        break;
      case "ArrowLeft":
        newOffset.x += step;
        changed = true;
        e.preventDefault();
        break;
      case "ArrowRight":
        newOffset.x -= step;
        changed = true;
        e.preventDefault();
        break;
      case "Home":
        newOffset = { x: 0, y: 0 };
        changed = true;
        e.preventDefault();
        break;
    }

    if (changed) {
      // Clamp offset to valid range based on alignment
      newOffset.x = Math.max(offsetBounds.minX, Math.min(offsetBounds.maxX, newOffset.x));
      newOffset.y = Math.max(offsetBounds.minY, Math.min(offsetBounds.maxY, newOffset.y));
      
      setOffset(newOffset);
      
      const scale = previewPlacement.drawWidth / imageSize.width;
      onPositionChange({
        x: -newOffset.x / scale,
        y: -newOffset.y / scale,
      });
    }
  }, [offset, offsetBounds, previewPlacement, imageSize, onPositionChange]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset offset when alignment changes
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    onPositionChange({ x: 0, y: 0 });
  }, [vAlign, hAlign, onPositionChange]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  }, [offset]);

  useEffect(() => {
    if (!isDragging) return;

    const SNAP_THRESHOLD = 15;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      let newOffsetX = dragStartRef.current.offsetX + deltaX;
      let newOffsetY = dragStartRef.current.offsetY + deltaY;

      // Snap to edges
      if (Math.abs(newOffsetX - offsetBounds.maxX) < SNAP_THRESHOLD) {
        newOffsetX = offsetBounds.maxX;
      } else if (Math.abs(newOffsetX - offsetBounds.minX) < SNAP_THRESHOLD) {
        newOffsetX = offsetBounds.minX;
      }
      
      if (Math.abs(newOffsetY - offsetBounds.maxY) < SNAP_THRESHOLD) {
        newOffsetY = offsetBounds.maxY;
      } else if (Math.abs(newOffsetY - offsetBounds.minY) < SNAP_THRESHOLD) {
        newOffsetY = offsetBounds.minY;
      }

      // Clamp to bounds
      newOffsetX = Math.max(offsetBounds.minX, Math.min(offsetBounds.maxX, newOffsetX));
      newOffsetY = Math.max(offsetBounds.minY, Math.min(offsetBounds.maxY, newOffsetY));

      setOffset({ x: newOffsetX, y: newOffsetY });

      const scale = previewPlacement.drawWidth / imageSize.width;
      onPositionChange({
        x: -newOffsetX / scale,
        y: -newOffsetY / scale,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offsetBounds, previewPlacement, imageSize, onPositionChange]);

  const handleResetPosition = useCallback(() => {
    setOffset({ x: 0, y: 0 });
    onPositionChange({ x: 0, y: 0 });
  }, [onPositionChange]);

  const getBackgroundColor = useCallback(() => {
    switch (paddingStyle) {
      case "white":
        return "#ffffff";
      case "custom":
        return customColor;
      case "blur":
        return "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
      case "extend":
        return "linear-gradient(90deg, #2d2d2d 0%, #3d3d3d 50%, #2d2d2d 100%)";
      case "black":
      default:
        return "#000000";
    }
  }, [paddingStyle, customColor]);

  const getImageFilter = useCallback(() => {
    const { brightness = 100, contrast = 100, saturation = 100 } = adjustments;
    const hasAdjustments = brightness !== 100 || contrast !== 100 || saturation !== 100;
    const adjustFilter = hasAdjustments
      ? `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      : '';

    if (paddingStyle === 'blur') {
      return adjustFilter || 'none';
    }
    return adjustFilter || 'none';
  }, [paddingStyle, adjustments]);

  const showBlurBackground = paddingStyle === "blur";
  const showExtendBackground = paddingStyle === "extend";

  return (
    <div className="scale-preview-container" ref={containerRef}>
      <div
        ref={previewRef}
        className="scale-preview"
        style={{
          width: previewWidth,
          height: previewHeight,
          position: "relative",
          background: getBackgroundColor(),
          borderRadius: 8,
          overflow: "hidden",
          outline: "none",
          tabIndex: 0,
          cursor: isDragging ? "grabbing" : "grab",
          border: "2px solid var(--accent)",
          margin: "12px auto",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Blurred background for blur mode */}
        {showBlurBackground && (
          <img
            src={image}
            alt=""
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(15px)",
              transform: "scale(1.1)",
              zIndex: 0,
            }}
          />
        )}

        {/* Extended edges background for extend mode */}
        {showExtendBackground && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `
                linear-gradient(to right, rgba(100,100,100,0.3) 0%, transparent 20%),
                linear-gradient(to left, rgba(100,100,100,0.3) 0%, transparent 20%),
                linear-gradient(to bottom, rgba(100,100,100,0.3) 0%, transparent 20%),
                linear-gradient(to top, rgba(100,100,100,0.3) 0%, transparent 20%)
              `,
              zIndex: 0,
            }}
          />
        )}
        
        <img
          src={image}
          alt="Scale Preview"
          style={{
            position: "absolute",
            filter: paddingStyle === "blur" ? "none" : getImageFilter(),
            width: previewPlacement.drawWidth * scaleZoom,
            height: previewPlacement.drawHeight * scaleZoom,
            left: previewPlacement.x + offset.x - (previewPlacement.drawWidth * (scaleZoom - 1)) / 2,
            top: previewPlacement.y + offset.y - (previewPlacement.drawHeight * (scaleZoom - 1)) / 2,
            pointerEvents: "none",
            userSelect: "none",
            borderRadius: 4,
            zIndex: 1,
          }}
          draggable={false}
        />

        {/* Grid overlay */}
        <GuidesOverlay
          width={previewWidth}
          height={previewHeight}
          showGrid={showGrid}
          showGuidelines={showGuidelines}
          safeZonePercentage={safeZonePercentage}
        />

        {/* Text Layers */}
        {textLayers.map((layer) => (
          <DraggableText
            key={layer.id}
            layer={layer}
            onUpdate={onTextLayerUpdate}
            containerWidth={previewWidth}
            containerHeight={previewHeight}
          />
        ))}
      </div>

      {/* Scale mode zoom control with presets */}
      <div className="scale-zoom-control">
        <span className="zoom-label">Zoom</span>
        <div className="zoom-presets">
          {[
            { label: 'Fit', value: 100 },
            { label: '50%', value: 50 },
            { label: '100%', value: 100 },
            { label: '150%', value: 150 },
            { label: '200%', value: 200 },
          ].map((preset) => (
            <button
              key={preset.value}
              className={`zoom-preset-btn ${scaleZoom * 100 === preset.value ? 'active' : ''}`}
              onClick={() => onScaleZoomChange?.(preset.value / 100)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          min="50"
          max="200"
          value={scaleZoom * 100}
          onChange={(e) => onScaleZoomChange?.(parseInt(e.target.value) / 100)}
          className="scale-zoom-slider"
        />
        <span className="zoom-value">{Math.round(scaleZoom * 100)}%</span>
      </div>

      {/* Position indicator */}
      <div className="scale-position-indicator">
        <span className="position-label">Position:</span>
        <span className="position-value">
          X: {Math.round(offset.x)} Y: {Math.round(offset.y)}
        </span>
      </div>

      <div
        className="scale-preview-info"
        style={{ textAlign: "center", fontSize: 12, color: "var(--text-secondary)" }}
      >
        <p style={{ margin: "4px 0" }}>
          Drag to reposition • Arrow keys to nudge • Home to reset
        </p>
      </div>

      <button
        onClick={handleResetPosition}
        style={{
          display: "block",
          margin: "8px auto",
          padding: "6px 12px",
          background: "var(--accent)",
          color: "var(--bg)",
          border: "none",
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.background = "var(--primary-hover)")}
        onMouseLeave={(e) => (e.target.style.background = "var(--accent)")}
      >
        Reset Position
      </button>
    </div>
  );
});

const GuidesOverlay = memo(({
  width,
  height,
  showGrid = true,
  showGuidelines = true,
  safeZonePercentage = 10,
}) => {
  const safeZoneMargin = Math.min(width, height) * (safeZonePercentage / 100);

  return (
    <svg
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      {/* Safe zone indicator - only show when guidelines enabled */}
      {showGuidelines && (
        <rect
          x={safeZoneMargin}
          y={safeZoneMargin}
          width={width - safeZoneMargin * 2}
          height={height - safeZoneMargin * 2}
          fill="none"
          stroke="#ff6b6b"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.4"
        />
      )}

      {/* Center cross - only show when guidelines enabled */}
      {showGuidelines && (
        <>
          <line
            x1={width / 2}
            y1="0"
            x2={width / 2}
            y2={height}
            stroke="var(--accent)"
            strokeWidth="1"
            opacity="0.3"
          />
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="var(--accent)"
            strokeWidth="1"
            opacity="0.3"
          />
        </>
      )}

      {/* Rule of thirds grid - only if enabled */}
      {showGrid &&
        [1, 2].map((i) => (
          <g key={`grid-${i}`}>
            <line
              x1={(width / 3) * i}
              y1="0"
              x2={(width / 3) * i}
              y2={height}
              stroke="var(--accent)"
              strokeWidth="0.5"
              opacity="0.15"
            />
            <line
              x1="0"
              y1={(height / 3) * i}
              x2={width}
              y2={(height / 3) * i}
              stroke="var(--accent)"
              strokeWidth="0.5"
              opacity="0.15"
            />
          </g>
        ))}
    </svg>
  );
});

const ImagePreview = ({
  image,
  imageSize,
  outputSize,
  crop,
  setCrop,
  zoom,
  setZoom,
  onCropComplete,
  mode,
  onScalePositionChange,
  showGrid = true,
  showGuidelines = true,
  safeZonePercentage = 10,
  vAlign = "center",
  hAlign = "center",
  paddingStyle = "black",
  customColor = "#000000",
  scaleZoom = 1,
  onScaleZoomChange,
  adjustments = { brightness: 100, contrast: 100, saturation: 100 },
  textLayers = [],
  onTextLayerUpdate,
  watermark,
}) => {
  const aspect = outputSize.width / outputSize.height;
  const cropperContainerRef = useRef(null);
  const [cropperDims, setCropperDims] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (cropperContainerRef.current) {
      const updateDims = () => {
        setCropperDims({
          width: cropperContainerRef.current.clientWidth,
          height: cropperContainerRef.current.clientHeight,
        });
      };
      updateDims();
      window.addEventListener("resize", updateDims);
      return () => window.removeEventListener("resize", updateDims);
    }
  }, [mode]);

  const renderWatermark = () => {
    if (!watermark || !watermark.image) return null;

    const { image, opacity, scale, position } = watermark;
    const style = {
      opacity: opacity / 100,
      width: `${scale}%`,
      height: "auto",
      position: "absolute",
      pointerEvents: "none",
      zIndex: 40,
    };

    const parts = position.split("-");
    const v = parts[0]; // top, center, bottom
    const h = parts[1] || "center"; // left, center, right

    if (v === "top") style.top = "10px";
    else if (v === "bottom") style.bottom = "10px";
    else if (v === "center") {
      style.top = "50%";
      style.transform = "translateY(-50%)";
    }

    if (h === "left") style.left = "10px";
    else if (h === "right") style.right = "10px";
    else if (h === "center") {
      style.left = "50%";
      style.transform = style.transform
        ? `${style.transform} translateX(-50%)`
        : "translateX(-50%)";
    }

    return (
      <img src={image} className="canvas-watermark" style={style} alt="" />
    );
  };

  if (mode === "scale") {
    return (
      <div
        className="preview-canvas-wrapper"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        <InteractiveScalePreview
          image={image}
          imageSize={imageSize}
          outputSize={outputSize}
          onPositionChange={onScalePositionChange || (() => {})}
          showGrid={showGrid}
          showGuidelines={showGuidelines}
          safeZonePercentage={safeZonePercentage}
          vAlign={vAlign}
          hAlign={hAlign}
          paddingStyle={paddingStyle}
          customColor={customColor}
          scaleZoom={scaleZoom}
          onScaleZoomChange={onScaleZoomChange}
          adjustments={adjustments}
          textLayers={textLayers}
          onTextLayerUpdate={onTextLayerUpdate}
        />
        {renderWatermark()}
      </div>
    );
  }

  const { brightness = 100, contrast = 100, saturation = 100 } = adjustments;
  const adjustFilter = (brightness !== 100 || contrast !== 100 || saturation !== 100)
    ? `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
    : 'none';

  return (
    <div
      className="cropper-container"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "var(--bg)",
        borderRadius: 8,
        overflow: "hidden",
        filter: adjustFilter,
      }}
      ref={cropperContainerRef}
    >
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
        showGrid={true}
        classes={{
          containerClassName: "cropper-wrapper",
          mediaClassName: "cropper-media",
          cropAreaClassName: "cropper-area",
        }}
      />

      {/* Text Layers Overlay */}
      <div
        className="text-layers-overlay"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        {textLayers.map((layer) => (
          <div key={layer.id} style={{ pointerEvents: "auto" }}>
            <DraggableText
              layer={layer}
              onUpdate={onTextLayerUpdate}
              containerWidth={cropperDims.width}
              containerHeight={cropperDims.height}
            />
          </div>
        ))}
      </div>

      {renderWatermark()}

      <div
        className="crop-dimensions"
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(34, 211, 238, 0.9)",
          color: "#0a0a0f",
          padding: "4px 10px",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {outputSize.width} × {outputSize.height}
      </div>
    </div>
  );
};

export default ImagePreview;
