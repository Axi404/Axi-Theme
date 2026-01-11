import { detectGraphicsAcceleration, getRendererInfo } from './detection'
import { getCachedWebGLSupport, setCachedWebGLSupport, hasShownWarning } from './cache'
import { getCurrentLanguage, i18nContent } from './i18n'
import { showWarning } from './ui'
import { enableGradientBackground, disableGradientBackground, applyCachedWebGLState } from './background'

export function backgroundCheckWebGL(): void {
  try {
    const acceleration = detectGraphicsAcceleration()
    const rendererInfo = getRendererInfo()
    
    setCachedWebGLSupport({
      webglSupported: acceleration.webglSupported,
      hardwareAccelerated:
        acceleration.hardwareAccelerated &&
        !(rendererInfo && rendererInfo.isSoftwareRenderer)
    })
    
    const cached = getCachedWebGLSupport()
    if (cached) {
      if (!cached.webglSupported || !cached.hardwareAccelerated) {
        disableGradientBackground()
      } else {
        enableGradientBackground()
      }
    }
  } catch (error) {
    // Silent fail for background check
  }
}

export function checkGraphicsSupport(): void {
  if (hasShownWarning()) {
    return
  }
  
  try {
    const currentLang = getCurrentLanguage()
    const acceleration = detectGraphicsAcceleration()
    const rendererInfo = getRendererInfo()
    
    setCachedWebGLSupport({
      webglSupported: acceleration.webglSupported,
      hardwareAccelerated:
        acceleration.hardwareAccelerated &&
        !(rendererInfo && rendererInfo.isSoftwareRenderer)
    })
    
    if (!acceleration.webglSupported) {
      disableGradientBackground()
      const content = i18nContent[currentLang].webglError
      showWarning(content.title, content.content, 'error')
    } else if (
      !acceleration.hardwareAccelerated ||
      (rendererInfo && rendererInfo.isSoftwareRenderer)
    ) {
      disableGradientBackground()
      const content = i18nContent[currentLang].performanceWarning
      showWarning(content.title, content.content, 'warning')
    } else {
      enableGradientBackground()
    }
  } catch (error) {
    // Silent fail for graphics check
  }
}

export function initializeWebGL(): void {
  const cachedState = getCachedWebGLSupport()
  const hasCachedState = !!cachedState
  
  if (hasCachedState && cachedState) {
    applyCachedWebGLState(cachedState.webglSupported, cachedState.hardwareAccelerated)
    setTimeout(backgroundCheckWebGL, 1500)
  } else {
    setTimeout(checkGraphicsSupport, 1500)
  }
}