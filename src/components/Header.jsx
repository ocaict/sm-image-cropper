import React, { useState } from 'react';

const Header = () => {
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
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 8px 0 20px",  // Right padding is smaller to tightly tuck the buttons
        minHeight: "56px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div className="header-logo">SI</div>
        <h1 className="header-title">Social Image Resizer</h1>
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
            <button 
              onClick={handleMinimize}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="5" width="10" height="2" />
              </svg>
            </button>
            <button 
              onClick={handleToggleMaximize}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
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
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 68, 68, 0.1)";
                e.currentTarget.style.color = "#ff4444";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
               <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
               </svg>
            </button>
          </div>
        )}
    </header>
  );
};

export default Header;
