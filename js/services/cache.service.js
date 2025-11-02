/**
 * ============================================
 * FLUXI - Serviço de Cache
 * ============================================
 *
 * Gerencia cache local para melhorar performance
 * Usa localStorage com expiração
 */

// Tempo de cache padrão: 5 minutos
const DEFAULT_CACHE_TIME = 5 * 60 * 1000

// ============================================
// SALVAR NO CACHE
// ============================================

/**
 * Salva dados no cache com expiração
 * @param {string} key - Chave do cache
 * @param {any} data - Dados a serem cachea dos
 * @param {number} ttl - Tempo de vida em milissegundos (opcional)
 */
function setCache(key, data, ttl = DEFAULT_CACHE_TIME) {
  try {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(`fluxi_cache_${key}`, JSON.stringify(item))
  } catch (error) {
    console.error('Erro ao salvar cache:', error)
  }
}

// ============================================
// OBTER DO CACHE
// ============================================

/**
 * Obtém dados do cache se ainda válidos
 * @param {string} key - Chave do cache
 * @returns {any|null} Dados do cache ou null se expirado/inexistente
 */
function getCache(key) {
  try {
    const item = localStorage.getItem(`fluxi_cache_${key}`)

    if (!item) {
      return null
    }

    const parsed = JSON.parse(item)
    const now = Date.now()

    // Verificar se expirou
    if (now - parsed.timestamp > parsed.ttl) {
      // Remover cache expirado
      localStorage.removeItem(`fluxi_cache_${key}`)
      return null
    }

    return parsed.data
  } catch (error) {
    console.error('Erro ao obter cache:', error)
    return null
  }
}

// ============================================
// LIMPAR CACHE
// ============================================

/**
 * Remove um item específico do cache
 * @param {string} key - Chave do cache
 */
function clearCache(key) {
  try {
    localStorage.removeItem(`fluxi_cache_${key}`)
  } catch (error) {
    console.error('Erro ao limpar cache:', error)
  }
}

/**
 * Remove todos os caches do FLUXI
 */
function clearAllCache() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('fluxi_cache_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Erro ao limpar todos os caches:', error)
  }
}

// ============================================
// INVALIDAR CACHE RELACIONADO
// ============================================

/**
 * Invalida caches relacionados a transações
 * (útil após criar/editar/deletar transação)
 */
function invalidateTransactionCache() {
  clearCache('financial_summary')
  clearCache('recent_transactions')
  clearCache('expenses_chart')
  clearCache('next_goal')
  clearCache('total_in_goals')
}

/**
 * Invalida caches relacionados a objetivos
 * (útil após criar/editar/deletar objetivo)
 */
function invalidateGoalCache() {
  clearCache('goals_active')
  clearCache('goals_completed')
  clearCache('goals_all')
  clearCache('next_goal')
  clearCache('total_in_goals')
  clearCache('financial_summary') // Saldo disponível depende de objetivos
}

// ============================================
// WRAPPER PARA FUNÇÕES COM CACHE
// ============================================

/**
 * Executa função com cache automático
 * @param {string} key - Chave do cache
 * @param {Function} fn - Função assíncrona a executar
 * @param {number} ttl - Tempo de vida do cache (opcional)
 * @returns {Promise<any>}
 */
async function withCache(key, fn, ttl = DEFAULT_CACHE_TIME) {
  // Tentar obter do cache
  const cached = getCache(key)
  if (cached !== null) {
    console.log(`✅ Cache hit: ${key}`)
    return cached
  }

  console.log(`❌ Cache miss: ${key}`)

  // Executar função e cachear resultado
  const result = await fn()
  setCache(key, result, ttl)

  return result
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setCache,
    getCache,
    clearCache,
    clearAllCache,
    invalidateTransactionCache,
    invalidateGoalCache,
    withCache
  }
}
