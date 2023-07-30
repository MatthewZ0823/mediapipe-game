<script lang="ts">
	import { onMount } from 'svelte';
	import SilhouetteImage from '$lib/assets/silhouettes/silhouette-1-edit.png';
	import cutoutLandmarks from '$lib/assets/cutout-landmarks/all_pose_landmarks.json';
	import { LandmarkRenderer } from '$lib/mediapipe/landmarkRenderer';
	import type { PoseLandmarkerResult } from '@mediapipe/tasks-vision';

	export let videoSource: MediaStream;
	export let landmarkerResult: PoseLandmarkerResult;
	export let width: number, height: number;

	let videoEl: HTMLVideoElement;
	let landmarkCanvasEl: HTMLCanvasElement;
	let landmarkCanvasCtx: CanvasRenderingContext2D | null;
	let landmarkRenderer: LandmarkRenderer | undefined;
	let webcamContainer: HTMLDivElement;
	let vidWidth: number, vidHeight: number;

	$: if (landmarkerResult) {
		clearCanvas();
		drawWebcamConnectors();
		drawCutoutConnectors();
	}
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
		landmarkCanvasCtx = landmarkCanvasEl.getContext('2d');
		if (landmarkCanvasCtx !== null) {
			landmarkRenderer = new LandmarkRenderer(landmarkCanvasCtx);
		} else {
			console.error('Could not get canvas context');
		}

		videoEl.srcObject = videoSource;
		updateWebcamSize();
	});

	const clearCanvas = () => {
		landmarkCanvasCtx?.clearRect(0, 0, landmarkCanvasEl.width, landmarkCanvasEl.height);
	};

	const drawWebcamConnectors = () => {
		landmarkRenderer?.drawConnectors(landmarkerResult.landmarks[0]);
	};

	const drawCutoutConnectors = () => {
		landmarkRenderer?.drawConnectors(cutoutLandmarks[0]);
	};

	const updateWebcamSize = () => {
		if (webcamContainer && videoSource) {
			const videoAspectRatio = videoSource.getVideoTracks()[0].getSettings().aspectRatio;
			const desiredAspectRatio = width / height;

			if (videoAspectRatio === undefined) return;

			if (desiredAspectRatio < videoAspectRatio) {
				// Video needs to be squished from its original aspect ratio
				videoEl.style.height = `${height}px`;
				videoEl.style.width = 'auto';

				landmarkCanvasEl.height = height;
				landmarkCanvasEl.width = height * videoAspectRatio;
			} else {
				// Video needs to be stretched
				videoEl.style.width = `${width}px`;
				videoEl.style.height = 'auto';

				landmarkCanvasEl.width = width;
				landmarkCanvasEl.height = width / videoAspectRatio;
			}

			webcamContainer.style.width = `${width}px`;
			webcamContainer.style.height = `${height}px`;
		}
	};
</script>

<div class="relative flex items-center justify-center overflow-hidden" bind:this={webcamContainer}>
	<video autoplay muted bind:this={videoEl} class="max-w-none" />
	<img class="absolute opacity-25" src={SilhouetteImage} alt="Silhouette" />
	<canvas class="absolute" width={vidWidth} height={vidHeight} bind:this={landmarkCanvasEl} />
</div>
