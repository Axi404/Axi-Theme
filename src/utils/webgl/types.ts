export interface WebGLSupportCache {
  webglSupported: boolean
  hardwareAccelerated: boolean
  timestamp: number
  version: string
}

export interface GraphicsAcceleration {
  webglSupported: boolean
  hardwareAccelerated: boolean
}

export interface RendererInfo {
  isSoftwareRenderer: boolean
  renderer: string
  vendor: string
}

export type Language = 'zh' | 'en'

export interface I18nContent {
  webglError: {
    title: string
    content: string
  }
  performanceWarning: {
    title: string
    content: string
  }
  button: string
}

export type WarningType = 'warning' | 'error'