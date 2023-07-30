<script lang="ts">
	export let videoEl: HTMLVideoElement;

	let webcamStream: MediaStream;
	let cameraEnabled = false;

	const handleToggleCamera = () => {
		cameraEnabled = !cameraEnabled;

		if (cameraEnabled) {
			enableCam();
		} else {
			disableCam();
		}
	};

	async function enableCam() {
		webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
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
<video
	class="absolute"
	muted
	on:loadeddata
	on:loadedmetadata
	bind:this={videoEl}
/>
