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
<CutoutRenderer width={400} height={400} videoSource={webcamStream} landmarkerResult={webcamLandmarkerResult} />
