import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { hexVertex, C } from './islands.js';

export class PeopleManager {
  constructor(scene) {
    this.scene = scene;
    this.walkers = [];
    this.initGeometries();
    this.initMaterials();
    this.createPedestrians();
  }

  initGeometries() {
    this.geo = {
      leg: new RoundedBoxGeometry(0.06, 0.22, 0.07, 2, 0.02),
      shoe: new RoundedBoxGeometry(0.07, 0.05, 0.11, 2, 0.02),
      body: new THREE.CapsuleGeometry(0.12, 0.16, 4, 10),
      arm: new RoundedBoxGeometry(0.05, 0.18, 0.05, 2, 0.02),
      hand: new THREE.SphereGeometry(0.035, 8, 6),
      head: new THREE.SphereGeometry(0.16, 14, 12),
      hairCap: new THREE.SphereGeometry(0.175, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
      eye: new THREE.SphereGeometry(0.018, 6, 6),
      shadow: new THREE.CircleGeometry(0.24, 16)
    };
    this.geo.shadow.rotateX(-Math.PI / 2);
  }

  initMaterials() {
    this.mats = {
      skin: new THREE.MeshStandardMaterial({ color: 0xf1c7a3, roughness: 0.75 }),
      hairDark: new THREE.MeshStandardMaterial({ color: 0x2e2522, roughness: 0.8 }),
      hairBrown: new THREE.MeshStandardMaterial({ color: 0x5a3d2b, roughness: 0.8 }),
      shoe: new THREE.MeshStandardMaterial({ color: 0x221c1c, roughness: 0.9 }),
      shadow: new THREE.MeshBasicMaterial({
        color: 0x1f1914,
        transparent: true,
        opacity: 0.25,
        depthWrite: false
      })
    };
  }

  // Build a cute Chibi pedestrian with articulated swinging limbs
  createChibiWalker(shirtColor, pantsColor, hairColor = this.mats.hairDark, accessory = null) {
    const root = new THREE.Group();

    // 1. Soft contact shadow on ground
    const shadow = new THREE.Mesh(this.geo.shadow, this.mats.shadow);
    shadow.position.y = 0.01;
    root.add(shadow);

    // 2. Character Model Group (will bob up and down while walking)
    const model = new THREE.Group();
    root.add(model);

    // Left Leg
    const legL = new THREE.Group();
    legL.position.set(-0.065, 0.22, 0);
    const legLMesh = new THREE.Mesh(this.geo.leg, new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 }));
    legLMesh.position.y = -0.11;
    legLMesh.castShadow = true;
    const shoeL = new THREE.Mesh(this.geo.shoe, this.mats.shoe);
    shoeL.position.set(0, -0.21, 0.02);
    legL.add(legLMesh, shoeL);
    model.add(legL);

