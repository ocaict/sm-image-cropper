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
  } = e.data;

  try {
    const canvas = new OffscreenCanvas(outputSize.width, outputSize.height);
    const ctx = canvas.getContext("2d", { alpha: format === "png" });

    if (!ctx) {
      throw new Error("Failed to get 2d context for OffscreenCanvas");
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

    const type = format === "png" ? "image/png" : "image/jpeg";
    const blob = await canvas.convertToBlob({ type, quality });

    // Clean up
    imageBitmap.close();

    self.postMessage({ blob, success: true, id });
  } catch (error) {
    self.postMessage({ success: false, error: error.message, id });
  }
};
