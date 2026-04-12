import React, { memo } from 'react';

const StatusBar = memo(({ imageSize, outputSize, mode, loading, batchProgress }) => {
  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="label">IMAGE SIZE:</span>
        <span className="value">{(imageSize.width || 0)}×{(imageSize.height || 0)} px</span>
      </div>
      <div className="status-divider" />
      <div className="status-item">
        <span className="label">OUTPUT:</span>
        <span className="value">{(outputSize.width || 0)}×{(outputSize.height || 0)} px</span>
      </div>
      <div className="status-divider" />
      <div className="status-item">
        <span className="label">RATIO:</span>
        <span className="value">{(outputSize.width / outputSize.height).toFixed(2)}:1</span>
      </div>
      <div className="status-divider" />
      <div className="status-item">
        <span className="label">MODE:</span>
        <span className="value">{mode.toUpperCase()}</span>
      </div>

      {loading && batchProgress.total > 0 && (
         <div className="status-item loading-status">
            <div className="progress-mini-bar">
               <div className="progress-mini-fill" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }} />
            </div>
            <span className="label">Exporting: {batchProgress.current}/{batchProgress.total}</span>
         </div>
      )}

      <div className="status-spacer" />
      
      <div className="status-item app-version">
         <span className="label">v 1.2.0</span>
         <span className="status-dot online" />
      </div>
    </div>
  );
});

export default StatusBar;
