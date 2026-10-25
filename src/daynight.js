import * as THREE from 'three';

// Keyframe interpolation for Sky, Sun, Hemisphere, and Water colors (derived from HEART policy island)
const KEYS = [
  // [min, skyTop, horizon, sunColor, sunI, hemiSky, hemiGround, hemiI, night, water]
  [0,    0x1e2c58, 0x3f4f80, 0xb4c2ff, 1.15, 0x94a2d8, 0x64566a, 1.85, 1.0,  0x5a88b2],
  [300,  0x26365f, 0x4c5688, 0xb8c4ff, 1.0,  0x96a4da, 0x66586c, 1.85, 1.0,  0x5c8ab4],
  [360,  0x7f8fc4, 0xf6c3a6, 0xffb48a, 1.4,  0xf3c6b5, 0x6b5a5a, 1.1,  0.55, 0x8fb7c4],
  [450,  0xa9d1ea, 0xfbe6d3, 0xffe2c4, 2.4,  0xeaf2f6, 0x8a7a68, 1.25, 0.0,  0x9fcfd6],
  [720,  0x9fd0ec, 0xf4eee3, 0xfff1de, 2.9,  0xeef6fa, 0x8f8270, 1.35, 0.0,  0xa9d8db],
  [960,  0xa6cfe6, 0xf8e7d2, 0xffe3c0, 2.5,  0xf1efe8, 0x8a7a66, 1.25, 0.0,  0x9fcbd2],
  [1080, 0x8b8fc4, 0xf7b98f, 0xff9f6a, 1.8,  0xf6d2bc, 0x7d6660, 1.2,  0.3,  0x93a9bd],
  [1170, 0x5a5e9e, 0xd99aa6, 0xff9a7a, 1.3,  0xc0b2e0, 0x655868, 1.35, 0.75, 0x6a7cab],
  [1260, 0x22325f, 0x445488, 0xc0ccff, 1.2,  0x98a8dc, 0x685a6e, 1.9,  1.0,  0x5a88b2],
  [1440, 0x1e2c58, 0x3f4f80, 0xb4c2ff, 1.15, 0x94a2d8, 0x64566a, 1.85, 1.0,  0x5a88b2]
];

export class DayNightSystem {
  constructor(scene, renderer, isMobile = false) {
    this.scene = scene;
    this.renderer = renderer;
    this.isMobile = isMobile;

    this.timeMinutes = 720; // Default: Day (12:00)
    this.targetMinutes = 720;
    this.isPlaying = false;
    this.playSpeed = 50;

    this.setupEnvironment();
    this.setupLights();
    this.applyKeyframes(720);
  }

  setupEnvironment() {
    this.scene.fog = new THREE.Fog(0xf4eee3, 30, 140);

    // Sky Dome Shader with mobile-safe precision
    this.skyUniforms = {
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSun: { value: new THREE.Color() },
      uNight: { value: 0 }
    };

    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: this.skyUniforms,
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform vec3 uTop, uHorizon, uSun, uSunDir;
        uniform float uNight;
        varying vec3 vDir;

        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        }

