/**
 * GLSL Shaders for the Procedural Particle and Filament Sculpture
 * Tuned with precision for razor-sharp pinpoint starlight, delicate moire linework,
 * chiaroscuro depth, and ethereal spectral dispersion matching the reference image.
 */

export const particleVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPointSizeMultiplier;
  uniform vec2 uMouse;

  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;
  attribute float aSeed;
  attribute float aLayer; // 0 = spectral cavity, 1 = starlight dust, 2 = bright nodal spark

  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  varying float vLayer;

  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vLayer = aLayer;

    vec3 pos = position;

    // Organic multi-harmonic spine wave deformation
    float wave1 = sin(pos.y * 1.6 - uTime * 0.55 + aSeed * 6.28) * 0.05;
    float wave2 = cos(pos.y * 2.8 + uTime * 0.7 + aSeed * 3.14) * 0.03;
    float twist = sin(uTime * 0.18 + pos.y * 0.45) * 0.08;

    // Apply harmonic twist
    float cosT = cos(twist);
    float sinT = sin(twist);
    float nx = pos.x * cosT - pos.z * sinT;
    float nz = pos.x * sinT + pos.z * cosT;
    pos.x = nx + wave1;
    pos.z = nz + wave2;

    // Gentle cursor response
    float mouseInfluence = smoothstep(4.5, 0.0, length(pos.xy - vec2(uMouse.x * 2.0, uMouse.y * 3.0)));
    pos.x += uMouse.x * 0.12 * mouseInfluence;
    pos.y += uMouse.y * 0.09 * mouseInfluence;
    pos.z += (uMouse.x * 0.08) * mouseInfluence;

    // Micro breathing oscillation
    float breathe = 1.0 + sin(uTime * 0.9 + aSeed * 6.28) * 0.02;
    pos.x *= breathe;
    pos.z *= breathe;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Depth attenuation tuned for razor-sharp pinpoint stars
    vDepth = -mvPosition.z;
    float depthFactor = 22.0 / max(0.5, -mvPosition.z);
    
    // Per-particle sizing: calibrated between 1.0px and 7.0px maximum
    gl_PointSize = aSize * uPixelRatio * uPointSizeMultiplier * depthFactor;
    gl_PointSize = clamp(gl_PointSize, 1.0, 9.0);
  }
`;

export const particleFragmentShader = `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  varying float vLayer;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
      discard;
    }

    // Crisp pinpoint starlight profile
    float core = smoothstep(0.25, 0.0, dist);
    float halo = exp(-dist * 9.0);
    float intensity = core * 0.85 + halo * 0.4;

    // Depth fade
    float depthFade = smoothstep(16.0, 4.0, vDepth);
    float finalAlpha = vAlpha * intensity * depthFade;

    if (finalAlpha < 0.015) {
      discard;
    }

    vec3 col = vColor * (0.85 + core * 0.45);
    gl_FragColor = vec4(col, finalAlpha);
  }
`;

export const filamentVertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;

  attribute float aAlpha;
  attribute vec3 aColor;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vY;

  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    vY = position.y;

    vec3 pos = position;

    // Harmonic wave travel along vertical axis
    float wave = sin(pos.y * 1.9 - uTime * 0.6) * 0.038;
    float waveCross = cos(pos.y * 1.2 + uTime * 0.4) * 0.028;

    pos.x += wave;
    pos.z += waveCross;

    // Subtle pointer bending
    float mDist = length(pos.xy - vec2(uMouse.x * 2.0, uMouse.y * 3.0));
    float mPush = smoothstep(3.5, 0.0, mDist);
    pos.x += uMouse.x * 0.08 * mPush;
    pos.y += uMouse.y * 0.06 * mPush;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const filamentFragmentShader = `
  precision highp float;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vY;

  void main() {
    // Subtle height attenuation for chiaroscuro balance
    float heightFade = smoothstep(-4.2, -2.8, vY) * smoothstep(4.4, 2.2, vY);
    float alpha = vAlpha * (0.35 + heightFade * 0.65);

    gl_FragColor = vec4(vColor, alpha);
  }
`;
