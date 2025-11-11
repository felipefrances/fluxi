/**
 * ============================================
 * FLUXI - Serviço de Transações
 * ============================================
 *
 * Gerencia todas as operações CRUD de transações
 */

// ============================================
// CRIAR TRANSAÇÃO
// ============================================

/**
 * Cria uma nova transação
 * @param {Object} transactionData
 * @param {string} transactionData.type - 'income' ou 'expense'
 * @param {number} transactionData.amount - Valor da transação
 * @param {string} transactionData.description - Descrição
 * @param {string} transactionData.categoryId - UUID da categoria
 * @param {string} transactionData.date - Data (YYYY-MM-DD)
 * @param {string} transactionData.notes - Observações (opcional)
 * @returns {Promise<Object>}
 */
async function createTransaction(transactionData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: user.id,
          type: transactionData.type,
          amount: parseFloat(transactionData.amount),
          description: transactionData.description,
          category_id: transactionData.categoryId || null,
          date: transactionData.date,
          notes: transactionData.notes || null
        }
      ])
      .select()

    if (error) throw error

    return {
      success: true,
      message: 'Transação criada com sucesso!',
      data: data[0]
    }
  } catch (error) {
    console.error('Erro ao criar transação:', error)
    return {
      success: false,
      message: error.message || 'Erro ao criar transação',
      error
    }
  }
}

// ============================================
// LISTAR TRANSAÇÕES
// ============================================

/**
 * Lista transações do usuário com filtros opcionais
 * @param {Object} filters - Filtros opcionais
 * @param {string} filters.type - 'income', 'expense' ou null (todas)
 * @param {string} filters.startDate - Data inicial (YYYY-MM-DD)
 * @param {string} filters.endDate - Data final (YYYY-MM-DD)
 * @param {string} filters.categoryId - Filtrar por categoria
 * @param {number} filters.limit - Limite de resultados (padrão: 50)
 * @param {string} filters.orderBy - Campo para ordenar (padrão: 'date')
 * @param {boolean} filters.ascending - Ordem crescente? (padrão: false)
 * @returns {Promise<Object>}
 */
async function getTransactions(filters = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado',
        data: []
      }
    }

    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        )
      `)
      .eq('user_id', user.id)

    // Aplicar filtros
    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.startDate) {
      query = query.gte('date', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('date', filters.endDate)
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    // Ordenação
    const orderBy = filters.orderBy || 'date'
    const ascending = filters.ascending || false
    query = query.order(orderBy, { ascending })

    // Limite
    const limit = filters.limit || 50
    query = query.limit(limit)

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    }
  } catch (error) {
    console.error('Erro ao listar transações:', error)
    return {
      success: false,
      message: error.message || 'Erro ao listar transações',
      data: [],
      error
    }
  }
}

// ============================================
// BUSCAR TRANSAÇÃO POR ID
// ============================================

/**
 * Busca uma transação específica por ID
 * @param {string} transactionId - UUID da transação
 * @returns {Promise<Object>}
 */
async function getTransactionById(transactionId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color,
          type
        )
      `)
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    if (!data) {
      return {
        success: false,
        message: 'Transação não encontrada'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Erro ao buscar transação:', error)
    return {
      success: false,
      message: error.message || 'Erro ao buscar transação',
      error
    }
  }
}

// ============================================
// ATUALIZAR TRANSAÇÃO
// ============================================

/**
 * Atualiza uma transação existente
 * @param {string} transactionId - UUID da transação
 * @param {Object} updates - Dados a atualizar
 * @returns {Promise<Object>}
 */
