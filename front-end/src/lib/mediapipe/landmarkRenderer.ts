import { PoseLandmarker, type NormalizedLandmark, DrawingUtils } from "@mediapipe/tasks-vision";
import { liteConnections, liteLandmarkIndexes } from "./constants";

export class LandmarkRenderer {
  drawingUtils: DrawingUtils;
  canvasCtx: CanvasRenderingContext2D;

  /**
   * Draws landmarks and connections on the given canvas context
   * @param canvasCtx Canvas context to draw on
   */
  constructor(canvasCtx: CanvasRenderingContext2D) {
    this.canvasCtx = canvasCtx;
    this.drawingUtils = new DrawingUtils(canvasCtx);
  };

  /**
   * Draws all landmarks and connections between landmarks
   * @param landmark The landmarks to draw on the canvas
   */
  drawConnectorsFull(landmark: NormalizedLandmark[]) {
    if (this.canvasCtx === null || this.canvasCtx === undefined) return;

    this.canvasCtx.save();
    if (this.drawingUtils !== undefined) {
      this.drawingUtils.drawLandmarks(landmark);
      this.drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }
    this.canvasCtx.restore();
  };

  /**
   * Draws some of the landmarks and connections, leaving out some of the less important ones
   * @param landmark The landmarks to draw on the canvas
   */
  drawConnectorsLite(landmark: NormalizedLandmark[]) {
    if (this.canvasCtx === null || this.canvasCtx === undefined || landmark === undefined) return;

    const reducedLandmarks = liteLandmarkIndexes.map(index => landmark[index]);

    this.canvasCtx.save();
    if (this.drawingUtils !== undefined) {
      this.drawingUtils.drawLandmarks(reducedLandmarks);
      this.drawingUtils.drawConnectors(landmark, liteConnections);
    }
    this.canvasCtx.restore();
  }
}