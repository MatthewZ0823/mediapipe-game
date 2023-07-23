<script lang="ts">
	import { DrawingUtils, PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
	import { onDestroy, onMount } from 'svelte';

	let videoEl: HTMLVideoElement;
	let canvasEl: HTMLCanvasElement;
	let canvasCtx: CanvasRenderingContext2D | null;
	let drawingUtils: DrawingUtils;
	let poseLandmarker: PoseLandmarker;
	let webcamStream: MediaStream;
	let cameraEnabled = false;

	let videoWidth: number;
	let videoHeight: number;

	onMount(() => {
		canvasCtx = canvasEl.getContext('2d');
		if (canvasCtx !== null) {
			drawingUtils = new DrawingUtils(canvasCtx);
		}
		createPoseLandmarker();
	});

	onDestroy(() => {
		videoEl?.removeEventListener('loadeddata', predictWebcam);
		videoEl?.removeEventListener('loadedmetadata', handleLoadedMetaData);
	});

	const handleLoadedMetaData = () => {
		({ videoWidth, videoHeight } = videoEl);
	};

	// Before we can use PoseLandmarker class we must wait for it to finish
	// loading. Machine Learning models can be large and take a moment to
	// get everything needed to run.
	const createPoseLandmarker = async () => {
		const vision = await FilesetResolver.forVisionTasks(
			'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm'
		);
		poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
				delegate: 'GPU'
			},
			runningMode: 'VIDEO',
			numPoses: 1
		});
	};

	let lastVideoTime = -1;
	async function predictWebcam() {
		// Now let's start detecting the stream.
		let startTimeMs = performance.now();
		if (lastVideoTime !== videoEl.currentTime) {
			lastVideoTime = videoEl.currentTime;
			poseLandmarker.detectForVideo(videoEl, startTimeMs, (result) => {
				canvasCtx?.save();
				canvasCtx?.clearRect(0, 0, canvasEl.width, canvasEl.height);
				for (const landmark of result.landmarks) {
					drawingUtils.drawLandmarks(landmark, {
						radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
					});
					drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
				}
				canvasCtx?.restore();
			});
		}

		// Call this function again to keep predicting when the browser is ready.
		if (cameraEnabled) {
			window.requestAnimationFrame(predictWebcam);
		}
	}

	const handleToggleCamera = () => {
		cameraEnabled = !cameraEnabled;

		if (cameraEnabled) {
			enableCam();
		} else {
			disableCam();
		}
	};

	async function enableCam() {
		if (poseLandmarker === undefined) return;

		// getUsermedia parameters.
		const mediaConfig = {
			video: true,
			audio: false
		};

		// Activate the webcam stream.
		webcamStream = await navigator.mediaDevices.getUserMedia(mediaConfig);
		videoEl.srcObject = webcamStream;
		videoEl.play();
		videoEl.addEventListener('loadeddata', predictWebcam);
		videoEl.addEventListener('loadedmetadata', handleLoadedMetaData);
	}

	const disableCam = () => {
		webcamStream.getTracks()[0].stop();
		videoEl.pause();
		videoEl.src = '';
		videoEl.removeEventListener('loadeddata', predictWebcam);
		videoEl.removeEventListener('loadedmetadata', handleLoadedMetaData);
	};
</script>

<button on:click={handleToggleCamera}>Toggle Camera</button>
<div class="webcam relative">
	<video class="absolute" muted bind:this={videoEl} />
	<canvas
		class="absolute left-0 top-0"
		bind:this={canvasEl}
		width={videoWidth}
		height={videoHeight}
	/>
</div>
