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
    <div className="tabbed-controls-compact">
      <div className="compact-nav-bar">
        <div className="nav-tabs">
          {[
            { id: "home", label: "Edit", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 14" /></svg> },
            { id: "scale", label: "Frame", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M3 9h18" /></svg> },
            { id: "adjust", label: "Tune", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg> },
            { id: "text", label: "Text", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg> },
            { id: "watermark", label: "Brand", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
            { id: "view", label: "View", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg> },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="nav-actions">
           <div className="action-divider" />
           <div className="primary-export-group">
              <button className="btn-compact primary" onClick={() => handleDownload(lastFormat)}>
                 <span>Export</span>
              </button>
              <button className="btn-split primary" onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(!showDownloadMenu); }}>
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {showDownloadMenu && (
                <div className="compact-download-menu">
                   <div className="menu-section">Format</div>
                   <button onClick={() => handleDownload("png")}>PNG Image</button>
                   <button onClick={() => handleDownload("jpeg")}>JPG Image</button>
                   {isBatch && (
                     <>
                       <div className="menu-divider" />
                       <div className="menu-section">Batch Export</div>
                       <button className="batch-btn" onClick={() => { onExportAll("png"); setShowDownloadMenu(false); }}>All as PNG</button>
                       <button className="batch-btn" onClick={() => { onExportAll("jpeg"); setShowDownloadMenu(false); }}>All as JPG</button>
                     </>
                   )}
                </div>
              )}
           </div>
        </div>

      </div>

      <div className="compact-panel">

        {activeTab === "home" && (
          <div className="property-panel-row">
            <div className="property-group">
              <label className="prop-label">Resizing Mode</label>
              <div className="segmented-control">
                <button className={`segment ${mode === "crop" ? "active" : ""}`} onClick={() => setMode("crop")}>Crop & Fill</button>
                <button className={`segment ${mode === "scale" ? "active" : ""}`} onClick={() => setMode("scale")}>Scale to Fit</button>
              </div>
            </div>

            <div className="prop-divider" />

            <div className="property-group flex-wide">
              <label className="prop-label">Zoom Level ({Math.round(zoom * 100)}%)</label>
              <div className="range-with-inputs">
                <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="modern-range" />
                <button className="btn-small-ghost" onClick={onReset}>Reset</button>
              </div>
            </div>

            <div className="prop-divider" />

            <div className="property-group">
              <label className="prop-label">Export Quality</label>
              <button className="quality-pill" onClick={() => setShowQuality(!showQuality)}>
                {jpegQuality}% Quality
              </button>
              {showQuality && (
                <div className="quality-popover">
                  <input type="range" min="60" max="100" value={jpegQuality} onChange={(e) => onJpegQualityChange(parseInt(e.target.value))} />
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
          <div className="property-panel-row">
            <div className="property-group flex-wide">
              <div className="setting-info">
                <span className="prop-label">Brightness</span>
                <span className="prop-value">{adjustments.brightness}%</span>
              </div>
              <input
                type="range" min="0" max="200" value={adjustments.brightness}
                className="modern-range"
                onChange={(e) => onAdjustmentsChange?.({ ...adjustments, brightness: parseInt(e.target.value) })}
              />
            </div>
            
            <div className="prop-divider" />

            <div className="property-group flex-wide">
              <div className="setting-info">
                <span className="prop-label">Contrast</span>
                <span className="prop-value">{adjustments.contrast}%</span>
              </div>
              <input
                type="range" min="0" max="200" value={adjustments.contrast}
                className="modern-range"
                onChange={(e) => onAdjustmentsChange?.({ ...adjustments, contrast: parseInt(e.target.value) })}
              />
            </div>

            <div className="prop-divider" />

            <div className="property-group flex-wide">
              <div className="setting-info">
                <span className="prop-label">Saturation</span>
                <span className="prop-value">{adjustments.saturation}%</span>
              </div>
              <input
                type="range" min="0" max="200" value={adjustments.saturation}
                className="modern-range"
                onChange={(e) => onAdjustmentsChange?.({ ...adjustments, saturation: parseInt(e.target.value) })}
              />
            </div>

            <div className="prop-divider" />

            <div className="tune-actions-column">
              <button className="btn-small-ghost" onClick={() => onAdjustmentsChange?.({ brightness: 100, contrast: 100, saturation: 100 })}>
                Reset
              </button>
              {isBatch && (
                <button className="btn-small-ghost accent" onClick={onApplyAdjustmentsToAll}>
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
    </div>
  </div>
);
});

export default TabbedControls;
