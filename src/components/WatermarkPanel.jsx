import React from "react";

const WatermarkPanel = ({
  watermark,
  onWatermarkUpload,
  onWatermarkUpdate,
  onWatermarkRemove,
}) => {
  const positions = [
    { id: "top-left", label: "Top Left" },
    { id: "top-center", label: "Top Center" },
    { id: "top-right", label: "Top Right" },
    { id: "center-left", label: "Middle Left" },
    { id: "center", label: "Center" },
    { id: "center-right", label: "Middle Right" },
    { id: "bottom-left", label: "Bottom Left" },
    { id: "bottom-center", label: "Bottom Center" },
    { id: "bottom-right", label: "Bottom Right" },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onWatermarkUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="watermark-panel">
      {!watermark.image ? (
        <div className="watermark-upload-area">
          <input
            type="file"
            id="watermark-file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <label htmlFor="watermark-file" className="watermark-upload-label">
            <div className="upload-icon">⊕</div>
            <span>Upload Watermark Image</span>
            <small>PNG with transparency recommended</small>
          </label>
        </div>
      ) : (
        <div className="watermark-settings">
          <div className="watermark-preview-header">
            <div className="watermark-mini-preview">
              <img src={watermark.image} alt="Watermark" />
            </div>
            <button className="watermark-remove-btn" onClick={onWatermarkRemove}>
              Replace / Remove
            </button>
          </div>

          <div className="settings-group">
            <div className="setting-header">
              <span className="setting-label">Opacity</span>
              <span className="setting-value">{watermark.opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={watermark.opacity}
              onChange={(e) => onWatermarkUpdate({ opacity: parseInt(e.target.value) })}
              className="setting-slider"
            />
          </div>

          <div className="settings-group">
            <div className="setting-header">
              <span className="setting-label">Scale</span>
              <span className="setting-value">{watermark.scale}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={watermark.scale}
              onChange={(e) => onWatermarkUpdate({ scale: parseInt(e.target.value) })}
              className="setting-slider"
            />
          </div>

          <div className="settings-group">
            <span className="setting-label">Position</span>
            <div className="position-grid">
              {positions.map((pos) => (
                <button
                  key={pos.id}
                  className={`position-btn ${watermark.position === pos.id ? "active" : ""}`}
                  onClick={() => onWatermarkUpdate({ position: pos.id })}
                  title={pos.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatermarkPanel;
