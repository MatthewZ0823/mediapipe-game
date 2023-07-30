import { PoseLandmarker, type NormalizedLandmark, DrawingUtils } from "@mediapipe/tasks-vision";

export class LandmarkRenderer {
    drawingUtils: DrawingUtils;
    canvasCtx: CanvasRenderingContext2D;

    constructor(canvasCtx: CanvasRenderingContext2D) {
        this.canvasCtx = canvasCtx;
        this.drawingUtils = new DrawingUtils(canvasCtx);
    };

    drawConnectors(landmark: NormalizedLandmark[]) {
        if (this.canvasCtx === null || this.canvasCtx === undefined) return;

        this.canvasCtx.save();
        if (this.drawingUtils !== undefined) {
            this.drawingUtils.drawLandmarks(landmark);
            this.drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
        }
        this.canvasCtx.restore();
    };
}