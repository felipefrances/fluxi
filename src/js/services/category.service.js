/**
 * ============================================
 * FLUXI - Serviço de Categorias
 * ============================================
 *
 * Gerencia categorias de transações
 */

// ============================================
// LISTAR CATEGORIAS
// ============================================

/**
 * Lista todas as categorias do usuário
 * @param {string} type - 'income', 'expense' ou null (todas)
 * @returns {Promise<Object>}
 */
async function getCategories(type = null) {
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
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Erro ao listar categorias:', error)
    return {
      success: false,
      message: error.message || 'Erro ao listar categorias',
      data: [],
      error
    }
  }
}

/**
 * Busca uma categoria específica por ID
 * @param {string} categoryId - UUID da categoria
 * @returns {Promise<Object>}
 */
async function getCategoryById(categoryId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    return {
      success: false,
      message: error.message || 'Erro ao buscar categoria',
      error
    }
  }
}

// ============================================
// CRIAR CATEGORIA
// ============================================

/**
 * Cria uma nova categoria personalizada
 * @param {Object} categoryData
 * @param {string} categoryData.name - Nome da categoria
 * @param {string} categoryData.type - 'income' ou 'expense'
 * @param {string} categoryData.icon - Nome do ícone (opcional)
 * @param {string} categoryData.color - Cor hex (opcional)
 * @returns {Promise<Object>}
 */
async function createCategory(categoryData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          user_id: user.id,
          name: categoryData.name,
          type: categoryData.type,
          icon: categoryData.icon || 'circle',
          color: categoryData.color || '#9CA3AF'
        }
      ])
      .select()

    if (error) throw error

    return {
      success: true,
      message: 'Categoria criada com sucesso!',
      data: data[0]
    }
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return {
      success: false,
      message: error.message || 'Erro ao criar categoria',
      error
    }
  }
}

// ============================================
// ATUALIZAR CATEGORIA
// ============================================

/**
 * Atualiza uma categoria existente
 * @param {string} categoryId - UUID da categoria
 * @param {Object} updates - Dados a atualizar
 * @returns {Promise<Object>}
 */
async function updateCategory(categoryId, updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .select()

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'Categoria não encontrada'
      }
    }

    return {
      success: true,
      message: 'Categoria atualizada com sucesso!',
      data: data[0]
    }
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return {
      success: false,
      message: error.message || 'Erro ao atualizar categoria',
      error
    }
  }
}

// ============================================
// DELETAR CATEGORIA
// ============================================

/**
 * Deleta uma categoria
 * Nota: Transações vinculadas terão category_id = null
 * @param {string} categoryId - UUID da categoria
 * @returns {Promise<Object>}
 */
async function deleteCategory(categoryId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', user.id)

    if (error) throw error

    return {
      success: true,
      message: 'Categoria deletada com sucesso!'
    }
  } catch (error) {
    console.error('Erro ao deletar categoria:', error)
    return {
      success: false,
      message: error.message || 'Erro ao deletar categoria',
      error
    }
  }
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
