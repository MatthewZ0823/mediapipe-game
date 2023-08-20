<script lang="ts">
	import CutoutRenderer from '$lib/components/CutoutRenderer.svelte';
	import PoseRenderer3d from '$lib/components/PoseRenderer3d.svelte';
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

<CutoutRenderer width={400} height={400} videoSource={webcamStream} landmarkerResult={webcamLandmarkerResult} />
<PoseRenderer3d result={webcamLandmarkerResult} />
