import type { WarningType } from './types'
import { getCurrentLanguage, i18nContent } from './i18n'
import { markWarningShown } from './cache'

const STORAGE_KEY = 'axi-blog-graphics-warning-shown'

export function showWarning(
  title: string,
  content: string,
  type: WarningType = 'warning'
): void {
  const currentLang = getCurrentLanguage()
  const buttonText = i18nContent[currentLang].button

  const overlay = document.createElement('div')
  overlay.className = 'graphics-warning-overlay'
  
  const dialog = document.createElement('div')
  dialog.className = 'graphics-warning-dialog'
  
  const iconClass = type === 'error' ? 'graphics-warning-icon error' : 'graphics-warning-icon'
  const icon = type === 'error' ? '🚫' : '⚠️'
  
  dialog.innerHTML = `
    <div class="graphics-warning-header">
      <div class="${iconClass}">${icon}</div>
      <h3 class="graphics-warning-title">${title}</h3>
    </div>
    <div class="graphics-warning-content">
      ${content}
    </div>
    <div class="graphics-warning-actions">
      <button class="graphics-warning-btn" onclick="this.closest('.graphics-warning-overlay').remove(); localStorage.setItem('${STORAGE_KEY}', 'true')">
        ${buttonText}
      </button>
    </div>
  `
  
  overlay.appendChild(dialog)
  document.body.appendChild(overlay)
  
  overlay.addEventListener('click', (e: Event) => {
    if (e.target === overlay) {
      markWarningShown()
      overlay.remove()
    }
  })
  
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      markWarningShown()
      overlay.remove()
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  markWarningShown()
}