/**
 * ============================================
 * FLUXI - Componente de Modal Reutilizável
 * ============================================
 */

// ============================================
// CRIAR E EXIBIR MODAL
// ============================================

/**
 * Cria e exibe um modal
 * @param {Object} options
 * @param {string} options.title - Título do modal
 * @param {string} options.content - Conteúdo HTML do modal
 * @param {Function} options.onClose - Callback ao fechar
 * @param {string} options.size - 'small', 'medium', 'large' (padrão: 'medium')
 * @returns {HTMLElement} Elemento do modal
 */
function showModal(options) {
  // Remover modal existente
  const existingModal = document.getElementById('fluxi-modal')
  if (existingModal) {
    existingModal.remove()
  }

  // Criar overlay
  const modal = document.createElement('div')
  modal.id = 'fluxi-modal'
  modal.className = 'modal-overlay'

  // Tamanhos
  const sizes = {
    small: '400px',
    medium: '600px',
    large: '800px'
  }
  const modalWidth = sizes[options.size || 'medium']

  modal.innerHTML = `
    <div class="modal-container" style="max-width: ${modalWidth};">
      <div class="modal-header">
        <h2>${options.title || 'Modal'}</h2>
        <button class="modal-close" aria-label="Fechar">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
      <div class="modal-body">
        ${options.content || ''}
      </div>
    </div>
  `

  // Adicionar ao body
  document.body.appendChild(modal)

  // Prevenir scroll do body
  document.body.style.overflow = 'hidden'

  // Event listeners
  const closeBtn = modal.querySelector('.modal-close')
  const container = modal.querySelector('.modal-container')

  // Fechar ao clicar no X
  closeBtn.addEventListener('click', () => {
    closeModal()
    if (options.onClose) options.onClose()
  })

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal()
      if (options.onClose) options.onClose()
    }
  })

  // Fechar com ESC
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal()
      if (options.onClose) options.onClose()
      document.removeEventListener('keydown', handleEsc)
    }
  }
  document.addEventListener('keydown', handleEsc)

  // Animação de entrada
  setTimeout(() => {
    modal.classList.add('active')
  }, 10)

  return modal
}

// ============================================
// FECHAR MODAL
// ============================================

function closeModal() {
  const modal = document.getElementById('fluxi-modal')
  if (!modal) return

  modal.classList.remove('active')

  setTimeout(() => {
    modal.remove()
    document.body.style.overflow = ''
  }, 300)
}

// ============================================
// ESTILOS DO MODAL
// ============================================

if (!document.getElementById('modal-styles')) {
  const styles = document.createElement('style')
  styles.id = 'modal-styles'
  styles.textContent = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
      padding: 20px;
    }

    .modal-overlay.active {
      opacity: 1;
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      width: 100%;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }

    .modal-overlay.active .modal-container {
      transform: scale(1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #E5E7EB;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #1F2937;
      font-weight: 600;
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      color: #6B7280;
    }

    .modal-close:hover {
      background: #F3F4F6;
      color: #1F2937;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .modal-body::-webkit-scrollbar {
      width: 8px;
    }

    .modal-body::-webkit-scrollbar-track {
      background: #F3F4F6;
      border-radius: 4px;
    }

    .modal-body::-webkit-scrollbar-thumb {
      background: #D1D5DB;
      border-radius: 4px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #9CA3AF;
    }
  `
  document.head.appendChild(styles)
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showModal,
    closeModal
  }
}
