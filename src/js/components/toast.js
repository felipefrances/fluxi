/**
 * ============================================
 * FLUXI - Sistema de Notificações Toast
 * ============================================
 *
 * Sistema simples de notificações visuais
 */

// ============================================
// CRIAR CONTAINER DE TOASTS
// ============================================

function createToastContainer() {
  if (document.getElementById('toast-container')) return

  const container = document.createElement('div')
  container.id = 'toast-container'
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
  `
  document.body.appendChild(container)
}

// ============================================
// MOSTRAR TOAST
// ============================================

/**
 * Exibe uma notificação toast
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duração em ms (padrão: 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
  createToastContainer()

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`

  // Cores por tipo
  const colors = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  }

  // Ícones por tipo
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  toast.style.cssText = `
    background: white;
    border-left: 4px solid ${colors[type]};
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
    min-width: 300px;
  `

  toast.innerHTML = `
    <span style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${colors[type]};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    ">${icons[type]}</span>
    <span style="
      color: #1F2937;
      font-size: 14px;
      line-height: 1.5;
      flex: 1;
    ">${message}</span>
    <button onclick="this.parentElement.remove()" style="
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    " aria-label="Fechar">×</button>
  `

  // Adicionar ao container
  const container = document.getElementById('toast-container')
  container.appendChild(toast)

  // Remover automaticamente
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => toast.remove(), 300)
  }, duration)

  // Remover ao clicar
  toast.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
      toast.remove()
    }
  })
}

// ============================================
// ATALHOS PARA TIPOS ESPECÍFICOS
// ============================================

function showSuccess(message, duration) {
  showToast(message, 'success', duration)
}

function showError(message, duration) {
  showToast(message, 'error', duration)
}

function showWarning(message, duration) {
  showToast(message, 'warning', duration)
}

function showInfo(message, duration) {
  showToast(message, 'info', duration)
}

// ============================================
// ADICIONAR ANIMAÇÕES AO DOCUMENTO
// ============================================

if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style')
  style.id = 'toast-animations'
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
