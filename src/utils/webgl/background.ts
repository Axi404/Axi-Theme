export function enableGradientBackground(): void {
  const gradientBg = document.getElementById('gradient-background')
  if (gradientBg) {
    gradientBg.style.display = 'block'
    gradientBg.style.opacity = '1'
  }
  
  const style = document.createElement('style')
  style.textContent = `
    header-component.not-top {
      background-color: hsl(var(--background) / 0.0) !important;
    }
    .dark header-component.not-top {
      background-color: hsl(var(--muted) / 0.0) !important;
    }
  `
  document.head.appendChild(style)
}

export function disableGradientBackground(): void {
  const gradientBg = document.getElementById('gradient-background')
  if (gradientBg) {
    gradientBg.style.opacity = '0'
    setTimeout(() => {
      gradientBg.style.display = 'none'
    }, 1000)
  }
}

export function applyCachedWebGLState(
  webglSupported: boolean,
  hardwareAccelerated: boolean
): void {
  const gradientBg = document.getElementById('gradient-background')
  if (!gradientBg) return
  
  if (!webglSupported || !hardwareAccelerated) {
    disableGradientBackground()
  } else {
    enableGradientBackground()
  }
}