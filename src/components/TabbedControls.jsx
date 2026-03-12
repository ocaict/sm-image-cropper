import React, { useState, useCallback, memo, useEffect } from "react";
import { platforms, commonSizes, aspectRatios, getAspectRatio } from "../utils/presets";
import TextOverlayPanel from "./TextOverlayPanel";
import WatermarkPanel from "./WatermarkPanel";

const TabbedControls = memo(({
  zoom,
  setZoom,
  imageSize,
  outputSize,
  mode,
  setMode,
  onReset,
  onClear,
  onDownload,
  onExportAll,
  isBatch,
  activeTab,
  setActiveTab,
  loading,
  batchProgress,
  onOpenSettings,
  vAlign,
  onVAlignChange,
  hAlign,
  onHAlignChange,
  paddingStyle,
  onPaddingStyleChange,
  customColor,
  onCustomColorChange,
  showGrid,
  onShowGridChange,
  showGuidelines,
  onShowGuidelinesChange,
  safeZonePercentage = 10,
  onSafeZonePercentageChange,
  selectedPreset,
  activePlatform,
  jpegQuality,
  onJpegQualityChange,
  recentPresets = [],
  onQuickSizeSelect,
  adjustments = { brightness: 100, contrast: 100, saturation: 100 },
  onAdjustmentsChange,
  textLayers = [],
  onTextLayerAdd,
  onTextLayerUpdate,
  onTextLayerRemove,
  watermark,
  onWatermarkUpload,
  onWatermarkUpdate,
  onWatermarkRemove,
  onApplyAdjustmentsToAll,
  onApplyScaleToAll,
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [lastFormat, setLastFormat] = useState("jpeg");
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showAspectMenu, setShowAspectMenu] = useState(false);

  const handleDownload = useCallback((format) => {
    setLastFormat(format);
    onDownload(format);
    setShowDownloadMenu(false);
  }, [onDownload]);

  const handleZoomToFit = useCallback(() => {
    setZoom(100);
  }, [setZoom]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDownloadMenu(false);
      setShowSizeMenu(false);
      setShowQuality(false);
      setShowAspectMenu(false);
    };
    if (showDownloadMenu || showSizeMenu || showQuality || showAspectMenu) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showDownloadMenu, showSizeMenu, showQuality, showAspectMenu]);

  const handlePaddingStyleChange = useCallback((style) => {
    onPaddingStyleChange(style);
  }, [onPaddingStyleChange]);

  return (
    <div className="tabbed-controls">
      <div className="controls-tabs">
        <button
          className={`control-tab ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          Home
        </button>
        <button
          className={`control-tab ${activeTab === "scale" ? "active" : ""}`}
          onClick={() => setActiveTab("scale")}
        >
          Scale
        </button>
        <button
          className={`control-tab ${activeTab === "view" ? "active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          View
        </button>
        <button
          className={`control-tab ${activeTab === "adjust" ? "active" : ""}`}
          onClick={() => setActiveTab("adjust")}
        >
          Adjust
        </button>
        <button
          className={`control-tab ${activeTab === "text" ? "active" : ""}`}
          onClick={() => setActiveTab("text")}
        >
          Text
        </button>
        <button
          className={`control-tab ${activeTab === "watermark" ? "active" : ""}`}
          onClick={() => setActiveTab("watermark")}
        >
          Watermark
        </button>
      </div>

      <div className="controls-content">
        {activeTab === "home" && (
          <div className="control-group home-controls">
            {/* Mode Toggle */}
            <div className="mode-toggle-group">
              <button
                className={`mode-toggle-btn ${mode === "crop" ? "active" : ""}`}
                onClick={() => setMode("crop")}
              >
                Crop
              </button>
              <button
                className={`mode-toggle-btn ${mode === "scale" ? "active" : ""}`}
                onClick={() => setMode("scale")}
              >
                Scale
              </button>
            </div>

            {/* Quick Size Dropdown */}
            <div className="size-dropdown">
              <button
                className="btn btn-size"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSizeMenu(!showSizeMenu);
                }}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18M3 9h18" />
                </svg>
                {selectedPreset ? selectedPreset.name : `${outputSize.width}×${outputSize.height}`}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {showSizeMenu && (
                <div className="size-menu">
                  {recentPresets.length > 0 && (
                    <>
                      <div className="size-menu-header">Recent</div>
                      {recentPresets.map((preset) => (
                        <button
                          key={preset.id}
                          className="size-menu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickSizeSelect?.(preset);
                            setShowSizeMenu(false);
                          }}
                        >
                          <span className="size-name">{preset.name}</span>
                          <span className="size-dims">{preset.width}×{preset.height}</span>
                        </button>
                      ))}
                      <div className="size-menu-divider" />
                    </>
                  )}
                  {platforms.map((platform) => (
                    <div key={platform.id}>
                      <div className="size-menu-header" style={{ color: platform.color }}>{platform.name}</div>
                      {platform.presets.slice(0, 4).map((preset) => (
                        <button
                          key={preset.id}
                          className="size-menu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickSizeSelect?.(preset);
                            setShowSizeMenu(false);
                          }}
                        >
                          <span className="size-name">{preset.name}</span>
                          <span className="size-dims">{preset.width}×{preset.height}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                  <div className="size-menu-divider" />
                  <div className="size-menu-header">Common Sizes</div>
                  {commonSizes.map((size) => (
                    <button
                      key={size.id}
                      className="size-menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickSizeSelect?.(size);
                        setShowSizeMenu(false);
                      }}
                    >
                      <span className="size-name">{size.name}</span>
                      <span className="size-dims">{size.width}×{size.height}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="btn btn-secondary" onClick={onClear}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>

            {/* Quality slider for JPEG */}
            <div className="quality-dropdown">
              <button
                className={`btn btn-quality ${jpegQuality < 92 ? 'quality-modified' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuality(!showQuality);
                }}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                {jpegQuality}%
                {jpegQuality < 92 && <span className="quality-indicator" />}
              </button>
              {showQuality && (
                <div className="quality-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="quality-header">JPEG Quality</div>
                  <div className="quality-slider-container">
                    <input
                      type="range"
                      min="60"
                      max="100"
                      value={jpegQuality}
                      onChange={(e) => onJpegQualityChange(parseInt(e.target.value))}
                      className="quality-slider"
                    />
                    <span className="quality-value">{jpegQuality}%</span>
                  </div>
                  <div className="quality-labels">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>
              )}
            </div>

            <div className="download-dropdown">
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDownloadMenu(!showDownloadMenu);
                }}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export
              </button>
              {showDownloadMenu && (
                <div className="download-menu">
                  <button className="download-option" onClick={() => handleDownload("png")}>
                    Export PNG
                  </button>
                  <button className="download-option" onClick={() => handleDownload("jpeg")}>
                    Export JPG
                  </button>
                  {isBatch && (
                    <>
                      <div className="dropdown-divider" />
                      <button className="download-option batch-option" onClick={() => { onExportAll("png"); setShowDownloadMenu(false); }}>
                        Export All PNG
                      </button>
                      <button className="download-option batch-option" onClick={() => { onExportAll("jpeg"); setShowDownloadMenu(false); }}>
                        Export All JPG
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "scale" && mode === "scale" && (
          <div className="scale-controls">
            {/* Padding style quick select */}
            <div className="control-section">
              <span className="section-label">Padding</span>
              <div className="padding-options">
                {["black", "white", "blur", "extend", "custom"].map((style) => (
                  <button
                    key={style}
                    className={`padding-btn ${paddingStyle === style ? "active" : ""}`}
                    onClick={() => handlePaddingStyleChange(style)}
                    title={style.charAt(0).toUpperCase() + style.slice(1)}
                  >
                    {style === "black" && <span className="padding-preview black" />}
                    {style === "white" && <span className="padding-preview white" />}
                    {style === "blur" && <span className="padding-preview blur">B</span>}
                    {style === "extend" && <span className="padding-preview extend">E</span>}
                    {style === "custom" && <span className="padding-preview custom">C</span>}
                  </button>
                ))}
                {/* Custom color picker */}
                {paddingStyle === "custom" && (
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => onCustomColorChange(e.target.value)}
                    className="color-picker"
                    title="Custom padding color"
                  />
                )}
              </div>
            </div>

            {/* Alignment controls */}
            <div className="control-section">
              <span className="section-label">Align</span>
              <div className="alignment-controls">
                <div className="alignment-row">
                  {["top", "center", "bottom"].map((v) => (
                    <button
                      key={`v-${v}`}
                      className={`align-btn ${vAlign === v ? "active" : ""}`}
                      onClick={() => onVAlignChange(v)}
                      title={`Vertical: ${v}`}
                    >
                      {v === "top" && "↑"}
                      {v === "center" && "↕"}
                      {v === "bottom" && "↓"}
                    </button>
                  ))}
                </div>
                <div className="alignment-row">
                  {["left", "center", "right"].map((h) => (
                    <button
                      key={`h-${h}`}
                      className={`align-btn ${hAlign === h ? "active" : ""}`}
                      onClick={() => onHAlignChange(h)}
                      title={`Horizontal: ${h}`}
                    >
                      {h === "left" && "←"}
                      {h === "center" && "↔"}
                      {h === "right" && "→"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual feedback toggles */}
            <div className="control-section visual-toggles">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => onShowGridChange(e.target.checked)}
                />
                <span>Grid</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showGuidelines}
                  onChange={(e) => onShowGuidelinesChange(e.target.checked)}
                />
                <span>Guides</span>
              </label>
            </div>

            {/* Safe zone slider */}
            {showGuidelines && (
              <div className="control-section">
                <span className="section-label">Safe Zone</span>
                <div className="safe-zone-control">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={safeZonePercentage}
                    onChange={(e) => onSafeZonePercentageChange(parseInt(e.target.value))}
                    className="safe-zone-slider"
                  />
                  <span className="safe-zone-value">{safeZonePercentage}%</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="scale-actions">
              <button className="btn btn-secondary" onClick={() => onOpenSettings?.()}>
                <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v4M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h4" />
                </svg>
                More
              </button>

              {isBatch && (
                <button
                  className="btn btn-secondary batch-apply-btn"
                  onClick={onApplyScaleToAll}
                  title="Apply current padding, alignment, and zoom to all images in the batch"
                >
                  Apply to All
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "scale" && mode === "crop" && (
          <div className="control-group">
            <span className="info-message">Switch to Scale mode to access padding settings</span>
            <button className="btn btn-primary" onClick={() => setMode("scale")}>
              Switch to Scale
            </button>
          </div>
        )}

        {activeTab === "view" && (
          <div className="view-controls">
            <div className="control-group">
              <span className="control-label">Zoom</span>
              <input
                type="range"
                className="zoom-slider"
                min="10"
                max="300"
                value={zoom}
                onChange={(e) => setZoom(parseInt(e.target.value))}
              />
              <span className="zoom-value">{zoom}%</span>
              <button className="btn btn-secondary" onClick={handleZoomToFit} title="Reset zoom to fit">
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
                Fit
              </button>
              <button className="btn btn-secondary" onClick={onReset}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Reset
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="shortcuts-section">
              <span className="section-label">Shortcuts</span>
              <div className="shortcuts-grid">
                <div className="shortcut">
                  <kbd>↑↓←→</kbd>
                  <span>Nudge</span>
                </div>
                <div className="shortcut">
                  <kbd>Shift</kbd>
                  <span>+ Arrow</span>
                </div>
                <div className="shortcut">
                  <kbd>Home</kbd>
                  <span>Reset</span>
                </div>
                <div className="shortcut">
                  <kbd>Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "adjust" && (
          <div className="adjust-controls">
            <div className="control-section">
              <div className="adjust-header">
                <span className="section-label">Brightness</span>
                <span className="adjust-value">{adjustments.brightness}%</span>
              </div>
              <input
                type="range" min="0" max="200" value={adjustments.brightness}
                className="adjust-slider"
                onChange={(e) => onAdjustmentsChange?.({ ...adjustments, brightness: parseInt(e.target.value) })}
              />
            </div>
            <div className="control-section">
              <div className="adjust-header">
                <span className="section-label">Contrast</span>
                <span className="adjust-value">{adjustments.contrast}%</span>
              </div>
              <input
                type="range" min="0" max="200" value={adjustments.contrast}
                className="adjust-slider"
                onChange={(e) => onAdjustmentsChange?.({ ...adjustments, contrast: parseInt(e.target.value) })}
              />
            </div>
            <div className="control-section">
              <div className="adjust-header">
                <span className="section-label">Saturation</span>
                <span className="adjust-value">{adjustments.saturation}%</span>
              </div>
              <input
                type="range" min="0" max="200" value={adjustments.saturation}
                className="adjust-slider"
                onChange={(e) => onAdjustmentsChange?.({ ...adjustments, saturation: parseInt(e.target.value) })}
              />
            </div>
            
            <div className="adjust-actions">
              <button
                className="btn btn-secondary"
                onClick={() => onAdjustmentsChange?.({ brightness: 100, contrast: 100, saturation: 100 })}
              >
                Reset
              </button>

              {isBatch && (
                <button
                  className="btn btn-secondary batch-apply-btn"
                  onClick={onApplyAdjustmentsToAll}
                  title="Apply these adjustments to all images in the batch"
                >
                  Apply to All
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "text" && (
          <TextOverlayPanel
            textLayers={textLayers}
            onAdd={onTextLayerAdd}
            onUpdate={onTextLayerUpdate}
            onRemove={onTextLayerRemove}
          />
        )}
        {activeTab === "watermark" && (
          <WatermarkPanel
            watermark={watermark}
            onWatermarkUpload={onWatermarkUpload}
            onWatermarkUpdate={onWatermarkUpdate}
            onWatermarkRemove={onWatermarkRemove}
          />
        )}

      </div>

      <div className="controls-footer">
        <div className="image-info">
          <span>
            Image: <strong>{imageSize.width} × {imageSize.height}</strong>
          </span>
          <span>
            Output: <strong>{outputSize.width} × {outputSize.height}</strong>
          </span>
          <span>
            Mode: <strong>{mode === "crop" ? "Crop" : "Scale"}</strong>
          </span>
        </div>

        {loading && batchProgress.total > 0 && (
          <div className="batch-progress">
            <div className="progress-info">
              <span className="progress-label">Export Progress</span>
              <span className="progress-text" aria-live="polite">
                {batchProgress.current} of {batchProgress.total}
              </span>
            </div>
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={batchProgress.current}
              aria-valuemin="0"
              aria-valuemax={batchProgress.total}
            >
              <div
                className="progress-fill"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default TabbedControls;
