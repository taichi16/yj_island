import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { IslandBuilder } from './islands.js';
import { DayNightSystem } from './daynight.js';
import { PeopleManager } from './people.js';

export class AppScene {
  constructor(canvasContainer, onSelectObject) {
    this.container = canvasContainer;
    this.onSelectObject = onSelectObject;

    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    this.initThree();
    this.initWorld();
    this.initLabels();
    this.initInteraction();
    this.animate();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  initThree() {
    this.scene = new THREE.Scene();

    // Telephoto miniature FOV (32 deg default, 42 deg for mobile portrait)
    const width = this.container.clientWidth || window.innerWidth || 800;
    const height = this.container.clientHeight || window.innerHeight || 600;
    const aspect = width / height;
    const fov = aspect < 1.0 ? 42 : 32;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.5, 350);
    this.overviewPos = aspect < 1.0 ? new THREE.Vector3(0, 32, 44) : new THREE.Vector3(0, 24, 34);
    this.overviewTarget = new THREE.Vector3(0, 1.2, -1.5);
    this.camera.position.copy(this.overviewPos);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.domElement.style.touchAction = 'none';
    this.container.appendChild(this.renderer.domElement);

    // CSS2D Label Renderer
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.labelRenderer.domElement.id = 'labels';
    this.labelRenderer.domElement.style.touchAction = 'none';
    this.container.appendChild(this.labelRenderer.domElement);

    // Orbit Controls with touch support
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(20);
    this.controls.maxPolarAngle = THREE.MathUtils.degToRad(75);
    this.controls.minDistance = 8;
    this.controls.maxDistance = 75;
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    this.controls.target.copy(this.overviewTarget);

    this.targetCameraPos = null;
    this.targetControlsTarget = null;
    this.isCameraAnimating = false;
  }

  initWorld() {
    this.dayNight = new DayNightSystem(this.scene, this.renderer, this.isMobile);
    this.islandBuilder = new IslandBuilder(this.scene);
    this.worldGroup = this.islandBuilder.buildWorld();
    this.scene.add(this.worldGroup);

    // Cute animated pedestrians & cyclists!
    this.peopleManager = new PeopleManager(this.scene);
  }

