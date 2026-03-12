import { IMAGE_CONFIG } from "../config";

/**
 * Calculate the placement and dimensions of an image within an output canvas
 * when using scale mode (letterboxing/pillarboxing)
 * @param {number} imgWidth - Original image width
 * @param {number} imgHeight - Original image height
 * @param {number} outputWidth - Output canvas width
 * @param {number} outputHeight - Output canvas height
 * @param {string} vAlign - Vertical alignment: 'top', 'center', 'bottom'
 * @param {string} hAlign - Horizontal alignment: 'left', 'center', 'right'
 * @returns {Object} Placement info: {drawWidth, drawHeight, x, y, imgAspect, targetAspect}
 */
export const calculateScalePlacement = (
  imgWidth,
  imgHeight,
  outputWidth,
  outputHeight,
  vAlign = "center",
  hAlign = "center",
) => {
  const imgAspect = imgWidth / imgHeight;
  const targetAspect = outputWidth / outputHeight;

  let drawWidth, drawHeight, x, y;

  if (imgAspect > targetAspect) {
    drawWidth = outputWidth;
    drawHeight = drawWidth / imgAspect;
  } else {
    drawHeight = outputHeight;
    drawWidth = drawHeight * imgAspect;
  }

  const availableY = outputHeight - drawHeight;
  const availableX = outputWidth - drawWidth;

  switch (vAlign) {
    case "top":
      y = 0;
      break;
    case "bottom":
      y = availableY;
      break;
    case "center":
    default:
      y = availableY / 2;
  }

  switch (hAlign) {
    case "left":
      x = 0;
      break;
    case "right":
      x = availableX;
      break;
    case "center":
    default:
      x = availableX / 2;
  }

  return {
    drawWidth,
    drawHeight,
    x,
    y,
    imgAspect,
    targetAspect,
  };
};

/**
 * Apply vertical alignment to positioning
 * @param {number} y - Current y position
 * @param {number} drawHeight - Height of drawn image
 * @param {number} outputHeight - Output canvas height
 * @param {string} vAlign - Vertical alignment: 'top', 'center', 'bottom'
 * @returns {number} Adjusted y position
 */
export const applyVerticalAlignment = (
  y,
  drawHeight,
  outputHeight,
  vAlign = IMAGE_CONFIG.DEFAULT_V_ALIGN,
) => {
  const availableSpace = outputHeight - drawHeight;

  switch (vAlign) {
    case "top":
      return 0;
    case "bottom":
      return availableSpace;
    case "center":
    default:
      return availableSpace / 2;
  }
};

/**
 * Apply horizontal alignment to positioning
 * @param {number} x - Current x position
 * @param {number} drawWidth - Width of drawn image
 * @param {number} outputWidth - Output canvas width
 * @param {string} hAlign - Horizontal alignment: 'left', 'center', 'right'
 * @returns {number} Adjusted x position
 */
export const applyHorizontalAlignment = (
  x,
  drawWidth,
  outputWidth,
  hAlign = IMAGE_CONFIG.DEFAULT_H_ALIGN,
) => {
  const availableSpace = outputWidth - drawWidth;

  switch (hAlign) {
    case "left":
      return 0;
    case "right":
      return availableSpace;
    case "center":
    default:
      return availableSpace / 2;
  }
};

/**
 * Calculate padding/letterbox dimensions
 * @param {Object} placement - Result from calculateScalePlacement
 * @param {number} outputWidth - Output canvas width
 * @param {number} outputHeight - Output canvas height
 * @returns {Object} Padding info: {top, right, bottom, left}
 */
export const calculatePadding = (placement, outputWidth, outputHeight) => {
  const { x, y, drawWidth, drawHeight } = placement;

  return {
    top: y,
    bottom: outputHeight - (y + drawHeight),
    left: x,
    right: outputWidth - (x + drawWidth),
  };
};

/**
 * Create a blurred background image canvas
 * @param {ImageBitmap} imageBitmap - Source image
 * @param {number} outputWidth - Canvas width
 * @param {number} outputHeight - Canvas height
 * @returns {Promise<OffscreenCanvas>} Canvas with blurred background
 */
export const createBlurredBackground = async (
  imageBitmap,
  outputWidth,
  outputHeight,
) => {
  const canvas = new OffscreenCanvas(outputWidth, outputHeight);
  const ctx = canvas.getContext("2d");

  // Draw full image scaled to cover entire output (blurry background)
  const imgAspect = imageBitmap.width / imageBitmap.height;
  const targetAspect = outputWidth / outputHeight;

  let bgWidth, bgHeight;
  if (imgAspect < targetAspect) {
    bgWidth = outputWidth;
    bgHeight = bgWidth / imgAspect;
  } else {
    bgHeight = outputHeight;
    bgWidth = bgHeight * imgAspect;
  }

  ctx.drawImage(
    imageBitmap,
    0,
    0,
    imageBitmap.width,
    imageBitmap.height,
    0,
    0,
    bgWidth,
    bgHeight,
  );

  // Apply blur using OffscreenCanvas filter (browser support varies)
  ctx.filter = "blur(20px)";
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = "none";

  return canvas;
};

/**
 * Create extended edge background (mirrors adjacent pixels)
 * @param {ImageBitmap} imageBitmap - Source image
 * @param {Object} placement - Result from calculateScalePlacement
 * @param {number} outputWidth - Canvas width
 * @param {number} outputHeight - Canvas height
 * @returns {OffscreenCanvas} Canvas with extended edges
 */
