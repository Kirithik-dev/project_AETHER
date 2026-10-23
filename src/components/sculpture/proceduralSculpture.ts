/**
 * Procedural generation of the 3D Particle & Filament Sculpture
 * Recreating the exact aesthetic of the reference artwork:
 * - Asymmetrical undulating S-curve totem
 * - Dense starlight particles with deep chiaroscuro folds
 * - Subtle violet and cyan spectral sparks
 * - Silky smooth moire filament contour loops and longitudinal streamlines
 * - Sweeping upper filament plume fanning into the dark void
 * - Lower organic cellular lattice graph with interconnected junction nodes
 */

import * as THREE from 'three';
import {
  particleVertexShader,
  particleFragmentShader,
  filamentVertexShader,
  filamentFragmentShader,
} from './shaders';

export interface SculptureMeshBundle {
  group: THREE.Group;
  particleMaterial: THREE.ShaderMaterial;
  filamentMaterial: THREE.ShaderMaterial;
  dispose: () => void;
  updateTime: (elapsed: number, mouse: { x: number; y: number }) => void;
}

// Pseudo-random deterministic generator with seed for reproducible sculpture
function createSeededRandom(seed = 42) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Evaluates the 3D center axis of the organic spine at a given height y [-4, 4]
 */
export function getSpinePoint(y: number): THREE.Vector3 {
  // Harmonic S-curve with asymmetric lateral offsets matching the reference silhouette
  const x =
    Math.sin(y * 0.72) * 0.44 +
    Math.sin(y * 1.45 + 0.38) * 0.24 -
    Math.cos(y * 0.28) * 0.14;
  const z =
    Math.cos(y * 0.62) * 0.3 +
    Math.sin(y * 1.15) * 0.16;
  return new THREE.Vector3(x, y, z);
}

/**
 * Returns the characteristic radial envelope at height y
 */
export function getRadiusAtY(y: number): number {
  if (y > 2.0) {
    // Top flare / plume
    const t = (y - 2.0) / 2.0;
    return 0.75 + t * 1.4;
  } else if (y > 0.4) {
    // Upper dense chest / core
    const t = (y - 0.4) / 1.6;
    return 0.95 + Math.sin(t * Math.PI) * 0.52;
  } else if (y > -0.7) {
    // Waist fold pinch with deep chiaroscuro hollow
    const t = (y + 0.7) / 1.1;
    return 0.38 + Math.sin(t * Math.PI) * 0.34;
  } else if (y > -2.2) {
    // Lower body swell
    const t = (y + 2.2) / 1.5;
    return 0.75 + Math.sin(t * Math.PI) * 0.44;
  } else {
    // Base root lattice
    const t = Math.max(0, (y + 3.8) / 1.6);
    return 0.8 + (1 - t) * 0.4;
  }
}

/**
 * Build the complete sculpture scene objects
 */
