import * as THREE from 'three';

export class MyScene {
  width: number;
  height: number;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.Renderer | undefined;
  animationCallbacks: { (): void; }[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 2;

    this.animationCallbacks = [];
  };

  addLights() {
    const directionalLight = new THREE.DirectionalLight(0x9090aa);
    directionalLight.position.set(-10, 10, -10).normalize();
    this.scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemisphereLight.position.set(1, 1, 1);
    this.scene.add(hemisphereLight);
  };

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.animationCallbacks.forEach(callback => callback());
    this.renderer?.render(this.scene, this.camera);
  };

  onAnimate(...callbacks: { (): void; }[]) {
    this.animationCallbacks.push(...callbacks);
  }

  createScene(el: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
    this.renderer.setSize(this.width, this.height);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.animate();
  };
}