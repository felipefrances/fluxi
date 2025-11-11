/**
 * ============================================
 * FLUXI - Serviço de Autenticação
 * ============================================
 *
 * Gerencia todas as operações de autenticação
 * usando Supabase Auth
 */

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================

/**
 * Cadastrar novo usuário
 * @param {Object} userData - Dados do usuário
 * @param {string} userData.email - Email do usuário
 * @param {string} userData.password - Senha do usuário
 * @param {string} userData.fullName - Nome completo do usuário
 * @param {string} userData.phone - Telefone do usuário (opcional)
 * @returns {Promise<Object>} Resultado do cadastro
 */
async function signUp({ email, password, fullName, phone = '' }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    })

    if (error) throw error

    return {
      success: true,
      message: 'Cadastro realizado com sucesso! Verifique seu email.',
      data
    }
  } catch (error) {
    console.error('Erro no cadastro:', error)
    return {
      success: false,
      message: getErrorMessage(error),
      error
    }
  }
}

/**
 * Fazer login
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Resultado do login
 */
async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return {
      success: true,
      message: 'Login realizado com sucesso!',
      data
    }
  } catch (error) {
    console.error('Erro no login:', error)
    return {
      success: false,
      message: getErrorMessage(error),
      error
    }
  }
}

/**
 * Fazer logout
 * @returns {Promise<Object>} Resultado do logout
 */
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    return {
      success: true,
      message: 'Logout realizado com sucesso!'
    }
  } catch (error) {
    console.error('Erro no logout:', error)
    return {
      success: false,
      message: 'Erro ao fazer logout',
      error
    }
  }
}

/**
 * Recuperar senha
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Resultado
 */
async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/recuperar-senha.html`
    })

    if (error) throw error

    return {
      success: true,
      message: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
    }
  } catch (error) {
    console.error('Erro ao recuperar senha:', error)
    return {
      success: false,
      message: 'Erro ao enviar email de recuperação',
      error
    }
  }
}

/**
 * Atualizar senha (quando usuário está autenticado)
 * @param {string} newPassword - Nova senha
 * @returns {Promise<Object>} Resultado
 */
async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    return {
      success: true,
      message: 'Senha atualizada com sucesso!'
    }
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return {
      success: false,
      message: 'Erro ao atualizar senha',
      error
    }
  }
}

// ============================================
// FUNÇÕES DE VERIFICAÇÃO E SESSÃO
// ============================================

/**
 * Obter usuário atual
 * @returns {Promise<Object|null>} Usuário atual ou null
 */
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Erro ao obter usuário:', error)
    return null
  }
}

/**
 * Obter sessão atual
 * @returns {Promise<Object|null>} Sessão atual ou null
 */
async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Erro ao obter sessão:', error)
    return null
  }
}

/**
 * Verificar se usuário está autenticado
 * @returns {Promise<boolean>} True se autenticado
 */
async function isAuthenticated() {
  const session = await getSession()
  return session !== null
}

/**
 * Verificar autenticação e redirecionar se necessário
 * Usar em páginas protegidas
 * @param {string} redirectTo - URL para redirecionar se não autenticado
 */
async function requireAuth(redirectTo = '/pages/login.html') {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    // Salvar URL atual para redirecionar após login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    window.location.href = redirectTo
    return false
  }

  return true
}

/**
 * Verificar se está autenticado e redirecionar para dashboard
 * Usar em páginas de login/cadastro
 * @param {string} redirectTo - URL para redirecionar se já autenticado
 */
async function redirectIfAuthenticated(redirectTo = '/pages/dashboard.html') {
  const authenticated = await isAuthenticated()

  if (authenticated) {
    window.location.href = redirectTo
    return true
  }

  return false
}

// ============================================
// LISTENER DE MUDANÇAS DE AUTENTICAÇÃO
// ============================================

/**
 * Listener para mudanças no estado de autenticação
 * @param {Function} callback - Função a ser chamada quando auth mudar
 */
function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('Auth event:', event, session)
      if (callback) callback(event, session)
    }
  )

  return subscription
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Traduzir mensagens de erro do Supabase
 * @param {Error} error - Erro do Supabase
 * @returns {string} Mensagem de erro traduzida
 */
function getErrorMessage(error) {
  const errorMessages = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Unable to validate email address: invalid format': 'Formato de email inválido',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
    'User not found': 'Usuário não encontrado'
  }

  return errorMessages[error.message] || error.message || 'Ocorreu um erro desconhecido'
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    getCurrentUser,
    getSession,
    isAuthenticated,
    requireAuth,
    redirectIfAuthenticated,
    onAuthStateChange
  }
}
