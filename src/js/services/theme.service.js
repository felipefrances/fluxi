/**
 * FLUXI - Theme Service
 * Gerencia tema claro/escuro com localStorage
 */

// Chave do localStorage para persistir preferência
const THEME_STORAGE_KEY = 'fluxi_theme'

// Temas disponíveis
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
}

/**
 * Inicializa o tema na primeira carga da página
 * Verifica localStorage ou preferência do sistema
 */
function initTheme() {
  // Buscar tema salvo no localStorage
  let savedTheme = localStorage.getItem(THEME_STORAGE_KEY)

  // Se não houver tema salvo, verificar preferência do sistema
  if (!savedTheme) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    savedTheme = prefersDark ? THEMES.DARK : THEMES.LIGHT
  }

  // Aplicar tema
  setTheme(savedTheme)

  // Listener para mudanças na preferência do sistema
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Só aplica se o usuário não tiver preferência salva
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT)
      }
    })
  }
}

/**
 * Define o tema atual
 * @param {string} theme - 'light' ou 'dark'
 */
function setTheme(theme) {
  // Validar tema
  if (theme !== THEMES.LIGHT && theme !== THEMES.DARK) {
    console.warn(`Tema inválido: ${theme}. Usando tema claro.`)
    theme = THEMES.LIGHT
  }

  // Aplicar tema no documento
  document.documentElement.setAttribute('data-theme', theme)

  // Salvar no localStorage
  localStorage.setItem(THEME_STORAGE_KEY, theme)

  // Atualizar toggle se existir
  updateThemeToggle(theme)

  // Dispatch evento customizado para outros componentes reagirem
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }))
}

/**
 * Alterna entre tema claro e escuro
 */
function toggleTheme() {
  const currentTheme = getCurrentTheme()
  const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
  setTheme(newTheme)
}

/**
 * Retorna o tema atual
 * @returns {string} 'light' ou 'dark'
 */
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || THEMES.LIGHT
}

/**
 * Verifica se o tema atual é escuro
 * @returns {boolean}
 */
function isDarkTheme() {
  return getCurrentTheme() === THEMES.DARK
}

/**
 * Atualiza o estado visual do toggle de tema
 * @param {string} theme
 */
function updateThemeToggle(theme) {
  const toggle = document.getElementById('themeToggle')
  if (toggle) {
    toggle.checked = theme === THEMES.DARK
  }

  // Atualizar ícone se existir
  const themeIcon = document.getElementById('themeIcon')
  if (themeIcon) {
    themeIcon.textContent = theme === THEMES.DARK ? 'dark_mode' : 'light_mode'
  }

  // Atualizar texto se existir
  const themeText = document.getElementById('themeText')
  if (themeText) {
    themeText.textContent = theme === THEMES.DARK ? 'Tema Escuro' : 'Tema Claro'
  }
}

/**
 * Reseta o tema para preferência do sistema
 */
function resetTheme() {
  localStorage.removeItem(THEME_STORAGE_KEY)
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  setTheme(prefersDark ? THEMES.DARK : THEMES.LIGHT)
}

/**
 * Inicializa listeners para toggles de tema na página
 */
function initThemeListeners() {
  // Toggle principal (checkbox)
  const themeToggle = document.getElementById('themeToggle')
  if (themeToggle) {
    themeToggle.addEventListener('change', toggleTheme)
  }

  // Botão de toggle alternativo
  const themeButton = document.getElementById('themeButton')
  if (themeButton) {
    themeButton.addEventListener('click', toggleTheme)
  }
}

// Inicializar tema imediatamente quando o script é carregado
// Isso previne flash de conteúdo com tema incorreto
initTheme()

// Inicializar listeners quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeListeners)
} else {
  initThemeListeners()
}

// Exportar funções para uso global
window.ThemeService = {
  initTheme,
  setTheme,
  toggleTheme,
  getCurrentTheme,
  isDarkTheme,
  resetTheme,
  THEMES
}
