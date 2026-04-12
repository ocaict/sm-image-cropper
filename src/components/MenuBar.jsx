import React, { useState, useEffect, useRef } from 'react';

const MenuBar = ({ 
  onImport, 
  onExport, 
  onExportAll, 
  onClear, 
  onApplyToAll, 
  onToggleGrid, 
  onToggleGuides, 
  onResetZoom,
  onOpenSettings,
  isBatch
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus = [
    {
      label: 'File',
      items: [
        { label: 'Import Images...', shortcut: 'Ctrl+O', action: onImport },
        { divider: true },
        { label: 'Export as PNG', action: () => onExport('png') },
        { label: 'Export as JPG', action: () => onExport('jpeg') },
        { divider: true },
        { label: 'Export All...', disabled: !isBatch, action: () => onExportAll('jpeg') },
        { divider: true },
        { label: 'Clear Workspace', shortcut: 'Delete', action: onClear },
        { label: 'Exit', action: () => window.runtime?.Quit?.() }
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Apply Adjustments to All', disabled: !isBatch, action: () => onApplyToAll('adjustments') },
        { label: 'Apply Scale to All', disabled: !isBatch, action: () => onApplyToAll('scale') },
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Show / Hide Grid', shortcut: 'G', action: onToggleGrid },
        { label: 'Show / Hide Guides', shortcut: 'H', action: onToggleGuides },
        { divider: true },
        { label: 'Reset Zoom', shortcut: 'Home', action: onResetZoom },
        { label: 'Fit to Screen', action: onResetZoom }
      ]
    },
    {
      label: 'Settings',
      items: [
        { label: 'Quality Preferences...', action: onOpenSettings },
        { label: 'Watermark Management...', action: onOpenSettings },
        { divider: true },
        { label: 'App Theme: Dark', disabled: true }
      ]
    }
  ];

  return (
    <nav className="menu-bar" ref={menuRef} style={{ "--wails-draggable": "no-drag" }}>
      {menus.map((menu) => (
        <div key={menu.label} className="menu-item-container">
          <button 
            className={`menu-trigger ${activeMenu === menu.label ? 'active' : ''}`}
            onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
            onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
          >
            {menu.label}
          </button>
          
          {activeMenu === menu.label && (
            <div className="menu-dropdown">
              {menu.items.map((item, idx) => (
                item.divider ? (
                  <div key={idx} className="menu-divider" />
                ) : (
                  <button
                    key={item.label}
                    className="menu-option"
                    disabled={item.disabled}
                    onClick={() => {
                      item.action?.();
                      setActiveMenu(null);
                    }}
                  >
                    <span className="menu-label">{item.label}</span>
                    {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default MenuBar;
