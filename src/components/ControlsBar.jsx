import React from "react";

const ControlsBar = ({
  zoom,
  setZoom,
  imageSize,
  outputSize,
  mode,
  onReset,
  onClear,
  onDownload,
  onExportAll,
  isBatch,
  showDownloadMenu,
  setShowDownloadMenu,
}) => {
  return (
    <div className="controls-bar">
      <div className="control-group">
        <label htmlFor="zoom-slider" className="control-label">
          Zoom
        </label>
        <input
          id="zoom-slider"
          type="range"
          className="zoom-slider"
          min="10"
          max="300"
          value={zoom}
          onChange={(e) => setZoom(parseInt(e.target.value))}
          aria-valuemin="10"
          aria-valuemax="300"
          aria-valuenow={zoom}
          aria-label="Zoom level"
        />
        <span className="zoom-value" aria-live="polite">
          {zoom}%
        </span>
      </div>
      <div className="image-info">
        <span>
          Image:{" "}
          <strong>
            {imageSize.width} × {imageSize.height}
          </strong>
        </span>
        <span>
          Output:{" "}
          <strong>
            {outputSize.width} × {outputSize.height}
          </strong>
        </span>
        <span>
          Mode: <strong>{mode === "crop" ? "Crop" : "Scale"}</strong>
        </span>
      </div>
      <div className="control-group">
        <button className="btn btn-secondary" onClick={onReset}>
          <svg
            className="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Reset
        </button>
        <button className="btn btn-secondary" onClick={onClear}>
          <svg
            className="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Clear
        </button>
        <div className="download-dropdown">
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              setShowDownloadMenu(!showDownloadMenu);
            }}
          >
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Export
          </button>
          {showDownloadMenu && (
            <div className="download-menu">
              <button
                className="download-option"
                onClick={() => onDownload("jpeg")}
              >
                Export JPG
              </button>
              <button
                className="download-option"
                onClick={() => onDownload("png")}
              >
                Export PNG
              </button>
              {isBatch && (
                <>
                  <div className="dropdown-divider" />
                  <button
                    className="download-option batch-option"
                    onClick={() => onExportAll("jpeg")}
                  >
                    Export All JPG
                  </button>
                  <button
                    className="download-option batch-option"
                    onClick={() => onExportAll("png")}
                  >
                    Export All PNG
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;
