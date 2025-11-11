/**
 * ============================================
 * FLUXI - Validador de Formulários
 * ============================================
 */

// ============================================
// VALIDAÇÕES DE EMAIL
// ============================================

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ============================================
// VALIDAÇÕES DE SENHA
// ============================================

/**
 * Valida senha (mínimo 6 caracteres)
 * @param {string} password - Senha a validar
 * @returns {boolean} True se válida
 */
function isValidPassword(password) {
  return password.length >= 6
}

/**
 * Verifica se senhas coincidem
 * @param {string} password - Senha
 * @param {string} confirmPassword - Confirmação de senha
 * @returns {boolean} True se coincidem
 */
function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword
}

/**
 * Retorna força da senha (0-4)
 * @param {string} password - Senha a avaliar
 * @returns {number} Força (0=muito fraca, 4=muito forte)
 */
function getPasswordStrength(password) {
  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  return Math.min(strength, 4)
}

// ============================================
// VALIDAÇÕES DE TELEFONE
// ============================================

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone a validar
 * @returns {boolean} True se válido
 */
function isValidPhone(phone) {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  // Aceita: 11 dígitos (com DDD) ou 10 dígitos
  return cleaned.length === 10 || cleaned.length === 11
}

/**
 * Formata telefone brasileiro
 * @param {string} phone - Telefone a formatar
 * @returns {string} Telefone formatado
 */
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    // (85) 99999-9999
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    // (85) 9999-9999
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

// ============================================
// VALIDAÇÕES DE NOME
// ============================================

/**
 * Valida nome completo (mínimo 2 palavras)
 * @param {string} name - Nome a validar
 * @returns {boolean} True se válido
 */
function isValidFullName(name) {
  const trimmed = name.trim()
  const words = trimmed.split(/\s+/)
  return words.length >= 2 && trimmed.length >= 3
}

// ============================================
// VALIDAÇÕES DE CAMPO VAZIO
// ============================================

/**
 * Verifica se campo não está vazio
 * @param {string} value - Valor a verificar
 * @returns {boolean} True se não vazio
 */
function isNotEmpty(value) {
  return value.trim().length > 0
}

// ============================================
// VALIDAÇÃO VISUAL DE CAMPO
// ============================================

/**
 * Adiciona feedback visual de validação ao campo
 * @param {HTMLElement} input - Input a validar
 * @param {boolean} isValid - Se é válido
 * @param {string} message - Mensagem de erro (opcional)
 */
function showFieldValidation(input, isValid, message = '') {
  const parent = input.parentElement

  // Remove validações anteriores
  const existingError = parent.querySelector('.error-message')
  if (existingError) existingError.remove()

  input.classList.remove('input-valid', 'input-invalid')

  if (isValid) {
    input.classList.add('input-valid')
  } else {
    input.classList.add('input-invalid')

    if (message) {
      const errorEl = document.createElement('span')
      errorEl.className = 'error-message'
      errorEl.textContent = message
      errorEl.style.cssText = `
        color: #EF4444;
        font-size: 12px;
        margin-top: 4px;
        display: block;
      `
      parent.appendChild(errorEl)
    }
  }
}

/**
 * Remove validação visual do campo
 * @param {HTMLElement} input - Input
 */
function clearFieldValidation(input) {
  input.classList.remove('input-valid', 'input-invalid')
  const parent = input.parentElement
  const existingError = parent.querySelector('.error-message')
  if (existingError) existingError.remove()
}

// ============================================
// VALIDAÇÃO COMPLETA DE FORMULÁRIO
// ============================================

/**
 * Valida formulário de login
 * @param {Object} data - Dados do formulário
 * @returns {Object} { valid: boolean, errors: {} }
 */
function validateLoginForm(data) {
  const errors = {}

  if (!isNotEmpty(data.email)) {
    errors.email = 'Email é obrigatório'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email inválido'
  }

  if (!isNotEmpty(data.password)) {
    errors.password = 'Senha é obrigatória'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Valida formulário de cadastro
 * @param {Object} data - Dados do formulário
 * @returns {Object} { valid: boolean, errors: {} }
 */
function validateSignupForm(data) {
  const errors = {}

  // Email
  if (!isNotEmpty(data.email)) {
    errors.email = 'Email é obrigatório'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email inválido'
  }

  // Nome
  if (!isNotEmpty(data.name)) {
    errors.name = 'Nome é obrigatório'
  } else if (!isValidFullName(data.name)) {
    errors.name = 'Digite nome e sobrenome'
  }

  // Telefone
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Telefone inválido'
  }

  // Senha
  if (!isNotEmpty(data.password)) {
    errors.password = 'Senha é obrigatória'
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres'
  }

  // Confirmação de senha
  if (!isNotEmpty(data.confirmPassword)) {
    errors.confirmPassword = 'Confirme sua senha'
  } else if (!passwordsMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = 'As senhas não coincidem'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isValidEmail,
    isValidPassword,
    passwordsMatch,
    getPasswordStrength,
    isValidPhone,
    formatPhone,
    isValidFullName,
    isNotEmpty,
    showFieldValidation,
    clearFieldValidation,
    validateLoginForm,
    validateSignupForm
  }
}
