/**
 * WebGL capability and software rendering detector
 * Following the threejs skill recommendations
 */

export interface WebGLProfile {
  isSoftwareGl: boolean;
  rendererName: string;
  maxAnisotropy: number;
  dpr: number;
}

export function detectWebGLProfile(): WebGLProfile {
  let isSoftware = false;
  let rendererName = 'Unknown';
  let maxAniso = 1;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      return { isSoftwareGl: true, rendererName: 'No WebGL', maxAnisotropy: 1, dpr: 1 };
    }

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const param = ext.UNMASKED_RENDERER_WEBGL;
      rendererName = String(gl.getParameter(param));
    } else {
      rendererName = String(gl.getParameter(gl.RENDERER));
    }

    const anisoExt = gl.getExtension('EXT_texture_filter_anisotropic');
    if (anisoExt) {
      maxAniso = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1;
    }

    // Clean up probe context
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    isSoftware = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererName);
  } catch (err) {
    console.warn('Error detecting WebGL capabilities:', err);
    isSoftware = true;
  }

  const dpr = isSoftware ? 1 : Math.min(window.devicePixelRatio || 1, 2);

  return {
    isSoftwareGl: isSoftware,
    rendererName,
    maxAnisotropy: maxAniso,
    dpr,
  };
}
