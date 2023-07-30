import type { ImageSegmenterResult, MPMask } from "@mediapipe/tasks-vision";

const legendColors = [
  [255, 197, 0, 255], // Vivid Yellow
  [128, 62, 117, 255], // Strong Purple
  [255, 104, 0, 255], // Vivid Orange
  [166, 189, 215, 255], // Very Light Blue
  [193, 0, 32, 255], // Vivid Red
  [206, 162, 98, 255], // Grayish Yellow
  [129, 112, 102, 255], // Medium Gray
  [0, 125, 52, 255], // Vivid Green
  [246, 118, 142, 255], // Strong Purplish Pink
  [0, 83, 138, 255], // Strong Blue
  [255, 112, 92, 255], // Strong Yellowish Pink
  [83, 55, 112, 255], // Strong Violet
  [255, 142, 0, 255], // Vivid Orange Yellow
  [179, 40, 81, 255], // Strong Purplish Red
  [244, 200, 0, 255], // Vivid Greenish Yellow
  [127, 24, 13, 255], // Strong Reddish Brown
  [147, 170, 0, 255], // Vivid Yellowish Green
  [89, 51, 21, 255], // Deep Yellowish Brown
  [241, 58, 19, 255], // Vivid Reddish Orange
  [35, 44, 22, 255], // Dark Olive Green
  [0, 161, 194, 255] // Vivid Blue
];

export const renderCategoryMask = (categoryMask: MPMask, canvasCtx: CanvasRenderingContext2D, videoEl: HTMLVideoElement) => {
  if (categoryMask === undefined) return;

  let imageData = canvasCtx.getImageData(0, 0, videoEl.videoWidth, videoEl.videoHeight).data;
  if (imageData === undefined) return;

  const mask = categoryMask.getAsFloat32Array();
  for (let i = 0; i < mask.length; i++) {
    const maskVal = Math.round(mask[i] * 255.0);
    const legendColor = legendColors[maskVal % legendColors.length];
    imageData[i * 4] = (legendColor[0] + imageData[i * 4]) / 2;
    imageData[i * 4 + 1] = (legendColor[1] + imageData[i * 4 + 1]) / 2;
    imageData[i * 4 + 2] = (legendColor[2] + imageData[i * 4 + 2]) / 2;
    imageData[i * 4 + 3] = (legendColor[3] + imageData[i * 4 + 3]) / 2;
  }
  const uint8Array = new Uint8ClampedArray(imageData.buffer);
  const dataNew = new ImageData(uint8Array, videoEl.videoWidth, videoEl.videoHeight);
  canvasCtx.putImageData(dataNew, 0, 0);
}

export const renderConfidenceMask = (confidenceMasks: MPMask[], canvasCtx: CanvasRenderingContext2D, videoEl: HTMLVideoElement, cutoff: number) => {
  if (confidenceMasks[0] === undefined) return;
  let imageData = canvasCtx.getImageData(0, 0, videoEl.videoWidth, videoEl.videoHeight).data;
  if (imageData === undefined) return;
 
  const mask = confidenceMasks[0].getAsFloat32Array();
  for (let i = 0; i < mask.length; i++) {
    const maskVal = mask[i] > cutoff ? 255 : 0;
    imageData[i * 4 + 3] = maskVal;
  }
  const uint8Array = new Uint8ClampedArray(imageData.buffer);
  const dataNew = new ImageData(uint8Array, videoEl.videoWidth, videoEl.videoHeight);
  canvasCtx.putImageData(dataNew, 0, 0);
}