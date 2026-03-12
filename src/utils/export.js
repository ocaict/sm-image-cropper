

export const generateFilename = (platform, preset, width, height, format) => {
  const ext = format === 'png' ? 'png' : 'jpg';
  return `${platform || 'custom'}_${preset || 'custom'}_${width}x${height}.${ext}`;
};
