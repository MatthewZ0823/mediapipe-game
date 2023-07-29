<script lang="ts">
	import CutoutRenderer from '$lib/components/CutoutRenderer.svelte';
	import SegTest from '$lib/components/SegTest.svelte';
	import WebcamPoseLandmarker from '$lib/components/WebcamPoseLandmarker.svelte';
	import WebcamSegmenter from '$lib/components/WebcamSegmenter.svelte';
	import { WebcamLandmarker } from '$lib/mediapipe/webcamLandmarker';
	import type { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
	import { onMount } from 'svelte';

	let webcamStream: MediaStream;
	let webcamLandmarkerResult: PoseLandmarkerResult;
	let webcamLandmarker: WebcamLandmarker;
	let width = 100, height = 100;

	onMount(async () => {
		webcamStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false
		});

		webcamLandmarker = new WebcamLandmarker((result) => {
			webcamLandmarkerResult = result;
		});

		webcamLandmarker.startWebcamPoseDetection();
	});
</script>

<!-- <WebcamSegmenter /> -->
<!-- <WebcamPoseLandmarker /> -->
<!-- <SegTest /> -->
<input type='range' max={1000} min={0} bind:value={width} />
<input type='range' max={1000} min={0} bind:value={height} />
<CutoutRenderer { width } { height } videoSource={webcamStream} landmarkerResult={webcamLandmarkerResult} />
