import React, { memo, useCallback, useMemo } from "react";
import { IMAGE_CONFIG } from "../config";
import { calculateScalePlacement } from "../utils/scaling";

const PaddingOptions = memo(({
  paddingStyle = IMAGE_CONFIG.DEFAULT_PADDING,
  customColor = IMAGE_CONFIG.DEFAULT_PADDING_COLOR,
  onPaddingStyleChange,
  onCustomColorChange,
  mode,
  image,
  imageSize,
  outputSize,
  vAlign = "center",
  hAlign = "center",
}) => {
  if (mode !== "scale") {
    return null;
  }

  const paddingOptions = Object.entries(IMAGE_CONFIG.PADDING_OPTIONS).map(
    ([key, label]) => ({
      key,
      label,
    }),
  );

  const getPaddingColor = useCallback((style, color) => {
    switch (style) {
      case "white": return "#ffffff";
      case "black": return "#000000";
      case "blur": return "#111111";
      case "extend": return "#333333";
      case "custom": return color;
      default: return "#000000";
    }
  }, []);

  const getPaddingDescription = useCallback((style) => {
    const descriptions = {
      black: "Solid black padding - most common, professional appearance",
      white: "Solid white padding - clean, content-focused appearance",
      blur: "Blurred background - background is blurred image colors",
      extend: "Extended edges - padding extends image edge pixels",
      custom: "Custom color - use any color you choose",
    };
    return descriptions[style] || "Choose a padding style for the output";
  }, []);

  return (
    <div className="padding-options-config">
      <label className="config-label">Padding Style</label>

      <div className="padding-radio-group">
        {paddingOptions.map(({ key, label }) => (
          <div key={key} className="padding-radio-row">
            <input
              type="radio"
              id={`padding-${key}`}
              name="padding-style"
              value={key.toLowerCase()}
              checked={paddingStyle === key.toLowerCase()}
              onChange={(e) => onPaddingStyleChange(e.target.value)}
              className="padding-radio"
            />
            <label htmlFor={`padding-${key}`} className="padding-radio-label">
              {label}
            </label>

            {key.toUpperCase() === "BLACK" && (
              <div className="color-preview black" />
            )}
            {key.toUpperCase() === "WHITE" && (
              <div className="color-preview white" />
            )}
            {key.toUpperCase() === "CUSTOM" && (
              <input
                type="color"
                value={customColor}
                onChange={(e) => onCustomColorChange(e.target.value)}
                disabled={paddingStyle !== "custom"}
                className="color-input"
              />
            )}
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="config-section">
        <label className="config-label">Preview</label>
        {image && imageSize?.width > 0 ? (
          <PaddingPreview
            image={image}
            imageSize={imageSize}
            outputSize={outputSize}
            paddingStyle={paddingStyle}
            customColor={customColor}
            vAlign={vAlign}
            hAlign={hAlign}
          />
        ) : (
          <div
            className="padding-preview-box"
            style={{ background: getPaddingColor(paddingStyle, customColor) }}
          >
            <div className="padding-preview-image" />
            <span className="padding-preview-label">No image</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="config-info">
        <p>{getPaddingDescription(paddingStyle)}</p>
      </div>
    </div>
  );
});

const PaddingPreview = memo(({
  image,
  imageSize,
  outputSize,
  paddingStyle,
  customColor,
  vAlign,
  hAlign,
}) => {
  const previewWidth = 200;
  const previewHeight = Math.round(previewWidth * (outputSize.height / outputSize.width));

  const placement = useMemo(() => {
    if (!imageSize?.width || !imageSize?.height) return null;
    return calculateScalePlacement(
      imageSize.width,
      imageSize.height,
      outputSize.width,
      outputSize.height,
      vAlign,
      hAlign,
    );
  }, [imageSize, outputSize, vAlign, hAlign]);

  const getBackgroundColor = useCallback((style, color) => {
    switch (style) {
      case "white": return "#ffffff";
      case "custom": return color;
      case "blur": return "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
      case "extend": return "linear-gradient(90deg, #2d2d2d 0%, #3d3d3d 50%, #2d2d2d 100%)";
      case "black":
      default: return "#000000";
    }
  }, []);

  if (!placement) return null;

  const scale = previewWidth / outputSize.width;
  const scaledDrawWidth = placement.drawWidth * scale;
  const scaledDrawHeight = placement.drawHeight * scale;
  const scaledX = placement.x * scale;
  const scaledY = placement.y * scale;

  const isBlur = paddingStyle === "blur";
  const isExtend = paddingStyle === "extend";

  return (
    <div
      className="padding-preview-box"
      style={{
        background: getBackgroundColor(paddingStyle, customColor),
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Blurred background - shows behind the sharp image */}
      {isBlur && (
        <img
          src={image}
          alt="Blurred background"
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

      {/* Extended edge background for extend mode */}
      {isExtend && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: `${scaledX}px 1fr ${previewWidth - scaledX - scaledDrawWidth}px`,
            gridTemplateRows: `${scaledY}px 1fr ${previewHeight - scaledY - scaledDrawHeight}px`,
          }}
        >
          {/* Top-left */}
          <div style={{ background: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxwYWN0YW5jZSBpZD0iZSIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzY2NiI+PC9wYWN0YW5jZT48L3N2Zz4=)", opacity: 0.5 }} />
          <div style={{ background: `linear-gradient(to bottom, rgba(100,100,100,0.4), transparent)` }} />
          <div style={{ background: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxwYWN0YW5jZSBpZD0iZSIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzY2NiI+PC9wYWN0YW5jZT48L3N2Zz4=)", opacity: 0.5 }} />
          
          {/* Middle-left */}
          <div style={{ background: `linear-gradient(to right, rgba(100,100,100,0.4), transparent)` }} />
          <div />
          <div style={{ background: `linear-gradient(to left, rgba(100,100,100,0.4), transparent)` }} />
          
          {/* Bottom-left */}
          <div style={{ background: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxwYWN0YW5jZSBpZD0iZSIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzY2NiI+PC9wYWN0YW5jZT48L3N2Zz4=)", opacity: 0.5 }} />
          <div style={{ background: `linear-gradient(to top, rgba(100,100,100,0.4), transparent)` }} />
          <div style={{ background: "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxwYWN0YW5jZSBpZD0iZSIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzY2NiI+PC9wYWN0YW5jZT48L3N2Zz4=)", opacity: 0.5 }} />
        </div>
      )}
      
      {/* Main image - always sharp */}
      <img
        src={image}
        alt="Preview"
        style={{
          position: "absolute",
          width: scaledDrawWidth,
          height: scaledDrawHeight,
          left: scaledX,
          top: scaledY,
          objectFit: "fill",
          filter: "none",
          zIndex: 2,
        }}
      />
      
      <span className="padding-preview-label">
        {outputSize.width} × {outputSize.height} • {paddingStyle}
      </span>
    </div>
  );
});

export default PaddingOptions;
