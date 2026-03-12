import React from "react";
import ImagePreview from "./ImagePreview";

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
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={onFileClick}
          role="button"
          tabIndex={0}
          aria-label="Upload area. Press Enter or Space to select image files. Drag and drop images to upload."
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onFileClick();
            }
          }}
        >
          <svg
            className="upload-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <span className="upload-text">Drop your images here</span>
          <span className="upload-hint">
            or click to browse • Multi-upload supported (Max 50MB/file)
          </span>
        </div>
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