export function buildProceduralSculpture(isSoftwareGl: boolean): SculptureMeshBundle {
  const group = new THREE.Group();
  const rand = createSeededRandom(9876);

  // High-density counts for exquisite fidelity
  const particleCount = isSoftwareGl ? 22000 : 48000;
  const ribbonRings = isSoftwareGl ? 90 : 180;
  const pointsPerRing = isSoftwareGl ? 50 : 96; // High segment count for silky curves
  const longitudinalStreamlines = isSoftwareGl ? 32 : 64;
  const plumeStrands = isSoftwareGl ? 60 : 160;

  // ----------------------------------------------------
  // 1. PINPOINT STARLIGHT PARTICLES
  // ----------------------------------------------------
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  const particleColors = new Float32Array(particleCount * 3);
  const particleAlphas = new Float32Array(particleCount);
  const particleSeeds = new Float32Array(particleCount);
  const particleLayers = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const u = rand();
    let y: number;
    if (u < 0.52) {
      // Upper dense starlight core
      y = 0.35 + rand() * 1.85;
    } else if (u < 0.78) {
      // Mid waist & lower column
      y = -1.9 + rand() * 2.25;
    } else if (u < 0.90) {
      // Top plume
      y = 2.1 + rand() * 1.8;
    } else {
      // Base network
      y = -3.7 + rand() * 1.7;
    }

    const spine = getSpinePoint(y);
    const maxR = getRadiusAtY(y);

    // Distribution concentrated near the inner body
    const rDist = Math.pow(rand(), 1.5) * maxR;
    const theta = rand() * Math.PI * 2;

    const harm =
      Math.sin(theta * 3 + y * 2.2) * 0.22 +
      Math.cos(theta * 5 - y * 1.6) * 0.12;
    const effR = rDist * (1.0 + harm);

    const px = spine.x + Math.cos(theta) * effR;
    const py = y + (rand() - 0.5) * 0.06;
    const pz = spine.z + Math.sin(theta) * effR * 0.85;

    particlePositions[i * 3 + 0] = px;
    particlePositions[i * 3 + 1] = py;
    particlePositions[i * 3 + 2] = pz;

    particleSeeds[i] = rand();

    const isBrightSpark = rand() < 0.22 && y > 0.3 && y < 2.1;
    const isSpectralPoint = rand() < 0.15 && y > -0.8 && y < 1.4;

    if (isBrightSpark) {
      // Bright starlight nodal points
      particleSizes[i] = 1.4 + rand() * 1.1;
      particleAlphas[i] = 0.6 + rand() * 0.3;
      particleColors[i * 3 + 0] = 1.0;
      particleColors[i * 3 + 1] = 1.0;
      particleColors[i * 3 + 2] = 1.0;
      particleLayers[i] = 2.0;
    } else if (isSpectralPoint) {
      // Spectral violet and cyan points
      particleSizes[i] = 1.2 + rand() * 0.9;
      particleAlphas[i] = 0.45 + rand() * 0.25;
      const isCyan = rand() < 0.5;
      if (isCyan) {
        particleColors[i * 3 + 0] = 0.45;
        particleColors[i * 3 + 1] = 0.84;
        particleColors[i * 3 + 2] = 0.98;
      } else {
        particleColors[i * 3 + 0] = 0.72;
        particleColors[i * 3 + 1] = 0.58;
        particleColors[i * 3 + 2] = 0.96;
      }
      particleLayers[i] = 0.0;
    } else {
      // Silver-white starlight dust
      const b = 0.75 + rand() * 0.25;
      particleSizes[i] = 0.65 + rand() * 0.75;
      particleAlphas[i] = 0.18 + rand() * 0.3;
      particleColors[i * 3 + 0] = b;
      particleColors[i * 3 + 1] = b * 0.98;
      particleColors[i * 3 + 2] = b * 1.02;
      particleLayers[i] = 1.0;
    }
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1));
  particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(particleColors, 3));
  particleGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(particleAlphas, 1));
  particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(particleSeeds, 1));
  particleGeometry.setAttribute('aLayer', new THREE.BufferAttribute(particleLayers, 1));

  const particleMaterial = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2) },
      uPointSizeMultiplier: { value: 1.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particleMesh);

  // ----------------------------------------------------
  // 2. FLOWING FILAMENTS (CONTOUR RINGS & STREAMLINES)
  // ----------------------------------------------------
  const filamentLinePositions: number[] = [];
  const filamentLineAlphas: number[] = [];
  const filamentLineColors: number[] = [];

  // 2a. Silky Smooth Contour Rings
  for (let r = 0; r < ribbonRings; r++) {
    const yNorm = r / (ribbonRings - 1);
    const y = -3.7 + yNorm * 7.4;
    const spine = getSpinePoint(y);
    const baseR = getRadiusAtY(y);

    const twistAngle = y * 0.78 + Math.sin(y * 1.15) * 0.36;
    const ringRadius = baseR * (0.88 + Math.sin(y * 3.3) * 0.1);

    for (let p = 0; p < pointsPerRing; p++) {
      const theta1 = (p / pointsPerRing) * Math.PI * 2;
      const theta2 = ((p + 1) / pointsPerRing) * Math.PI * 2;

      // Surface perturbations for moire wave generation
      const w1 = 1.0 + Math.sin(theta1 * 3.0 + twistAngle) * 0.2 + Math.cos(theta1 * 6.0 - y * 1.2) * 0.08;
      const w2 = 1.0 + Math.sin(theta2 * 3.0 + twistAngle) * 0.2 + Math.cos(theta2 * 6.0 - y * 1.2) * 0.08;

      const x1 = spine.x + Math.cos(theta1 + twistAngle) * ringRadius * w1;
      const z1 = spine.z + Math.sin(theta1 + twistAngle) * ringRadius * w1 * 0.86;

      const x2 = spine.x + Math.cos(theta2 + twistAngle) * ringRadius * w2;
      const z2 = spine.z + Math.sin(theta2 + twistAngle) * ringRadius * w2 * 0.86;

      filamentLinePositions.push(x1, y, z1, x2, y, z2);

      const ringAlpha = 0.14 + Math.abs(Math.sin(theta1 * 2 + y * 1.4)) * 0.22;
      filamentLineAlphas.push(ringAlpha, ringAlpha);

      // Silver tone
      filamentLineColors.push(0.85, 0.9, 0.96, 0.85, 0.9, 0.96);
    }
  }

  // 2b. Longitudinal Flowing Streamlines
  for (let s = 0; s < longitudinalStreamlines; s++) {
    const thetaBase = (s / longitudinalStreamlines) * Math.PI * 2;
    const numVertSteps = isSoftwareGl ? 35 : 75;

    let prevPos: THREE.Vector3 | null = null;
    for (let v = 0; v <= numVertSteps; v++) {
      const yNorm = v / numVertSteps;
      const y = -3.7 + yNorm * 7.4;
      const spine = getSpinePoint(y);
      const baseR = getRadiusAtY(y);

      const twistAngle = y * 0.78 + Math.sin(y * 1.15) * 0.36;
      const currentTheta = thetaBase + twistAngle * 0.5;

      const w = 1.0 + Math.sin(currentTheta * 3.0 + twistAngle) * 0.18;
      const curX = spine.x + Math.cos(currentTheta) * baseR * w;
      const curZ = spine.z + Math.sin(currentTheta) * baseR * w * 0.86;
      const curPos = new THREE.Vector3(curX, y, curZ);

      if (prevPos) {
        filamentLinePositions.push(
          prevPos.x, prevPos.y, prevPos.z,
          curPos.x, curPos.y, curPos.z
        );
        const streamAlpha = 0.11 + Math.sin(yNorm * Math.PI) * 0.15;
        filamentLineAlphas.push(streamAlpha, streamAlpha);
        filamentLineColors.push(0.82, 0.88, 0.94, 0.82, 0.88, 0.94);
      }
      prevPos = curPos;
    }
  }

  // ----------------------------------------------------
  // 3. UPPER RADIATING FILAMENT PLUME (TOP RIGHT FAN)
  // ----------------------------------------------------
  for (let strand = 0; strand < plumeStrands; strand++) {
    const strandT = strand / plumeStrands;
    const startY = 1.5 + strandT * 1.4;
    const spineStart = getSpinePoint(startY);

    const segments = isSoftwareGl ? 14 : 26;
    let prevPoint = new THREE.Vector3(
      spineStart.x + (rand() - 0.5) * 0.25,
      startY,
      spineStart.z + (rand() - 0.5) * 0.25
    );

    const plumeAngle = strandT * Math.PI * 1.35 - 0.2;
    const strandLength = 1.3 + rand() * 2.2;
    const archFactor = 0.45 + rand() * 0.7;

    for (let seg = 1; seg <= segments; seg++) {
      const st = seg / segments;
      const curY = startY + st * strandLength * 0.88;
      const curX = prevPoint.x + Math.cos(plumeAngle) * st * archFactor * 0.24 + st * 0.07;
      const curZ = prevPoint.z + Math.sin(plumeAngle) * st * archFactor * 0.17;

      const curPoint = new THREE.Vector3(curX, curY, curZ);

      filamentLinePositions.push(
        prevPoint.x, prevPoint.y, prevPoint.z,
        curPoint.x, curPoint.y, curPoint.z
      );

      const strandAlpha = (1 - st * 0.85) * (0.15 + rand() * 0.28);
      filamentLineAlphas.push(strandAlpha, strandAlpha);
      filamentLineColors.push(0.9, 0.94, 0.98, 0.9, 0.94, 0.98);

      prevPoint = curPoint;
    }
  }

  // ----------------------------------------------------
  // 4. LOWER DELAUNAY CELLULAR ROOT WEB
  // ----------------------------------------------------
  const baseNodes: THREE.Vector3[] = [];
  const baseNodeCount = isSoftwareGl ? 45 : 95;

  for (let b = 0; b < baseNodeCount; b++) {
    const by = -3.7 + rand() * 1.7;
    const bSpine = getSpinePoint(by);
    const bR = getRadiusAtY(by) * (0.2 + rand() * 0.95);
    const bTheta = rand() * Math.PI * 2;

    baseNodes.push(
      new THREE.Vector3(
        bSpine.x + Math.cos(bTheta) * bR,
        by + (rand() - 0.5) * 0.18,
        bSpine.z + Math.sin(bTheta) * bR
      )
    );
  }

  // Connect close neighbors
  for (let i = 0; i < baseNodes.length; i++) {
    const p1 = baseNodes[i];
    let connections = 0;

    for (let j = i + 1; j < baseNodes.length; j++) {
      const p2 = baseNodes[j];
      const dist = p1.distanceTo(p2);

      if (dist < 0.6 && connections < 4) {
        filamentLinePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        const netAlpha = 0.26 * (1 - dist / 0.6);
        filamentLineAlphas.push(netAlpha, netAlpha);
        filamentLineColors.push(0.72, 0.78, 0.84, 0.72, 0.78, 0.84);
        connections++;
      }
    }
  }

  const filamentGeometry = new THREE.BufferGeometry();
  filamentGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(filamentLinePositions), 3)
  );
  filamentGeometry.setAttribute(
    'aAlpha',
    new THREE.BufferAttribute(new Float32Array(filamentLineAlphas), 1)
  );
  filamentGeometry.setAttribute(
    'aColor',
    new THREE.BufferAttribute(new Float32Array(filamentLineColors), 3)
  );

  const filamentMaterial = new THREE.ShaderMaterial({
    vertexShader: filamentVertexShader,
    fragmentShader: filamentFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const filamentMesh = new THREE.LineSegments(filamentGeometry, filamentMaterial);
  group.add(filamentMesh);

  group.position.set(0, 0, 0);

  return {
    group,
    particleMaterial,
    filamentMaterial,
    dispose: () => {
      particleGeometry.dispose();
      particleMaterial.dispose();
      filamentGeometry.dispose();
      filamentMaterial.dispose();
    },
    updateTime: (elapsed: number, mouse: { x: number; y: number }) => {
      particleMaterial.uniforms.uTime.value = elapsed;
      particleMaterial.uniforms.uMouse.value.set(mouse.x, mouse.y);
      filamentMaterial.uniforms.uTime.value = elapsed;
      filamentMaterial.uniforms.uMouse.value.set(mouse.x, mouse.y);
    },
  };
}