export const createExtendedBackground = (
  imageBitmap,
  placement,
  outputWidth,
  outputHeight,
) => {
  const { drawWidth, drawHeight, x, y } = placement;
  const canvas = new OffscreenCanvas(outputWidth, outputHeight);
  const ctx = canvas.getContext("2d");

  // Draw the main image
  ctx.drawImage(imageBitmap, x, y, drawWidth, drawHeight);

  // Fill padding areas with extended edges
  // Top edge
  if (y > 0) {
    ctx.drawImage(imageBitmap, x, y, drawWidth, 1, x, 0, drawWidth, y);
  }

  // Bottom edge
  if (y + drawHeight < outputHeight) {
    const bottomSrc = y + drawHeight - 1;
    ctx.drawImage(
      imageBitmap,
      x,
      bottomSrc,
      drawWidth,
      1,
      x,
      bottomSrc + 1,
      drawWidth,
      outputHeight - bottomSrc - 1,
    );
  }

  // Left edge
  if (x > 0) {
    ctx.drawImage(imageBitmap, x, y, 1, drawHeight, 0, y, x, drawHeight);
  }

  // Right edge
  if (x + drawWidth < outputWidth) {
    const rightSrc = x + drawWidth - 1;
    ctx.drawImage(
      imageBitmap,
      rightSrc,
      y,
      1,
      drawHeight,
      rightSrc + 1,
      y,
      outputWidth - rightSrc - 1,
      drawHeight,
    );
  }

  return canvas;
};

/**
 * Draw an image with padding using specified style
 * @param {CanvasRenderingContext2D} ctx - 2D canvas context
 * @param {ImageBitmap} imageBitmap - Source image
 * @param {Object} placement - Result from calculateScalePlacement
 * @param {number} outputWidth - Canvas width
 * @param {number} outputHeight - Canvas height
 * @param {string} paddingStyle - Padding style: 'black', 'white', 'custom'
 * @param {string} customColor - Custom color if paddingStyle is 'custom'
 */
export const drawWithPadding = (
  ctx,
  imageBitmap,
  placement,
  outputWidth,
  outputHeight,
  paddingStyle = IMAGE_CONFIG.DEFAULT_PADDING,
  customColor = IMAGE_CONFIG.DEFAULT_PADDING_COLOR,
) => {
  const { drawWidth, drawHeight, x, y } = placement;

  // Draw padding/background
  switch (paddingStyle) {
    case "white":
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      break;
    case "custom":
      ctx.fillStyle = customColor;
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      break;
    case "black":
    default:
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, outputWidth, outputHeight);
  }

  // Draw image on top
  ctx.drawImage(imageBitmap, x, y, drawWidth, drawHeight);
};

/**
 * Transform annotation points for scale mode
 * @param {Object} point - Point with {x, y} coordinates
 * @param {Object} placement - Result from calculateScalePlacement
 * @param {number} outputWidth - Canvas width
 * @param {number} imageBitmap - Source image
 * @returns {Object} Transformed point
 */
export const transformPointForScale = (
  point,
  placement,
  outputWidth,
  imageBitmap,
) => {
  const { drawWidth, x } = placement;

  // Scale from image pixels to output pixels
  const scale = drawWidth / imageBitmap.width;

  return {
    x: point.x * scale + x,
    y: point.y * scale + placement.y,
  };
};

/**
 * Get scale transform parameters for annotations
 * @param {Object} placement - Result from calculateScalePlacement
 * @param {ImageBitmap} imageBitmap - Source image
 * @returns {Object} Transform parameters: {scale, offsetX, offsetY}
 */
export const getScaleTransform = (placement, imageBitmap) => {
  const { drawWidth, x, y } = placement;
  const scale = drawWidth / imageBitmap.width;

  return {
    scale,
    offsetX: x,
    offsetY: y,
  };
};

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Memoize expensive calculations
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  };
};

/**
 * Calculate available space for image positioning
 * @param {Object} placement - Result from calculateScalePlacement
 * @param {number} outputWidth - Canvas width
 * @param {number} outputHeight - Canvas height
 * @returns {Object} Available space: {x, y}
 */
export const getAvailableSpace = (placement, outputWidth, outputHeight) => {
  const { drawWidth, drawHeight } = placement;

  return {
    x: outputWidth - drawWidth,
    y: outputHeight - drawHeight,
  };
};

// Cache for memoized calculations
const placementCache = new Map();
const PLACEMENT_CACHE_MAX_SIZE = 100;

/**
 * Memoized version of calculateScalePlacement for better performance
 * @param {number} imgWidth - Original image width
 * @param {number} imgHeight - Original image height
 * @param {number} outputWidth - Output canvas width
 * @param {number} outputHeight - Output canvas height
 * @param {string} vAlign - Vertical alignment
 * @param {string} hAlign - Horizontal alignment
 * @returns {Object} Placement info
 */
export const calculateScalePlacementMemo = (
  imgWidth,
  imgHeight,
  outputWidth,
  outputHeight,
  vAlign = "center",
  hAlign = "center",
) => {
  const key = `${imgWidth}-${imgHeight}-${outputWidth}-${outputHeight}-${vAlign}-${hAlign}`;
  
  if (placementCache.has(key)) {
    return placementCache.get(key);
  }

  const result = calculateScalePlacement(
    imgWidth,
    imgHeight,
    outputWidth,
    outputHeight,
    vAlign,
    hAlign,
  );

  // Prevent cache from growing too large
  if (placementCache.size >= PLACEMENT_CACHE_MAX_SIZE) {
    const firstKey = placementCache.keys().next().value;
    placementCache.delete(firstKey);
  }

  placementCache.set(key, result);
  return result;
};
