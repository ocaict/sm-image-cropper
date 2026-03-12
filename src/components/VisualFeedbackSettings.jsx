import React, { memo } from "react";

const VisualFeedbackSettings = memo(({
  showGrid,
  onShowGridChange,
  showGuidelines,
  onShowGuidelinesChange,
  safeZonePercentage = 10,
  onSafeZonePercentageChange,
  mode,
}) => {
  if (mode !== "scale") {
    return null;
  }

  return (
    <div className="visual-feedback-config">
      <label className="config-label">Visual Feedback</label>

      <div className="visual-feedback-toggles">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => onShowGridChange(e.target.checked)}
            className="toggle-checkbox"
          />
          <span className="toggle-text">Show Grid (Rule of thirds)</span>
          <span className="toggle-desc">9-point composition grid</span>
        </label>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showGuidelines}
            onChange={(e) => onShowGuidelinesChange(e.target.checked)}
            className="toggle-checkbox"
          />
          <span className="toggle-text">Show Guidelines</span>
          <span className="toggle-desc">Center guides + safe zone</span>
        </label>
      </div>

      {showGuidelines && (
        <div className="safe-zone-config">
          <label className="config-label">Safe Zone Margin</label>
          <div className="safe-zone-row">
            <input
              type="range"
              min="0"
              max="30"
              value={safeZonePercentage}
              onChange={(e) => onSafeZonePercentageChange?.(parseInt(e.target.value))}
              className="safe-zone-slider-modal"
            />
            <span className="safe-zone-value">{safeZonePercentage}%</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="config-info">
        <p className="legend-title">Guide Colors:</p>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color accent" />
            <span>Center guides and grid (cyan)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color safe-zone" />
            <span>Safe zone margin (red dashed)</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VisualFeedbackSettings;
