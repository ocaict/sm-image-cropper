/* eslint-disable no-restricted-globals */
import {
  calculateScalePlacement,
  drawWithPadding,
  getScaleTransform,
  transformPointForScale,
  createBlurredBackground,
  createExtendedBackground,
} from "../utils/scaling.js";

self.onmessage = async (e) => {
  const {
    imageBitmap,
    croppedAreaPixels,
    outputSize,
    mode,
    format,
    quality = 0.92,
    id,
    paths,
    paddingStyle = "black",
    customColor = "#000000",
    vAlign = "center",
    hAlign = "center",
    scalePosition = { x: 0, y: 0 },
    scaleZoom = 1,
    adjustments = { brightness: 100, contrast: 100, saturation: 100 },
    textLayers = [],
    watermark = { image: null, opacity: 50, scale: 20, position: "bottom-right" },
  } = e.data;

  try {
    const canvas = new OffscreenCanvas(outputSize.width, outputSize.height);
    const ctx = canvas.getContext("2d", { alpha: format === "png" });

    if (!ctx) {
      throw new Error("Failed to get 2d context for OffscreenCanvas");
    }

    // Apply image adjustments as CSS filter on the canvas
    const { brightness = 100, contrast = 100, saturation = 100 } = adjustments;
    if (brightness !== 100 || contrast !== 100 || saturation !== 100) {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    }

    if (mode === "crop" && croppedAreaPixels) {
      // Crop mode: draw full background first, then crop rect
      if (format !== "png") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(
        imageBitmap,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    } else {
      // Scale mode: use padded placement
      const placement = calculateScalePlacement(
        imageBitmap.width,
        imageBitmap.height,
        outputSize.width,
        outputSize.height,
        vAlign,
        hAlign,
      );

      // Apply scaleZoom to the image dimensions
      const zoomedWidth = placement.drawWidth * scaleZoom;
      const zoomedHeight = placement.drawHeight * scaleZoom;

      // Recalculate position to center the zoomed image within the output
      const zoomedX = (outputSize.width - zoomedWidth) / 2;
      const zoomedY = (outputSize.height - zoomedHeight) / 2;

      // Apply scale position offset (based on original placement scale)
      const offsetScale = placement.drawWidth / imageBitmap.width;
      const offsetX = scalePosition.x * offsetScale;
      const offsetY = scalePosition.y * offsetScale;

      const adjustedPlacement = {
        ...placement,
        drawWidth: zoomedWidth,
        drawHeight: zoomedHeight,
        x: zoomedX + offsetX,
        y: zoomedY + offsetY,
      };

      if (paddingStyle === "blur") {
        const blurredCanvas = await createBlurredBackground(
          imageBitmap,
          outputSize.width,
          outputSize.height,
        );
        ctx.drawImage(blurredCanvas, 0, 0);
        ctx.drawImage(
          imageBitmap,
          adjustedPlacement.x,
          adjustedPlacement.y,
          adjustedPlacement.drawWidth,
          adjustedPlacement.drawHeight,
        );
      } else if (paddingStyle === "extend") {
        const extendedCanvas = createExtendedBackground(
          imageBitmap,
          adjustedPlacement,
          outputSize.width,
          outputSize.height,
        );
        ctx.drawImage(extendedCanvas, 0, 0);
      } else {
        drawWithPadding(
          ctx,
          imageBitmap,
          adjustedPlacement,
          outputSize.width,
          outputSize.height,
          paddingStyle,
          customColor,
        );
      }
    }

    // Draw Annotations
    if (paths && paths.length > 0) {
      ctx.filter = "none"; // Reset filter before drawing annotations
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      paths.forEach((path) => {
        if (path.points.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = path.color;

        // Calculate scale factor for line width
        let scaleX = 1;

        if (mode === "crop" && croppedAreaPixels) {
          // Crop mode: scale based on crop dimensions
          scaleX = outputSize.width / croppedAreaPixels.width;
        } else {
          // Scale mode: use placement calculations
          const placement = calculateScalePlacement(
            imageBitmap.width,
            imageBitmap.height,
            outputSize.width,
            outputSize.height,
          );
          scaleX = placement.drawWidth / imageBitmap.width;
        }

        ctx.lineWidth = path.width * scaleX;

        // Helper to transform point
        const transform = (p) => {
          if (mode === "crop" && croppedAreaPixels) {
            return {
              x: (p.x - croppedAreaPixels.x) * scaleX,
              y: (p.y - croppedAreaPixels.y) * scaleX,
            };
          } else {
            // Scale mode: use utility function
            const placement = calculateScalePlacement(
              imageBitmap.width,
              imageBitmap.height,
              outputSize.width,
              outputSize.height,
            );
            return transformPointForScale(
              p,
              placement,
              outputSize.width,
              imageBitmap,
            );
          }
        };

        const p0 = transform(path.points[0]);
        ctx.moveTo(p0.x, p0.y);

        for (let i = 1; i < path.points.length; i++) {
          const p = transform(path.points[i]);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      });
    }

    // Draw Text Layers
    if (textLayers && textLayers.length > 0) {
      ctx.filter = "none";
      textLayers.forEach((layer) => {
        const fontSize = (layer.fontSize / 1000) * outputSize.width;
        ctx.font = `${layer.fontWeight} ${fontSize}px ${layer.fontFamily}`;
        ctx.fillStyle = layer.color;
        ctx.textAlign = layer.textAlign;
        ctx.textBaseline = "middle";

        if (layer.shadow) {
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        const x = (layer.x / 100) * outputSize.width;
        const y = (layer.y / 100) * outputSize.height;

        ctx.fillText(layer.text, x, y);
        
        // Reset shadow for next layer
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      });
    }

    // Draw Watermark
    if (watermark && watermark.image) {
      try {
        ctx.filter = "none";
        const response = await fetch(watermark.image);
        const blob = await response.blob();
        const wmImg = await createImageBitmap(blob);
        
        const { opacity, scale, position } = watermark;
        ctx.globalAlpha = opacity / 100;
        
        const wmWidth = outputSize.width * (scale / 100);
        const wmHeight = (wmImg.height / wmImg.width) * wmWidth;
        
        let x = 20;
        let y = 20;
        
        const parts = position.split("-");
        const v = parts[0];
        const h = parts[1] || "center";
        
        if (v === "top") y = 20;
        else if (v === "bottom") y = outputSize.height - wmHeight - 20;
        else if (v === "center") y = (outputSize.height - wmHeight) / 2;
        
        if (h === "left") x = 20;
        else if (h === "right") x = outputSize.width - wmWidth - 20;
        else if (h === "center") x = (outputSize.width - wmWidth) / 2;
        
        ctx.drawImage(wmImg, x, y, wmWidth, wmHeight);
        ctx.globalAlpha = 1.0;
        wmImg.close();
      } catch (wmError) {
        // Silently fail watermark if error occurs (e.g. invalid URL)
      }
    }

    const type = format === "png" ? "image/png" : "image/jpeg";
    const blob = await canvas.convertToBlob({ type, quality });

    // Clean up
    imageBitmap.close();

    self.postMessage({ blob, success: true, id });
  } catch (error) {
    self.postMessage({ success: false, error: error.message, id });
  }
};
