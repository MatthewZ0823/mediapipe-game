<script lang="ts">
	import { renderCategoryMask, renderConfidenceMask } from '$lib/mediapipe/renderResults';
	import {
		FilesetResolver,
		type ImageSegmenterResult,
		PoseLandmarker,
		type PoseLandmarkerResult,
		MPMask
	} from '@mediapipe/tasks-vision';
	import { onDestroy, onMount } from 'svelte';

	let videoEl: HTMLVideoElement;
	let canvasEl: HTMLCanvasElement;
	let canvasCtx: CanvasRenderingContext2D | null;
	let webcamStream: MediaStream;
	let cameraEnabled = false;
	let poseLandmarker: PoseLandmarker;
	let cutoffVal = 0.5;

	onMount(() => {
		canvasCtx = canvasEl.getContext('2d');
		createImageSegmenter();
	});

	const createImageSegmenter = async () => {
		const vision = await FilesetResolver.forVisionTasks(
			'node_modules/@mediapipe/tasks-vision/wasm'
		);
		poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath: 'src/lib/models/pose_landmarker_lite.task',
				// delegate: 'GPU'
			},
			runningMode: 'VIDEO',
			numPoses: 1,
			outputSegmentationMasks: true
		});
	};

	function callbackForVideo(result: PoseLandmarkerResult) {
		if (canvasCtx !== null) {
			if (result.segmentationMasks !== undefined) {
				renderConfidenceMask(result.segmentationMasks, canvasCtx, videoEl, cutoffVal);
			}
		}

		if (cameraEnabled) {
			window.requestAnimationFrame(predictWebcam);
		}
	}

	// Get segmentation from the webcam
	let lastWebcamTime = -1;
	async function predictWebcam() {
		if (videoEl.currentTime === lastWebcamTime) {
			if (cameraEnabled) {
				window.requestAnimationFrame(predictWebcam);
			}
			return;
		}
		lastWebcamTime = videoEl.currentTime;
		canvasCtx?.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
		// Do not segmented if imageSegmenter hasn't loaded
		if (poseLandmarker === undefined) return;

		let startTimeMs = performance.now();

		// Start segmenting the stream.
		poseLandmarker.detectForVideo(videoEl, startTimeMs, callbackForVideo);
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
	}

	const disableCam = () => {
		webcamStream.getTracks()[0].stop();
		videoEl.pause();
		videoEl.src = '';
	};
</script>

<button on:click={handleToggleCamera}>Toggle Camera</button>
<input type="range" min="0" max="1" step="0.01" bind:value={cutoffVal} />
<div class="webcam">
	<video muted bind:this={videoEl} on:loadeddata={predictWebcam} />
	<canvas width="1280px" height="720px" bind:this={canvasEl} />
</div>

<style>
	/* video {
		display: none;
	} */
</style>
