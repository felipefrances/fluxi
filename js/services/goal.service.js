/**
 * ============================================
 * FLUXI - Serviço de Objetivos/Metas
 * ============================================
 *
 * Gerencia objetivos financeiros (metas de economia)
 * Modelo similar ao Nubank Caixinhas / PicPay Cofrinhos
 */

// ============================================
// LISTAR OBJETIVOS
// ============================================

/**
 * Lista todos os objetivos do usuário
 * @param {string} status - 'active', 'completed', 'cancelled' ou null (todos)
 * @returns {Promise<Object>}
 */
async function getGoals(status = null) {
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
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Erro ao listar objetivos:', error)
    return {
      success: false,
      message: error.message || 'Erro ao listar objetivos',
      data: [],
      error
    }
  }
}

/**
 * Busca um objetivo específico por ID
 * @param {string} goalId - UUID do objetivo
 * @returns {Promise<Object>}
 */
async function getGoalById(goalId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Erro ao buscar objetivo:', error)
    return {
      success: false,
      message: error.message || 'Erro ao buscar objetivo',
      error
    }
  }
}

/**
 * Busca o próximo objetivo ativo (com maior progresso)
 * @returns {Promise<Object>}
 */
async function getNextGoal() {
  try {
    const result = await getGoals('active')

    if (!result.success || result.data.length === 0) {
      return {
        success: true,
        data: null
      }
    }

    // Ordenar por progresso (maior primeiro)
    const goalsWithProgress = result.data.map(goal => ({
      ...goal,
      progress: goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
    }))

    goalsWithProgress.sort((a, b) => b.progress - a.progress)

    return {
      success: true,
      data: goalsWithProgress[0]
    }
  } catch (error) {
    console.error('Erro ao buscar próximo objetivo:', error)
    return {
      success: false,
      message: error.message || 'Erro ao buscar próximo objetivo',
      error
    }
  }
}

// ============================================
// CRIAR OBJETIVO
// ============================================

/**
 * Cria um novo objetivo
 * @param {Object} goalData
 * @param {string} goalData.name - Nome do objetivo
 * @param {number} goalData.targetAmount - Valor alvo
 * @param {number} goalData.initialAmount - Valor inicial (opcional)
 * @param {string} goalData.deadline - Data limite (opcional)
 * @param {string} goalData.description - Descrição (opcional)
 * @param {string} goalData.icon - Ícone Material Icons (opcional)
 * @param {string} goalData.color - Cor hex (opcional)
 * @returns {Promise<Object>}
 */
async function createGoal(goalData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    // Validações
    if (!goalData.name || !goalData.targetAmount) {
      return {
        success: false,
        message: 'Nome e valor alvo são obrigatórios'
      }
    }

    if (goalData.targetAmount <= 0) {
      return {
        success: false,
        message: 'Valor alvo deve ser maior que zero'
      }
    }

    const { data, error } = await supabase
      .from('goals')
      .insert([
        {
          user_id: user.id,
          name: goalData.name,
          target_amount: goalData.targetAmount,
          current_amount: goalData.initialAmount || 0,
          deadline: goalData.deadline || null,
          description: goalData.description || null,
          icon: goalData.icon || 'flag',
          color: goalData.color || '#5C3FD6',
          status: 'active'
        }
      ])
      .select()

    if (error) throw error

    return {
      success: true,
      message: 'Objetivo criado com sucesso!',
      data: data[0]
    }
  } catch (error) {
    console.error('Erro ao criar objetivo:', error)
    return {
      success: false,
      message: error.message || 'Erro ao criar objetivo',
      error
    }
  }
}

// ============================================
// ATUALIZAR OBJETIVO
// ============================================

/**
 * Atualiza um objetivo existente
 * @param {string} goalId - UUID do objetivo
 * @param {Object} updates - Dados a atualizar
 * @returns {Promise<Object>}
 */
async function updateGoal(goalId, updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'Objetivo não encontrado'
      }
    }

    return {
      success: true,
      message: 'Objetivo atualizado com sucesso!',
      data: data[0]
    }
  } catch (error) {
    console.error('Erro ao atualizar objetivo:', error)
    return {
      success: false,
      message: error.message || 'Erro ao atualizar objetivo',
      error
    }
  }
}

// ============================================
// DELETAR OBJETIVO
// ============================================

/**
 * Deleta um objetivo
 * Se tiver dinheiro guardado, retorna erro (precisa resgatar antes)
 * @param {string} goalId - UUID do objetivo
 * @returns {Promise<Object>}
 */
