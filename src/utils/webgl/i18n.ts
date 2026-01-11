import type { Language, I18nContent } from './types'

export function getCurrentLanguage(): Language {
  const path = window.location.pathname
  if (path.includes('/en/') || path.endsWith('/en')) {
    return 'en'
  }
  return 'zh'
}

export const i18nContent: Record<Language, I18nContent> = {
  zh: {
    webglError: {
      title: '浏览器兼容性提醒',
      content: `
        <strong>您的浏览器不支持 WebGL 技术</strong>，可能会影响网站的某些功能体验。
        
        <ul class="graphics-warning-list">
          <li>更新到最新版本的现代浏览器（Chrome、Firefox、Edge、Safari）</li>
          <li>确保您的设备支持硬件加速</li>
          <li>如果使用的是较老的设备，建议升级浏览器版本</li>
        </ul>
      `
    },
    performanceWarning: {
      title: '性能优化建议',
      content: `
        <strong>检测到您的浏览器可能未启用硬件加速</strong>，这可能会影响网页性能和视觉效果。开启硬件加速通常<strong>不会导致性能开销明显增加</strong>，但是可能可以显著提升网页的渲染速度与浏览体验。
        
        <ul class="graphics-warning-list">
          <li><strong>Chrome:</strong> 设置 → 系统 → 使用图形加速功能（如果可用）</li>
          <li><strong>Firefox:</strong> 设置 → 常规 → 性能 → 使用推荐的性能设置 → 自动启用硬件加速</li>
          <li><strong>Edge:</strong> 设置 → 系统和性能 → 图形加速 → 在可用时使用图形加速</li>
          <li>重启浏览器让设置生效</li>
        </ul>
        
        <p style="margin-top: 16px; opacity: 0.8; font-size: 14px;">
          💡 如果您的设备较老或不支持硬件加速，网站仍可正常使用。
        </p>
      `
    },
    button: '我知道了'
  },
  en: {
    webglError: {
      title: 'Browser Compatibility Notice',
      content: `
        <strong>Your browser does not support WebGL technology</strong>, which may affect some website features and experience.
        
        <ul class="graphics-warning-list">
          <li>Update to the latest version of modern browsers (Chrome, Firefox, Edge, Safari)</li>
          <li>Ensure your device supports hardware acceleration</li>
          <li>For older devices, consider upgrading your browser version</li>
        </ul>
      `
    },
    performanceWarning: {
      title: 'Performance Optimization Suggestion',
      content: `
        <strong>Hardware acceleration may not be enabled in your browser</strong>, which could affect web performance and visual effects. Enabling hardware acceleration typically <strong>does not significantly increase performance overhead</strong>, but can significantly improve web rendering speed and browsing experience.
        
        <ul class="graphics-warning-list">
          <li><strong>Chrome:</strong> Settings → System → Use hardware acceleration when available</li>
          <li><strong>Firefox:</strong> Settings → General → Performance → Use recommended performance settings → Enable hardware acceleration</li>
          <li><strong>Edge:</strong> Settings → System and performance → Use hardware acceleration when available</li>
          <li>Restart your browser for settings to take effect</li>
        </ul>
        
        <p style="margin-top: 16px; opacity: 0.8; font-size: 14px;">
          💡 If your device is older or doesn't support hardware acceleration, the website will still work normally.
        </p>
      `
    },
    button: 'Got it'
  }
}