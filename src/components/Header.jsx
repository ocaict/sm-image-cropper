import React, { useState } from 'react';
import MenuBar from './MenuBar';


const Header = ({ 
  onImport, 
  onExport, 
  onExportAll, 
  onClear, 
  onApplyToAll, 
  onToggleGrid, 
  onToggleGuides, 
  onResetZoom,
  onOpenSettings,
  isBatch,
  mode,
  outputSize
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    if (window.runtime?.WindowMinimise) {
      window.runtime.WindowMinimise();
    }
  };

  const handleClose = () => {
    if (window.runtime?.Quit) {
      window.runtime.Quit();
    }
  };

  const handleToggleMaximize = () => {
    if (window.runtime?.WindowToggleMaximise) {
      window.runtime.WindowToggleMaximise();
      setIsMaximized(!isMaximized);
    }
  };

  return (
    <header 
      className="header" 
      style={{ 
        "--wails-draggable": "drag",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 8px 0 20px",
        minHeight: "72px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", height: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="header-logo">SI</div>
          <h1 className="header-title" style={{ fontSize: "14px", fontWeight: "700" }}>Social Image Resizer</h1>
        </div>
        
        {/* Custom Window Controls (Only visible/functional in Wails) */}
        {window.runtime && (
          <div 
            className="window-controls" 
            style={{ 
              display: "flex", 
              gap: "8px", 
              "--wails-draggable": "no-drag" 
            }}
          >
            {/* ... keep minimize, maximize, close ... */}
            <button 
              onClick={handleMinimize}
              className="window-control-btn"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="5" width="10" height="2" />
              </svg>
            </button>
            <button 
              onClick={handleToggleMaximize}
              className="window-control-btn"
            >
              {isMaximized ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                  <rect x="1.5" y="3.5" width="7" height="7" strokeWidth="1.5" />
                  <path d="M3.5 3.5 V1.5 H10.5 V8.5 H8.5" strokeWidth="1.5" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                  <rect x="1.5" y="1.5" width="9" height="9" strokeWidth="1.5" />
                </svg>
              )}
            </button>
            <button 
              onClick={handleClose}
              className="window-control-btn close"
            >
               <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
               </svg>
            </button>
          </div>
        )}
      </div>

      <MenuBar 
        onImport={onImport}
        onExport={onExport}
        onExportAll={onExportAll}
        onClear={onClear}
        onApplyToAll={onApplyToAll}
        onToggleGrid={onToggleGrid}
        onToggleGuides={onToggleGuides}
        onResetZoom={onResetZoom}
        onOpenSettings={onOpenSettings}
        isBatch={isBatch}
      />
    </header>
  );
};

export default Header;
