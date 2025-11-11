#!/usr/bin/env node

/**
 * ============================================
 * FLUXI - Teste Automatizado de Integração
 * ============================================
 *
 * Este script testa toda a integração com o Supabase
 */

// Importar configurações
const SUPABASE_URL = 'https://oapaprhanosvxpvjhvfk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGFwcmhhbm9zdnhwdmpodmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NzQ3NDAsImV4cCI6MjA3NzU1MDc0MH0.88gPOehq1IthIJZRVzzEuW7HuBUhPKX0inbV69Hxvxs'

console.log('\n🧪 ===================================')
console.log('   TESTE DE INTEGRAÇÃO - FLUXI')
console.log('=====================================\n')

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const results = {
  passed: 0,
  failed: 0,
  warnings: 0
}

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset)
}

function testResult(name, success, message = '') {
  if (success) {
    results.passed++
    log(`✅ ${name}`, 'green')
    if (message) log(`   ${message}`, 'cyan')
  } else {
    results.failed++
    log(`❌ ${name}`, 'red')
    if (message) log(`   ${message}`, 'red')
  }
}

function warning(name, message) {
  results.warnings++
  log(`⚠️  ${name}`, 'yellow')
  if (message) log(`   ${message}`, 'yellow')
}

// ============================================
// TESTES
// ============================================

async function runTests() {
  // Teste 1: Verificar Credenciais
  log('\n📍 Teste 1: Verificação de Credenciais', 'blue')
  log('─'.repeat(50), 'blue')

  const urlValid = SUPABASE_URL && SUPABASE_URL.includes('supabase.co')
  const keyValid = SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 100

  testResult('URL do Supabase configurada', urlValid, SUPABASE_URL)
  testResult('Chave anon configurada', keyValid, SUPABASE_ANON_KEY.substring(0, 50) + '...')

  // Teste 2: Verificar se consegue fazer fetch básico
  log('\n📍 Teste 2: Conexão com API', 'blue')
  log('─'.repeat(50), 'blue')

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })

    testResult('API respondeu', response.ok || response.status === 404, `Status: ${response.status}`)
  } catch (error) {
    testResult('API respondeu', false, error.message)
  }

  // Teste 3: Testar acesso às tabelas
  log('\n📍 Teste 3: Estrutura do Banco de Dados', 'blue')
  log('─'.repeat(50), 'blue')

  const tables = ['profiles', 'categories', 'transactions', 'goals']

  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        testResult(`Tabela "${table}" existe`, true, 'Acessível via API')
      } else if (response.status === 401 || response.status === 403) {
        warning(`Tabela "${table}"`, 'RLS ativo (bloqueou acesso não autenticado - isso é bom!)')
      } else {
        const errorData = await response.text()
        testResult(`Tabela "${table}" existe`, false, `Status ${response.status}: ${errorData.substring(0, 100)}`)
      }
    } catch (error) {
      testResult(`Tabela "${table}" existe`, false, error.message)
    }
  }

  // Teste 4: Verificar arquivos do projeto
  log('\n📍 Teste 4: Arquivos do Projeto', 'blue')
  log('─'.repeat(50), 'blue')

  const fs = require('fs')
  const path = require('path')

  const requiredFiles = [
    'js/config/supabase-config.js',
    'js/services/auth.service.js',
    'js/login.js',
    'js/signup.js',
    'src/pages/login.html',
    'src/pages/signup.html',
    'src/pages/dashboard.html',
    'database/schema.sql',
    'database/policies.sql'
  ]

  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(__dirname, file))
    testResult(`Arquivo "${file}"`, exists, exists ? 'Encontrado' : 'Não encontrado')
  }

  // Teste 5: Verificar estrutura de arquivos JavaScript
  log('\n📍 Teste 5: Validação de Código', 'blue')
  log('─'.repeat(50), 'blue')

  try {
    const authServiceContent = fs.readFileSync(path.join(__dirname, 'js/services/auth.service.js'), 'utf8')

    const hasSignUp = authServiceContent.includes('function signUp')
    const hasSignIn = authServiceContent.includes('function signIn')
    const hasSignOut = authServiceContent.includes('function signOut')
    const hasGetCurrentUser = authServiceContent.includes('function getCurrentUser')

    testResult('Função signUp implementada', hasSignUp)
    testResult('Função signIn implementada', hasSignIn)
    testResult('Função signOut implementada', hasSignOut)
    testResult('Função getCurrentUser implementada', hasGetCurrentUser)

    // Verificar se usa o cliente supabase corretamente
    const usesSupabaseAuth = authServiceContent.includes('supabase.auth')
    testResult('Usa Supabase Auth corretamente', usesSupabaseAuth)
  } catch (error) {
    testResult('Validação de código', false, error.message)
  }

  // Teste 6: Verificar SQL Schema
  log('\n📍 Teste 6: Schema SQL', 'blue')
  log('─'.repeat(50), 'blue')

  try {
    const schemaContent = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8')

    testResult('Schema possui tabela profiles', schemaContent.includes('CREATE TABLE IF NOT EXISTS public.profiles'))
    testResult('Schema possui tabela categories', schemaContent.includes('CREATE TABLE IF NOT EXISTS public.categories'))
    testResult('Schema possui tabela transactions', schemaContent.includes('CREATE TABLE IF NOT EXISTS public.transactions'))
    testResult('Schema possui tabela goals', schemaContent.includes('CREATE TABLE IF NOT EXISTS public.goals'))
    testResult('Schema possui triggers', schemaContent.includes('CREATE TRIGGER'))
  } catch (error) {
    testResult('Validação de schema', false, error.message)
  }

  // Resumo final
  log('\n📊 ===================================', 'cyan')
  log('   RESUMO DOS TESTES', 'cyan')
  log('=====================================', 'cyan')

  const total = results.passed + results.failed
  const successRate = ((results.passed / total) * 100).toFixed(1)

  log(`\n✅ Testes aprovados: ${results.passed}`, 'green')
  log(`❌ Testes falhados: ${results.failed}`, results.failed > 0 ? 'red' : 'reset')
  log(`⚠️  Avisos: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'reset')
  log(`📊 Taxa de sucesso: ${successRate}%\n`, successRate >= 80 ? 'green' : 'yellow')

  if (results.failed === 0 && results.passed > 0) {
    log('🎉 TODOS OS TESTES PASSARAM!', 'green')
    log('✨ Sua aplicação está pronta para uso!', 'green')
  } else if (successRate >= 80) {
    log('⚠️  A maioria dos testes passou, mas há alguns problemas.', 'yellow')
    log('   Revise os erros acima e corrija-os.', 'yellow')
  } else {
    log('❌ ATENÇÃO: Muitos testes falharam!', 'red')
    log('   Revise sua configuração do Supabase e os arquivos do projeto.', 'red')
  }

  log('\n=====================================\n')

  // Retornar código de saída apropriado
  process.exit(results.failed > 0 ? 1 : 0)
}

// Executar testes
runTests().catch(error => {
  log(`\n❌ ERRO FATAL: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})
