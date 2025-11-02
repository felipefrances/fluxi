/**
 * FLUXI - Página de Transações
 */

let currentFilter = 'all'
let addTransactionBtn, logoutBtn, searchInput

;(async () => {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    window.location.href = './login.html'
    return
  }

  await loadUserInfo()
  initializeElements()
  initializeEventListeners()
  await loadTransactions()
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

function initializeElements() {
  addTransactionBtn = document.querySelectorAll('.add-transaction')
  logoutBtn = document.querySelector('.logout')
  searchInput = document.getElementById('searchInput')
}

function initializeEventListeners() {
  addTransactionBtn.forEach(btn => {
    btn.addEventListener('click', () => window.location.href = 'dashboard.html')
  })

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout)
  }

  const filterBtns = document.querySelectorAll('.filter-btn')
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'))
      e.target.classList.add('active')
      currentFilter = e.target.dataset.filter
      loadTransactions()
    })
  })

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterTransactions(e.target.value)
    })
  }
}

async function loadTransactions() {
  const container = document.getElementById('transactionsGrouped')
  const emptyState = document.getElementById('emptyState')

  try {
    const filters = currentFilter === 'all' ? {} : { type: currentFilter }
    const result = await getTransactions({ ...filters, limit: 100, orderBy: 'date', ascending: false })

    if (!result.success || result.data.length === 0) {
      container.style.display = 'none'
      emptyState.style.display = 'flex'
      return
    }

    container.style.display = 'flex'
    emptyState.style.display = 'none'

    const grouped = groupByDate(result.data)
    container.innerHTML = ''

    Object.keys(grouped).forEach(date => {
      const transactions = grouped[date]
      const dateGroup = createDateGroup(date, transactions)
      container.appendChild(dateGroup)
    })
  } catch (error) {
    console.error('Erro ao carregar transações:', error)
    showError('Erro ao carregar transações')
  }
}

function groupByDate(transactions) {
  const grouped = {}

  transactions.forEach(transaction => {
    const date = transaction.date
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(transaction)
  })

  return grouped
}

function createDateGroup(date, transactions) {
  const container = document.createElement('div')
  container.className = 'date-group'

  const dateObj = new Date(date + 'T00:00:00')
  const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  const total = transactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount))
  }, 0)

  const totalClass = total >= 0 ? 'positive' : 'negative'
  const totalSymbol = total >= 0 ? '+' : ''

  container.innerHTML = `
    <div class="date-group-header">
      <h3 class="date-group-title">${dateFormatted}</h3>
      <span class="date-group-total ${totalClass}">${totalSymbol} ${formatCurrency(Math.abs(total))}</span>
    </div>
    <ul class="transactions-list"></ul>
  `

  const list = container.querySelector('.transactions-list')
  transactions.forEach(transaction => {
    const item = createTransactionItem(transaction)
    list.appendChild(item)
  })

  return container
}

function createTransactionItem(transaction) {
  const li = document.createElement('li')
  li.className = 'transaction-item'

  const isIncome = transaction.type === 'income'
  const icon = transaction.categories?.icon || 'attach_money'
  const categoryName = transaction.categories?.name || 'Sem categoria'
  const valueClass = isIncome ? 'income' : 'expense'
  const valueSymbol = isIncome ? '+' : '-'

  li.innerHTML = `
    <span class="material-icons-outlined ${isIncome ? 'income-icon' : 'expense-icon'}">${icon}</span>
    <div>
      <p class="transaction-title">${transaction.description}</p>
      <p class="transaction-type ${valueClass}">${categoryName}</p>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <p class="transaction-value ${valueClass}">${valueSymbol} ${formatCurrency(transaction.amount)}</p>
    </div>
  `

  return li
}

function filterTransactions(query) {
  const allItems = document.querySelectorAll('.transaction-item')
  const lowerQuery = query.toLowerCase()

  allItems.forEach(item => {
    const title = item.querySelector('.transaction-title').textContent.toLowerCase()
    const category = item.querySelector('.transaction-type').textContent.toLowerCase()

    if (title.includes(lowerQuery) || category.includes(lowerQuery)) {
      item.style.display = 'flex'
    } else {
      item.style.display = 'none'
    }
  })
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

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
