/**
 * Cinematic Realistic Black Hole Background Component
 * Inspired by Gargantua with differential accretion disk rotation,
 * relativistic relativistic plasma streams, gravitational lensing glow,
 * and reflective glass stage floor.
 */

import React, { useEffect, useRef } from 'react';

interface BlackHoleBackgroundProps {
  reducedMotion?: boolean;
}

interface AccretionParticle {
  radius: number;
  angle: number;
  speed: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  wobbleSpeed: number;
  wobbleOffset: number;
}

export const BlackHoleBackground: React.FC<BlackHoleBackgroundProps> = ({ reducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current.targetX = normX * 12;
      mouseRef.current.targetY = normY * 12;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize relativistic accretion disk particles
    const particleCount = reducedMotion ? 40 : 180;
    const particles: AccretionParticle[] = [];

    // Colors matching the golden accretion disk
    const colors = [
      'rgba(255, 235, 180, ', // bright incandescent white-gold
      'rgba(255, 185, 70, ',  // fiery amber
      'rgba(240, 140, 30, ',  // deep plasma gold
      'rgba(255, 255, 255, ', // pure relativistic light
      'rgba(200, 110, 20, ',  // ember border
    ];

    for (let i = 0; i < particleCount; i++) {
      // Differential radius: from just outside event horizon to outer accretion boundary
      const normalizedDist = Math.random();
      // Concentrated closer to the inner photon sphere
      const radius = 130 + Math.pow(normalizedDist, 1.8) * 360;
      // Relativistic speed Keplerian decay (v ~ 1 / sqrt(r))
      const speed = (0.012 * Math.sqrt(200 / radius)) * (Math.random() * 0.4 + 0.8);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const baseAlpha = Math.random() * 0.55 + 0.25;

      particles.push({
        radius,
        angle: Math.random() * Math.PI * 2,
        speed,
        size: Math.random() * 1.8 + 0.6,
        alpha: baseAlpha,
        baseAlpha,
        color,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        wobbleOffset: Math.random() * Math.PI * 2,
      });
    }

    let isVisible = !document.hidden;
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible && !animFrameRef.current && !reducedMotion) {
        lastTime = performance.now();
        render();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let lastTime = performance.now();
    let globalTime = 0;

    const render = () => {
      if (!isVisible) {
        animFrameRef.current = null;
        return;
      }

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      globalTime += delta;

      // Mouse lerp for smooth parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Center of the black hole in viewport
      // Slightly lower-center to align with the background reference geometry
      const centerX = width * 0.52 + mouseRef.current.x;
      const centerY = height * 0.58 + mouseRef.current.y;

      // Draw faint relativistic jet / gravitational glow rays
      ctx.save();
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        90,
        centerX,
        centerY,
        Math.max(width, height) * 0.7
      );
      glowGrad.addColorStop(0, 'rgba(255, 200, 90, 0.09)');
      glowGrad.addColorStop(0.25, 'rgba(210, 130, 40, 0.04)');
      glowGrad.addColorStop(0.6, 'rgba(10, 20, 40, 0.02)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // Render differential plasma disk particles
      // Transform with tilt to match gravitational lensing ellipse (Interstellar orientation)
      const diskTilt = -0.38; // radians tilt
      const diskEccentricity = 0.44; // vertical flattening

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reducedMotion) {
          p.angle += p.speed;
        }

        // Elliptical relativistic orbit
        const cosAngle = Math.cos(p.angle);
        const sinAngle = Math.sin(p.angle);

        // Projected onto tilted plane
        const localX = cosAngle * p.radius;
        const localY = sinAngle * p.radius * diskEccentricity;

        // Rotate by tilt angle
        const rotatedX = localX * Math.cos(diskTilt) - localY * Math.sin(diskTilt);
        const rotatedY = localX * Math.sin(diskTilt) + localY * Math.cos(diskTilt);

        // Gravitational lensing warp: particles passing behind the horizon bend upward/downward
        let lensWarpY = 0;
        if (sinAngle < 0) {
          // Relativistic bending over the top crest
          lensWarpY = -Math.pow(Math.abs(sinAngle), 1.5) * (p.radius * 0.28);
        }

        const screenX = centerX + rotatedX;
        const screenY = centerY + rotatedY + lensWarpY;

        // Relativistic beaming / Doppler boost: approaching side (left) is brighter and shifted white
        const dopplerFactor = 1.0 + cosAngle * 0.35;
        const shimmer = Math.sin(globalTime * 3 + p.wobbleOffset) * 0.2;
        const finalAlpha = Math.max(0.05, Math.min(1, p.baseAlpha * dopplerFactor + shimmer));

        // Draw particle with subtle motion trail
        const trailLength = reducedMotion ? 1 : Math.max(2, p.speed * p.radius * 2.2);

        ctx.beginPath();
        ctx.fillStyle = `${p.color}${finalAlpha})`;
        ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Delicate tail
        if (!reducedMotion && trailLength > 2) {
          ctx.beginPath();
          ctx.strokeStyle = `${p.color}${finalAlpha * 0.5})`;
          ctx.lineWidth = p.size * 0.8;
          ctx.moveTo(screenX, screenY);
          const prevCos = Math.cos(p.angle - p.speed * 2.5);
          const prevSin = Math.sin(p.angle - p.speed * 2.5);
          const prevX = centerX + (prevCos * p.radius * Math.cos(diskTilt) - prevSin * p.radius * diskEccentricity * Math.sin(diskTilt));
          const prevY = centerY + (prevCos * p.radius * Math.sin(diskTilt) + prevSin * p.radius * diskEccentricity * Math.cos(diskTilt)) + lensWarpY;
          ctx.lineTo(prevX, prevY);
          ctx.stroke();
        }
      }

      if (!reducedMotion) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reducedMotion]);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none select-none -z-10 bg-[#030407]"
      aria-hidden="true"
    >
      {/* 1. Gargantua Realistic Black Hole Base Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-85 transition-opacity duration-1000 scale-[1.03]"
        style={{
          backgroundImage: `url('/assets/aistudio/image_2ee713b3.png')`,
          filter: 'contrast(1.15) brightness(0.95)',
        }}
      />

      {/* 2. Soft Deep Midnight Blue & Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020306] via-[#04060c]/40 to-[#020306]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020306_90%)]" />

      {/* 3. Dynamic Differential Relativistic Accretion Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-screen opacity-90"
      />

      {/* 4. Deep-Space Ambient Relativistic Aura */}
      <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/[0.04] blur-[140px]" />
      <div className="absolute top-[30%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-yellow-200/[0.03] blur-[100px]" />

      {/* 5. Reflective Glassmorphic Stage Floor (Reference Image 3 styling) */}
      <div className="absolute bottom-0 left-0 right-0 h-[380px] bg-gradient-to-t from-[#020307] via-[#050811]/70 to-transparent">
        {/* Subtle ground reflection streak of the accretion disk */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[180px] bg-gradient-to-r from-transparent via-amber-400/[0.035] to-transparent blur-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
};
