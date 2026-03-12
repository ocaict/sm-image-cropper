import React, { useEffect, memo, useCallback } from "react";
import AlignmentControls from "./AlignmentControls";
import PaddingOptions from "./PaddingOptions";
import VisualFeedbackSettings from "./VisualFeedbackSettings";

const SettingsModal = memo(({
  isOpen,
  onClose,
  mode,
  setMode,
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
  image,
  imageSize,
  outputSize,
}) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">Scale Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {mode === "scale" ? (
            <>
              <PaddingOptions
                paddingStyle={paddingStyle}
                customColor={customColor}
                onPaddingStyleChange={onPaddingStyleChange}
                onCustomColorChange={onCustomColorChange}
                mode={mode}
                image={image}
                imageSize={imageSize}
                outputSize={outputSize}
                vAlign={vAlign}
                hAlign={hAlign}
              />

              <div className="modal-divider" />

              <AlignmentControls
                vAlign={vAlign}
                hAlign={hAlign}
                onVAlignChange={onVAlignChange}
                onHAlignChange={onHAlignChange}
                mode={mode}
              />

              <div className="modal-divider" />

              <VisualFeedbackSettings
                showGrid={showGrid}
                onShowGridChange={onShowGridChange}
                showGuidelines={showGuidelines}
                onShowGuidelinesChange={onShowGuidelinesChange}
                safeZonePercentage={safeZonePercentage}
                onSafeZonePercentageChange={onSafeZonePercentageChange}
                mode={mode}
              />
            </>
          ) : (
            <div className="modal-empty">
              <p>Settings are only available in Scale mode</p>
              <button className="btn btn-primary" onClick={() => { setMode?.("scale"); onClose(); }}>
                Switch to Scale
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );
});

export default SettingsModal;
