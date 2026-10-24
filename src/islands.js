import * as THREE from 'three';

// Procedural materials and geometries for the 3D Island
export class IslandBuilder {
  constructor(scene) {
    this.scene = scene;
    this.interactiveObjects = [];
    this.animatedObjects = [];
    this.materials = this.createMaterials();
  }

  createMaterials() {
    return {
      islandBase: new THREE.MeshStandardMaterial({
        color: 0x243242,
        roughness: 0.8,
        metalness: 0.2,
        flatShading: true
      }),
      islandDevTop: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5,
        metalness: 0.5,
        flatShading: true
      }),
      islandZenTop: new THREE.MeshStandardMaterial({
        color: 0x2d4a3e,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true
      }),
      islandBeaconTop: new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.6,
        metalness: 0.4,
        flatShading: true
      }),
      techGlowCyan: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8
      }),
      techGlowPurple: new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.7,
        roughness: 0.3
      }),
      zenWood: new THREE.MeshStandardMaterial({
        color: 0x8b5a2b,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: true
      }),
      zenRoof: new THREE.MeshStandardMaterial({
        color: 0x2c3e50,
        roughness: 0.5,
        flatShading: true
      }),
      foliageGreen: new THREE.MeshStandardMaterial({
        color: 0x34d399,
        roughness: 0.7,
        flatShading: true
      }),
      sakuraPink: new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        roughness: 0.8,
        flatShading: true
      }),
      beaconGold: new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.7
      }),
      waterGrid: new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      })
    };
  }

  // Create a stylized hexagonal island block
  createHexIsland(radius = 12, height = 5, topMaterial, baseMaterial = this.materials.islandBase) {
    const group = new THREE.Group();

    // Top Hexagon
    const hexGeom = new THREE.CylinderGeometry(radius, radius * 1.08, height, 6, 1);
    const hexMesh = new THREE.Mesh(hexGeom, topMaterial);
    hexMesh.castShadow = true;
    hexMesh.receiveShadow = true;
    group.add(hexMesh);

    // Underground bedrock (inverted cone/pyramid for floating effect)
    const baseGeom = new THREE.ConeGeometry(radius * 1.08, height * 1.8, 6);
    baseGeom.rotateX(Math.PI);
    const baseMesh = new THREE.Mesh(baseGeom, baseMaterial);
    baseMesh.position.y = -height * 1.4;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Decorative floating ring around base
    const ringGeom = new THREE.TorusGeometry(radius * 1.25, 0.15, 6, 6);
    ringGeom.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeom, this.materials.techGlowCyan);
    ringMesh.position.y = -height * 0.4;
    group.add(ringMesh);

    return { group, topMesh: hexMesh };
  }

  // Build the complete archipelago
  buildWorld() {
    const world = new THREE.Group();

    // 1. DEV ISLAND (科技與開發核心島)
    const devIsland = this.buildDevIsland();
    devIsland.position.set(-16, 1, -2);
    world.add(devIsland);

    // 2. ZEN & ATELIER ISLAND (生活藝境與創客綠洲島)
    const zenIsland = this.buildZenIsland();
    zenIsland.position.set(15, 0.5, 6);
    world.add(zenIsland);

    // 3. BEACON ISLAND (連結燈塔島)
    const beaconIsland = this.buildBeaconIsland();
    beaconIsland.position.set(-2, 2.5, -20);
    world.add(beaconIsland);

    // 4. Energy Bridges / Connections
    this.createEnergyStream(devIsland.position, zenIsland.position, 0x38bdf8, world);
    this.createEnergyStream(devIsland.position, beaconIsland.position, 0xa855f7, world);
    this.createEnergyStream(zenIsland.position, beaconIsland.position, 0xf59e0b, world);

    // 5. Floating Clouds
    this.createClouds(world);

    return world;
  }

  // 1. Dev Island Construction
  buildDevIsland() {
    const { group, topMesh } = this.createHexIsland(13, 4.5, this.materials.islandDevTop);
    group.userData = { id: "dev", name: "開發核心島 (Dev Island)", category: "projects" };
    topMesh.userData = group.userData;
    this.interactiveObjects.push(topMesh);

    // Cyber Skyscraper A (Main Server Tower)
    const towerAGeom = new THREE.BoxGeometry(3.5, 12, 3.5);
    const towerAMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.7,
      flatShading: true
    });
    const towerA = new THREE.Mesh(towerAGeom, towerAMat);
    towerA.position.set(-3, 6 + 2.25, -2);
    towerA.castShadow = true;
    towerA.receiveShadow = true;
    towerA.userData = { id: "unisnap", name: "UniSnap 伺服核心", category: "projects" };
    this.interactiveObjects.push(towerA);
    group.add(towerA);

    // Tower A glowing server bands
    for (let i = 0; i < 4; i++) {
      const bandGeom = new THREE.BoxGeometry(3.6, 0.4, 3.6);
      const bandMesh = new THREE.Mesh(bandGeom, this.materials.techGlowCyan);
      bandMesh.position.set(-3, 4 + i * 2.5 + 2.25, -2);
      group.add(bandMesh);
    }

    // Skyscraper B (Rust Core Tower)
    const towerBGeom = new THREE.BoxGeometry(3, 9, 3);
    const towerB = new THREE.Mesh(towerBGeom, towerAMat);
    towerB.position.set(3, 4.5 + 2.25, 2);
    towerB.castShadow = true;
    towerB.receiveShadow = true;
    towerB.userData = { id: "windows-media-downloader", name: "Rust Downloader 核心", category: "projects" };
    this.interactiveObjects.push(towerB);
    group.add(towerB);

    // Cyber Antenna / Satellite Dish
    const poleGeom = new THREE.CylinderGeometry(0.15, 0.25, 4, 8);
    const pole = new THREE.Mesh(poleGeom, this.materials.techGlowCyan);
    pole.position.set(3, 9 + 2.25 + 2, 2);
    group.add(pole);

    const dishGeom = new THREE.ConeGeometry(1.4, 0.8, 12, 1, true);
    dishGeom.rotateX(Math.PI / 4);
    const dish = new THREE.Mesh(dishGeom, this.materials.techGlowPurple);
    dish.position.set(3, 11 + 2.25, 2);
    this.animatedObjects.push({ mesh: dish, update: (t) => { dish.rotation.y = t * 0.5; } });
    group.add(dish);

    // GIS Milestone Obelisk (Highway query)
    const obeliskGeom = new THREE.ConeGeometry(1.6, 6, 4);
    const obelisk = new THREE.Mesh(obeliskGeom, new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.3,
      emissive: 0x065f46,
      emissiveIntensity: 0.6
    }));
    obelisk.position.set(4, 3 + 2.25, -4);
    obelisk.castShadow = true;
    obelisk.userData = { id: "freeway-milestone-query", name: "國道里程樁坐標陣列", category: "projects" };
    this.interactiveObjects.push(obelisk);
    group.add(obelisk);

    // Small data nodes / crystals on ground
    for (let i = 0; i < 5; i++) {
      const nodeGeom = new THREE.OctahedronGeometry(0.6 + Math.random() * 0.4);
      const node = new THREE.Mesh(nodeGeom, this.materials.techGlowCyan);
      const angle = (i / 5) * Math.PI * 2;
      const dist = 7 + Math.random() * 2;
      node.position.set(Math.cos(angle) * dist, 2.5 + Math.random() * 0.5, Math.sin(angle) * dist);
      this.animatedObjects.push({
        mesh: node,
        initY: node.position.y,
        update: (t) => {
          node.position.y = node.userData.initY + Math.sin(t * 2 + i) * 0.3;
          node.rotation.y = t * 1.2;
        }
      });
      node.userData = { initY: node.position.y };
      group.add(node);
    }

    // Island Float Animation
    this.animatedObjects.push({
      mesh: group,
      initY: group.position.y,
      update: (t) => {
        group.position.y = group.userData.initY + Math.sin(t * 0.8) * 0.4;
      }
    });
    group.userData.initY = 1;

    return group;
  }

  // 2. Zen & Atelier Island Construction
  buildZenIsland() {
    const { group, topMesh } = this.createHexIsland(14, 4.5, this.materials.islandZenTop);
    group.userData = { id: "zen", name: "藝境綠洲島 (Zen & Atelier)", category: "interests" };
    topMesh.userData = group.userData;
    this.interactiveObjects.push(topMesh);

    // Japanese-style Tea Pavilion (茶道亭)
    const pavilion = new THREE.Group();
    pavilion.position.set(-2, 2.25, -2);
    pavilion.userData = { id: "tea-ceremony", name: "靜水茶席 (Tea Pavilion)", category: "interests" };

    // Pavilion base platform
    const platformGeom = new THREE.BoxGeometry(6, 0.4, 6);
    const platform = new THREE.Mesh(platformGeom, this.materials.zenWood);
    platform.position.y = 0.2;
    platform.castShadow = true;
    platform.receiveShadow = true;
    pavilion.add(platform);

    // 4 Pillars
    const pillarGeom = new THREE.CylinderGeometry(0.2, 0.2, 3, 6);
    const pillarPositions = [
      [-2.4, 1.5, -2.4], [2.4, 1.5, -2.4],
      [-2.4, 1.5, 2.4], [2.4, 1.5, 2.4]
    ];
    pillarPositions.forEach(pos => {
      const pillar = new THREE.Mesh(pillarGeom, this.materials.zenWood);
      pillar.position.set(...pos);
      pillar.castShadow = true;
      pavilion.add(pillar);
    });

    // Traditional Pagoda Tiered Roof
    const roofGeom1 = new THREE.ConeGeometry(5, 1.4, 4);
    roofGeom1.rotateY(Math.PI / 4);
    const roof1 = new THREE.Mesh(roofGeom1, this.materials.zenRoof);
    roof1.position.y = 3.6;
    roof1.castShadow = true;
    pavilion.add(roof1);

    // Tea pot / Teacup mini geometry
    const teapotGeom = new THREE.SphereGeometry(0.4, 8, 8);
    const teapot = new THREE.Mesh(teapotGeom, new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 }));
    teapot.position.set(0, 0.7, 0);
    pavilion.add(teapot);

    this.interactiveObjects.push(platform);
    group.add(pavilion);

    // 3D Printing / Laser Art Cube (創客工坊)
    const atelierGroup = new THREE.Group();
    atelierGroup.position.set(5, 2.25, 3);
    atelierGroup.userData = { id: "art-maker", name: "創客工坊 (Maker Atelier)", category: "interests" };

    const cubeFrameGeom = new THREE.BoxGeometry(3, 3, 3);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      wireframe: true,
      roughness: 0.2
    });
    const cubeFrame = new THREE.Mesh(cubeFrameGeom, cubeMat);
    cubeFrame.position.y = 1.6;
    atelierGroup.add(cubeFrame);

    // Floating 3D printed sculpted Torus Knot inside
    const torusGeom = new THREE.TorusKnotGeometry(0.7, 0.25, 48, 8);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    const torus = new THREE.Mesh(torusGeom, torusMat);
    torus.position.y = 1.6;
    this.animatedObjects.push({
      mesh: torus,
      update: (t) => {
        torus.rotation.x = t * 0.8;
        torus.rotation.y = t * 1.1;
      }
    });
    atelierGroup.add(torus);
    this.interactiveObjects.push(cubeFrame);
    group.add(atelierGroup);

    // Photography Lens / Camera Totem (攝影視角)
    const photoGroup = new THREE.Group();
    photoGroup.position.set(-5, 2.25, 4);
    photoGroup.userData = { id: "photography", name: "光影觀景台 (Photography Observation)", category: "interests" };

    const pedestalGeom = new THREE.CylinderGeometry(1.2, 1.4, 2, 8);
    const pedestal = new THREE.Mesh(pedestalGeom, this.materials.islandBase);
    pedestal.position.y = 1;
    pedestal.castShadow = true;
    photoGroup.add(pedestal);

    const lensGeom = new THREE.CylinderGeometry(0.9, 0.9, 1.6, 16);
    lensGeom.rotateX(Math.PI / 2);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4
    });
    const lens = new THREE.Mesh(lensGeom, lensMat);
    lens.position.y = 2.4;
    lens.castShadow = true;
    photoGroup.add(lens);
    this.interactiveObjects.push(pedestal);
    group.add(photoGroup);

    // AI & Cybersecurity Shield / Polyhedron (AI研究與資安防禦)
    const aiGroup = new THREE.Group();
    aiGroup.position.set(1, 2.25, 6.5);
    aiGroup.userData = { id: "ai-research", name: "AI 核心與資安防禦陣列", category: "interests" };

    const aiCoreGeom = new THREE.IcosahedronGeometry(1.3, 0);
    const aiCoreMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.9,
      flatShading: true,
      roughness: 0.2
    });
    const aiCore = new THREE.Mesh(aiCoreGeom, aiCoreMat);
    aiCore.position.y = 2.2;
    this.animatedObjects.push({
      mesh: aiCore,
      update: (t) => {
        aiCore.rotation.x = t * 0.7;
        aiCore.rotation.y = t * 0.9;
        aiCore.position.y = 2.2 + Math.sin(t * 1.5) * 0.25;
      }
    });
    aiGroup.add(aiCore);

    // Wireframe Shield dome around it (Cybersecurity)
    const shieldGeom = new THREE.SphereGeometry(2.3, 12, 12);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const shield = new THREE.Mesh(shieldGeom, shieldMat);
    shield.position.y = 2.2;
    this.animatedObjects.push({
      mesh: shield,
      update: (t) => { shield.rotation.y = -t * 0.3; }
    });
    aiGroup.add(shield);
    this.interactiveObjects.push(aiCore);
    group.add(aiGroup);

    // Low-poly Pine / Zen Trees
    this.createLowPolyTree(group, -7, 2.25, -2, this.materials.foliageGreen);
    this.createLowPolyTree(group, -6, 2.25, -6, this.materials.foliageGreen);
    this.createLowPolyTree(group, 7, 2.25, -4, this.materials.sakuraPink); // Sakura tree

    // Island Float Animation
    this.animatedObjects.push({
      mesh: group,
      initY: group.position.y,
      update: (t) => {
        group.position.y = group.userData.initY + Math.sin(t * 0.7 + 1.5) * 0.35;
      }
    });
    group.userData.initY = 0.5;

    return group;
  }

  // 3. Beacon Island Construction (Social links)
  buildBeaconIsland() {
    const { group, topMesh } = this.createHexIsland(9, 4, this.materials.islandBeaconTop);
    group.userData = { id: "beacon", name: "連結燈塔島 (Nexus Beacon)", category: "social" };
    topMesh.userData = group.userData;
    this.interactiveObjects.push(topMesh);

    // The Tower / Lighthouse (Main Beacon)
    const towerGeom = new THREE.CylinderGeometry(1.2, 2.8, 16, 6);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6,
      flatShading: true
    });
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.y = 8 + 2;
    tower.castShadow = true;
    tower.receiveShadow = true;
    tower.userData = { id: "beacon-tower", name: "天線燈塔 (Nexus Beacon)", category: "social" };
    this.interactiveObjects.push(tower);
    group.add(tower);

    // Glowing Light Orb on Top of Lighthouse
    const lightOrbGeom = new THREE.SphereGeometry(1.3, 16, 16);
    const lightOrb = new THREE.Mesh(lightOrbGeom, this.materials.beaconGold);
    lightOrb.position.y = 16.5 + 2;
    group.add(lightOrb);

    // Vertical Light Beam shooting to sky
    const beamGeom = new THREE.CylinderGeometry(0.4, 2.5, 35, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.position.y = 34;
    group.add(beam);

    // Orbiting Hologram Rings (Social Orbs)
    const socialOrbs = [
      { id: "github", color: 0xe2e8f0, name: "GitHub 專區" },
      { id: "facebook", color: 0x1877f2, name: "Facebook 連結" },
      { id: "instagram", color: 0xe1306c, name: "Instagram 連結" },
      { id: "linkedin", color: 0x0a66c2, name: "LinkedIn 連結" }
    ];

    socialOrbs.forEach((soc, idx) => {
      const orbGeom = new THREE.SphereGeometry(0.7, 12, 12);
      const orbMat = new THREE.MeshStandardMaterial({
        color: soc.color,
        emissive: soc.color,
        emissiveIntensity: 0.7,
        roughness: 0.2
      });
      const orb = new THREE.Mesh(orbGeom, orbMat);
      orb.userData = { id: soc.id, name: soc.name, category: "social" };
      this.interactiveObjects.push(orb);

      const radius = 5.5;
      this.animatedObjects.push({
        mesh: orb,
        update: (t) => {
          const angle = t * 0.8 + (idx * (Math.PI / 2));
          orb.position.x = Math.cos(angle) * radius;
          orb.position.z = Math.sin(angle) * radius;
          orb.position.y = 12 + Math.sin(t * 2 + idx) * 0.8;
        }
      });
      group.add(orb);
    });

    // Island Float Animation
    this.animatedObjects.push({
      mesh: group,
      initY: group.position.y,
      update: (t) => {
        group.position.y = group.userData.initY + Math.sin(t * 0.6 + 3.0) * 0.3;
      }
    });
    group.userData.initY = 2.5;

    return group;
  }

  // Create a low-poly tree
  createLowPolyTree(parent, x, y, z, foliageMaterial) {
    const tree = new THREE.Group();
    tree.position.set(x, y, z);

    // Trunk
    const trunkGeom = new THREE.CylinderGeometry(0.2, 0.4, 2, 5);
    const trunk = new THREE.Mesh(trunkGeom, this.materials.zenWood);
    trunk.position.y = 1;
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage cones
    for (let i = 0; i < 3; i++) {
      const coneGeom = new THREE.ConeGeometry(1.8 - i * 0.4, 1.8, 5);
      const cone = new THREE.Mesh(coneGeom, foliageMaterial);
      cone.position.y = 2 + i * 1;
      cone.castShadow = true;
      tree.add(cone);
    }

    parent.add(tree);
  }

  // Create animated energy curves between islands
  createEnergyStream(startPos, endPos, colorHex, parent) {
    const midX = (startPos.x + endPos.x) / 2;
    const midZ = (startPos.z + endPos.z) / 2;
    const midY = Math.max(startPos.y, endPos.y) + 6; // Arc upwards

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(startPos.x, startPos.y + 2, startPos.z),
      new THREE.Vector3(midX, midY, midZ),
      new THREE.Vector3(endPos.x, endPos.y + 2, endPos.z)
    );

    const points = curve.getPoints(40);
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.5
    });
    const line = new THREE.Line(geom, mat);
    parent.add(line);

    // Traveling light pulse on the line
    const pulseGeom = new THREE.SphereGeometry(0.3, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const pulse = new THREE.Mesh(pulseGeom, pulseMat);
    parent.add(pulse);

    this.animatedObjects.push({
      mesh: pulse,
      update: (t) => {
        const u = (t * 0.35 + (colorHex % 10) * 0.1) % 1;
        const pos = curve.getPointAt(u);
        pulse.position.copy(pos);
      }
    });
  }

  // Floating low-poly clouds
  createClouds(parent) {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: 0.75,
      flatShading: true
    });

    for (let c = 0; c < 6; c++) {
      const cloud = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 3);
      for (let p = 0; p < numPuffs; p++) {
        const puffGeom = new THREE.DodecahedronGeometry(1.5 + Math.random() * 1.5);
        const puff = new THREE.Mesh(puffGeom, cloudMat);
        puff.position.set((p - numPuffs / 2) * 2, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 1.2);
        cloud.add(puff);
      }

      const angle = (c / 6) * Math.PI * 2;
      const dist = 32 + Math.random() * 8;
      cloud.position.set(Math.cos(angle) * dist, 12 + Math.random() * 8, Math.sin(angle) * dist);

      this.animatedObjects.push({
        mesh: cloud,
        initAngle: angle,
        dist: dist,
        speed: 0.04 + Math.random() * 0.03,
        update: (t) => {
          const curAngle = cloud.userData.initAngle + t * cloud.userData.speed;
          cloud.position.x = Math.cos(curAngle) * cloud.userData.dist;
          cloud.position.z = Math.sin(curAngle) * cloud.userData.dist;
        }
      });
      cloud.userData = { initAngle: angle, dist: dist, speed: 0.04 + Math.random() * 0.03 };

      parent.add(cloud);
    }
  }

  // Called in requestAnimationFrame loop
  update(timeSeconds) {
    for (const item of this.animatedObjects) {
      if (item.update) {
        item.update(timeSeconds);
      }
    }
  }
}
