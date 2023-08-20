import { FilesetResolver, PoseLandmarker, type PoseLandmarkerCallback } from "@mediapipe/tasks-vision";

/**
 * Class to run Mediapipe's Pose Landmark Detection on the Webcam input
 */
export class WebcamLandmarker {
  private poseLandmarker: PoseLandmarker | undefined;
  private lastVideoTime: number;
  poseCallback: PoseLandmarkerCallback;
  private videoEl: HTMLVideoElement;
  private webcamStream: MediaStream | undefined;
  cameraEnabled: boolean;

  /**
   * Performs pose landmark detection on webcam input
   * @param poseCallback Callback to recieve the result of the pose landmark detection
   */
  constructor(poseCallback: PoseLandmarkerCallback) {
    this.lastVideoTime = -1;
    this.poseLandmarker = undefined;
    this.cameraEnabled = false;
    this.videoEl = document.createElement('video');

    this.predictWebcam = this.predictWebcam.bind(this);
    this.createPoseLandmarker();
    this.poseCallback = poseCallback;
  }

  /**
   * Creates a pose landmarker object asynchronously and puts the object in this.poseLandmarker, should be called in constructor
   */
  private async createPoseLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      'node_modules/@mediapipe/tasks-vision/wasm'
    );
    this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'src/lib/models/pose_landmarker_lite.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
  };

  /**
   * Runs the Mediapipe Pose Landmark Detect task on the webcam
   */
  private async predictWebcam() {
    // Now let's start detecting the stream.
    let startTimeMs = performance.now();
    if (this.lastVideoTime !== this.videoEl.currentTime) {
      this.lastVideoTime = this.videoEl.currentTime;

      if (this.poseLandmarker !== undefined) {
        // TODO: Make website responsive when loading landmarks for the first time
        this.poseLandmarker.detectForVideo(this.videoEl, startTimeMs, this.poseCallback);
      } else {
        console.error('Pose Landmarker not yet initialized');
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    if (this.cameraEnabled) {
      window.requestAnimationFrame(this.predictWebcam);
    }
  }

  /**
   * Enables the webcam and starts the Pose Landmark Detection
   */
  async startWebcamPoseDetection() {
    this.cameraEnabled = true;

    // getUsermedia parameters.
    const mediaConfig = {
      video: true,
      audio: false
    };

    // Activate the webcam stream.
    this.webcamStream = await navigator.mediaDevices.getUserMedia(mediaConfig);
    this.videoEl.srcObject = this.webcamStream;
    this.videoEl.play();
    this.videoEl.addEventListener('loadeddata', this.predictWebcam, false);
  }

  /**
   * Disables the webcam and stops the Pose Landmark Detection
   */
  stopWebcamPoseDetection() {
    this.cameraEnabled = false;

    this.webcamStream?.getTracks()[0].stop();
    this.videoEl.pause();
    this.videoEl.src = '';
    this.videoEl.removeEventListener('loadeddata', this.predictWebcam, false);
  };
}