async function updateTransaction(transactionId, updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    // Preparar dados para update
    const updateData = {}

    if (updates.type) updateData.type = updates.type
    if (updates.amount) updateData.amount = parseFloat(updates.amount)
    if (updates.description) updateData.description = updates.description
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.date) updateData.date = updates.date
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'Transação não encontrada ou você não tem permissão para editá-la'
      }
    }

    return {
      success: true,
      message: 'Transação atualizada com sucesso!',
      data: data[0]
    }
  } catch (error) {
    console.error('Erro ao atualizar transação:', error)
    return {
      success: false,
      message: error.message || 'Erro ao atualizar transação',
      error
    }
  }
}

// ============================================
// DELETAR TRANSAÇÃO
// ============================================

/**
 * Deleta uma transação
 * @param {string} transactionId - UUID da transação
 * @returns {Promise<Object>}
 */
async function deleteTransaction(transactionId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (error) throw error

    return {
      success: true,
      message: 'Transação deletada com sucesso!'
    }
  } catch (error) {
    console.error('Erro ao deletar transação:', error)
    return {
      success: false,
      message: error.message || 'Erro ao deletar transação',
      error
    }
  }
}

// ============================================
// ESTATÍSTICAS E RESUMOS
// ============================================

/**
 * Calcula o resumo financeiro (saldo, receitas, despesas)
 * @param {string} startDate - Data inicial (opcional)
 * @param {string} endDate - Data final (opcional)
 * @returns {Promise<Object>}
 */
async function getFinancialSummary(startDate = null, endDate = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    let query = supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', user.id)

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    // Calcular totais
    const income = data
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const expense = data
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const balance = income - expense

    return {
      success: true,
      data: {
        income: income.toFixed(2),
        expense: expense.toFixed(2),
        balance: balance.toFixed(2),
        transactionCount: data.length
      }
    }
  } catch (error) {
    console.error('Erro ao calcular resumo:', error)
    return {
      success: false,
      message: error.message || 'Erro ao calcular resumo',
      error
    }
  }
}

/**
 * Obtém gastos agrupados por categoria
 * @param {string} startDate - Data inicial (opcional)
 * @param {string} endDate - Data final (opcional)
 * @returns {Promise<Object>}
 */
async function getExpensesByCategory(startDate = null, endDate = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado',
        data: []
      }
    }

    let query = supabase
      .from('transactions')
      .select(`
        amount,
        categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('user_id', user.id)
      .eq('type', 'expense')

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    // Agrupar por categoria
    const grouped = {}

    data.forEach(transaction => {
      const category = transaction.categories
      if (!category) return

      if (!grouped[category.id]) {
        grouped[category.id] = {
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          total: 0,
          count: 0
        }
      }

      grouped[category.id].total += parseFloat(transaction.amount)
      grouped[category.id].count++
    })

    // Converter para array e ordenar por total
    const result = Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .map(cat => ({
        ...cat,
        total: cat.total.toFixed(2)
      }))

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Erro ao obter gastos por categoria:', error)
    return {
      success: false,
      message: error.message || 'Erro ao obter gastos por categoria',
      data: [],
      error
    }
  }
}

/**
 * Obtém transações dos últimos N dias agrupadas por dia
 * @param {number} days - Número de dias (padrão: 7)
 * @returns {Promise<Object>}
 */
async function getTransactionsByDay(days = 7) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado',
        data: []
      }
    }

    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('transactions')
      .select('date, type, amount')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error

    // Agrupar por data
    const grouped = {}

    data.forEach(transaction => {
      const date = transaction.date
      if (!grouped[date]) {
        grouped[date] = {
          date,
          income: 0,
          expense: 0
        }
      }

      if (transaction.type === 'income') {
        grouped[date].income += parseFloat(transaction.amount)
      } else {
        grouped[date].expense += parseFloat(transaction.amount)
      }
    })

    return {
      success: true,
      data: Object.values(grouped)
    }
  } catch (error) {
    console.error('Erro ao obter transações por dia:', error)
    return {
      success: false,
      message: error.message || 'Erro ao obter transações por dia',
      data: [],
      error
    }
  }
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary,
    getExpensesByCategory,
    getTransactionsByDay
  }
}
