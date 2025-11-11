/**
 * ============================================
 * FLUXI - Dashboard Principal
 * ============================================
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let userName, userNameHeader, balanceEl, expenseEl, goalEl, transactionsList, addTransactionBtn, logoutBtn

// ============================================
// INICIALIZAÇÃO
// ============================================

;(async () => {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    window.location.href = './login.html'
    return
  }

  // Inicializar elementos do DOM
  initializeElements()

  // Inicializar event listeners
  initializeEventListeners()

  // Carregar dados do dashboard
  await loadDashboard()
})()

// ============================================
// INICIALIZAR ELEMENTOS DO DOM
// ============================================

function initializeElements() {
  userName = document.querySelector('.overview-header h2')
  userNameHeader = document.querySelector('.avatar-text .name')
  balanceEl = document.querySelector('.cards .card:nth-child(1) .value')
  expenseEl = document.querySelector('.cards .card:nth-child(2) .value')
  goalEl = document.querySelector('.cards .card:nth-child(3) .value')
  transactionsList = document.querySelector('.transactions-list')
  addTransactionBtn = document.querySelector('.add-transaction')
  logoutBtn = document.querySelector('.logout')

  console.log('Elementos inicializados:')
  console.log('addTransactionBtn:', addTransactionBtn)
  console.log('logoutBtn:', logoutBtn)
}

// ============================================
// INICIALIZAR EVENT LISTENERS
// ============================================

function initializeEventListeners() {
  // Botão de adicionar transação
  if (addTransactionBtn) {
    console.log('Adicionando event listener ao botão de adicionar transação')
    addTransactionBtn.addEventListener('click', (e) => {
      e.preventDefault()
      openAddTransactionModal()
    })
  } else {
    console.error('Botão de adicionar transação não encontrado!')
  }

  // Botão de logout
  if (logoutBtn) {
    console.log('Adicionando event listener ao botão de logout')
    logoutBtn.addEventListener('click', handleLogout)
  } else {
    console.error('Botão de logout não encontrado!')
  }
}

// ============================================
// OBTER SAUDAÇÃO BASEADA NO HORÁRIO
// ============================================

function getGreeting() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'Bom dia'
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde'
  } else {
    return 'Boa noite'
  }
}

// ============================================
// CARREGAR DADOS DO DASHBOARD
// ============================================

async function loadDashboard() {
  try {
    // Mostrar loading
    showLoading()

    // Buscar usuário atual (precisa ser sequencial)
    const user = await getCurrentUser()
    if (user) {
      const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'Usuário'
      const greeting = getGreeting()
      userName.textContent = `${greeting}, ${firstName}!`
      userNameHeader.textContent = user.user_metadata?.full_name || 'Usuário'

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

    // Carregar todos os dados em paralelo para melhor performance
    await Promise.all([
      loadFinancialSummary(),
      loadRecentTransactions(),
      loadExpensesChart(),
      loadNextGoal()
    ])

    // Esconder loading
    hideLoading()
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
    showError('Erro ao carregar dados do dashboard')
    hideLoading()
  }
}

// ============================================
// CARREGAR RESUMO FINANCEIRO
// ============================================

async function loadFinancialSummary() {
  try {
    const result = await getFinancialSummary()

    if (result.success) {
      const { income, expense, balance } = result.data

      // Calcular saldo disponível (saldo total - dinheiro em objetivos)
      let availableBalance = balance
      if (typeof getTotalInGoals === 'function') {
        const totalInGoalsResult = await getTotalInGoals()
        const totalInGoals = totalInGoalsResult.total || 0
        availableBalance = balance - totalInGoals
      }

      // Atualizar cards (mostra saldo disponível, não total)
      balanceEl.textContent = formatCurrency(availableBalance)
      expenseEl.textContent = formatCurrency(expense)

      // Calcular porcentagem de objetivo (exemplo: 60% do saldo desejado)
      // Isso virá de uma meta real depois
      const goalPercentage = 60
      goalEl.textContent = `${goalPercentage}%`
    }
  } catch (error) {
    console.error('Erro ao carregar resumo:', error)
  }
}

// ============================================
// CARREGAR ÚLTIMAS TRANSAÇÕES
// ============================================

async function loadRecentTransactions() {
  try {
    const result = await getTransactions({ limit: 4, orderBy: 'created_at', ascending: false })

    if (result.success && result.data.length > 0) {
      transactionsList.innerHTML = ''

      result.data.forEach(transaction => {
        const li = createTransactionItem(transaction)
        transactionsList.appendChild(li)
      })

      // Adicionar link "Ver todas"
      const viewAllLink = document.createElement('li')
      viewAllLink.style.cssText = 'text-align: center; padding: 16px; margin-top: 8px;'
      viewAllLink.innerHTML = '<a href="transactions.html" style="color: var(--color-primary); text-decoration: none; font-weight: 500; font-size: 13px;">Ver todas as transações →</a>'
      transactionsList.appendChild(viewAllLink)
    } else {
      transactionsList.innerHTML = '<li style="text-align: center; padding: 20px; color: #9CA3AF;">Nenhuma transação encontrada. Adicione sua primeira!</li>'
    }
  } catch (error) {
    console.error('Erro ao carregar transações:', error)
  }
}

// ============================================
// CARREGAR GRÁFICO DE GASTOS DOS ÚLTIMOS 7 DIAS
// ============================================

async function loadExpensesChart() {
  try {
    // Calcular data de 7 dias atrás
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6) // Últimos 7 dias incluindo hoje

    // Buscar transações dos últimos 7 dias
    const result = await getTransactions({
      startDate: sevenDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    })

    if (!result.success) {
      console.error('Erro ao carregar dados do gráfico')
      return
    }

    // Criar array com os últimos 7 dias
    const days = []
    const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push({
        date: date.toISOString().split('T')[0],
        label: dayLabels[date.getDay()],
        income: 0,
        expense: 0
      })
    }

    // Agrupar transações por dia
    result.data.forEach(transaction => {
      const transactionDate = transaction.date
      const day = days.find(d => d.date === transactionDate)

      if (day) {
        if (transaction.type === 'income') {
          day.income += parseFloat(transaction.amount)
        } else {
          day.expense += parseFloat(transaction.amount)
        }
      }
    })

    // Calcular valor máximo para escala
    const maxValue = Math.max(...days.map(d => Math.max(d.income, d.expense)), 1)

    // Renderizar gráfico
    const chartContainer = document.querySelector('.expenses-chart')
    if (!chartContainer) return

    chartContainer.innerHTML = ''

    days.forEach((day) => {
      const barGroup = document.createElement('div')
      barGroup.className = 'bar-group'

      // Calcular altura das barras (porcentagem do máximo)
      const expenseHeight = maxValue > 0 ? (day.expense / maxValue) * 100 : 0
      const incomeHeight = maxValue > 0 ? (day.income / maxValue) * 100 : 0

      // Alternar cores
      const expenseColor = '#9C82FF'
      const incomeColor = '#67E5D2'

      // Se houver ambos, mostrar apenas o maior (ou poderia empilhar)
      const hasTransactions = day.expense > 0 || day.income > 0
      const height = Math.max(expenseHeight, incomeHeight)
      const color = day.expense >= day.income ? expenseColor : incomeColor

      // Criar tooltip customizado
      const tooltipContent = hasTransactions
        ? `<div class="chart-tooltip">
             <div><strong>${day.label}</strong></div>
             <div>Receitas: ${formatCurrency(day.income)}</div>
             <div>Despesas: ${formatCurrency(day.expense)}</div>
           </div>`
        : ''

      barGroup.innerHTML = `
        ${tooltipContent}
        <div class="bar" style="height: ${hasTransactions ? height : 5}%; background-color: ${hasTransactions ? color : '#E5E7EB'};"></div>
        <span class="day-label">${day.label}</span>
      `

      chartContainer.appendChild(barGroup)
    })

  } catch (error) {
    console.error('Erro ao carregar gráfico de gastos:', error)
  }
}

// ============================================
// CRIAR ITEM DE TRANSAÇÃO
// ============================================

function createTransactionItem(transaction) {
  const li = document.createElement('li')
  li.className = 'transaction-item'
  li.setAttribute('data-id', transaction.id)

  const isIncome = transaction.type === 'income'
  const iconClass = isIncome ? 'income-icon' : 'expense-icon'
  const typeText = isIncome ? 'Receita' : 'Despesa'
  const valueClass = isIncome ? 'income' : 'expense'
  const valueSymbol = isIncome ? '+' : '-'
  const categoryName = transaction.categories?.name || 'Sem categoria'
  const icon = transaction.categories?.icon || 'attach_money'

  li.innerHTML = `
    <span class="material-icons-outlined ${iconClass}">${icon}</span>
    <div>
      <p class="transaction-title">${transaction.description}</p>
      <p class="transaction-type ${valueClass}">${categoryName}</p>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <p class="transaction-value ${valueClass}">${valueSymbol} ${formatCurrency(transaction.amount)}</p>
      <div class="transaction-actions">
        <button class="action-btn edit-btn" title="Editar" onclick="editTransaction('${transaction.id}')">
          <span class="material-icons-outlined">edit</span>
        </button>
        <button class="action-btn delete-btn" title="Excluir" onclick="deleteTransactionConfirm('${transaction.id}')">
          <span class="material-icons-outlined">delete</span>
        </button>
      </div>
    </div>
  `

  return li
}

// ============================================
// MODAL DE ADICIONAR TRANSAÇÃO
// ============================================

async function openAddTransactionModal() {
  try {
    // Carregar categorias
    const categoriesIncome = await getCategories('income')
    const categoriesExpense = await getCategories('expense')

    if (!categoriesIncome.success || !categoriesExpense.success) {
      showError('Erro ao carregar categorias')
      return
    }

    const incomeOptions = categoriesIncome.data.map(cat =>
      `<option value="${cat.id}">${cat.name}</option>`
    ).join('')

    const expenseOptions = categoriesExpense.data.map(cat =>
      `<option value="${cat.id}">${cat.name}</option>`
    ).join('')

    const today = new Date().toISOString().split('T')[0]

    const modalContent = `
      <form id="transactionForm" class="transaction-form">
        <div class="form-group">
          <label>Tipo de transação</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" name="type" value="expense" checked />
              <span>Despesa</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="type" value="income" />
              <span>Receita</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Descrição *</label>
          <input type="text" id="description" name="description" placeholder="Ex: Compras no supermercado" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="amount">Valor *</label>
            <input type="number" id="amount" name="amount" step="0.01" min="0.01" placeholder="0,00" required />
          </div>

          <div class="form-group">
            <label for="date">Data *</label>
            <input type="date" id="date" name="date" value="${today}" required />
          </div>
        </div>

        <div class="form-group">
          <label for="category">Categoria *</label>
          <select id="category" name="category" required>
            <optgroup label="Despesas" id="expense-categories">
              ${expenseOptions}
            </optgroup>
            <optgroup label="Receitas" id="income-categories" style="display:none;">
              ${incomeOptions}
            </optgroup>
          </select>
        </div>

        <div class="form-group">
          <label for="notes">Observações (opcional)</label>
          <textarea id="notes" name="notes" rows="3" placeholder="Adicione detalhes..."></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Adicionar transação</button>
        </div>
      </form>
    `

    showModal({
      title: '+ Adicionar transação',
      content: modalContent,
      size: 'medium'
    })

    // Adicionar estilos do formulário
    addFormStyles()

    // Event listeners do formulário
    setupTransactionForm()
  } catch (error) {
    console.error('Erro ao abrir modal:', error)
    showError('Erro ao abrir formulário')
  }
}

// ============================================
// CONFIGURAR FORMULÁRIO DE TRANSAÇÃO
// ============================================

function setupTransactionForm() {
  const form = document.getElementById('transactionForm')
  const typeInputs = form.querySelectorAll('input[name="type"]')
  const expenseCategories = document.getElementById('expense-categories')
  const incomeCategories = document.getElementById('income-categories')

  // Trocar categorias ao mudar tipo
  typeInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      if (e.target.value === 'income') {
        expenseCategories.style.display = 'none'
        incomeCategories.style.display = 'block'
      } else {
        expenseCategories.style.display = 'block'
        incomeCategories.style.display = 'none'
      }
    })
  })

  // Submit do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(form)
    const submitBtn = form.querySelector('button[type="submit"]')

    const transactionData = {
      type: formData.get('type'),
      description: formData.get('description'),
      amount: formData.get('amount'),
      date: formData.get('date'),
      categoryId: formData.get('category'),
      notes: formData.get('notes')
    }

    // Desabilitar botão
    submitBtn.disabled = true
    submitBtn.textContent = 'Adicionando...'

    try {
      const result = await createTransaction(transactionData)

      if (result.success) {
        // Invalidar cache de transações
        if (typeof invalidateTransactionCache === 'function') {
          invalidateTransactionCache()
        }
        showSuccess('Transação adicionada com sucesso!')
        closeModal()
        await loadDashboard() // Recarregar dados
      } else {
        showError(result.message)
        submitBtn.disabled = false
        submitBtn.textContent = 'Adicionar transação'
      }
    } catch (error) {
      showError('Erro ao adicionar transação')
      submitBtn.disabled = false
      submitBtn.textContent = 'Adicionar transação'
    }
  })
}

// ============================================
// EDITAR TRANSAÇÃO
// ============================================

async function editTransaction(transactionId) {
  try {
    // Buscar dados da transação
    const result = await getTransactionById(transactionId)

    if (!result.success) {
      showError('Transação não encontrada')
      return
    }

    const transaction = result.data

    // Carregar categorias
    const categoriesIncome = await getCategories('income')
    const categoriesExpense = await getCategories('expense')

    const incomeOptions = categoriesIncome.data.map(cat =>
      `<option value="${cat.id}" ${transaction.category_id === cat.id ? 'selected' : ''}>${cat.name}</option>`
    ).join('')

    const expenseOptions = categoriesExpense.data.map(cat =>
      `<option value="${cat.id}" ${transaction.category_id === cat.id ? 'selected' : ''}>${cat.name}</option>`
    ).join('')

    const modalContent = `
      <form id="editTransactionForm" class="transaction-form">
        <div class="form-group">
          <label>Tipo de transação</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" name="type" value="expense" ${transaction.type === 'expense' ? 'checked' : ''} />
              <span>Despesa</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="type" value="income" ${transaction.type === 'income' ? 'checked' : ''} />
              <span>Receita</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Descrição *</label>
          <input type="text" id="description" name="description" value="${transaction.description}" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="amount">Valor *</label>
            <input type="number" id="amount" name="amount" step="0.01" min="0.01" value="${transaction.amount}" required />
          </div>

          <div class="form-group">
            <label for="date">Data *</label>
            <input type="date" id="date" name="date" value="${transaction.date}" required />
          </div>
        </div>

        <div class="form-group">
          <label for="category">Categoria *</label>
          <select id="category" name="category" required>
            <optgroup label="Despesas" id="expense-categories" ${transaction.type === 'income' ? 'style="display:none;"' : ''}>
              ${expenseOptions}
            </optgroup>
            <optgroup label="Receitas" id="income-categories" ${transaction.type === 'expense' ? 'style="display:none;"' : ''}>
              ${incomeOptions}
            </optgroup>
          </select>
        </div>

        <div class="form-group">
          <label for="notes">Observações</label>
          <textarea id="notes" name="notes" rows="3">${transaction.notes || ''}</textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar alterações</button>
        </div>
      </form>
    `

    showModal({
      title: 'Editar transação',
      content: modalContent,
      size: 'medium'
    })

    addFormStyles()

    // Setup do formulário de edição
    const form = document.getElementById('editTransactionForm')
    const typeInputs = form.querySelectorAll('input[name="type"]')
    const expenseCategoriesEl = document.getElementById('expense-categories')
    const incomeCategoriesEl = document.getElementById('income-categories')

    typeInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        if (e.target.value === 'income') {
          expenseCategoriesEl.style.display = 'none'
          incomeCategoriesEl.style.display = 'block'
        } else {
          expenseCategoriesEl.style.display = 'block'
          incomeCategoriesEl.style.display = 'none'
        }
      })
    })

    form.addEventListener('submit', async (e) => {
      e.preventDefault()

      const formData = new FormData(form)
      const submitBtn = form.querySelector('button[type="submit"]')

      const updates = {
        type: formData.get('type'),
        description: formData.get('description'),
        amount: formData.get('amount'),
        date: formData.get('date'),
        categoryId: formData.get('category'),
        notes: formData.get('notes')
      }

      submitBtn.disabled = true
      submitBtn.textContent = 'Salvando...'

      try {
        const result = await updateTransaction(transactionId, updates)

        if (result.success) {
          // Invalidar cache de transações
          if (typeof invalidateTransactionCache === 'function') {
            invalidateTransactionCache()
          }
          showSuccess('Transação atualizada com sucesso!')
          closeModal()
          await loadDashboard()
        } else {
          showError(result.message)
          submitBtn.disabled = false
          submitBtn.textContent = 'Salvar alterações'
        }
      } catch (error) {
        showError('Erro ao atualizar transação')
        submitBtn.disabled = false
        submitBtn.textContent = 'Salvar alterações'
      }
    })
  } catch (error) {
    console.error('Erro ao editar transação:', error)
    showError('Erro ao carregar transação')
  }
}

// ============================================
// DELETAR TRANSAÇÃO
// ============================================

async function deleteTransactionConfirm(transactionId) {
  if (!confirm('Tem certeza que deseja excluir esta transação?')) {
    return
  }

  try {
    const result = await deleteTransaction(transactionId)

    if (result.success) {
      // Invalidar cache de transações
      if (typeof invalidateTransactionCache === 'function') {
        invalidateTransactionCache()
      }
      showSuccess('Transação excluída com sucesso!')
      await loadDashboard()
    } else {
      showError(result.message)
    }
  } catch (error) {
    console.error('Erro ao deletar transação:', error)
    showError('Erro ao excluir transação')
  }
}

// ============================================
// CARREGAR PRÓXIMO OBJETIVO
// ============================================

async function loadNextGoal() {
  try {
    // Verificar se o service de goals está disponível
    if (typeof getNextGoal !== 'function') {
      console.log('Service de goals não carregado')
      return
    }

    const result = await getNextGoal()

    if (!result.success || !result.data) {
      // Sem objetivo ativo, mostrar mensagem padrão
      updateGoalCard(null)
      return
    }

    updateGoalCard(result.data)
  } catch (error) {
    console.error('Erro ao carregar objetivo:', error)
  }
}

function updateGoalCard(goal) {
  const goalCard = document.querySelector('.goal-card')
  if (!goalCard) return

  if (!goal) {
    goalCard.innerHTML = `
      <h3>Próximo objetivo</h3>
      <div style="text-align: center; padding: 20px;">
        <span class="material-icons-outlined" style="font-size: 48px; color: #D1D5DB;">flag</span>
        <p style="color: var(--color-gray); margin-top: 12px;">Nenhum objetivo ativo</p>
        <a href="goals.html" style="color: var(--color-primary); text-decoration: none; font-weight: 500; margin-top: 8px; display: inline-block;">Criar objetivo</a>
      </div>
    `
    return
  }

  const progress = goal.target_amount > 0
    ? (goal.current_amount / goal.target_amount) * 100
    : 0
  const progressClamped = Math.min(progress, 100)

  goalCard.innerHTML = `
    <h3>Próximo objetivo</h3>
    <div class="goal-info">
      <p>${goal.name}</p>
      <p class="goal-value">${progressClamped.toFixed(0)}% concluído</p>
    </div>
    <div class="progress-bar">
      <div class="progress" style="width: ${progressClamped}%;"></div>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--color-gray); margin-top: 8px;">
      <span>${formatCurrency(goal.current_amount)}</span>
      <span>${formatCurrency(goal.target_amount)}</span>
    </div>
    <a href="goals.html" style="color: var(--color-primary); text-decoration: none; font-weight: 500; font-size: 13px; margin-top: 12px; display: inline-block;">Ver todos os objetivos →</a>
  `
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

function showLoading() {
  // Implementar loading state se necessário
}

function hideLoading() {
  // Implementar loading state se necessário
}

// ============================================
// ESTILOS DO FORMULÁRIO
// ============================================

function addFormStyles() {
  if (document.getElementById('transaction-form-styles')) return

  const styles = document.createElement('style')
  styles.id = 'transaction-form-styles'
  styles.textContent = `
    .transaction-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 12px;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #5C3FD6;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .radio-group {
      display: flex;
      gap: 12px;
    }

    .radio-option {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      border: 2px solid #D1D5DB;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .radio-option input {
      display: none;
    }

    .radio-option input:checked + span {
      color: white;
    }

    .radio-option:has(input:checked) {
      background: #5C3FD6;
      border-color: #5C3FD6;
      color: white;
    }

    .radio-option span {
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #5C3FD6;
      color: white;
    }

    .btn-primary:hover {
      background: #7B61FF;
    }

    .btn-primary:disabled {
      background: #D1D5DB;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #F3F4F6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #E5E7EB;
    }

    .transaction-actions {
      display: none;
      gap: 4px;
    }

    .transaction-item:hover .transaction-actions {
      display: flex;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: #F3F4F6;
    }

    .action-btn span {
      font-size: 18px;
      color: #6B7280;
    }

    .edit-btn:hover span {
      color: #3B82F6;
    }

    .delete-btn:hover span {
      color: #EF4444;
    }
  `
  document.head.appendChild(styles)
}
