import { createContext, useState, useCallback } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activePlatform, setActivePlatform] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [batch, setBatch] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [outputSize, setOutputSize] = useState({ width: 1280, height: 720 });
  const [mode, setMode] = useState("crop");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const clearSession = useCallback(() => {
    setBatch([]);
    setImage(null);
    setOriginalImage(null);
    setSelectedPreset(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setActiveIndex(0);
  }, []);

  const value = {
    activePlatform,
    setActivePlatform,
    selectedPreset,
    setSelectedPreset,
    batch,
    setBatch,
    activeIndex,
    setActiveIndex,
    image,
    setImage,
    originalImage,
    setOriginalImage,
    imageSize,
    setImageSize,
    crop,
    setCrop,
    zoom,
    setZoom,
    croppedAreaPixels,
    setCroppedAreaPixels,
    outputSize,
    setOutputSize,
    mode,
    setMode,
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    batchProgress,
    setBatchProgress,
    clearSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
