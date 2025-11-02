/**
 * ============================================
 * FLUXI - Página de Objetivos
 * ============================================
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let currentFilter = 'active'
let selectedIcon = 'flag'
let selectedColor = '#5C3FD6'

// ============================================
// INICIALIZAÇÃO
// ============================================

;(async () => {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    window.location.href = './login.html'
    return
  }

  // Carregar informações do usuário
  await loadUserInfo()

  // Inicializar elementos e listeners
  initializeEventListeners()

  // Carregar dados
  await loadGoalsPage()
})()

// ============================================
// CARREGAR INFORMAÇÕES DO USUÁRIO
// ============================================

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
    console.error('Erro ao carregar informações do usuário:', error)
  }
}

// ============================================
// INICIALIZAR EVENT LISTENERS
// ============================================

function initializeEventListeners() {
  // Botões de adicionar objetivo
  const addGoalBtns = document.querySelectorAll('.add-goal-btn')
  addGoalBtns.forEach(btn => {
    btn.addEventListener('click', openCreateGoalModal)
  })

  // Filtros
  const filterBtns = document.querySelectorAll('.filter-btn')
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remover active de todos
      filterBtns.forEach(b => b.classList.remove('active'))
      // Adicionar ao clicado
      e.target.classList.add('active')
      // Atualizar filtro
      currentFilter = e.target.dataset.filter
      loadGoalsList()
    })
  })

  // Logout
  const logoutBtn = document.querySelector('.logout')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout)
  }
}

// ============================================
// CARREGAR PÁGINA
// ============================================

async function loadGoalsPage() {
  try {
    await Promise.all([
      loadSummary(),
      loadGoalsList()
    ])
  } catch (error) {
    console.error('Erro ao carregar página:', error)
    showError('Erro ao carregar objetivos')
  }
}

// ============================================
// CARREGAR RESUMO
// ============================================

async function loadSummary() {
  try {
    const [activeResult, completedResult, totalResult] = await Promise.all([
      getGoals('active'),
      getGoals('completed'),
      getTotalInGoals()
    ])

    // Objetivos ativos
    document.getElementById('activeGoalsCount').textContent = activeResult.data?.length || 0

    // Total guardado
    document.getElementById('totalInGoals').textContent = formatCurrency(totalResult.total || 0)

    // Concluídos
    document.getElementById('completedGoalsCount').textContent = completedResult.data?.length || 0
  } catch (error) {
    console.error('Erro ao carregar resumo:', error)
  }
}

// ============================================
// CARREGAR LISTA DE OBJETIVOS
// ============================================

async function loadGoalsList() {
  const goalsList = document.getElementById('goalsList')
  const emptyState = document.getElementById('emptyState')

  try {
    const status = currentFilter === 'all' ? null : currentFilter
    const result = await getGoals(status)

    if (!result.success || result.data.length === 0) {
      goalsList.style.display = 'none'
      emptyState.style.display = 'flex'
      return
    }

    goalsList.style.display = 'grid'
    emptyState.style.display = 'none'
    goalsList.innerHTML = ''

    result.data.forEach(goal => {
      const goalCard = createGoalCard(goal)
      goalsList.appendChild(goalCard)
    })
  } catch (error) {
    console.error('Erro ao carregar lista:', error)
    showError('Erro ao carregar objetivos')
  }
}

// ============================================
// CRIAR CARD DE OBJETIVO
// ============================================

function createGoalCard(goal) {
  const card = document.createElement('div')
  card.className = `goal-card ${goal.status === 'completed' ? 'completed' : ''}`
  card.setAttribute('data-id', goal.id)

  const progress = goal.target_amount > 0
    ? (goal.current_amount / goal.target_amount) * 100
    : 0

  const progressClamped = Math.min(progress, 100)

  // Formatar deadline
  let deadlineText = ''
  if (goal.deadline) {
    const deadlineDate = new Date(goal.deadline)
    deadlineText = `<div class="goal-deadline">
      <span class="material-icons-outlined">event</span>
      ${deadlineDate.toLocaleDateString('pt-BR')}
    </div>`
  }

  card.innerHTML = `
    <div class="goal-header">
      <div class="goal-icon" style="background: ${goal.color || '#5C3FD6'};">
        <span class="material-icons-outlined">${goal.icon || 'flag'}</span>
      </div>
      <div class="goal-info">
        <h3 class="goal-name">${goal.name}</h3>
        ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
        ${deadlineText}
      </div>
    </div>

    <div class="goal-progress">
      <div class="goal-amounts">
        <span class="goal-current">${formatCurrency(goal.current_amount)}</span>
        <span class="goal-target">
          <span class="goal-separator">/</span>
          ${formatCurrency(goal.target_amount)}
        </span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${progressClamped}%;"></div>
      </div>
      <div class="progress-percentage">${progressClamped.toFixed(1)}% concluído</div>
    </div>

    <div class="goal-actions">
      ${goal.status === 'active' ? `
        <button class="btn-action btn-deposit" onclick="openDepositModal('${goal.id}')">
          <span class="material-icons-outlined">add</span>
          Depositar
        </button>
        ${goal.current_amount > 0 ? `
          <button class="btn-action btn-withdraw" onclick="openWithdrawModal('${goal.id}')">
            <span class="material-icons-outlined">remove</span>
            Resgatar
          </button>
        ` : ''}
      ` : `
        <button class="btn-action btn-withdraw" onclick="openWithdrawModal('${goal.id}')">
          <span class="material-icons-outlined">remove</span>
          Resgatar Tudo
        </button>
      `}
    </div>

    <div class="goal-menu">
      <button class="menu-btn" onclick="openGoalMenu('${goal.id}')">
        <span class="material-icons-outlined">more_vert</span>
      </button>
    </div>
  `

  return card
}

// ============================================
// MODAL: CRIAR OBJETIVO
// ============================================

async function openCreateGoalModal() {
  const iconOptions = [
    'flag', 'flight', 'directions_car', 'home', 'school',
    'computer', 'phone_iphone', 'shopping_cart', 'favorite', 'beach_access',
    'savings', 'account_balance', 'trending_up', 'card_giftcard', 'celebration'
  ]

  const colorOptions = [
    '#5C3FD6', '#7B61FF', '#9C82FF',
    '#67E5D2', '#10B981', '#3B82F6',
    '#EF4444', '#F59E0B', '#EC4899'
  ]

  const modalContent = `
    <form id="goalForm" class="goal-form">
      <div class="form-group">
        <label for="goalName">Nome do objetivo *</label>
        <input type="text" id="goalName" name="name" placeholder="Ex: Viagem de férias" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="targetAmount">Valor da meta *</label>
          <input type="number" id="targetAmount" name="targetAmount" step="0.01" min="0.01" placeholder="0,00" required />
        </div>

        <div class="form-group">
          <label for="initialAmount">Valor inicial (opcional)</label>
          <input type="number" id="initialAmount" name="initialAmount" step="0.01" min="0" placeholder="0,00" />
        </div>
      </div>

      <div class="form-group">
        <label for="deadline">Data limite (opcional)</label>
        <input type="date" id="deadline" name="deadline" />
      </div>

      <div class="form-group">
        <label for="description">Descrição (opcional)</label>
        <textarea id="description" name="description" rows="2" placeholder="Adicione detalhes sobre seu objetivo..."></textarea>
      </div>

      <div class="icon-color-picker">
        <div class="icon-selector">
          <label>Ícone</label>
          <div class="icon-grid" id="iconGrid">
            ${iconOptions.map(icon => `
              <div class="icon-option ${icon === selectedIcon ? 'selected' : ''}" data-icon="${icon}" onclick="selectIcon('${icon}')">
                <span class="material-icons-outlined">${icon}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="color-selector">
          <label>Cor</label>
          <div class="color-grid" id="colorGrid">
            ${colorOptions.map(color => `
              <div class="color-option ${color === selectedColor ? 'selected' : ''}"
                   data-color="${color}"
                   style="background-color: ${color};"
                   onclick="selectColor('${color}')">
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">Criar objetivo</button>
      </div>
    </form>
  `

  showModal({
    title: '🎯 Novo Objetivo',
    content: modalContent,
    size: 'medium'
  })

  // Event listener do formulário
  const form = document.getElementById('goalForm')
  form.addEventListener('submit', handleCreateGoal)
}

// ============================================
// SELECIONAR ÍCONE E COR
// ============================================

function selectIcon(icon) {
  selectedIcon = icon
  document.querySelectorAll('.icon-option').forEach(el => {
    el.classList.remove('selected')
  })
  document.querySelector(`[data-icon="${icon}"]`).classList.add('selected')
}

function selectColor(color) {
  selectedColor = color
  document.querySelectorAll('.color-option').forEach(el => {
    el.classList.remove('selected')
  })
  document.querySelector(`[data-color="${color}"]`).classList.add('selected')
}

// ============================================
// HANDLER: CRIAR OBJETIVO
// ============================================

async function handleCreateGoal(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const submitBtn = e.target.querySelector('button[type="submit"]')

  const goalData = {
    name: formData.get('name'),
    targetAmount: parseFloat(formData.get('targetAmount')),
    initialAmount: parseFloat(formData.get('initialAmount')) || 0,
    deadline: formData.get('deadline') || null,
    description: formData.get('description') || null,
    icon: selectedIcon,
    color: selectedColor
  }

  submitBtn.disabled = true
  submitBtn.textContent = 'Criando...'

  try {
    const result = await createGoal(goalData)

    if (result.success) {
      showSuccess('Objetivo criado com sucesso!')
      closeModal()
      await loadGoalsPage()
    } else {
      showError(result.message)
      submitBtn.disabled = false
      submitBtn.textContent = 'Criar objetivo'
    }
  } catch (error) {
    showError('Erro ao criar objetivo')
    submitBtn.disabled = false
    submitBtn.textContent = 'Criar objetivo'
  }
}

// ============================================
// MODAL: DEPOSITAR
// ============================================

async function openDepositModal(goalId) {
  const goalResult = await getGoalById(goalId)
  if (!goalResult.success) {
    showError('Erro ao carregar objetivo')
    return
  }

  const goal = goalResult.data

  // Calcular saldo disponível
  const summaryResult = await getFinancialSummary()
  const totalResult = await getTotalInGoals()
  const availableBalance = summaryResult.data.balance - totalResult.total

  const modalContent = `
    <form id="depositForm" class="goal-form">
      <div style="text-align: center; margin-bottom: 20px;">
        <div class="goal-icon" style="background: ${goal.color}; display: inline-flex; width: 64px; height: 64px; margin-bottom: 12px;">
          <span class="material-icons-outlined" style="font-size: 32px; color: white;">${goal.icon}</span>
        </div>
        <h3 style="margin: 0; color: var(--color-text);">${goal.name}</h3>
        <p style="color: var(--color-gray); font-size: 14px; margin-top: 4px;">
          ${formatCurrency(goal.current_amount)} / ${formatCurrency(goal.target_amount)}
        </p>
      </div>

      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="font-size: 13px; color: var(--color-gray); margin-bottom: 4px;">Saldo disponível</p>
        <p style="font-size: 20px; font-weight: 700; color: var(--color-text);">${formatCurrency(availableBalance)}</p>
      </div>

      <div class="form-group">
        <label for="depositAmount">Quanto deseja depositar? *</label>
        <input type="number" id="depositAmount" name="amount" step="0.01" min="0.01" max="${availableBalance}" placeholder="0,00" required autofocus />
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">Depositar</button>
      </div>
    </form>
  `

  showModal({
    title: '💰 Depositar no Objetivo',
    content: modalContent,
    size: 'small'
  })

  const form = document.getElementById('depositForm')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const amount = parseFloat(e.target.amount.value)
    await handleDeposit(goalId, amount)
  })
}

// ============================================
// HANDLER: DEPOSITAR
// ============================================

async function handleDeposit(goalId, amount) {
  const submitBtn = document.querySelector('#depositForm button[type="submit"]')

  submitBtn.disabled = true
  submitBtn.textContent = 'Depositando...'

  try {
    const result = await depositToGoal(goalId, amount)

    if (result.success) {
      showSuccess(result.message)
      closeModal()
      await loadGoalsPage()
    } else {
      showError(result.message)
      submitBtn.disabled = false
      submitBtn.textContent = 'Depositar'
    }
  } catch (error) {
    showError('Erro ao depositar')
    submitBtn.disabled = false
    submitBtn.textContent = 'Depositar'
  }
}

// ============================================
// MODAL: RESGATAR
// ============================================

async function openWithdrawModal(goalId) {
  const goalResult = await getGoalById(goalId)
  if (!goalResult.success) {
    showError('Erro ao carregar objetivo')
    return
  }

  const goal = goalResult.data

  const modalContent = `
    <form id="withdrawForm" class="goal-form">
      <div style="text-align: center; margin-bottom: 20px;">
        <div class="goal-icon" style="background: ${goal.color}; display: inline-flex; width: 64px; height: 64px; margin-bottom: 12px;">
          <span class="material-icons-outlined" style="font-size: 32px; color: white;">${goal.icon}</span>
        </div>
        <h3 style="margin: 0; color: var(--color-text);">${goal.name}</h3>
      </div>

      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="font-size: 13px; color: var(--color-gray); margin-bottom: 4px;">Disponível para resgate</p>
        <p style="font-size: 20px; font-weight: 700; color: var(--color-text);">${formatCurrency(goal.current_amount)}</p>
      </div>

      <div class="form-group">
        <label for="withdrawAmount">Quanto deseja resgatar? *</label>
        <input type="number" id="withdrawAmount" name="amount" step="0.01" min="0.01" max="${goal.current_amount}" placeholder="0,00" required autofocus />
      </div>

      <button type="button" class="btn-secondary" onclick="document.getElementById('withdrawAmount').value = ${goal.current_amount}" style="width: 100%; margin-bottom: 12px;">
        Resgatar tudo (${formatCurrency(goal.current_amount)})
      </button>

      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-primary">Resgatar</button>
      </div>
    </form>
  `

  showModal({
    title: '💵 Resgatar do Objetivo',
    content: modalContent,
    size: 'small'
  })

  const form = document.getElementById('withdrawForm')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const amount = parseFloat(e.target.amount.value)
    await handleWithdraw(goalId, amount)
  })
}

// ============================================
// HANDLER: RESGATAR
// ============================================

async function handleWithdraw(goalId, amount) {
  const submitBtn = document.querySelector('#withdrawForm button[type="submit"]')

  submitBtn.disabled = true
  submitBtn.textContent = 'Resgatando...'

  try {
    const result = await withdrawFromGoal(goalId, amount)

    if (result.success) {
      showSuccess(result.message)
      closeModal()
      await loadGoalsPage()
    } else {
      showError(result.message)
      submitBtn.disabled = false
      submitBtn.textContent = 'Resgatar'
    }
  } catch (error) {
    showError('Erro ao resgatar')
    submitBtn.disabled = false
    submitBtn.textContent = 'Resgatar'
  }
}

// ============================================
// MENU DE AÇÕES
// ============================================

async function openGoalMenu(goalId) {
  const goalResult = await getGoalById(goalId)
  if (!goalResult.success) return

  const goal = goalResult.data

  const actions = [
    {
      label: 'Editar objetivo',
      icon: 'edit',
      action: () => console.log('Editar:', goalId)
    },
    {
      label: goal.status === 'active' ? 'Marcar como concluído' : 'Reativar objetivo',
      icon: goal.status === 'active' ? 'check_circle' : 'restart_alt',
      action: () => toggleGoalStatus(goalId, goal.status)
    },
    {
      label: 'Excluir objetivo',
      icon: 'delete',
      action: () => confirmDeleteGoal(goalId),
      danger: true
    }
  ]

  const menuHTML = actions.map(action => `
    <button onclick="${action.action.toString().match(/=> (.*)/)[1]}" style="
      width: 100%;
      padding: 12px 16px;
      border: none;
      background: white;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      color: ${action.danger ? '#EF4444' : 'var(--color-text)'};
      transition: background 0.2s;
    " onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='white'">
      <span class="material-icons-outlined">${action.icon}</span>
      ${action.label}
    </button>
  `).join('')

  showModal({
    title: 'Ações do Objetivo',
    content: `<div style="display: flex; flex-direction: column;">${menuHTML}</div>`,
    size: 'small'
  })
}

async function toggleGoalStatus(goalId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'completed' : 'active'

  const result = await updateGoal(goalId, { status: newStatus })

  if (result.success) {
    showSuccess(newStatus === 'completed' ? 'Objetivo marcado como concluído!' : 'Objetivo reativado!')
    closeModal()
    await loadGoalsPage()
  } else {
    showError(result.message)
  }
}

async function confirmDeleteGoal(goalId) {
  closeModal()

  if (!confirm('Tem certeza que deseja excluir este objetivo?')) {
    return
  }

  const result = await deleteGoal(goalId)

  if (result.success) {
    showSuccess('Objetivo excluído com sucesso!')
    await loadGoalsPage()
  } else {
    showError(result.message)
  }
}

// ============================================
// LOGOUT
// ============================================

async function handleLogout(e) {
  e.preventDefault()

  if (!confirm('Deseja sair da sua conta?')) {
    return
  }

  const result = await signOut()

  if (result.success) {
    showSuccess('Logout realizado com sucesso!')
    setTimeout(() => {
      window.location.href = './login.html'
    }, 1000)
  } else {
    showError('Erro ao fazer logout')
  }
}

// ============================================
// UTILITÁRIOS
// ============================================

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
