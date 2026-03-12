import React, { useState } from "react";
import { getAspectRatio, aspectRatios } from "../utils/presets";

const PresetPanel = ({
  activePlatform,
  selectedPreset,
  onPresetSelect,
  customWidth,
  setCustomWidth,
  customHeight,
  setCustomHeight,
  mode,
  setMode,
  onCustomApply,
  imageSize,
}) => {
  const [lockAspect, setLockAspect] = useState(true);

  const currentAspect = customWidth && customHeight ? (customWidth / customHeight).toFixed(2) : null;
  const isUpscaling = imageSize?.width > 0 && (customWidth > imageSize.width || customHeight > imageSize.height);

  const handleWidthChange = (val) => {
    const newWidth = Math.max(1, parseInt(val) || 1);
    setCustomWidth(newWidth);
    if (lockAspect && customHeight) {
      const ratio = customWidth / customHeight;
      setCustomHeight(Math.round(newWidth / ratio));
    }
  };

  const handleHeightChange = (val) => {
    const newHeight = Math.max(1, parseInt(val) || 1);
    setCustomHeight(newHeight);
    if (lockAspect && customWidth) {
      const ratio = customWidth / customHeight;
      setCustomWidth(Math.round(newHeight * ratio));
    }
  };

  const handleAspectSelect = (ratio) => {
    const newHeight = Math.round(customWidth / ratio);
    setCustomHeight(newHeight);
  };

  return (
    <aside className="sidebar">
      <h2 className="section-title">Platform Presets</h2>
      <div className="presets-grid">
        {activePlatform.presets.map((preset) => (
          <button
            key={preset.id}
            className={`preset-card ${selectedPreset?.id === preset.id ? "selected" : ""}`}
            onClick={() => onPresetSelect(preset)}
            aria-label={`${preset.name}: ${preset.width}×${preset.height} pixels`}
            aria-pressed={selectedPreset?.id === preset.id}
          >
            <div className="preset-info">
              <span className="preset-name">{preset.name}</span>
              <span className="preset-dimensions">
                {preset.width} × {preset.height}
              </span>
            </div>
            <span className="preset-ratio">
              {getAspectRatio(preset.width, preset.height)}
            </span>
          </button>
        ))}
      </div>

      <fieldset className="custom-size-section">
        <legend className="custom-size-header">
          <span className="custom-size-title">Custom Size</span>
          {!selectedPreset && (
            <span className="custom-badge">Custom</span>
          )}
        </legend>
        <div className="custom-size-inputs">
          <div className="input-group">
            <label htmlFor="custom-width">Width (px)</label>
            <input
              id="custom-width"
              type="number"
              value={customWidth}
              onChange={(e) => handleWidthChange(e.target.value)}
              min="1"
              max="4096"
              aria-label="Custom width in pixels"
              className={isUpscaling ? "input-warning" : ""}
            />
          </div>
          <button
            className={`aspect-lock ${lockAspect ? "locked" : ""}`}
            onClick={() => setLockAspect(!lockAspect)}
            aria-label={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
            title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
          >
            {lockAspect ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
          </button>
          <div className="input-group">
            <label htmlFor="custom-height">Height (px)</label>
            <input
              id="custom-height"
              type="number"
              value={customHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
              min="1"
              max="4096"
              aria-label="Custom height in pixels"
              className={isUpscaling ? "input-warning" : ""}
            />
          </div>
        </div>
        
        {/* Aspect Ratio Quick Buttons */}
        <div className="aspect-ratio-buttons">
          {aspectRatios.map((ar) => (
            <button
              key={ar.id}
              className={`aspect-btn ${currentAspect && Math.abs(currentAspect - ar.ratio) < 0.1 ? "active" : ""}`}
              onClick={() => handleAspectSelect(ar.ratio)}
              title={`Set aspect ratio to ${ar.label}`}
            >
              {ar.label}
            </button>
          ))}
        </div>

        {isUpscaling && (
          <div className="validation-warning">
            ⚠️ Output larger than source - will upscale
          </div>
        )}
        
        <div className="toggle-group" role="group" aria-label="Scaling mode">
          <button
            className={`toggle-btn ${mode === "crop" ? "active" : ""}`}
            onClick={() => setMode("crop")}
            aria-pressed={mode === "crop"}
          >
            Crop
          </button>
          <button
            className={`toggle-btn ${mode === "scale" ? "active" : ""}`}
            onClick={() => setMode("scale")}
            aria-pressed={mode === "scale"}
          >
            Scale
          </button>
        </div>
        <div className="mode-description" aria-live="polite">
          {mode === "crop"
            ? "Crop: Select and zoom to fill the output frame."
            : "Scale: Fit the entire image with padding."}
        </div>
        {!selectedPreset && (
          <button className="apply-btn" onClick={onCustomApply}>
            Apply
          </button>
        )}
      </fieldset>
    </aside>
  );
};

export default PresetPanel;