    // Right Leg
    const legR = new THREE.Group();
    legR.position.set(0.065, 0.22, 0);
    const legRMesh = new THREE.Mesh(this.geo.leg, new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 }));
    legRMesh.position.y = -0.11;
    legRMesh.castShadow = true;
    const shoeR = new THREE.Mesh(this.geo.shoe, this.mats.shoe);
    shoeR.position.set(0, -0.21, 0.02);
    legR.add(legRMesh, shoeR);
    model.add(legR);

    // Torso / Body
    const bodyMesh = new THREE.Mesh(this.geo.body, new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 }));
    bodyMesh.position.y = 0.36;
    bodyMesh.castShadow = true;
    model.add(bodyMesh);

    // Left Arm
    const armL = new THREE.Group();
    armL.position.set(-0.16, 0.44, 0);
    const armLMesh = new THREE.Mesh(this.geo.arm, new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 }));
    armLMesh.position.y = -0.09;
    armLMesh.castShadow = true;
    const handL = new THREE.Mesh(this.geo.hand, this.mats.skin);
    handL.position.y = -0.18;
    armL.add(armLMesh, handL);
    model.add(armL);

    // Right Arm
    const armR = new THREE.Group();
    armR.position.set(0.16, 0.44, 0);
    const armRMesh = new THREE.Mesh(this.geo.arm, new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 }));
    armRMesh.position.y = -0.09;
    armRMesh.castShadow = true;
    const handR = new THREE.Mesh(this.geo.hand, this.mats.skin);
    handR.position.y = -0.18;
    armR.add(armRMesh, handR);
    model.add(armR);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.6, 0);
    const headMesh = new THREE.Mesh(this.geo.head, this.mats.skin);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Hair Shell
    const hair = new THREE.Mesh(this.geo.hairCap, hairColor);
    hair.rotation.x = -0.3;
    hair.position.set(0, 0.02, -0.01);
    hair.castShadow = true;
    headGroup.add(hair);

    // Cute Eyes & Blush
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1f1914 });
    const eyeL = new THREE.Mesh(this.geo.eye, eyeMat);
    eyeL.position.set(-0.05, 0.01, 0.155);
    const eyeR = new THREE.Mesh(this.geo.eye, eyeMat);
    eyeR.position.set(0.05, 0.01, 0.155);
    headGroup.add(eyeL, eyeR);

    // Blush cheeks
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf4a4a4 });
    const blushL = new THREE.Mesh(this.geo.eye, blushMat);
    blushL.scale.set(1.4, 0.7, 0.5);
    blushL.position.set(-0.08, -0.04, 0.14);
    const blushR = new THREE.Mesh(this.geo.eye, blushMat);
    blushR.scale.set(1.4, 0.7, 0.5);
    blushR.position.set(0.08, -0.04, 0.14);
    headGroup.add(blushL, blushR);

    // Accessory (e.g. backpack, headphones, laptop folder)
    if (accessory === 'backpack') {
      const bag = new THREE.Mesh(
        new RoundedBoxGeometry(0.18, 0.22, 0.1, 2, 0.03),
        new THREE.MeshStandardMaterial({ color: C.coralDark, roughness: 0.8 })
      );
      bag.position.set(0, 0.36, -0.12);
      bag.castShadow = true;
      model.add(bag);
    } else if (accessory === 'camera') {
      const cam = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 })
      );
      cam.position.set(0, 0.32, 0.13);
      model.add(cam);
    } else if (accessory === 'laptop') {
      const folder = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.1, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.6 })
      );
      folder.position.set(0.17, -0.08, 0.05);
      armR.add(folder);
    }

    model.add(headGroup);

    return {
      root,
      model,
      legL,
      legR,
      armL,
      armR,
      headGroup
    };
  }

  // Create cute cycling character on a bicycle
  createCyclist(shirtColor) {
    const root = new THREE.Group();

    // Bicycle frame
    const bike = new THREE.Group();
    // Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f1914, roughness: 0.8 });
    const wheelGeo = new THREE.TorusGeometry(0.18, 0.02, 6, 18);
    const wFront = new THREE.Mesh(wheelGeo, wheelMat);
    wFront.position.set(0, 0.18, 0.32);
    wFront.rotation.y = Math.PI / 2;
    const wBack = new THREE.Mesh(wheelGeo, wheelMat);
    wBack.position.set(0, 0.18, -0.32);
    wBack.rotation.y = Math.PI / 2;
    bike.add(wFront, wBack);

    // Frame tubes
    const frameMat = new THREE.MeshStandardMaterial({ color: C.yellow, roughness: 0.6 });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 6), frameMat);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(0, 0.22, 0);
    bike.add(bar);

    // Handlebars
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), new THREE.MeshStandardMaterial({ color: C.ink }));
    handle.position.set(0, 0.42, 0.28);
    bike.add(handle);

    root.add(bike);

    // Rider sitting on bicycle
    const rider = this.createChibiWalker(shirtColor, 0x3b3a42, this.mats.hairBrown, 'backpack');
    rider.model.position.set(0, 0.18, -0.08);
    rider.legL.rotation.x = 0.6;
    rider.legR.rotation.x = -0.6;
    rider.armL.rotation.x = -0.8;
    rider.armR.rotation.x = -0.8;
    root.add(rider.root);

    return { root, bike, wFront, wBack, rider, isBike: true };
  }

  createPedestrians() {
    const Y = 1.2; // Island surface level

    // 1. Dev Island Perimeter Walker (Tech enthusiast with backpack & laptop)
    const devPath = this.generateHexPath(-8.6, 2.0, 7.0, Y);
    const w1 = this.createChibiWalker(C.shirtBlue, 0x3b3a42, this.mats.hairDark, 'backpack');
    this.scene.add(w1.root);
    this.walkers.push({
      person: w1,
      path: devPath,
      progress: 0.1,
      speed: 0.022,
      swingSpeed: 8
    });

    // 2. Dev Island Second Walker (Casual commuter in orange shirt)
    const w2 = this.createChibiWalker(C.shirtOrange, 0x4a5a78, this.mats.hairBrown, 'laptop');
    this.scene.add(w2.root);
    this.walkers.push({
      person: w2,
      path: devPath,
      progress: 0.6,
      speed: 0.02,
      swingSpeed: 7.5
    });

    // 3. Zen Island Stroller (Tea lover strolling near the Sakura tree)
    const zenPath = this.generateHexPath(8.6, 2.0, 7.0, Y);
    const w3 = this.createChibiWalker(C.yellow, 0x4a3426, this.mats.hairBrown);
    this.scene.add(w3.root);
    this.walkers.push({
      person: w3,
      path: zenPath,
      progress: 0.35,
      speed: 0.018,
      swingSpeed: 6.5
    });

    // 4. Zen Island Photographer (Walking around with neck camera)
    const w4 = this.createChibiWalker(0x58a6a6, 0x3b3a42, this.mats.hairDark, 'camera');
    this.scene.add(w4.root);
    this.walkers.push({
      person: w4,
      path: zenPath,
      progress: 0.85,
      speed: 0.016,
      swingSpeed: 6.0
    });

    // 5. Cross-Island Bridge Walker (Walking across bridge from Dev Island to Zen Island and back!)
    const bridgePath = [
      new THREE.Vector3(-4.5, Y, 2.0),
      new THREE.Vector3(4.5, Y, 2.0),
      new THREE.Vector3(6.5, Y, 3.2),
      new THREE.Vector3(4.5, Y, 2.0),
      new THREE.Vector3(-4.5, Y, 2.0),
      new THREE.Vector3(-6.5, Y, 0.8)
    ];
    const w5 = this.createChibiWalker(C.coral, 0x2f3a4a, this.mats.hairDark, 'backpack');
    this.scene.add(w5.root);
    this.walkers.push({
      person: w5,
      path: bridgePath,
      progress: 0.25,
      speed: 0.024,
      swingSpeed: 8.5
    });

    // 6. Beacon Island Maritime Walker (Walking along the pier and lighthouse path)
    const beaconPath = [
      new THREE.Vector3(-2.8, Y, -10.1),
      new THREE.Vector3(-1.2, Y, -10.1),
      new THREE.Vector3(0, Y, -8.2),
      new THREE.Vector3(2.4, Y, -10.3),
      new THREE.Vector3(1.2, Y, -13.2),
      new THREE.Vector3(-1.8, Y, -13.2)
    ];
    const w6 = this.createChibiWalker(0xf2a1a1, 0x3b3a42, this.mats.hairBrown);
    this.scene.add(w6.root);
    this.walkers.push({
      person: w6,
      path: beaconPath,
      progress: 0.5,
      speed: 0.017,
      swingSpeed: 6.5
    });

    // 7. Cute Cyclist riding around the Zen Island walkway!
    const cyclist = this.createCyclist(C.shirtBlue);
    this.scene.add(cyclist.root);
    this.walkers.push({
      person: cyclist,
      path: zenPath,
      progress: 0.05,
      speed: 0.045, // Faster bicycle speed
      swingSpeed: 14,
      isBike: true
    });
  }

  // Generate a closed 6-way waypoint loop around a hex island perimeter
  generateHexPath(cx, cz, r, y) {
    const points = [];
    for (let k = 0; k < 6; k++) {
      const [x, z] = hexVertex(cx, cz, r, k);
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }

  // Called in requestAnimationFrame loop
  update(deltaSeconds) {
    const t = performance.now() * 0.001;

    for (const walker of this.walkers) {
      walker.progress = (walker.progress + deltaSeconds * walker.speed) % 1.0;

      // Calculate position along piecewise linear waypoints
      const path = walker.path;
      const count = path.length;
      const totalP = walker.progress * count;
      const index = Math.floor(totalP);
      const frac = totalP - index;

      const pCurrent = path[index % count];
      const pNext = path[(index + 1) % count];

      // Current position
      const curX = THREE.MathUtils.lerp(pCurrent.x, pNext.x, frac);
      const curZ = THREE.MathUtils.lerp(pCurrent.z, pNext.z, frac);
      const curY = THREE.MathUtils.lerp(pCurrent.y, pNext.y, frac);

      walker.person.root.position.set(curX, curY, curZ);

      // Facing orientation
      const dirX = pNext.x - pCurrent.x;
      const dirZ = pNext.z - pCurrent.z;
      const angle = Math.atan2(dirX, dirZ);
      walker.person.root.rotation.y = angle;

      // Limb swinging & Stepping bounce
      if (walker.isBike) {
        // Cycling wheel spin & leg pedaling
        walker.person.wFront.rotation.x += deltaSeconds * 12;
        walker.person.wBack.rotation.x += deltaSeconds * 12;
        const pedal = Math.sin(t * walker.swingSpeed);
        walker.person.rider.legL.rotation.x = 0.6 + pedal * 0.25;
        walker.person.rider.legR.rotation.x = -0.6 - pedal * 0.25;
      } else {
        // Natural walking swing
        const swing = Math.sin(t * walker.swingSpeed) * 0.55;
        walker.person.legL.rotation.x = swing;
        walker.person.legR.rotation.x = -swing;
        walker.person.armL.rotation.x = -swing * 0.8;
        walker.person.armR.rotation.x = swing * 0.8;

        // Bouncy walk cycle
        walker.person.model.position.y = Math.abs(Math.sin(t * walker.swingSpeed)) * 0.035;
        // Subtle shoulder / head waddle
        walker.person.model.rotation.z = Math.sin(t * walker.swingSpeed) * 0.04;
      }
    }
  }
}
