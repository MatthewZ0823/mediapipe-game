import { PoseLandmarker, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { liteConnections, liteLandmarkIndexes } from '$lib/mediapipe/constants';
import * as THREE from 'three';

const drawConnection = (
	parent: THREE.Scene | THREE.Object3D,
	start: THREE.Vector3,
	end: THREE.Vector3
) => {
	const dist = start.distanceTo(end);
  const midpoint = start.clone().add(end).divideScalar(2);
	const geometry = new THREE.CylinderGeometry(0.1, 0.1, dist, 32);
	const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
	const cylinder = new THREE.Mesh(geometry, material);

  cylinder.position.add(midpoint);
  cylinder.lookAt(start);

	parent.add(cylinder);
};

export const drawResults = (
	parent: THREE.Scene | THREE.Object3D,
	landmarkerResult: PoseLandmarkerResult
): void | never => {
	const landmarks = landmarkerResult.landmarks[0];

	if (landmarks === undefined) throw new Error('No landmarks found in landmarker result');

	landmarks.forEach((landmark) => {
		const geometry = new THREE.SphereGeometry(0.1, 32, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const sphere = new THREE.Mesh(geometry, material);

		sphere.position.x = landmark.x - 0.5;
		sphere.position.y = -landmark.y + 0.5;
		sphere.position.z = landmark.z - 0.5;

		parent.add(sphere);
	});

	PoseLandmarker.POSE_CONNECTIONS.forEach((connection) => {
		const startLandmark = landmarks[connection.start];
		const endLandmark = landmarks[connection.end];
		const startCoordinates = [startLandmark.x - 0.5, -startLandmark.y + 0.5, startLandmark.z - 0.5];
		const endCoordinates = [endLandmark.x - 0.5, -endLandmark.y + 0.5, endLandmark.z];

		const points = [new THREE.Vector3(...startCoordinates), new THREE.Vector3(...endCoordinates)];

		const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const line = new THREE.Line(geometry, material);

		parent.add(line);
	});
};

export const drawResultsLite = (
	parent: THREE.Scene | THREE.Object3D,
	landmarkerResult: PoseLandmarkerResult
): void | never => {
	const landmarks = landmarkerResult.landmarks[0];

	if (landmarks === undefined) throw new Error('No landmarks found in landmarker result');

	landmarks.forEach((landmark, index) => {
		if (!liteLandmarkIndexes.includes(index)) return;

		const geometry = new THREE.SphereGeometry(0.1, 32, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const sphere = new THREE.Mesh(geometry, material);

		sphere.position.x = landmark.x - 0.5;
		sphere.position.y = -landmark.y + 0.5;
		sphere.position.z = landmark.z - 0.5;

		parent.add(sphere);
	});

	liteConnections.forEach((connection, index) => {
		const startLandmark = landmarks[connection.start];
		const endLandmark = landmarks[connection.end];
		const startCoordinates = [startLandmark.x - 0.5, -startLandmark.y + 0.5, startLandmark.z - 0.5];
		const endCoordinates = [endLandmark.x - 0.5, -endLandmark.y + 0.5, endLandmark.z];

		const points = [new THREE.Vector3(...startCoordinates), new THREE.Vector3(...endCoordinates)];

		const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const line = new THREE.Line(geometry, material);

		parent.add(line);

    if (index === 0) drawConnection(parent, points[0], points[1]);
	});
};
