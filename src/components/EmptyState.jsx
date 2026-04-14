import React from 'react';
import logo from '../assets/logo.png';

const EmptyState = ({ onImport, dragOver, onDrop, onDragOver, onDragLeave }) => {
  return (
    <div 
      className={`premium-empty-state ${dragOver ? 'drag-over' : ''}`}
      onClick={onImport}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="empty-state-content">
        <div className="empty-state-logo-wrapper">
          <img src={logo} alt="Social Image Resizer" className="empty-state-logo" />
          <div className="logo-glow"></div>
        </div>
        
        <h2 className="empty-state-title">Ready to Resize?</h2>
        <p className="empty-state-subtitle">
          Drag and drop your images here, or click to browse your files.
        </p>
        
        <div className="import-button-container">
          <button className="import-cta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import Images
          </button>
        </div>
        
        <div className="empty-state-features">
          <div className="feature-item">
            <span className="feature-dot"></span>
            Multi-upload supported
          </div>
          <div className="feature-item">
            <span className="feature-dot"></span>
            Social Media Presets
          </div>
          <div className="feature-item">
            <span className="feature-dot"></span>
            Smart Auto-Scale
          </div>
        </div>
      </div>
      
      {dragOver && (
        <div className="premium-drop-overlay">
          <div className="drop-circle">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span>Drop to Start</span>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
