/**
 * FLUXI - Profile Page
 */

let profileForm, passwordForm, avatarInput, avatarPreview, avatarContainer, logoutBtn

;(async () => {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    window.location.href = './login.html'
    return
  }

  await loadUserInfo()
  initializeElements()
  initializeEventListeners()
  await loadProfileData()
})()

function initializeElements() {
  profileForm = document.getElementById('profileForm')
  passwordForm = document.getElementById('passwordForm')
  avatarInput = document.getElementById('avatarInput')
  avatarPreview = document.getElementById('avatarPreview')
  avatarContainer = document.getElementById('avatarContainer')
  logoutBtn = document.querySelector('.logout')
}

function initializeEventListeners() {
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit)
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordSubmit)
  }

  if (avatarInput) {
    avatarInput.addEventListener('change', handleAvatarChange)
  }

  if (avatarContainer) {
    avatarContainer.addEventListener('click', () => {
      avatarInput.click()
    })
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout)
  }
}

async function loadUserInfo() {
  try {
    const user = await getCurrentUser()
    if (user) {
      const userNameEl = document.querySelector('.avatar-text .name')
      if (userNameEl) {
        userNameEl.textContent = user.user_metadata?.full_name || 'Usuário'
      }

      // Load avatar in topbar
      const result = await getUserProfile()
      if (result.success && result.data?.avatar_url) {
        const avatarIcon = document.querySelector('.topbar .avatar-icon')
        if (avatarIcon) {
          avatarIcon.style.backgroundImage = `url(${result.data.avatar_url})`
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

async function loadProfileData() {
  try {
    const result = await getUserProfile()

    if (result.success && result.data) {
      const profile = result.data

      // Fill form fields
      const fullNameInput = document.getElementById('fullName')
      const emailInput = document.getElementById('email')

      if (fullNameInput) {
        fullNameInput.value = profile.full_name || ''
      }

      if (emailInput) {
        emailInput.value = profile.email || ''
      }

      // Load avatar if exists
      if (profile.avatar_url) {
        avatarPreview.src = profile.avatar_url
        avatarPreview.classList.add('loaded')
        const personIcon = avatarContainer.querySelector('.material-icons-outlined')
        if (personIcon) {
          personIcon.style.display = 'none'
        }
      }
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
    showError('Erro ao carregar dados do perfil')
  }
}

async function handleProfileSubmit(e) {
  e.preventDefault()

  const fullName = document.getElementById('fullName').value.trim()

  if (!fullName) {
    showError('Por favor, preencha o nome completo')
    return
  }

  // Add loading state
  const card = document.querySelector('.profile-card')
  card.classList.add('loading')

  try {
    const result = await updateProfile({ full_name: fullName })

    if (result.success) {
      showSuccess(result.message)

      // Update topbar name
      const userNameEl = document.querySelector('.avatar-text .name')
      if (userNameEl) {
        userNameEl.textContent = fullName
      }
    } else {
      showError(result.message)
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    showError('Erro ao atualizar perfil')
  } finally {
    card.classList.remove('loading')
  }
}

async function handlePasswordSubmit(e) {
  e.preventDefault()

  const newPassword = document.getElementById('newPassword').value
  const confirmPassword = document.getElementById('confirmPassword').value

  if (!newPassword) {
    showError('Digite a nova senha')
    return
  }

  if (newPassword.length < 6) {
    showError('A senha deve ter pelo menos 6 caracteres')
    return
  }

  if (newPassword !== confirmPassword) {
    showError('As senhas não coincidem')
    return
  }

  // Add loading state
  const card = document.querySelector('.profile-card')
  card.classList.add('loading')

  try {
    const result = await updatePassword(newPassword)

    if (result.success) {
      showSuccess(result.message)

      // Clear password fields
      document.getElementById('newPassword').value = ''
      document.getElementById('confirmPassword').value = ''
    } else {
      showError(result.message)
    }
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    showError('Erro ao alterar senha')
  } finally {
    card.classList.remove('loading')
  }
}

async function handleAvatarChange(e) {
  const file = e.target.files[0]

  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Por favor, selecione uma imagem')
    return
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    showError('A imagem deve ter no máximo 5MB')
    return
  }

  // Show preview
  const reader = new FileReader()
  reader.onload = (event) => {
    avatarPreview.src = event.target.result
    avatarPreview.classList.add('loaded')
    const personIcon = avatarContainer.querySelector('.material-icons-outlined')
    if (personIcon) {
      personIcon.style.display = 'none'
    }
  }
  reader.readAsDataURL(file)

  // Upload to server
  const card = document.querySelector('.profile-card')
  card.classList.add('loading')

  try {
    const result = await uploadAvatar(file)

    if (result.success) {
      showSuccess(result.message)

      // Update topbar avatar
      const avatarIcon = document.querySelector('.topbar .avatar-icon')
      if (avatarIcon && result.avatarUrl) {
        avatarIcon.style.backgroundImage = `url(${result.avatarUrl})`
        avatarIcon.style.backgroundSize = 'cover'
        avatarIcon.style.backgroundPosition = 'center'
        avatarIcon.innerHTML = ''
      }
    } else {
      showError(result.message)

      // Reset preview on error
      avatarPreview.src = ''
      avatarPreview.classList.remove('loaded')
      const personIcon = avatarContainer.querySelector('.material-icons-outlined')
      if (personIcon) {
        personIcon.style.display = 'block'
      }
    }
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    showError('Erro ao fazer upload da foto')
  } finally {
    card.classList.remove('loading')
    // Clear input to allow re-upload of same file
    avatarInput.value = ''
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
