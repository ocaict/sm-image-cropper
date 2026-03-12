import React, { useState, useCallback, memo } from "react";

const FONTS = [
  "Arial",
  "Impact",
  "Georgia",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
];

const TextOverlayPanel = memo(({
  textLayers = [],
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState("bold");
  const [textAlign, setTextAlign] = useState("center");
  const [shadow, setShadow] = useState(true);

  const handleAdd = useCallback(() => {
    if (!text.trim()) return;
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      x: 50, // percentage
      y: 50,
      fontSize,
      color,
      fontFamily,
      fontWeight,
      textAlign,
      shadow,
    });
    setText("");
  }, [text, fontSize, color, fontFamily, fontWeight, textAlign, shadow, onAdd]);

  return (
    <div className="text-overlay-panel">
      {/* Add new Layer form */}
      <div className="text-add-form">
        <div className="text-form-row">
          <textarea
            className="text-input"
            placeholder="Type text here…"
            value={text}
            rows={2}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd();
            }}
          />
        </div>

        <div className="text-form-row text-form-inline">
          <div className="text-form-group">
            <label className="text-form-label">Font</label>
            <select
              className="text-select"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {FONTS.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
          </div>

          <div className="text-form-group">
            <label className="text-form-label">Size</label>
            <input
              type="number"
              className="text-number-input"
              min={8}
              max={200}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 36)}
            />
          </div>

          <div className="text-form-group">
            <label className="text-form-label">Color</label>
            <input
              type="color"
              className="text-color-picker"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>

        <div className="text-form-row text-form-inline">
          {/* Bold toggle */}
          <button
            className={`text-style-btn ${fontWeight === "bold" ? "active" : ""}`}
            onClick={() => setFontWeight(fontWeight === "bold" ? "normal" : "bold")}
            title="Bold"
          >
            <strong>B</strong>
          </button>

          {/* Align buttons */}
          {["left", "center", "right"].map((align) => (
            <button
              key={align}
              className={`text-style-btn ${textAlign === align ? "active" : ""}`}
              onClick={() => setTextAlign(align)}
              title={`Align ${align}`}
            >
              {align === "left" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="10" width="12" height="2" rx="1"/><rect x="3" y="15" width="15" height="2" rx="1"/>
                </svg>
              )}
              {align === "center" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="6" y="10" width="12" height="2" rx="1"/><rect x="4" y="15" width="15" height="2" rx="1"/>
                </svg>
              )}
              {align === "right" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="5" width="18" height="2" rx="1"/><rect x="9" y="10" width="12" height="2" rx="1"/><rect x="6" y="15" width="15" height="2" rx="1"/>
                </svg>
              )}
            </button>
          ))}

          {/* Shadow toggle */}
          <button
            className={`text-style-btn ${shadow ? "active" : ""}`}
            onClick={() => setShadow(!shadow)}
            title="Text shadow"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <text x="3" y="17" fontSize="14" fill="currentColor" stroke="none">S</text>
            </svg>
            Shd
          </button>
        </div>

        <button className="btn btn-primary btn-full" onClick={handleAdd} style={{ marginTop: 8 }}>
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Text Layer
        </button>
      </div>

      {/* Existing layers list */}
      {textLayers.length > 0 && (
        <div className="text-layers-list">
          <div className="text-layers-header">
            <span className="section-label">Layers ({textLayers.length})</span>
          </div>
          {textLayers.map((layer) => (
            <div key={layer.id} className="text-layer-item">
              <div
                className="text-layer-preview"
                style={{
                  fontFamily: layer.fontFamily,
                  fontWeight: layer.fontWeight,
                  color: layer.color,
                  fontSize: 12,
                }}
              >
                {layer.text.length > 24 ? layer.text.slice(0, 24) + "…" : layer.text}
              </div>
              <div className="text-layer-meta">
                {layer.fontFamily} · {layer.fontSize}px
              </div>
              <button
                className="text-layer-remove"
                onClick={() => onRemove(layer.id)}
                title="Remove text layer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            className="btn btn-secondary btn-full"
            style={{ marginTop: 6 }}
            onClick={() => textLayers.forEach((l) => onRemove(l.id))}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
});

export default TextOverlayPanel;
