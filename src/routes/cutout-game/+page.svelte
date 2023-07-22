<script lang="ts">
	import { renderCategoryMask, renderConfidenceMask } from '$lib/mediapipe/renderResults';
	import {
		ImageSegmenter,
		FilesetResolver,
		type ImageSegmenterResult
	} from '@mediapipe/tasks-vision';
	import { onMount } from 'svelte';

	let videoEl: HTMLVideoElement;
	let canvasEl: HTMLCanvasElement;
	let canvasCtx: CanvasRenderingContext2D | null;
	let webcamStream: MediaStream;
	let cameraEnabled = false;
	let imageSegmenter: ImageSegmenter;
	let cutoffVal = 0.5;

	onMount(() => {
		canvasCtx = canvasEl.getContext('2d');
		createImageSegmenter();
	});

	const createImageSegmenter = async () => {
		const audio = await FilesetResolver.forVisionTasks('node_modules/@mediapipe/tasks-vision/wasm');

		imageSegmenter = await ImageSegmenter.createFromOptions(audio, {
			baseOptions: {
				modelAssetPath: 'src/lib/models/selfie_segmenter_square.tflite',
				delegate: 'GPU'
			},
			runningMode: 'VIDEO',
			outputCategoryMask: false,
			outputConfidenceMasks: true
		});
	};

	function callbackForVideo(result: ImageSegmenterResult) {
		if (canvasCtx !== null) {
			if (result.categoryMask !== undefined) {
				renderCategoryMask(result.categoryMask, canvasCtx, videoEl);
			}

			if (result.confidenceMasks !== undefined) {
				renderConfidenceMask(result.confidenceMasks, canvasCtx, videoEl, cutoffVal);
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
		if (imageSegmenter === undefined) return;

		let startTimeMs = performance.now();

		// Start segmenting the stream.
		imageSegmenter.segmentForVideo(videoEl, startTimeMs, callbackForVideo);
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
		if (imageSegmenter === undefined) return;

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
	<video muted bind:this={videoEl} />
	<canvas width="1280px" height="720px" bind:this={canvasEl} />
</div>

<style>
	video {
		display: none;
	}
</style>
