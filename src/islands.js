import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Exact Palette from HEART policy island
export const C = {
  coral: 0xdb6a41,
  coralDark: 0xa34e34,
  coralSoft: 0xf4ece4,
  ink: 0x211d1d,
  cream: 0xfff8f4,
  yellow: 0xfcea8b,
  stone: 0xc5b5a7,
  stoneDark: 0x9e8e81,
  green: 0x71806a,
  leafLight: 0xa3bf86,
  leafMid: 0x86a56c,
  leafDark: 0x728f5f,
  sakura: 0xf8a5c2,
  wood: 0xb48560,
  woodDark: 0x8a6a4e,
  glowCyan: 0xa8c4c2,
  glowAmber: 0xfff0c2,
  waterShallow: 0xb9d9d6,
  waterDeep: 0x7faab8,
  
  // Specific Island Ground & Ring Tones
  devLawn: 0xb9cd98,
  devWalkway: 0xdcb79a, // Terracotta brick
  zenLawn: 0xbccf9c,
  zenWalkway: 0xd9cbb4, // Granite
  beaconSand: 0xdcd0bd,
  beaconWalkway: 0xc9a27c, // Boardwalk
  
  shirtBlue: 0x58a6a6,
  shirtOrange: 0xe87a47,
  shirtYellow: 0xe8c547,
  skin: 0xf1c7a3,
  hair: 0x3b2f2a
};

