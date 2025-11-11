/**
 * ============================================
 * FLUXI - Página de Login
 * ============================================
 */

// ============================================
// ELEMENTOS DO DOM
// ============================================

const loginForm = document.getElementById('loginForm')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const submitButton = loginForm.querySelector('button[type="submit"]')
const togglePassword = document.getElementById('togglePassword')
const icon = togglePassword.querySelector('span')

// ============================================
// TOGGLE DE SENHA
// ============================================

togglePassword.addEventListener('click', () => {
  const isHidden = passwordInput.getAttribute('type') === 'password'
  passwordInput.setAttribute('type', isHidden ? 'text' : 'password')
  icon.textContent = isHidden ? 'visibility_off' : 'visibility'
})

// ============================================
// VERIFICAR SE JÁ ESTÁ AUTENTICADO
// ============================================

// Redirecionar para dashboard se já estiver logado
;(async () => {
  const authenticated = await isAuthenticated()
  if (authenticated) {
    window.location.href = './dashboard.html'
  }
})()

// ============================================
// SUBMIT DO FORMULÁRIO
// ============================================

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  // Coletar dados do formulário
  const email = emailInput.value.trim()
  const password = passwordInput.value

  // Validar dados
  const validation = validateLoginForm({ email, password })

  if (!validation.valid) {
    // Mostrar erros de validação
    if (validation.errors.email) {
      showFieldValidation(emailInput, false, validation.errors.email)
    } else {
      clearFieldValidation(emailInput)
    }

    if (validation.errors.password) {
      showFieldValidation(passwordInput, false, validation.errors.password)
    } else {
      clearFieldValidation(passwordInput)
    }

    return
  }

  // Limpar validações anteriores
  clearFieldValidation(emailInput)
  clearFieldValidation(passwordInput)

  // Desabilitar botão e mostrar loading
  const originalButtonText = submitButton.textContent
  submitButton.disabled = true
  submitButton.textContent = 'Entrando...'
  submitButton.style.opacity = '0.7'
  submitButton.style.cursor = 'not-allowed'

  try {
    // Fazer login via Supabase
    const result = await signIn(email, password)
    console.log('Resultado do login:', result)

    if (result.success) {
      // Sucesso!
      showSuccess('Login realizado com sucesso! Redirecionando...')

      // Verificar se há URL de redirecionamento salva
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
      sessionStorage.removeItem('redirectAfterLogin')

      console.log('Redirecionando para:', redirectUrl || './dashboard.html')

      // Aguardar 1 segundo e redirecionar
      setTimeout(() => {
        // Usar caminho relativo - estamos em /src/pages/login.html
        console.log('Executando redirecionamento...')
        window.location.href = redirectUrl || './dashboard.html'
      }, 1000)
    } else {
      // Erro no login
      console.error('Erro no login:', result.message)
      showError(result.message)

      // Reabilitar botão
      submitButton.disabled = false
      submitButton.textContent = originalButtonText
      submitButton.style.opacity = '1'
      submitButton.style.cursor = 'pointer'
    }
  } catch (error) {
    console.error('Erro inesperado no login:', error)
    showError('Ocorreu um erro inesperado. Tente novamente.')

    // Reabilitar botão
    submitButton.disabled = false
    submitButton.textContent = originalButtonText
    submitButton.style.opacity = '1'
    submitButton.style.cursor = 'pointer'
  }
})

// ============================================
// VALIDAÇÃO EM TEMPO REAL
// ============================================

// Validar email ao perder foco
emailInput.addEventListener('blur', () => {
  const email = emailInput.value.trim()

  if (email) {
    if (isValidEmail(email)) {
      showFieldValidation(emailInput, true)
    } else {
      showFieldValidation(emailInput, false, 'Email inválido')
    }
  }
})

// Limpar validação ao focar
emailInput.addEventListener('focus', () => {
  clearFieldValidation(emailInput)
})

passwordInput.addEventListener('focus', () => {
  clearFieldValidation(passwordInput)
})

// ============================================
// RECUPERAÇÃO DE SENHA
// ============================================

const forgotPasswordLink = document.querySelector('.forgot-password')

forgotPasswordLink.addEventListener('click', async (e) => {
  e.preventDefault()

  const email = emailInput.value.trim()

  if (!email) {
    showWarning('Digite seu email primeiro para recuperar a senha')
    emailInput.focus()
    return
  }

  if (!isValidEmail(email)) {
    showError('Digite um email válido')
    emailInput.focus()
    return
  }

  // Confirmar ação
  if (!confirm(`Enviar email de recuperação para ${email}?`)) {
    return
  }

  // Desabilitar link
  forgotPasswordLink.style.pointerEvents = 'none'
  forgotPasswordLink.style.opacity = '0.5'

  try {
    const result = await resetPassword(email)

    if (result.success) {
      showSuccess(result.message)
    } else {
      showError(result.message)
    }
  } catch (error) {
    console.error('Erro ao recuperar senha:', error)
    showError('Erro ao enviar email de recuperação')
  } finally {
    // Reabilitar link após 3 segundos
    setTimeout(() => {
      forgotPasswordLink.style.pointerEvents = 'auto'
      forgotPasswordLink.style.opacity = '1'
    }, 3000)
  }
})

// ============================================
// ENTER PARA SUBMIT
// ============================================

passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loginForm.dispatchEvent(new Event('submit'))
  }
})

// ============================================
// ADICIONAR ESTILOS DE VALIDAÇÃO
// ============================================

const validationStyles = document.createElement('style')
validationStyles.textContent = `
  .input-valid {
    border-color: #10B981 !important;
  }

  .input-invalid {
    border-color: #EF4444 !important;
  }
`
document.head.appendChild(validationStyles)