async function deleteGoal(goalId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    // Verificar se tem dinheiro guardado
    const goalResult = await getGoalById(goalId)
    if (goalResult.success && goalResult.data.current_amount > 0) {
      return {
        success: false,
        message: 'Não é possível excluir objetivo com dinheiro guardado. Resgate o valor primeiro.'
      }
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id)

    if (error) throw error

    return {
      success: true,
      message: 'Objetivo excluído com sucesso!'
    }
  } catch (error) {
    console.error('Erro ao deletar objetivo:', error)
    return {
      success: false,
      message: error.message || 'Erro ao deletar objetivo',
      error
    }
  }
}

// ============================================
// DEPOSITAR NO OBJETIVO
// ============================================

/**
 * Deposita valor no objetivo (separa dinheiro)
 * @param {string} goalId - UUID do objetivo
 * @param {number} amount - Valor a depositar
 * @returns {Promise<Object>}
 */
async function depositToGoal(goalId, amount) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    // Validações
    if (!amount || amount <= 0) {
      return {
        success: false,
        message: 'Valor deve ser maior que zero'
      }
    }

    // Buscar objetivo
    const goalResult = await getGoalById(goalId)
    if (!goalResult.success) {
      return goalResult
    }

    const goal = goalResult.data

    // Verificar saldo disponível (importar da transaction.service.js)
    const summaryResult = await getFinancialSummary()
    if (!summaryResult.success) {
      return {
        success: false,
        message: 'Erro ao verificar saldo disponível'
      }
    }

    // Calcular saldo disponível (saldo - dinheiro em objetivos)
    const totalGoalsResult = await getTotalInGoals()
    const availableBalance = summaryResult.data.balance - totalGoalsResult.total

    if (amount > availableBalance) {
      return {
        success: false,
        message: `Saldo insuficiente. Disponível: ${formatCurrency(availableBalance)}`
      }
    }

    // Atualizar current_amount do objetivo
    const newCurrentAmount = parseFloat(goal.current_amount) + parseFloat(amount)

    // Verificar se completou o objetivo
    const newStatus = newCurrentAmount >= goal.target_amount ? 'completed' : 'active'

    const { data, error } = await supabase
      .from('goals')
      .update({
        current_amount: newCurrentAmount,
        status: newStatus
      })
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()

    if (error) throw error

    return {
      success: true,
      message: newStatus === 'completed'
        ? '🎉 Parabéns! Objetivo concluído!'
        : 'Depósito realizado com sucesso!',
      data: data[0]
    }
  } catch (error) {
    console.error('Erro ao depositar no objetivo:', error)
    return {
      success: false,
      message: error.message || 'Erro ao depositar no objetivo',
      error
    }
  }
}

// ============================================
// RESGATAR DO OBJETIVO
// ============================================

/**
 * Resgata valor do objetivo (devolve para saldo disponível)
 * @param {string} goalId - UUID do objetivo
 * @param {number} amount - Valor a resgatar (ou null para resgatar tudo)
 * @returns {Promise<Object>}
 */
async function withdrawFromGoal(goalId, amount = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    // Buscar objetivo
    const goalResult = await getGoalById(goalId)
    if (!goalResult.success) {
      return goalResult
    }

    const goal = goalResult.data
    const withdrawAmount = amount || goal.current_amount

    // Validações
    if (withdrawAmount <= 0) {
      return {
        success: false,
        message: 'Valor deve ser maior que zero'
      }
    }

    if (withdrawAmount > goal.current_amount) {
      return {
        success: false,
        message: 'Valor maior que o disponível no objetivo'
      }
    }

    // Atualizar current_amount do objetivo
    const newCurrentAmount = parseFloat(goal.current_amount) - parseFloat(withdrawAmount)

    const { data, error } = await supabase
      .from('goals')
      .update({
        current_amount: newCurrentAmount,
        status: newCurrentAmount === 0 && goal.status === 'completed' ? 'active' : goal.status
      })
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()

    if (error) throw error

    return {
      success: true,
      message: 'Resgate realizado com sucesso!',
      data: data[0]
    }
  } catch (error) {
    console.error('Erro ao resgatar do objetivo:', error)
    return {
      success: false,
      message: error.message || 'Erro ao resgatar do objetivo',
      error
    }
  }
}

// ============================================
// TOTAL EM OBJETIVOS
// ============================================

/**
 * Retorna o total de dinheiro guardado em objetivos ativos
 * @returns {Promise<Object>}
 */
async function getTotalInGoals() {
  try {
    const result = await getGoals('active')

    if (!result.success) {
      return { total: 0 }
    }

    const total = result.data.reduce((sum, goal) => {
      return sum + parseFloat(goal.current_amount || 0)
    }, 0)

    return {
      success: true,
      total
    }
  } catch (error) {
    console.error('Erro ao calcular total em objetivos:', error)
    return { total: 0 }
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

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getGoals,
    getGoalById,
    getNextGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    depositToGoal,
    withdrawFromGoal,
    getTotalInGoals
  }
}
