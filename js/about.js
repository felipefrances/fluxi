/**
 * FLUXI - About Page
 */

let logoutBtn

;(async () => {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    window.location.href = './login.html'
    return
  }

  await loadUserInfo()
  initializeEventListeners()
})()

async function loadUserInfo() {
  try {
    const user = await getCurrentUser()
    if (user) {
      const userNameEl = document.querySelector('.avatar-text .name')
      if (userNameEl) {
        userNameEl.textContent = user.user_metadata?.full_name || 'Usuário'
      }

      // Carregar avatar do usuário
      const profileResult = await getUserProfile()
      if (profileResult.success && profileResult.data?.avatar_url) {
        const avatarIcon = document.querySelector('.avatar-icon')
        if (avatarIcon) {
          avatarIcon.style.backgroundImage = `url(${profileResult.data.avatar_url})`
          avatarIcon.style.backgroundSize = 'cover'
          avatarIcon.style.backgroundPosition = 'center'
          avatarIcon.innerHTML = ''
        }
      }
    }
  } catch (error) {
    console.error('Erro ao carregar usuário:', error)
  }
}

function initializeEventListeners() {
  logoutBtn = document.querySelector('.logout')

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout)
  }
}

async function handleLogout(e) {
  e.preventDefault()
  if (!confirm('Deseja sair da sua conta?')) return

  const result = await signOut()
  if (result.success) {
    showSuccess('Logout realizado com sucesso!')
    setTimeout(() => window.location.href = './login.html', 1000)
  } else {
    showError('Erro ao fazer logout')
  }
}
