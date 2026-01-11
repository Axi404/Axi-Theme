import type { GraphicsAcceleration, RendererInfo } from './types'

export function detectGraphicsAcceleration(): GraphicsAcceleration {
  const canvas = document.createElement('canvas')
  
  const glWithCaveat =
    canvas.getContext('webgl', {
      failIfMajorPerformanceCaveat: true
    }) ||
    canvas.getContext('experimental-webgl', {
      failIfMajorPerformanceCaveat: true
    })
  
  const glAny = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  if (!glAny) {
    return { webglSupported: false, hardwareAccelerated: false }
  } else if (!glWithCaveat) {
    return { webglSupported: true, hardwareAccelerated: false }
  } else {
    return { webglSupported: true, hardwareAccelerated: true }
  }
}

export function getRendererInfo(): RendererInfo | null {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  if (!gl) return null
  
  const webgl = gl as WebGLRenderingContext
  const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info')
  
  if (debugInfo) {
    const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    const vendor = webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    
    const softwareIndicators = [
      'swiftshader',
      'software',
      // 'mesa',
      'llvmpipe',
      'microsoft basic render'
    ]
    
    const isSoftwareRenderer = softwareIndicators.some((indicator) =>
      renderer.toLowerCase().includes(indicator)
    )
    
    return { isSoftwareRenderer, renderer, vendor }
  }
  
  return null
}