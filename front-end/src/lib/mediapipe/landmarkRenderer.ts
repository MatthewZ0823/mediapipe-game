import { PoseLandmarker, type NormalizedLandmark, DrawingUtils } from "@mediapipe/tasks-vision";

interface Connection {
  start: number;
  end: number;
}

export class LandmarkRenderer {
  drawingUtils: DrawingUtils;
  canvasCtx: CanvasRenderingContext2D;
  liteLandmarks: number[];
  liteConnections: Connection[];

  /**
   * Draws landmarks and connections on the given canvas context
   * @param canvasCtx Canvas context to draw on
   */
  constructor(canvasCtx: CanvasRenderingContext2D) {
    this.canvasCtx = canvasCtx;
    this.drawingUtils = new DrawingUtils(canvasCtx);
    this.liteLandmarks = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    this.liteConnections = [
      { start: 11, end: 12 },
      { start: 11, end: 13 },
      { start: 11, end: 23 },
      { start: 12, end: 24 },
      { start: 12, end: 14 },
      { start: 13, end: 15 },
      { start: 14, end: 16 },
      { start: 23, end: 24 },
      { start: 23, end: 25 },
      { start: 24, end: 26 },
      { start: 25, end: 27 },
      { start: 26, end: 28 }
    ];
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

    const reducedLandmarks = this.liteLandmarks.map(val => landmark[val]);

    this.canvasCtx.save();
    if (this.drawingUtils !== undefined) {
      this.drawingUtils.drawLandmarks(reducedLandmarks);
      this.drawingUtils.drawConnectors(landmark, this.liteConnections);
    }
    this.canvasCtx.restore();
  }
}