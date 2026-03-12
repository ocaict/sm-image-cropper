// Application configuration constants

export const IMAGE_CONFIG = {
  // Image preview thresholds
  LARGE_IMAGE_THRESHOLD: 2000, // pixels
  FILE_SIZE_THRESHOLD: 5 * 1024 * 1024, // 5MB
  PREVIEW_MAX_DIMENSION: 1500, // pixels

  // Export settings
  JPEG_QUALITY: 0.92,

  // File upload limits
  MAX_FILES_PER_UPLOAD: 50,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB per file
  MAX_BATCH_SIZE: 100,

  // Scale mode settings
  PADDING_OPTIONS: {
    BLACK: "black",
    WHITE: "white",
    BLUR: "blur",
    EXTEND: "extend",
    CUSTOM: "custom",
  },
  DEFAULT_PADDING: "black",
  DEFAULT_PADDING_COLOR: "#000000",
  CUSTOM_COLOR_DEFAULT: "#808080",

  // Alignment options
  VERTICAL_ALIGN: ["top", "center", "bottom"],
  HORIZONTAL_ALIGN: ["left", "center", "right"],
  DEFAULT_V_ALIGN: "center",
  DEFAULT_H_ALIGN: "center",

  // Scale preview settings
  GRID_ENABLED: true,
  SHOW_GUIDELINES: true,
  SAFE_ZONE_PERCENTAGE: 10, // 10% margin

  // Warning thresholds
  LOW_RES_THRESHOLD: 150, // Warn if output is more than 150% of input
  UPSCALE_THRESHOLD: 1.0, // Warn if output > input dimensions
};

export const ERROR_MESSAGES = {
  FILE_TYPE_INVALID: "Only image files are allowed",
  FILE_SIZE_TOO_LARGE: "File size exceeds limit (50MB max)",
  TOO_MANY_FILES: "Too many files selected (50 max)",
  UPLOAD_FAILED: "Failed to upload images",
  EXPORT_FAILED: "Export failed: ",
  BATCH_EXPORT_FAILED: "Batch export failed: ",
  WORKER_NOT_INITIALIZED: "Export worker not initialized",
};

export const WARNING_MESSAGES = {
  UPSCALING: "Output size is larger than original - image will be upscaled",
  LOW_RESOLUTION: "Image resolution is low - output may appear pixelated",
};

export const SUCCESS_MESSAGES = {
  IMAGE_UPLOADED: "Image uploaded successfully",
  IMAGES_UPLOADED: "images uploaded successfully",
  EXPORT_COMPLETE: "Image exported successfully",
  BATCH_EXPORT_COMPLETE: "Batch export completed",
};
export const UI_CONFIG = {
  TOAST_DURATION: 3000, // 3 seconds
};
