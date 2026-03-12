import React, { memo } from "react";
import { IMAGE_CONFIG } from "../config";

const AlignmentControls = memo(({
  vAlign = IMAGE_CONFIG.DEFAULT_V_ALIGN,
  hAlign = IMAGE_CONFIG.DEFAULT_H_ALIGN,
  onVAlignChange,
  onHAlignChange,
  mode,
}) => {
  if (mode !== "scale") {
    return null;
  }

  return (
    <div className="alignment-options-config">
      <div className="alignment-section">
        <label className="config-label">Vertical Alignment</label>
        <div className="alignment-buttons">
          {IMAGE_CONFIG.VERTICAL_ALIGN.map((align) => (
            <button
              key={align}
              className={`alignment-btn-large ${vAlign === align ? "active" : ""}`}
              onClick={() => onVAlignChange(align)}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <div className="alignment-section">
        <label className="config-label">Horizontal Alignment</label>
        <div className="alignment-buttons">
          {IMAGE_CONFIG.HORIZONTAL_ALIGN.map((align) => (
            <button
              key={align}
              className={`alignment-btn-large ${hAlign === align ? "active" : ""}`}
              onClick={() => onHAlignChange(align)}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <p className="alignment-hint">Preview shows combined with padding settings above</p>
    </div>
  );
});

export default AlignmentControls;