  initLabels() {
    this.labelObjects = [];

    // 1. Main Island Badges (Black pills pinned to edge)
    const islandBadges = [
      { id: "dev", num: "01", text: "開發", pos: new THREE.Vector3(-8.6, 1.3, 8.8) },
      { id: "zen", num: "02", text: "藝境", pos: new THREE.Vector3(8.6, 1.3, 8.8) },
      { id: "beacon", num: "03", text: "燈塔", pos: new THREE.Vector3(0, 1.3, -4.7) }
    ];

    islandBadges.forEach(b => {
      const div = document.createElement('div');
      div.className = 'island-main-badge';
      div.innerHTML = `<strong>${b.num}</strong><span>${b.text}</span>`;
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        this.focusIsland(b.id);
        if (this.onSelectObject) this.onSelectObject({ id: b.id, name: b.text });
      });

      const labelObj = new CSS2DObject(div);
      labelObj.position.copy(b.pos);
      this.scene.add(labelObj);
      this.labelObjects.push({ element: div, id: b.id });
    });

    // 2. Compact Circular Point Pins (①, ②, ③)
    const pointPins = [
      // Dev Island
      { id: "unisnap", num: "1", text: "UniSnap 基地", pos: new THREE.Vector3(-11.4, 3.4, 3.4) },
      { id: "windows-media-downloader", num: "2", text: "Rust 工具樓", pos: new THREE.Vector3(-6.0, 4.4, 3.2) },
      { id: "freeway-milestone-query", num: "3", text: "國道里程樁", pos: new THREE.Vector3(-5.8, 2.4, 0.2) },
      
      // Zen Island
      { id: "tea-ceremony", num: "1", text: "靜水茶席亭", pos: new THREE.Vector3(7.2, 3.6, 0.8) },
      { id: "art-maker", num: "2", text: "創客實體工坊", pos: new THREE.Vector3(11.0, 3.4, 3.2) },
      { id: "photography", num: "3", text: "光影觀景台", pos: new THREE.Vector3(8.2, 2.2, 4.4) },
      { id: "ai-research", num: "4", text: "AI 核心矩陣", pos: new THREE.Vector3(10.4, 2.1, 0.2) },

      // Beacon Island
      { id: "beacon", num: "1", text: "社交燈塔", pos: new THREE.Vector3(0, 8.2, -11.5) }
    ];

    pointPins.forEach(p => {
      const div = document.createElement('div');
      div.className = 'pin-badge';
      div.innerHTML = `<span class="pin-num">${p.num}</span><span>${p.text}</span>`;
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        this.focusOnCoordinate(p.pos, p.id);
        if (this.onSelectObject) this.onSelectObject({ id: p.id, name: p.text });
      });

      const labelObj = new CSS2DObject(div);
      labelObj.position.copy(p.pos);
      this.scene.add(labelObj);
      this.labelObjects.push({ element: div, id: p.id });
    });
  }

  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const dom = this.renderer.domElement;
    this.pointerStartPos = { x: 0, y: 0 };
    this.pointerStartTime = 0;

    dom.addEventListener('pointerdown', (e) => {
      this.pointerStartPos.x = e.clientX;
      this.pointerStartPos.y = e.clientY;
      this.pointerStartTime = performance.now();
      this.updateMousePos(e);
    });

    dom.addEventListener('pointermove', (e) => {
      this.updateMousePos(e);
      if (e.pointerType === 'mouse') {
        this.checkHover();
      }
    });

    dom.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - this.pointerStartPos.x, e.clientY - this.pointerStartPos.y);
      const elapsed = performance.now() - this.pointerStartTime;

      // Only trigger click/tap if finger or mouse barely moved (tap vs drag)
      if (dist < 10 && elapsed < 400) {
        this.updateMousePos(e);
        this.handleTapOrClick();
      }
    });
  }

  updateMousePos(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.islandBuilder.interactiveObjects, true);
    this.container.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
  }

  handleTapOrClick() {
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

  focusOnObject(object) {
    const worldPos = new THREE.Vector3();
    object.getWorldPosition(worldPos);
    this.focusOnCoordinate(worldPos, object.userData.id);
  }

  focusOnCoordinate(worldPos, id) {
    let offset = new THREE.Vector3(0, 11, 16);
    if (id === "dev" || id === "unisnap") {
      offset = new THREE.Vector3(-1.5, 11, 16);
    } else if (id === "zen" || id === "tea-ceremony" || id === "art-maker") {
      offset = new THREE.Vector3(2, 11, 16);
    } else if (id === "beacon") {
      offset = new THREE.Vector3(0, 13, 14);
    }

    this.animateCameraTo(
      new THREE.Vector3().addVectors(worldPos, offset),
      worldPos
    );

    this.highlightLabel(id);
  }

  highlightLabel(id) {
    this.labelObjects.forEach(l => {
      l.element.classList.toggle('selected', l.id === id);
    });
  }

  animateCameraTo(targetPos, targetLookAt) {
    this.targetCameraPos = targetPos.clone();
    this.targetControlsTarget = targetLookAt.clone();
    this.isCameraAnimating = true;
  }

  resetToOverview() {
    this.animateCameraTo(this.overviewPos, this.overviewTarget);
    this.highlightLabel(null);
  }

  setBirdEyeView() {
    this.animateCameraTo(new THREE.Vector3(0, 46, 2), new THREE.Vector3(0, 1.2, -1.5));
    this.highlightLabel(null);
  }

  focusIsland(islandId) {
    if (islandId === "overview") {
      this.resetToOverview();
    } else if (islandId === "dev") {
      this.animateCameraTo(new THREE.Vector3(-8.6, 12, 16), new THREE.Vector3(-8.6, 1.2, 2.0));
      this.highlightLabel("dev");
    } else if (islandId === "zen") {
      this.animateCameraTo(new THREE.Vector3(8.6, 12, 16), new THREE.Vector3(8.6, 1.2, 2.0));
      this.highlightLabel("zen");
    } else if (islandId === "beacon") {
      this.animateCameraTo(new THREE.Vector3(0, 14, 2), new THREE.Vector3(0, 2.8, -11.5));
      this.highlightLabel("beacon");
    }
  }

  onResize() {
    const width = this.container.clientWidth || window.innerWidth || 800;
    const height = this.container.clientHeight || window.innerHeight || 600;
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1.0 ? 42 : 32;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = 0.016;
    const timeSec = performance.now() * 0.001;

    // Update island world & lighting
    this.islandBuilder.update(timeSec);
    this.dayNight.update(delta);

    // Update walking characters and cyclists!
    if (this.peopleManager) {
      this.peopleManager.update(delta);
    }

    if (this.isCameraAnimating && this.targetCameraPos && this.targetControlsTarget) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      this.controls.target.lerp(this.targetControlsTarget, 0.06);

      if (
        this.camera.position.distanceTo(this.targetCameraPos) < 0.2 &&
        this.controls.target.distanceTo(this.targetControlsTarget) < 0.2
      ) {
        this.isCameraAnimating = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
}
