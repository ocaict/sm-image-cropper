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
    <div className="watermark-compact-layout">
      {!watermark.image ? (
        <div className="watermark-upload-column">
          <input
            type="file"
            id="watermark-file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <label htmlFor="watermark-file" className="watermark-upload-zone">
            <div className="upload-icon">⊕</div>
            <div className="upload-text">
               <span>Add Watermark</span>
               <small>PNG / JPG</small>
            </div>
          </label>
        </div>
      ) : (
        <div className="watermark-preview-column">
           <div className="watermark-mini-thumb">
              <img src={watermark.image} alt="Watermark" />
              <button className="remove-small-btn" onClick={onWatermarkRemove} title="Remove watermark">×</button>
           </div>
        </div>
      )}

      <div className="watermark-settings-grid">
         <div className="setting-box">
            <div className="setting-info">
               <span className="prop-label">Opacity</span>
               <span className="prop-value">{watermark.opacity}%</span>
            </div>
            <input
               type="range"
               min="0"
               max="100"
               value={watermark.opacity}
               onChange={(e) => onWatermarkUpdate({ opacity: parseInt(e.target.value) })}
               className="modern-range"
            />
         </div>

         <div className="setting-box">
            <div className="setting-info">
               <span className="prop-label">Scale</span>
               <span className="prop-value">{watermark.scale}%</span>
            </div>
            <input
               type="range"
               min="1"
               max="100"
               value={watermark.scale}
               onChange={(e) => onWatermarkUpdate({ scale: parseInt(e.target.value) })}
               className="modern-range"
            />
         </div>
      </div>

      <div className="prop-divider" />

      <div className="watermark-position-column">
         <span className="prop-label">Position</span>
         <div className="mini-position-grid">
            {positions.map((pos) => (
              <button
                key={pos.id}
                className={`mini-pos-btn ${watermark.position === pos.id ? "active" : ""}`}
                onClick={() => onWatermarkUpdate({ position: pos.id })}
                title={pos.label}
              />
            ))}
         </div>
      </div>
    </div>

  );
};

export default WatermarkPanel;
