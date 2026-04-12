import React from "react";
import ImagePreview from "./ImagePreview";
import EmptyState from "./EmptyState";

const CanvasArea = ({
  image,
  dragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileClick,
  loading,
  imageSize,
  outputSize,
  crop,
  setCrop,
  zoom,
  setZoom,
  onCropComplete,
  mode,
  containerRef,
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
  return (
    <main className="canvas-area">
      {!image ? (
        <EmptyState onImport={onFileClick} dragOver={dragOver} />
      ) : (

        <div
          className={`preview-container ${dragOver ? "drag-over" : ""}`}
          ref={containerRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {loading && (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          )}
          
          {dragOver && (
            <div className="drop-overlay">
              <div className="drop-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Drop to Add to Batch</span>
              </div>
            </div>
          )}

          <ImagePreview
            image={image}
            imageSize={imageSize}
            outputSize={outputSize}
            crop={crop}
            setCrop={setCrop}
            zoom={zoom}
            setZoom={setZoom}
            onCropComplete={onCropComplete}
            mode={mode}
            onScalePositionChange={onScalePositionChange}
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
            watermark={watermark}
          />
        </div>
      )}
    </main>
  );
};

export default CanvasArea;
