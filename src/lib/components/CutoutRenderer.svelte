<script lang="ts">
	import { DrawingUtils, PoseLandmarker, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';
	import { onMount } from 'svelte';

	export let videoSource: MediaStream;
	export let landmarkerResult: PoseLandmarkerResult;
	export let width: number, height: number;

	let videoEl: HTMLVideoElement;
	let canvasEl: HTMLCanvasElement;
	let canvasCtx: CanvasRenderingContext2D | null;
	let drawingUtils: DrawingUtils;
	let webcamContainer: HTMLDivElement;

	$: if (landmarkerResult) drawConnectors();
	$: if (videoEl && videoSource) {
		videoEl.srcObject = videoSource;
		updateWebcamSize();
	}
	$: if (width >= 0 && height >= 0) {
		updateWebcamSize();
	} else {
		throw new Error('Webcam size cannot be negative');
	}

	onMount(async () => {
		canvasCtx = canvasEl.getContext('2d');
		if (canvasCtx !== null) {
			drawingUtils = new DrawingUtils(canvasCtx);
		}

		videoEl.srcObject = videoSource;
		updateWebcamSize();
	});

	const drawConnectors = () => {
		canvasCtx?.save();
		canvasCtx?.clearRect(0, 0, canvasEl.width, canvasEl.height);
		for (const landmark of landmarkerResult.landmarks) {
			if (drawingUtils !== undefined) {
				drawingUtils.drawLandmarks(landmark);
				drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
			}
		}
		canvasCtx?.restore();
	};

	const updateWebcamSize = () => {
		if (webcamContainer && videoSource) {
			const videoAspectRatio = videoSource.getVideoTracks()[0].getSettings().aspectRatio;
			const desiredAspectRatio = width / height;

			if (videoAspectRatio && desiredAspectRatio < videoAspectRatio) {
				// Video needs to be squished from its original aspect ratio
				videoEl.style.height = `${height}px`;
				videoEl.style.width = 'auto';
			} else {
				// Video needs to be stretched
				videoEl.style.width = `${width}px`;
				videoEl.style.height = 'auto';
			}

			webcamContainer.style.width = `${width}px`;
			webcamContainer.style.height = `${height}px`;
		}
	};
</script>

<div class="relative mx-4">
	<div
		class="absolute flex items-center justify-center overflow-hidden"
		bind:this={webcamContainer}
	>
		<video autoplay muted bind:this={videoEl} class="max-w-none" />
	</div>
	<canvas class="absolute left-0 top-0" {width} {height} bind:this={canvasEl} />
</div>
