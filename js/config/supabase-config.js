/**
 * ============================================
 * FLUXI - Configuração do Supabase
 * ============================================
 *
 * Este arquivo configura a conexão com o Supabase
 *
 * IMPORTANTE:
 * 1. Crie uma conta gratuita em https://supabase.com
 * 2. Crie um novo projeto
 * 3. Vá em Settings > API
 * 4. Copie a "URL" e a "anon public" key
 * 5. Substitua os valores abaixo
 */

// ============================================
// CONFIGURAÇÕES - SUBSTITUA PELOS SEUS VALORES
// ============================================

const SUPABASE_URL = 'https://oapaprhanosvxpvjhvfk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGFwcmhhbm9zdnhwdmpodmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NzQ3NDAsImV4cCI6MjA3NzU1MDc0MH0.88gPOehq1IthIJZRVzzEuW7HuBUhPKX0inbV69Hxvxs'

// ============================================
// VALIDAÇÃO DAS CREDENCIAIS
// ============================================

if (SUPABASE_URL === 'https://seu-projeto.supabase.co' ||
    SUPABASE_ANON_KEY === 'sua-chave-anonima-aqui') {
  console.error(
    '⚠️ ERRO: Credenciais do Supabase não configuradas!\n\n' +
    'Por favor, edite o arquivo js/config/supabase-config.js\n' +
    'e adicione suas credenciais do Supabase.\n\n' +
    'Instruções:\n' +
    '1. Acesse https://supabase.com\n' +
    '2. Crie/acesse seu projeto\n' +
    '3. Vá em Settings > API\n' +
    '4. Copie a URL e a anon key\n' +
    '5. Cole no arquivo supabase-config.js'
  )
}

// ============================================
// INICIALIZAÇÃO DO CLIENTE SUPABASE
// ============================================

// Importa o cliente Supabase do CDN
// Certifique-se de que o script está carregado no HTML:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Verificar se o Supabase CDN foi carregado
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase JS não foi carregado! Adicione o script CDN no HTML.')
  throw new Error('Supabase CDN não carregado')
}

// Inicializar cliente Supabase imediatamente
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
console.log('✅ Supabase inicializado com sucesso!')

// ============================================
// EXPORTAR CONFIGURAÇÕES
// ============================================

// Para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_URL, SUPABASE_ANON_KEY, supabase }
}
