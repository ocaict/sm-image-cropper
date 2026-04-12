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
    <div className="text-compact-layout">
      {/* Input and Basic Props Column */}
      <div className="text-entry-column">
        <textarea
          className="text-compact-input"
          placeholder="New text layer…"
          value={text}
          rows={1}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-compact primary full-width" onClick={handleAdd}>
           Add Layer
        </button>
      </div>

      <div className="prop-divider" />

      {/* Style Props Grid */}
      <div className="text-props-grid">
         <div className="prop-row">
            <div className="property-group">
               <label className="prop-label">Font</label>
               <select className="text-select-mini" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
               </select>
            </div>
            <div className="property-group">
               <label className="prop-label">Size</label>
               <input type="number" className="text-input-mini" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} />
            </div>
            <div className="property-group">
               <label className="prop-label">Color</label>
               <input type="color" className="text-color-mini" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
         </div>

         <div className="prop-row">
            <div className="segmented-control mini">
               <button className={`segment ${fontWeight === "bold" ? "active" : ""}`} onClick={() => setFontWeight(fontWeight === "bold" ? "normal" : "bold")}>B</button>
               <button className={`segment ${textAlign === "left" ? "active" : ""}`} onClick={() => setTextAlign("left")}>L</button>
               <button className={`segment ${textAlign === "center" ? "active" : ""}`} onClick={() => setTextAlign("center")}>C</button>
               <button className={`segment ${textAlign === "right" ? "active" : ""}`} onClick={() => setTextAlign("right")}>R</button>
               <button className={`segment ${shadow ? "active" : ""}`} onClick={() => setShadow(!shadow)}>S</button>
            </div>
         </div>
      </div>

      <div className="prop-divider" />

      {/* Layers List */}
      <div className="text-layers-column">
         <span className="prop-label">Active Layers ({textLayers.length})</span>
         <div className="mini-layers-list">
            {textLayers.map(layer => (
              <div key={layer.id} className="mini-layer-item">
                 <span className="layer-text-preview">{layer.text}</span>
                 <button className="layer-del-btn" onClick={() => onRemove(layer.id)}>×</button>
              </div>
            ))}
            {textLayers.length === 0 && <span className="no-layers-hint">No text layers</span>}
         </div>
      </div>
    </div>

  );
});

export default TextOverlayPanel;
