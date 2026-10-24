import * as THREE from 'three';

// Manages dynamic sun, moon, sky colors, fog, and day/night transitions
export class DayNightSystem {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    // Current time in minutes (0 - 1439). Default to Day (720 min / 12:00)
    this.timeMinutes = 720;
    this.targetMinutes = 720;
    this.isPlaying = false;
    this.playSpeed = 60; // minutes per real-time second

    this.setupLights();
    this.setupEnvironment();
    this.setTime(720, true);
  }

  setupLights() {
    // Hemisphere ambient light
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Directional celestial light (Sun / Moon)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 150;
    const d = 40;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Secondary subtle fill light
    this.fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    this.fillLight.position.set(-30, 20, -30);
    this.scene.add(this.fillLight);
  }

  setupEnvironment() {
    // Background color / fog
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    // Starfield for night sky
    const starGeom = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 80 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPos[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = Math.abs(radius * Math.cos(phi)) + 5; // Keep above horizon
      starPos[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0
    });
    this.stars = new THREE.Points(starGeom, this.starMat);
    this.scene.add(this.stars);

    // Infinite Water Grid plane
    const waterGeom = new THREE.PlaneGeometry(300, 300, 40, 40);
    waterGeom.rotateX(-Math.PI / 2);
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x091e3a,
      roughness: 0.1,
      metalness: 0.8,
      flatShading: true,
      transparent: true,
      opacity: 0.85
    });
    this.water = new THREE.Mesh(waterGeom, this.waterMat);
    this.water.position.y = -6;
    this.water.receiveShadow = true;
    this.scene.add(this.water);
  }

  // Set time of day in minutes (0 - 1439)
  setTime(minutes, immediate = false) {
    this.targetMinutes = ((minutes % 1440) + 1440) % 1440;
    if (immediate) {
      this.timeMinutes = this.targetMinutes;
      this.applyLighting();
    }
  }

  applyLighting() {
    // Normalized 0 to 1
    const progress = this.timeMinutes / 1440;
    const hour = this.timeMinutes / 60;

    // Sun trajectory angle
    const sunAngle = progress * Math.PI * 2 - Math.PI / 2;
    const sunRadius = 60;
    const sunY = Math.sin(sunAngle) * sunRadius;
    const sunX = Math.cos(sunAngle) * sunRadius;
    const sunZ = Math.sin(sunAngle * 0.5) * 20;

    this.sunLight.position.set(sunX, Math.max(sunY, -sunRadius), sunZ);

    let skyColor, fogColor, sunColor, sunIntensity, hemiSky, hemiGround, starOpacity, waterColor;

    if (hour >= 5 && hour < 8) {
      // DAWN / 清晨 (05:00 - 08:00)
      const t = (hour - 5) / 3;
      skyColor = new THREE.Color(0xfb923c).lerp(new THREE.Color(0x38bdf8), t * 0.6);
      fogColor = new THREE.Color(0xffedd5).lerp(new THREE.Color(0xbae6fd), t);
      sunColor = new THREE.Color(0xffedd5);
      sunIntensity = 1.2;
      hemiSky = new THREE.Color(0xfdba74);
      hemiGround = new THREE.Color(0x1e293b);
      starOpacity = (1 - t) * 0.5;
      waterColor = new THREE.Color(0x1e3a8a);
    } else if (hour >= 8 && hour < 17) {
      // DAY / 白天 (08:00 - 17:00)
      skyColor = new THREE.Color(0x0284c7);
      fogColor = new THREE.Color(0xe0f2fe);
      sunColor = new THREE.Color(0xfffbeb);
      sunIntensity = 1.8;
      hemiSky = new THREE.Color(0xffffff);
      hemiGround = new THREE.Color(0x334155);
      starOpacity = 0;
      waterColor = new THREE.Color(0x0284c7);
    } else if (hour >= 17 && hour < 20) {
      // DUSK / 黃昏 (17:00 - 20:00)
      const t = (hour - 17) / 3;
      skyColor = new THREE.Color(0xf97316).lerp(new THREE.Color(0x4c1d95), t);
      fogColor = new THREE.Color(0xfed7aa).lerp(new THREE.Color(0x312e81), t);
      sunColor = new THREE.Color(0xf97316);
      sunIntensity = 1.4;
      hemiSky = new THREE.Color(0xfb923c);
      hemiGround = new THREE.Color(0x0f172a);
      starOpacity = t * 0.7;
      waterColor = new THREE.Color(0x311042);
    } else {
      // NIGHT / 夜晚 (20:00 - 05:00)
      skyColor = new THREE.Color(0x050b14);
      fogColor = new THREE.Color(0x0b1329);
      sunColor = new THREE.Color(0x60a5fa); // Moonlight
      sunIntensity = 0.5;
      hemiSky = new THREE.Color(0x1e293b);
      hemiGround = new THREE.Color(0x020617);
      starOpacity = 0.95;
      waterColor = new THREE.Color(0x050c1e);
    }

    this.renderer.setClearColor(skyColor, 1);
    this.scene.fog.color.copy(fogColor);
    this.sunLight.color.copy(sunColor);
    this.sunLight.intensity = sunIntensity;
    this.hemiLight.color.copy(hemiSky);
    this.hemiLight.groundColor.copy(hemiGround);
    this.starMat.opacity = starOpacity;
    this.waterMat.color.copy(waterColor);
  }

  // Smooth lerp to target time & play animation
  update(deltaSeconds) {
    if (this.isPlaying) {
      this.timeMinutes = (this.timeMinutes + deltaSeconds * this.playSpeed) % 1440;
      this.targetMinutes = this.timeMinutes;
      this.applyLighting();
    } else if (Math.abs(this.timeMinutes - this.targetMinutes) > 0.1) {
      let diff = this.targetMinutes - this.timeMinutes;
      // Handle wrap around
      if (diff > 720) diff -= 1440;
      if (diff < -720) diff += 1440;
      this.timeMinutes = (this.timeMinutes + diff * 0.1 + 1440) % 1440;
      this.applyLighting();
    }
  }

  getTimeFormatted() {
    const hours = Math.floor(this.timeMinutes / 60);
    const mins = Math.floor(this.timeMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