        void main() {
          float h = clamp(vDir.y, -0.2, 1.0);
          vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.55, h));
          float sd = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
          col += uSun * pow(sd, 16.0) * 0.35 * (1.0 - uNight * 0.6);

          // Stars at night
          vec3 cell = floor(vDir * 160.0);
          float star = step(0.9965, hash(cell)) * smoothstep(0.08, 0.5, h) * uNight;
          col += vec3(star * 0.9);

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const skyGeo = new THREE.SphereGeometry(180, 24, 16);
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // Stylized Water Shader (100% mobile safe without fwidth)
    this.waterUniforms = {
      uColor: { value: new THREE.Color(0xa4d4da) },
      uDeep: { value: new THREE.Color(0x6fa9b8) },
      uTime: { value: 0 },
      uNight: { value: 0 },
      ...THREE.UniformsLib.fog
    };

    const waterMat = new THREE.ShaderMaterial({
      fog: true,
      transparent: false,
      uniforms: this.waterUniforms,
      vertexShader: `
        #include <fog_pars_vertex>
        varying vec3 vW;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          vec4 mvPosition = viewMatrix * w;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: `
        #include <fog_pars_fragment>
        precision highp float;
        uniform vec3 uColor, uDeep;
        uniform float uTime, uNight;
        varying vec3 vW;

        void main() {
          float d = length(vW.xz);
          float w1 = sin(vW.x * 0.35 + uTime * 0.35 + sin(vW.z * 0.27)) * sin(vW.z * 0.31 - uTime * 0.28);
          float w2 = sin((vW.x * 0.6 + vW.z) * 1.1 + uTime * 0.7) * sin(vW.x * 0.9 - vW.z * 0.4);

          // Mobile-safe smooth antialiasing without relying on fwidth
          float aa = clamp(1.0 - abs(w2) * 1.2, 0.0, 1.0);

          vec3 col = mix(uColor, uDeep, smoothstep(8.0, 45.0, d) * 0.5);
          col += w1 * 0.016 + w2 * 0.005 * aa;

          // Gentle glint
          float glint = smoothstep(0.975, 1.0, w2 * 0.5 + 0.5) * 0.06 * (1.0 - uNight) * aa * (1.0 - smoothstep(15.0, 45.0, d));
          col += glint;

          gl_FragColor = vec4(col, 1.0);
          #include <fog_fragment>
        }
      `
    });

    const waterGeo = new THREE.CircleGeometry(160, 48);
    waterGeo.rotateX(-Math.PI / 2);
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.y = -0.2;
    this.waterMesh.receiveShadow = false;
    this.scene.add(this.waterMesh);

    this.createDistantHills();
  }

  createDistantHills() {
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x9fb5a4,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true
    });

    const hillsGroup = new THREE.Group();
    const hillConfigs = [
      { x: -50, z: -70, r: 28, h: 14 },
      { x: 20, z: -75, r: 35, h: 16 },
      { x: 65, z: -30, r: 26, h: 12 },
      { x: 55, z: 45, r: 30, h: 13 },
      { x: -55, z: 40, r: 32, h: 15 }
    ];

    hillConfigs.forEach(cfg => {
      const hillGeo = new THREE.ConeGeometry(cfg.r, cfg.h, 7);
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.position.set(cfg.x, cfg.h / 2 - 2, cfg.z);
      hillsGroup.add(hill);
    });

    this.scene.add(hillsGroup);
  }

  setupLights() {
    this.hemiLight = new THREE.HemisphereLight(0xeef6fa, 0x8f8270, 1.35);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff1de, 2.8);
    this.sunLight.castShadow = true;
    
    // Scale shadow map size down on mobile to prevent GPU OOM crashes
    const sm = this.isMobile ? 1024 : 2048;
    this.sunLight.shadow.mapSize.set(sm, sm);
    this.sunLight.shadow.camera.left = -26;
    this.sunLight.shadow.camera.right = 26;
    this.sunLight.shadow.camera.top = 26;
    this.sunLight.shadow.camera.bottom = -26;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 110;
    this.sunLight.shadow.bias = -0.0006;
    this.sunLight.shadow.normalBias = 0.045;
    this.sunLight.shadow.radius = this.isMobile ? 1.5 : 3;
    this.scene.add(this.sunLight);

    this.fillLight = new THREE.DirectionalLight(0xbfd6ff, 0.4);
    this.fillLight.position.set(25, 20, -25);
    this.scene.add(this.fillLight);
  }

  setTime(minutes, immediate = false) {
    this.targetMinutes = ((minutes % 1440) + 1440) % 1440;
    if (immediate) {
      this.timeMinutes = this.targetMinutes;
      this.applyKeyframes(this.timeMinutes);
    }
  }

  applyKeyframes(minutes) {
    const m = ((minutes % 1440) + 1440) % 1440;

    let k0 = KEYS[0], k1 = KEYS[KEYS.length - 1];
    for (let i = 0; i < KEYS.length - 1; i++) {
      if (m >= KEYS[i][0] && m <= KEYS[i + 1][0]) {
        k0 = KEYS[i];
        k1 = KEYS[i + 1];
        break;
      }
    }

    const span = k1[0] - k0[0] || 1;
    const t = (m - k0[0]) / span;

    const skyTop = new THREE.Color(k0[1]).lerp(new THREE.Color(k1[1]), t);
    const horizon = new THREE.Color(k0[2]).lerp(new THREE.Color(k1[2]), t);
    const sunColor = new THREE.Color(k0[3]).lerp(new THREE.Color(k1[3]), t);
    const sunIntensity = THREE.MathUtils.lerp(k0[4], k1[4], t);
    const hemiSky = new THREE.Color(k0[5]).lerp(new THREE.Color(k1[5]), t);
    const hemiGround = new THREE.Color(k0[6]).lerp(new THREE.Color(k1[6]), t);
    const hemiIntensity = THREE.MathUtils.lerp(k0[7], k1[7], t);
    const night = THREE.MathUtils.lerp(k0[8], k1[8], t);
    const waterColor = new THREE.Color(k0[9]).lerp(new THREE.Color(k1[9]), t);

    const progress = m / 1440;
    const angle = progress * Math.PI * 2 - Math.PI / 2;
    const radius = 60;
    const sunX = Math.cos(angle) * radius;
    const sunY = Math.sin(angle) * radius;
    const sunZ = Math.sin(angle * 0.5) * 22;

    this.sunLight.position.set(sunX, Math.max(sunY, -10), sunZ);
    this.sunLight.color.copy(sunColor);
    this.sunLight.intensity = sunIntensity;

    this.hemiLight.color.copy(hemiSky);
    this.hemiLight.groundColor.copy(hemiGround);
    this.hemiLight.intensity = hemiIntensity;

    this.skyUniforms.uTop.value.copy(skyTop);
    this.skyUniforms.uHorizon.value.copy(horizon);
    this.skyUniforms.uSun.value.copy(sunColor);
    this.skyUniforms.uSunDir.value.copy(this.sunLight.position).normalize();
    this.skyUniforms.uNight.value = night;

    this.scene.fog.color.copy(horizon);
    this.waterUniforms.uColor.value.copy(waterColor);
    this.waterUniforms.uNight.value = night;
  }

  update(deltaSeconds) {
    this.waterUniforms.uTime.value += deltaSeconds;

    if (this.isPlaying) {
      this.timeMinutes = (this.timeMinutes + deltaSeconds * this.playSpeed) % 1440;
      this.targetMinutes = this.timeMinutes;
      this.applyKeyframes(this.timeMinutes);
    } else if (Math.abs(this.timeMinutes - this.targetMinutes) > 0.1) {
      let diff = this.targetMinutes - this.timeMinutes;
      if (diff > 720) diff -= 1440;
      if (diff < -720) diff += 1440;
      this.timeMinutes = (this.timeMinutes + diff * 0.1 + 1440) % 1440;
      this.applyKeyframes(this.timeMinutes);
    }
  }

  getTimeFormatted() {
    const hours = Math.floor(this.timeMinutes / 60);
    const mins = Math.floor(this.timeMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
