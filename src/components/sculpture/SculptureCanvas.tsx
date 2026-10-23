/**
 * Persistent Three.js Canvas component hosting the procedural 3D sculpture
 * Handles camera framing, cursor parallax, and smooth transitions
 * without ever tearing down or recreating the WebGL context.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildProceduralSculpture, SculptureMeshBundle } from './proceduralSculpture';
import { detectWebGLProfile } from '../../utils/webglCheck';

export type ScenePhase = 'login' | 'authenticated';

interface SculptureCanvasProps {
  phase: ScenePhase;
  reducedMotion?: boolean;
}

// Module-scope math caches to prevent Garbage Collection during render loop
const _targetSculpturePos = new THREE.Vector3();
const _targetCameraPos = new THREE.Vector3();
const _mouseNorm = new THREE.Vector2();
const _smoothMouse = new THREE.Vector2();

export const SculptureCanvas: React.FC<SculptureCanvasProps> = ({
  phase,
  reducedMotion = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const profile = detectWebGLProfile();
    const isSoftwareGl = profile.isSoftwareGl;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    // Subtle atmospheric scene fog
    scene.fog = new THREE.FogExp2(0x06080b, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
      depth: true,
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(profile.dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Append canvas to container
    const canvas = renderer.domElement;
    canvas.setAttribute('data-testid', 'sculpture-webgl-canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    // 2. Build Procedural Sculpture Bundle
    let bundle: SculptureMeshBundle | null = buildProceduralSculpture(isSoftwareGl);
    scene.add(bundle.group);

    // Background ambient lighting & soft directional accents
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xddeeff, 1.2);
    dirLight1.position.set(5, 8, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xaabbcc, 0.8);
    dirLight2.position.set(-6, -4, -3);
    scene.add(dirLight2);

    // 3. Pointer & Parallax tracking
    const onPointerMove = (e: MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      _mouseNorm.x = (e.clientX / width) * 2 - 1;
      _mouseNorm.y = -(e.clientY / height) * 2 + 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // 4. Resize listener
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 5. Software WebGL Guarded Render Loop
    let animationFrameId = 0;
    let timeoutId = 0;
    const clock = new THREE.Clock();
    let currentRotationSpeed = 0.08;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timeoutId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          timeoutId = window.setTimeout(cb, 60);
        }
      };
      timeoutId = window.setTimeout(poll, 6);
    }

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const curPhase = phaseRef.current;
      const isReduced = reducedMotionRef.current;

      // Mouse smoothing
      _smoothMouse.x = THREE.MathUtils.damp(_smoothMouse.x, _mouseNorm.x, 3.5, dt);
      _smoothMouse.y = THREE.MathUtils.damp(_smoothMouse.y, _mouseNorm.y, 3.5, dt);

      // Transition choreography based on Phase
      const isMobile = window.innerWidth < 1024;

      if (curPhase === 'login') {
        // Desktop: sculpture framed dramatically on the right flank
        // Mobile: centered and scaled back slightly
        _targetSculpturePos.set(isMobile ? 0 : 2.1, 0, 0);
        _targetCameraPos.set(0, 0, isMobile ? 8.4 : 7.4);
        currentRotationSpeed = THREE.MathUtils.damp(currentRotationSpeed, 0.08, 2.0, dt);
      } else {
        // Authenticated: Hero central moment
        _targetSculpturePos.set(0, 0, 0);
        _targetCameraPos.set(0, 0, 7.0);
        currentRotationSpeed = THREE.MathUtils.damp(currentRotationSpeed, 0.018, 1.5, dt);
      }

      if (bundle) {
        // Smoothly interpolate position
        bundle.group.position.lerp(_targetSculpturePos, THREE.MathUtils.clamp(dt * 2.8, 0, 1));

        // Smooth rotation
        if (!isReduced) {
          bundle.group.rotation.y += currentRotationSpeed * dt;
          // Subtle responsive tilt
          bundle.group.rotation.x = THREE.MathUtils.damp(
            bundle.group.rotation.x,
            _smoothMouse.y * 0.12,
            3.0,
            dt
          );
          bundle.group.rotation.z = THREE.MathUtils.damp(
            bundle.group.rotation.z,
            -_smoothMouse.x * 0.08,
            3.0,
            dt
          );
        }

        // Update shaders
        bundle.updateTime(elapsed, {
          x: isReduced ? 0 : _smoothMouse.x,
          y: isReduced ? 0 : _smoothMouse.y,
        });
      }

      // Smooth camera interpolation
      camera.position.lerp(_targetCameraPos, THREE.MathUtils.clamp(dt * 2.5, 0, 1));
      camera.lookAt(0, 0, 0);

      // Render
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    // Pre-warm shaders
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    } else {
      tick();
    }

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);

      if (bundle) {
        scene.remove(bundle.group);
        bundle.dispose();
        bundle = null;
      }

      renderer.dispose();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{
        background:
          'radial-gradient(ellipse at 15% 30%, rgba(130, 140, 155, 0.28) 0%, rgba(35, 42, 52, 0.18) 45%, rgba(6, 8, 11, 0.98) 75%, #040507 100%)',
      }}
      aria-hidden="true"
    />
  );
};
