/**
 * ============================================
 * FLUXI - Página de Cadastro
 * ============================================
 */

// ============================================
// ELEMENTOS DO DOM
// ============================================

const signupForm = document.getElementById('signupForm')
const emailInput = document.getElementById('email')
const nameInput = document.getElementById('name')
const phoneInput = document.getElementById('phone')
const passwordInput = document.getElementById('password')
const confirmPasswordInput = document.getElementById('confirmPassword')
const submitButton = signupForm.querySelector('button[type="submit"]')
const togglePasswordButtons = document.querySelectorAll('.togglePassword')

// ============================================
// TOGGLE DE SENHAS
// ============================================

togglePasswordButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input')
    const icon = button.querySelector('span')
    const isHidden = input.getAttribute('type') === 'password'

    input.setAttribute('type', isHidden ? 'text' : 'password')
    icon.textContent = isHidden ? 'visibility_off' : 'visibility'
  })
})

// ============================================
// VERIFICAR SE JÁ ESTÁ AUTENTICADO
// ============================================

;(async () => {
  const authenticated = await isAuthenticated()
  if (authenticated) {
    window.location.href = './dashboard.html'
  }
})()

// ============================================
// FORMATAÇÃO AUTOMÁTICA DE TELEFONE
// ============================================

phoneInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '')

  if (value.length > 11) {
    value = value.substring(0, 11)
  }

  if (value.length <= 10) {
    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  } else {
    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }

  e.target.value = value
})

// ============================================
// SUBMIT DO FORMULÁRIO
// ============================================

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  // Coletar dados do formulário
  const formData = {
    email: emailInput.value.trim(),
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    password: passwordInput.value,
    confirmPassword: confirmPasswordInput.value
  }

  // Validar dados
  const validation = validateSignupForm(formData)

  if (!validation.valid) {
    // Mostrar erros de validação
    Object.keys(validation.errors).forEach((field) => {
      const input = document.getElementById(field)
      if (input) {
        showFieldValidation(input, false, validation.errors[field])
      }
    })

    // Focar no primeiro campo com erro
    const firstErrorField = Object.keys(validation.errors)[0]
    const firstErrorInput = document.getElementById(firstErrorField)
    if (firstErrorInput) {
      firstErrorInput.focus()
    }

    return
  }

  // Limpar todas as validações
  ;[emailInput, nameInput, phoneInput, passwordInput, confirmPasswordInput].forEach((input) => {
    clearFieldValidation(input)
  })

  // Desabilitar botão e mostrar loading
  const originalButtonText = submitButton.textContent
  submitButton.disabled = true
  submitButton.textContent = 'Criando conta...'
  submitButton.style.opacity = '0.7'
  submitButton.style.cursor = 'not-allowed'

  try {
    // Cadastrar via Supabase
    const result = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.name,
      phone: formData.phone
    })

    if (result.success) {
      // Sucesso!
      showSuccess(
        'Conta criada com sucesso! Verifique seu email para confirmar o cadastro.',
        6000
      )

      // Limpar formulário
      signupForm.reset()

      // Aguardar 3 segundos e redirecionar para login
      setTimeout(() => {
        window.location.href = 'login.html'
      }, 3000)
    } else {
      // Erro no cadastro
      showError(result.message)

      // Reabilitar botão
      submitButton.disabled = false
      submitButton.textContent = originalButtonText
      submitButton.style.opacity = '1'
      submitButton.style.cursor = 'pointer'
    }
  } catch (error) {
    console.error('Erro inesperado no cadastro:', error)
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

// Email
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

emailInput.addEventListener('focus', () => {
  clearFieldValidation(emailInput)
})

// Nome
nameInput.addEventListener('blur', () => {
  const name = nameInput.value.trim()

  if (name) {
    if (isValidFullName(name)) {
      showFieldValidation(nameInput, true)
    } else {
      showFieldValidation(nameInput, false, 'Digite nome e sobrenome')
    }
  }
})

nameInput.addEventListener('focus', () => {
  clearFieldValidation(nameInput)
})

// Telefone
phoneInput.addEventListener('blur', () => {
  const phone = phoneInput.value.trim()

  if (phone) {
    if (isValidPhone(phone)) {
      showFieldValidation(phoneInput, true)
    } else {
      showFieldValidation(phoneInput, false, 'Telefone inválido')
    }
  }
})

phoneInput.addEventListener('focus', () => {
  clearFieldValidation(phoneInput)
})

// Senha
passwordInput.addEventListener('blur', () => {
  const password = passwordInput.value

  if (password) {
    if (isValidPassword(password)) {
      showFieldValidation(passwordInput, true)
    } else {
      showFieldValidation(passwordInput, false, 'Mínimo 6 caracteres')
    }
  }
})

passwordInput.addEventListener('focus', () => {
  clearFieldValidation(passwordInput)
})

// Confirmação de senha
confirmPasswordInput.addEventListener('blur', () => {
  const password = passwordInput.value
  const confirmPassword = confirmPasswordInput.value

  if (confirmPassword) {
    if (passwordsMatch(password, confirmPassword)) {
      showFieldValidation(confirmPasswordInput, true)
    } else {
      showFieldValidation(confirmPasswordInput, false, 'As senhas não coincidem')
    }
  }
})

confirmPasswordInput.addEventListener('focus', () => {
  clearFieldValidation(confirmPasswordInput)
})

// ============================================
// INDICADOR DE FORÇA DA SENHA (OPCIONAL)
// ============================================

passwordInput.addEventListener('input', () => {
  const password = passwordInput.value
  if (!password) return

  const strength = getPasswordStrength(password)
  const strengthLabels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte']
  const strengthColors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981']

  // Remover indicador anterior
  const existingIndicator = passwordInput.parentElement.parentElement.querySelector('.strength-indicator')
  if (existingIndicator) existingIndicator.remove()

  // Criar novo indicador
  const indicator = document.createElement('div')
  indicator.className = 'strength-indicator'
  indicator.style.cssText = `
    font-size: 12px;
    margin-top: 4px;
    color: ${strengthColors[strength]};
    font-weight: 500;
  `
  indicator.textContent = `Força da senha: ${strengthLabels[strength]}`

  passwordInput.parentElement.parentElement.appendChild(indicator)
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
