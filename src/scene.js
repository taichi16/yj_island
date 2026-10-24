import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { IslandBuilder } from './islands.js';
import { DayNightSystem } from './daynight.js';

export class AppScene {
  constructor(canvasContainer, onSelectObject) {
    this.container = canvasContainer;
    this.onSelectObject = onSelectObject;

    this.initThree();
    this.initWorld();
    this.initInteraction();
    this.animate();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  initThree() {
    this.scene = new THREE.Scene();

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      500
    );
    this.overviewPos = new THREE.Vector3(0, 36, 52);
    this.overviewTarget = new THREE.Vector3(0, 2, 0);
    this.camera.position.copy(this.overviewPos);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below horizon
    this.controls.minDistance = 10;
    this.controls.maxDistance = 140;
    this.controls.target.copy(this.overviewTarget);

    // Target positions for camera animations
    this.targetCameraPos = null;
    this.targetControlsTarget = null;
    this.isCameraAnimating = false;
  }

  initWorld() {
    this.dayNight = new DayNightSystem(this.scene, this.renderer);
    this.islandBuilder = new IslandBuilder(this.scene);
    this.worldGroup = this.islandBuilder.buildWorld();
    this.scene.add(this.worldGroup);
  }

  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;

    const dom = this.renderer.domElement;
    dom.addEventListener('pointermove', this.onPointerMove.bind(this));
    dom.addEventListener('pointerdown', this.onPointerDown.bind(this));
  }

  onPointerMove(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.islandBuilder.interactiveObjects, true);

    if (intersects.length > 0) {
      this.container.style.cursor = 'pointer';
    } else {
      this.container.style.cursor = 'default';
    }
  }

  onPointerDown(e) {
    // Only trigger if left click and not dragging
    if (e.button !== 0) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.islandBuilder.interactiveObjects, true);

    if (intersects.length > 0) {
      let hit = intersects[0].object;
      while (hit && !hit.userData?.id && hit.parent && hit.parent !== this.scene) {
        hit = hit.parent;
      }
      if (hit && hit.userData?.id) {
        this.focusOnObject(hit);
        if (this.onSelectObject) {
          this.onSelectObject(hit.userData);
        }
      }
    }
  }

  // Smooth focus on an island or landmark
  focusOnObject(object) {
    const worldPos = new THREE.Vector3();
    object.getWorldPosition(worldPos);

    // Calculate nice camera offset based on object type
    let offset = new THREE.Vector3(0, 14, 20);
    if (object.userData.id === "dev") {
      offset = new THREE.Vector3(-4, 16, 24);
    } else if (object.userData.id === "zen") {
      offset = new THREE.Vector3(12, 16, 24);
    } else if (object.userData.id === "beacon") {
      offset = new THREE.Vector3(0, 20, 20);
    }

    this.animateCameraTo(
      new THREE.Vector3().addVectors(worldPos, offset),
      worldPos
    );
  }

  animateCameraTo(targetPos, targetLookAt) {
    this.targetCameraPos = targetPos.clone();
    this.targetControlsTarget = targetLookAt.clone();
    this.isCameraAnimating = true;
  }

  resetToOverview() {
    this.animateCameraTo(this.overviewPos, this.overviewTarget);
  }

  setBirdEyeView() {
    this.animateCameraTo(new THREE.Vector3(0, 75, 4), new THREE.Vector3(0, 0, 0));
  }

  focusIsland(islandId) {
    if (islandId === "overview") {
      this.resetToOverview();
      return;
    }

    if (islandId === "dev") {
      this.animateCameraTo(new THREE.Vector3(-18, 20, 18), new THREE.Vector3(-16, 3, -2));
    } else if (islandId === "zen") {
      this.animateCameraTo(new THREE.Vector3(16, 18, 25), new THREE.Vector3(15, 2, 6));
    } else if (islandId === "beacon") {
      this.animateCameraTo(new THREE.Vector3(-2, 22, -2), new THREE.Vector3(-2, 8, -20));
    }
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = 0.016;
    const timeSec = performance.now() * 0.001;

    // Update animations
    this.islandBuilder.update(timeSec);
    this.dayNight.update(delta);

    // Smooth camera transition if active
    if (this.isCameraAnimating && this.targetCameraPos && this.targetControlsTarget) {
      this.camera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetControlsTarget, 0.05);

      if (
        this.camera.position.distanceTo(this.targetCameraPos) < 0.2 &&
        this.controls.target.distanceTo(this.targetControlsTarget) < 0.2
      ) {
        this.isCameraAnimating = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
