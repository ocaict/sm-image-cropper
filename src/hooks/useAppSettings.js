import { useState, useEffect } from "react";

export function useAppSettings(initialConfig) {
  const [settings, setSettings] = useState({
    jpegQuality: initialConfig.jpegQuality || 92,
    showGrid: initialConfig.showGrid ?? true,
    showGuidelines: initialConfig.showGuidelines ?? true,
    safeZonePercentage: initialConfig.safeZonePercentage || 10,
    paddingStyle: initialConfig.paddingStyle || "black",
    customPaddingColor: initialConfig.customPaddingColor || "#000000",
    watermark: {
      image: null,
      opacity: 50,
      scale: 20,
      position: "bottom-right",
    },
  });

  // Load settings on startup
  useEffect(() => {
    if (window.go?.main?.App?.LoadSettings) {
      window.go.main.App.LoadSettings()
        .then((saved) => {
          if (saved) {
            setSettings((prev) => ({
              ...prev,
              jpegQuality: saved.jpegQuality || prev.jpegQuality,
              showGrid: saved.showGrid ?? prev.showGrid,
              showGuidelines: saved.showGuidelines ?? prev.showGuidelines,
              safeZonePercentage: saved.safeZonePercentage || prev.safeZonePercentage,
              paddingStyle: saved.paddingStyle || prev.paddingStyle,
              customPaddingColor: saved.customPaddingColor || prev.customPaddingColor,
              watermark: {
                ...prev.watermark,
                image: saved.watermarkImage || prev.watermark.image,
                opacity: saved.watermarkOpacity || prev.watermark.opacity,
                scale: saved.watermarkScale || prev.watermark.scale,
                position: saved.watermarkPosition || prev.watermark.position,
              },
            }));
          }
        })
        .catch((err) => console.error("Failed to load settings:", err));
    }
  }, []);

  // Save settings when they change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.go?.main?.App?.SaveSettings) {
        const payload = {
          jpegQuality: settings.jpegQuality,
          showGrid: settings.showGrid,
          showGuidelines: settings.showGuidelines,
          safeZonePercentage: settings.safeZonePercentage,
          paddingStyle: settings.paddingStyle,
          customPaddingColor: settings.customPaddingColor,
          watermarkImage: settings.watermark.image,
          watermarkOpacity: settings.watermark.opacity,
          watermarkScale: settings.watermark.scale,
          watermarkPosition: settings.watermark.position,
        };

        window.go.main.App.LoadSettings().then((current) => {
          window.go.main.App.SaveSettings({
            ...current,
            ...payload,
          });
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [settings]);

  return [settings, setSettings];
}