// Pointy-top hex vertex helper (exact heart-island math)
export function hexVertex(cx, cz, r, k) {
  const a = Math.PI / 2 + (k * Math.PI) / 3;
  return [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
}

// Generate exact 2D hexagon shape
function createHexShape(r) {
  const shape = new THREE.Shape();
  for (let k = 0; k < 6; k++) {
    const [x, z] = hexVertex(0, 0, r, k);
    if (k === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  }
  shape.closePath();
  return shape;
}

// Generate exact 2D hexagon ring path (between rOut and rIn)
function createHexRingGeometry(rOut, rIn) {
  const shape = createHexShape(rOut);
  const hole = new THREE.Path();
  for (let k = 0; k < 6; k++) {
    const [x, z] = hexVertex(0, 0, rIn, k);
    if (k === 0) hole.moveTo(x, -z);
    else hole.lineTo(x, -z);
  }
  hole.closePath();
  shape.holes.push(hole);

  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export class IslandBuilder {
  constructor(scene) {
    this.scene = scene;
    this.interactiveObjects = [];
    this.animatedObjects = [];
    this.initGeometries();
    this.initMaterials();
  }

  initGeometries() {
    this.geo = {
      box: new THREE.BoxGeometry(1, 1, 1),
      rbox: new RoundedBoxGeometry(1, 1, 1, 2, 0.08),
      cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
      cone: new THREE.ConeGeometry(0.5, 1, 8),
      sphere: new THREE.SphereGeometry(0.5, 12, 10),
      dome: new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      torus: new THREE.TorusGeometry(0.5, 0.06, 6, 20),
      hip: new THREE.ConeGeometry(0.5, 1, 4).rotateY(Math.PI / 4).scale(Math.SQRT2, 1, Math.SQRT2)
    };

    // Organic foliage geometry
    const leafGeo = new THREE.IcosahedronGeometry(0.5, 1);
    const pos = leafGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = Math.sin(v.x * 12.9 + v.y * 78.2 + v.z * 37.7) * 43758.5;
      const j = 1 + ((n - Math.floor(n)) - 0.5) * 0.18;
      v.multiplyScalar(j);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    leafGeo.computeVertexNormals();
    this.geo.leaf = leafGeo;
  }

  initMaterials() {
    this.mats = {
      solid: new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0.05, flatShading: true }),
      glass: new THREE.MeshStandardMaterial({ color: 0x9bc2c0, roughness: 0.15, transparent: true, opacity: 0.7 }),
      glow: new THREE.MeshBasicMaterial({ color: C.glowAmber }),
      glowCyan: new THREE.MeshBasicMaterial({ color: C.glowCyan })
    };
  }

  part(parent, geoKind, pos, scale, color, owner = null, rot = [0, 0, 0]) {
    const geo = this.geo[geoKind] || this.geo.box;
    const isGlow = geoKind === 'glow' || geoKind === 'glowCyan';
    const mat = isGlow ? (geoKind === 'glow' ? this.mats.glow : this.mats.glowCyan) : this.mats.solid.clone();

    if (!isGlow) mat.color.set(color);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    mesh.rotation.set(...rot);
    mesh.castShadow = !isGlow;
    mesh.receiveShadow = true;

    if (owner) {
      mesh.userData = owner;
      this.interactiveObjects.push(mesh);
    }

    parent.add(mesh);
    return mesh;
  }

  // Cute Lego/Nendoroid miniature person
  person(parent, x, y, z, shirtColor = C.shirtBlue, rotY = 0, isSitting = false) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    const legH = isSitting ? 0.12 : 0.22;
    for (const dx of [-0.04, 0.04]) {
      this.part(group, 'box', [dx, legH / 2, isSitting ? 0.06 : 0], [0.04, legH, 0.05], 0x3b3a42);
    }
    if (isSitting) {
      for (const dx of [-0.04, 0.04]) {
        this.part(group, 'box', [dx, legH, 0.06], [0.04, 0.04, 0.12], 0x3b3a42);
      }
    }

    const torsoY = legH + 0.16;
    this.part(group, 'rbox', [0, torsoY, 0], [0.15, 0.22, 0.1], shirtColor);
    const headY = torsoY + 0.18;
    this.part(group, 'sphere', [0, headY, 0], [0.14, 0.14, 0.14], C.skin);
    this.part(group, 'dome', [0, headY + 0.01, -0.01], [0.15, 0.14, 0.15], C.hair);

    parent.add(group);
    return group;
  }

  // Organic miniature tree
  tree(parent, x, y, z, scale = 1, isSakura = false) {
    const trunkH = 1.2 * scale;
    this.part(parent, 'cyl', [x, y + trunkH / 2, z], [0.14 * scale, trunkH, 0.14 * scale], C.wood);

    const leafPalette = isSakura
      ? [C.sakura, 0xf68dae, 0xffb7b2, 0xffd1dc]
      : [C.leafMid, C.leafDark, C.leafLight, C.green];

    const leafOffsets = [
      [0, trunkH + 0.5 * scale, 0, 0.95 * scale, leafPalette[0]],
      [-0.28 * scale, trunkH + 0.3 * scale, 0.14 * scale, 0.7 * scale, leafPalette[1]],
      [0.28 * scale, trunkH + 0.35 * scale, -0.14 * scale, 0.72 * scale, leafPalette[2]],
      [0.08 * scale, trunkH + 0.75 * scale, 0.08 * scale, 0.65 * scale, leafPalette[3]],
      [0.1 * scale, trunkH + 0.25 * scale, 0.28 * scale, 0.6 * scale, leafPalette[1]]
    ];

    leafOffsets.forEach(([dx, dy, dz, sz, col]) => {
      this.part(parent, 'leaf', [x + dx, y + dy, z + dz], [sz, sz * 0.9, sz], col);
    });
  }

  // =========================================================================
  // Authentic Hexagon Island Structure (Exactly matching heart-island)
  // =========================================================================
  createAuthenticHexIsland(radius = 7.5, topY = 1.2, { groundTone, walkwayTone, bandColor = C.coral }) {
    const group = new THREE.Group();
    const R = radius;
    const ringWidth = 0.95;
    const innerR = R - ringWidth;

    // 1. Center Ground Polygon (Lawn / Courtyard) - Exactly fits inner hex!
    const centerShape = createHexShape(innerR);
    const centerGeo = new THREE.ShapeGeometry(centerShape);
    centerGeo.rotateX(-Math.PI / 2);
    const centerMesh = new THREE.Mesh(centerGeo, new THREE.MeshStandardMaterial({
      color: groundTone,
      roughness: 0.85,
      flatShading: true
    }));
    centerMesh.position.y = topY;
    centerMesh.receiveShadow = true;
    group.add(centerMesh);

    // 2. Perimeter Walkway Hexagon Ring (Terracotta / Granite) - Exact parallel hex band!
    const ringGeo = createHexRingGeometry(R, innerR);
    const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({
      color: walkwayTone,
      roughness: 0.82,
      flatShading: true
    }));
    ringMesh.position.y = topY;
    ringMesh.receiveShadow = true;
    group.add(ringMesh);

    // 3. Exact Hexagon Vertical Skirt & Alternating Red/White Barrier Blocks on 6 Edges!
    // This is the signature detail in Image 2: alternating curb blocks along the exact 6 edges!
    const edgeBlocksGroup = new THREE.Group();
    edgeBlocksGroup.position.y = topY;

    for (let e = 0; e < 6; e++) {
      const [ax, az] = hexVertex(0, 0, R, e);
      const [bx, bz] = hexVertex(0, 0, R, (e + 1) % 6);
      const edgeLen = Math.hypot(bx - ax, bz - az);
      const edgeAngle = Math.atan2(bz - az, bx - ax);
      const midX = (ax + bx) / 2;
      const midZ = (az + bz) / 2;

      // Outer curb barrier with alternating coral & cream blocks
      const segCount = 6;
      for (let s = 0; s < segCount; s++) {
        const segT = (s + 0.5) / segCount;
        const sx = ax + (bx - ax) * segT;
        const sz = az + (bz - az) * segT;
        const isCoral = s % 2 === 0;

        const block = new THREE.Mesh(
          this.geo.box,
          new THREE.MeshStandardMaterial({
            color: isCoral ? bandColor : C.cream,
            roughness: 0.7,
            flatShading: true
          })
        );
        block.position.set(sx, 0.06, sz);
        block.scale.set(edgeLen / segCount * 0.98, 0.12, 0.12);
        block.rotation.y = -edgeAngle;
        block.castShadow = true;
        block.receiveShadow = true;
        edgeBlocksGroup.add(block);
      }

      // Perimeter slender light poles along the outer edge
      const poleX = ax;
      const poleZ = az;
      const pole = new THREE.Mesh(this.geo.cyl, this.mats.solid.clone());
      pole.material.color.set(C.ink);
      pole.position.set(poleX, 0.45, poleZ);
      pole.scale.set(0.035, 0.9, 0.035);
      edgeBlocksGroup.add(pole);

      // Tiny yellow lantern on corner poles
      const bulb = new THREE.Mesh(this.geo.sphere, this.mats.glow);
      bulb.position.set(poleX, 0.9, poleZ);
      bulb.scale.set(0.08, 0.08, 0.08);
      edgeBlocksGroup.add(bulb);
    }
    group.add(edgeBlocksGroup);

    // 4. Island Cliff Base (Smooth, clean vertical plinth descending into shallow water)
    const cliffShape = createHexShape(R);
    const extrudeSettings = {
      depth: 1.8,
      bevelEnabled: false
    };
    const cliffGeo = new THREE.ExtrudeGeometry(cliffShape, extrudeSettings);
    cliffGeo.rotateX(Math.PI / 2);
    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0xd9e5e3, // Clean shallow-water tinted stone (just like Image 2!)
      roughness: 0.7,
      flatShading: true
    });
    const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
    cliffMesh.position.y = topY;
    cliffMesh.receiveShadow = true;
    group.add(cliffMesh);

    // 5. Water-level Floating Step Terraces (Directly from Image 2!)
    this.createFloatingBoardwalks(group, R, topY);

    return { group, topMesh: centerMesh, topY, R };
  }

  // Floating boardwalks with stairs down to water level (The signature detail in Image 2!)
  createFloatingBoardwalks(parent, islandR, topY) {
    const terraces = [
      { edge: 1, offset: 0 },
      { edge: 3, offset: 0 },
      { edge: 5, offset: 0 }
    ];

    terraces.forEach(({ edge }) => {
      const [ax, az] = hexVertex(0, 0, islandR, edge);
      const [bx, bz] = hexVertex(0, 0, islandR, (edge + 1) % 6);
      const midX = (ax + bx) / 2;
      const midZ = (az + bz) / 2;
      const angle = Math.atan2(bz - az, bx - ax);
      const nx = midX / islandR;
      const nz = midZ / islandR;

      const platGroup = new THREE.Group();
      platGroup.position.set(midX + nx * 1.5, 0.05, midZ + nz * 1.5);
      platGroup.rotation.y = -angle;

      // Wooden floating platform at water level
      this.part(platGroup, 'rbox', [0, 0.08, 0], [4.2, 0.16, 1.2], 0x86a58c);
      // Terracotta running track / path on the platform
      this.part(platGroup, 'box', [0, 0.18, 0], [3.8, 0.04, 0.8], C.coral);

      // Stepped wooden stairs leading down from island top to the platform
      const stepCount = 5;
      for (let s = 0; s < stepCount; s++) {
        const sy = (s / stepCount) * topY;
        const sz = -0.5 - (s / stepCount) * 0.9;
        this.part(platGroup, 'box', [1.2, sy, sz], [0.8, 0.18, 0.3], C.wood);
      }

      parent.add(platGroup);
    });

    // Cattails & Water plants with tiny white waterbirds
    const plantGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const dist = islandR + 2.8 + (i % 2) * 0.6;
      const rx = Math.cos(a) * dist;
      const rz = Math.sin(a) * dist;

      // Thin reeds sticking out of water
      for (let r = 0; r < 3; r++) {
        this.part(plantGroup, 'cyl', [rx + (r - 1) * 0.1, 0.4, rz], [0.02, 0.8, 0.02], 0x7fa26d);
      }
      // Tiny white waterbird perched near reed
      if (i % 3 === 0) {
        this.part(plantGroup, 'sphere', [rx + 0.15, 0.25, rz], [0.1, 0.08, 0.12], 0xffffff);
        this.part(plantGroup, 'cone', [rx + 0.24, 0.27, rz], [0.03, 0.08, 0.03], C.coral, null, [0, 0, -Math.PI / 3]);
      }
    }
    parent.add(plantGroup);
  }

  // Build the complete archipelago
  buildWorld() {
    const world = new THREE.Group();

    // Natural clustered island centers
    this.posDev = new THREE.Vector3(-8.6, 0, 2.0);
    this.posZen = new THREE.Vector3(8.6, 0, 2.0);
    this.posBeacon = new THREE.Vector3(0, 0, -11.5);

    // 1. DEV ISLAND
    const devIsland = this.buildDevIsland();
    devIsland.position.copy(this.posDev);
    world.add(devIsland);

    // 2. ZEN ISLAND
    const zenIsland = this.buildZenIsland();
    zenIsland.position.copy(this.posZen);
    world.add(zenIsland);

    // 3. BEACON ISLAND
    const beaconIsland = this.buildBeaconIsland();
    beaconIsland.position.copy(this.posBeacon);
    world.add(beaconIsland);

    // Exact Connecting Bridges with yellow handrails (from Image 2!)
    this.buildBridge(world, this.posDev, this.posZen);
    this.buildBridge(world, this.posDev, this.posBeacon);
    this.buildBridge(world, this.posZen, this.posBeacon);

    // Clouds
    this.buildClouds(world);

    return world;
  }

  // =========================================================================
  // 01. DEV ISLAND (Software Hub, Sports Court, Bus, Workstation)
  // =========================================================================
  buildDevIsland() {
    const { group, topMesh, topY: Y } = this.createAuthenticHexIsland(7.5, 1.2, {
      groundTone: C.devLawn,
      walkwayTone: C.devWalkway,
      bandColor: C.coral
    });
    group.userData = { id: "dev", name: "01 開發核心島", category: "projects" };
    topMesh.userData = group.userData;
    this.interactiveObjects.push(topMesh);

    // --- Mini Sports Court / Activity Pitch (Directly from Image 2!) ---
    const courtOwner = { id: "unisnap", name: "UniSnap 軟體工坊", category: "projects" };
    // Green athletic turf
    this.part(group, 'rbox', [0, Y + 0.02, -1.8], [3.2, 0.04, 2.2], 0x5b8a68, courtOwner);
    // White field boundary lines & center circle
    this.part(group, 'box', [0, Y + 0.03, -1.8], [3.0, 0.01, 0.04], 0xffffff); // Center line
    this.part(group, 'torus', [0, Y + 0.03, -1.8], [0.45, 0.02, 0.45], 0xffffff, null, [Math.PI / 2, 0, 0]);
    // Spectator Bleacher bench behind court
    this.part(group, 'box', [0, Y + 0.25, -3.1], [2.8, 0.08, 0.35], C.wood);
    this.part(group, 'box', [0, Y + 0.45, -3.3], [2.8, 0.08, 0.25], C.wood);

    // Mini Soccer Goal Net
    this.part(group, 'torus', [-1.4, Y + 0.35, -1.8], [0.35, 0.03, 0.35], 0xffffff, null, [0, Math.PI / 2, 0]);

    // --- UniSnap macOS Studio (Hip Roof & Eaves) ---
    this.part(group, 'rbox', [-2.8, Y + 1.2, 1.4], [2.6, 2.2, 2.2], C.cream, courtOwner);
    this.part(group, 'hip', [-2.8, Y + 2.7, 1.4], [2.8, 0.8, 2.4], C.coral, courtOwner);
    this.part(group, 'box', [-2.8, Y + 2.3, 1.4], [2.9, 0.06, 2.5], C.coralDark);
    this.part(group, 'glow', [-2.8, Y + 1.4, 2.52], [0.8, 0.6, 0.04], C.glowAmber);
    this.part(group, 'box', [-3.6, Y + 0.7, 2.52], [0.5, 1.1, 0.04], C.ink);

    // --- Rust Tools Tower (windows-media-downloader) ---
    const rustOwner = { id: "windows-media-downloader", name: "Rust 工具研發樓", category: "projects" };
    this.part(group, 'rbox', [2.6, Y + 1.6, 1.2], [2.2, 3.2, 2.0], 0xcfa88a, rustOwner);
    this.part(group, 'hip', [2.6, Y + 3.6, 1.2], [2.4, 0.8, 2.2], 0x475569, rustOwner);
    for (let l = 0; l < 3; l++) {
      this.part(group, 'glowCyan', [2.6, Y + 0.8 + l * 0.8, 2.22], [1.1, 0.2, 0.04], C.glowCyan);
    }

    // --- Cute Yellow Mini Bus (From Image 2!) ---
    const busGroup = new THREE.Group();
    busGroup.position.set(-2.2, Y, -0.2);
    busGroup.rotation.y = 0.4;
    this.part(busGroup, 'rbox', [0, 0.3, 0], [1.4, 0.55, 0.7], C.yellow);
    this.part(busGroup, 'box', [0, 0.36, 0], [1.2, 0.22, 0.72], C.glowCyan); // Windows
    for (const [bx, bz] of [[-0.45, -0.36], [0.45, -0.36], [-0.45, 0.36], [0.45, 0.36]]) {
      this.part(busGroup, 'cyl', [bx, 0.1, bz], [0.18, 0.08, 0.18], C.ink, null, [Math.PI / 2, 0, 0]);
    }
    group.add(busGroup);

    // --- Bike Station with Orange Awning & Parked Bikes (From Image 2!) ---
    this.part(group, 'box', [-0.6, Y + 0.8, 1.2], [1.0, 0.04, 0.7], C.coral); // Orange awning
    this.part(group, 'cyl', [-1.0, Y + 0.4, 1.2], [0.03, 0.8, 0.03], C.ink);
    this.part(group, 'cyl', [-0.2, Y + 0.4, 1.2], [0.03, 0.8, 0.03], C.ink);
    // Parked Bicycle
    this.part(group, 'torus', [-0.8, Y + 0.2, 1.2], [0.18, 0.02, 0.18], C.ink, null, [Math.PI / 2, 0, 0]);
    this.part(group, 'torus', [-0.4, Y + 0.2, 1.2], [0.18, 0.02, 0.18], C.ink, null, [Math.PI / 2, 0, 0]);
    this.part(group, 'box', [-0.6, Y + 0.22, 1.2], [0.4, 0.03, 0.03], C.coral);

    // --- Developer Person & Outdoor Workstation ---
    this.part(group, 'rbox', [0.8, Y + 0.35, 1.4], [0.9, 0.05, 0.6], C.wood);
    this.part(group, 'rbox', [0.8, Y + 0.5, 1.3], [0.35, 0.22, 0.03], C.ink);
    this.part(group, 'glowCyan', [0.8, Y + 0.5, 1.31], [0.32, 0.18, 0.02], C.glowCyan);
    this.person(group, 0.8, Y, 1.7, C.shirtBlue, Math.PI, true);

    // --- Milestone Stone Monument (freeway query) ---
    const gisOwner = { id: "freeway-milestone-query", name: "國道里程樁座標所", category: "projects" };
    this.part(group, 'rbox', [2.8, Y + 0.15, -1.8], [1.0, 0.3, 1.0], C.stone, gisOwner);
    this.part(group, 'rbox', [2.8, Y + 0.65, -1.8], [0.6, 0.9, 0.6], C.cream, gisOwner);
    this.part(group, 'cone', [2.8, Y + 1.3, -1.8], [0.55, 0.4, 0.55], C.coral, gisOwner);

    // People walking / cycling on the island
    this.person(group, -1.2, Y, 2.6, C.shirtOrange, -Math.PI / 3);
    this.person(group, 2.0, Y, -2.8, C.shirtYellow, Math.PI / 4);

    // Trees & Planters
    this.tree(group, -3.2, Y, -2.6, 1.0);
    this.tree(group, 1.8, Y, 2.6, 0.85);
    this.tree(group, -3.8, Y, 0.2, 0.75);

    return group;
  }

  // =========================================================================
  // 02. ZEN & ATELIER ISLAND
  // =========================================================================
  buildZenIsland() {
    const { group, topMesh, topY: Y } = this.createAuthenticHexIsland(7.5, 1.2, {
      groundTone: C.zenLawn,
      walkwayTone: C.zenWalkway,
      bandColor: 0x5b7065
    });
    group.userData = { id: "zen", name: "02 藝境綠洲島", category: "interests" };
    topMesh.userData = group.userData;
    this.interactiveObjects.push(topMesh);

    // --- Traditional Tea Pavilion (靜水茶席亭) ---
    const teaOwner = { id: "tea-ceremony", name: "靜水茶席亭", category: "interests" };
    const teaGroup = new THREE.Group();
    teaGroup.position.set(-1.4, Y, -1.2);

    this.part(teaGroup, 'rbox', [0, 0.18, 0], [3.6, 0.28, 3.6], C.wood, teaOwner);
    this.part(teaGroup, 'box', [0, 0.34, 0], [2.9, 0.03, 2.9], 0xb5a87a); // Tatami

    for (const [px, pz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) {
      this.part(teaGroup, 'cyl', [px, 1.1, pz], [0.1, 1.9, 0.1], C.woodDark);
    }
    this.part(teaGroup, 'box', [0, 2.1, 0], [3.8, 0.08, 3.8], C.woodDark);
    this.part(teaGroup, 'hip', [0, 2.75, 0], [3.4, 1.1, 3.4], 0x3e4a52, teaOwner);

    // Low tea table, kettle, cups & kneeling characters
    this.part(teaGroup, 'rbox', [0, 0.44, 0], [0.9, 0.08, 0.55], C.woodDark);
    this.part(teaGroup, 'sphere', [0, 0.58, 0], [0.14, 0.14, 0.14], 0x27272a);
    this.person(teaGroup, -0.5, 0.32, 0, C.shirtOrange, Math.PI / 2, true);
    this.person(teaGroup, 0.5, 0.32, 0, C.shirtBlue, -Math.PI / 2, true);
    group.add(teaGroup);

    // Stone Lantern (Toro)
    this.part(group, 'cyl', [-3.2, Y + 0.3, 0.4], [0.16, 0.6, 0.16], C.stone);
    this.part(group, 'glow', [-3.2, Y + 0.7, 0.4], [0.3, 0.22, 0.3], C.glowAmber);
    this.part(group, 'hip', [-3.2, Y + 0.95, 0.4], [0.55, 0.3, 0.55], C.stoneDark);

    // --- Maker Atelier (3D Printing / Laser Engraving) ---
    const makerOwner = { id: "art-maker", name: "創客實體工坊", category: "interests" };
    this.part(group, 'rbox', [2.4, Y + 1.1, 1.2], [2.5, 2.2, 2.0], C.cream, makerOwner);
    this.part(group, 'hip', [2.4, Y + 2.5, 1.2], [2.7, 0.8, 2.2], C.coral, makerOwner);
    this.part(group, 'box', [2.4, Y + 1.3, 2.22], [1.0, 0.9, 0.04], C.glowCyan);

    // Outdoor Easel with painting
    const easelGroup = new THREE.Group();
    easelGroup.position.set(1.1, Y, 2.4);
    easelGroup.rotation.y = -0.3;
    this.part(easelGroup, 'cyl', [-0.18, 0.5, 0.08], [0.025, 1.1, 0.025], C.wood, null, [0, 0, 0.15]);
    this.part(easelGroup, 'cyl', [0.18, 0.5, 0.08], [0.025, 1.1, 0.025], C.wood, null, [0, 0, -0.15]);
    this.part(easelGroup, 'cyl', [0, 0.5, -0.15], [0.025, 1.1, 0.025], C.wood, null, [-0.25, 0, 0]);
    this.part(easelGroup, 'box', [0, 0.7, 0.05], [0.5, 0.4, 0.03], C.coral);
    this.person(easelGroup, 0.06, 0, 0.5, C.shirtYellow, Math.PI);
    group.add(easelGroup);

    // --- Photography Belvedere ---
    const photoOwner = { id: "photography", name: "光影觀景台", category: "interests" };
    this.part(group, 'cyl', [-0.4, Y + 0.1, 2.4], [1.6, 0.18, 1.6], C.wood, photoOwner);
    this.part(group, 'cyl', [-0.4, Y + 0.55, 2.4], [0.035, 0.8, 0.035], C.ink);
    this.part(group, 'cyl', [-0.4, Y + 0.95, 2.4], [0.1, 0.25, 0.1], 0x27272a, null, [Math.PI / 4, 0, 0]);
    this.person(group, -0.4, Y + 0.18, 2.05, C.shirtBlue, 0);

    // --- AI Research Core with Rotating Gyroscope Rings ---
    const aiOwner = { id: "ai-research", name: "AI 核心與資安防護", category: "interests" };
    this.part(group, 'cyl', [1.8, Y + 0.15, -1.8], [1.3, 0.3, 1.3], C.stone, aiOwner);
    const ring1 = this.part(group, 'torus', [1.8, Y + 0.8, -1.8], [0.8, 0.03, 0.8], C.coral);
    const ring2 = this.part(group, 'torus', [1.8, Y + 0.8, -1.8], [0.6, 0.03, 0.6], 0x6366f1);
    const aiCore = this.part(group, 'leaf', [1.8, Y + 0.8, -1.8], [0.45, 0.45, 0.45], 0x818cf8);
    this.animatedObjects.push({
      update: (t) => {
        ring1.rotation.x = t * 0.8;
        ring2.rotation.y = -t * 0.7;
        aiCore.rotation.y = t * 0.6;
      }
    });

    // Trees
    this.tree(group, -3.2, Y, -2.4, 1.25, true); // Gorgeous Sakura
    this.part(group, 'cyl', [-3.0, Y + 0.01, -2.2], [1.1, 0.01, 1.1], 0xffd1dc);
    this.tree(group, 3.2, Y, -1.2, 0.9);

    return group;
  }

  // =========================================================================
  // 03. BEACON ISLAND
  // =========================================================================
  buildBeaconIsland() {
    const { group, topMesh, topY: Y } = this.createAuthenticHexIsland(6.8, 1.2, {
      groundTone: C.beaconSand,
      walkwayTone: C.beaconWalkway,
      bandColor: 0x9a7a5a
    });
    group.userData = { id: "beacon", name: "03 連結燈塔島", category: "social" };
    topMesh.userData = group.userData;
    this.interactiveObjects.push(topMesh);

    const beaconOwner = { id: "beacon", name: "社交傳送燈塔", category: "social" };

    // Classical Stone Lighthouse
    this.part(group, 'cyl', [0, Y + 2.0, -0.2], [1.8, 4.0, 2.2], C.cream, beaconOwner);
    this.part(group, 'cyl', [0, Y + 4.8, -0.2], [1.4, 2.6, 1.7], 0xf7ede2, beaconOwner);
    this.part(group, 'cyl', [0, Y + 3.8, -0.2], [1.8, 0.35, 1.9], C.coral); // Red belt
    // Gallery & Lantern
    this.part(group, 'cyl', [0, Y + 6.3, -0.2], [1.7, 0.2, 1.7], C.coralDark);
    this.part(group, 'cyl', [0, Y + 6.9, -0.2], [1.0, 1.0, 1.0], C.glowAmber);
    this.part(group, 'glow', [0, Y + 6.9, -0.2], [0.7, 0.7, 0.7], C.glowAmber);
    this.part(group, 'dome', [0, Y + 7.5, -0.2], [1.1, 0.7, 1.1], 0x475569);

    // Rotating Searchlight Beam
    const spotlight = new THREE.SpotLight(0xfff5ea, 4.0, 40, Math.PI / 7, 0.35);
    spotlight.position.set(0, Y + 6.9, -0.2);
    const spotTarget = new THREE.Object3D();
    group.add(spotlight);
    group.add(spotTarget);
    spotlight.target = spotTarget;
    this.animatedObjects.push({
      update: (t) => {
        const rad = t * 0.75;
        spotTarget.position.set(Math.cos(rad) * 25, Y + 6.9, Math.sin(rad) * 25);
      }
    });

    // Keeper's Cottage
    this.part(group, 'rbox', [1.8, Y + 0.8, 1.0], [1.8, 1.6, 1.6], C.cream, beaconOwner);
    this.part(group, 'hip', [1.8, Y + 2.0, 1.0], [2.0, 0.7, 1.8], C.coral, beaconOwner);
    this.part(group, 'glow', [1.8, Y + 0.9, 1.82], [0.45, 0.4, 0.04], C.glowAmber);

    // Keeper Person
    this.person(group, 0.6, Y + 6.4, 0.3, C.shirtYellow, Math.PI / 4);

    // Pier with stairs down to water and moored rowboat
    const pierGroup = new THREE.Group();
    pierGroup.position.set(-2.2, Y - 0.2, 1.4);
    pierGroup.rotation.y = 0.5;
    this.part(pierGroup, 'box', [0, 0.1, 0], [1.8, 0.1, 0.75], C.wood);
    for (const [px, pz] of [[-0.7, -0.25], [-0.7, 0.25], [0.7, -0.25], [0.7, 0.25]]) {
      this.part(pierGroup, 'cyl', [px, -0.5, pz], [0.07, 1.2, 0.07], C.woodDark);
    }
    const boat = new THREE.Group();
    boat.position.set(1.1, -0.15, 0.3);
    this.part(boat, 'rbox', [0, 0.07, 0], [0.9, 0.2, 0.38], C.coralDark);
    this.part(boat, 'box', [0, 0.12, 0], [0.68, 0.12, 0.25], C.wood);
    this.animatedObjects.push({
      update: (t) => {
        boat.position.y = -0.15 + Math.sin(t * 1.5) * 0.03;
        boat.rotation.z = Math.sin(t * 1.2) * 0.04;
      }
    });
    pierGroup.add(boat);
    group.add(pierGroup);

    // Trees
    this.tree(group, -1.8, Y, -1.8, 0.8);
    this.tree(group, 2.0, Y, -1.6, 0.75);

    return group;
  }

  // Exact Wooden Plank Bridge with yellow handrails (from Image 2!)
  buildBridge(parent, p1, p2) {
    const bridgeGroup = new THREE.Group();
    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;
    const dist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);

    bridgeGroup.position.set(midX, 1.26, midZ);
    bridgeGroup.rotation.y = -angle;

    const deckLen = dist - 8.2;
    if (deckLen <= 0) return;

    // Dark grey / asphalt deck with yellow handrail (exactly as in Image 2!)
    this.part(bridgeGroup, 'rbox', [0, 0, 0], [deckLen, 0.1, 1.1], 0x475569);

    // Support pilings in water
    for (const sideX of [-deckLen * 0.35, deckLen * 0.35]) {
      for (const sideZ of [-0.42, 0.42]) {
        this.part(bridgeGroup, 'cyl', [sideX, -0.8, sideZ], [0.08, 1.6, 0.08], C.woodDark);
      }
    }

    // Yellow bright safety handrails (just like the yellow bridge in Image 2!)
    for (const side of [-0.48, 0.48]) {
      this.part(bridgeGroup, 'box', [0, 0.28, side], [deckLen, 0.05, 0.04], C.yellow);
      for (let i = -3; i <= 3; i++) {
        this.part(bridgeGroup, 'cyl', [(i / 3.5) * (deckLen * 0.42), 0.14, side], [0.025, 0.28, 0.025], C.ink);
      }
    }

    parent.add(bridgeGroup);
  }

  // Soft natural clouds
  buildClouds(parent) {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf7,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
      flatShading: true
    });

    for (let i = 0; i < 5; i++) {
      const cloud = new THREE.Group();
      for (let p = 0; p < 4; p++) {
        const puff = new THREE.Mesh(this.geo.leaf, cloudMat);
        puff.scale.set(1.8, 1.3, 1.6);
        puff.position.set((p - 1.5) * 1.5, (Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.5);
        cloud.add(puff);
      }

      const angle = (i / 5) * Math.PI * 2;
      const dist = 30 + Math.random() * 5;
      cloud.position.set(Math.cos(angle) * dist, 12 + Math.random() * 3, Math.sin(angle) * dist);

      this.animatedObjects.push({
        update: (t) => {
          const cur = angle + t * 0.025;
          cloud.position.x = Math.cos(cur) * dist;
          cloud.position.z = Math.sin(cur) * dist;
        }
      });

      parent.add(cloud);
    }
  }

  update(timeSeconds) {
    for (const obj of this.animatedObjects) {
      if (obj.update) obj.update(timeSeconds);
    }
  }
}
