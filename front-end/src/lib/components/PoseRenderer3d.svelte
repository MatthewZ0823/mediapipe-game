<script lang="ts">
	import { onMount } from 'svelte';
	import { MyScene } from '$lib/three/scene';
	import { drawResults, drawResultsLite } from '$lib/three/posePoints';
	import * as THREE from 'three';
	import type { PoseLandmarkerResult } from '@mediapipe/tasks-vision';

	export let result: PoseLandmarkerResult;

	let el: HTMLCanvasElement;
	let scene = new MyScene(400, 400);
	let mounted = false;
	let resultsParent = new THREE.Object3D();

	onMount(() => {
		scene.createScene(el);
		scene.addLights();
		scene.scene.add(resultsParent);
		mounted = true;
	});

	$: if (result && scene.scene) {
		resultsParent.clear();

		try {
			drawResultsLite(resultsParent, result);
		} catch (e) {
			console.error(e);
		}
	}
</script>

<canvas bind:this={el} />
