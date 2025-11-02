-- ============================================
-- FLUXI - CORREÇÃO DE SEGURANÇA
-- Fix: Remover SECURITY DEFINER da view dashboard_summary
-- ============================================
--
-- PROBLEMA IDENTIFICADO:
-- A view public.dashboard_summary está com SECURITY DEFINER,
-- o que permite bypass do RLS e exposição de dados de outros usuários.
--
-- SOLUÇÃO:
-- Recriar a view sem SECURITY DEFINER (padrão é SECURITY INVOKER)
-- para que ela respeite as políticas RLS das tabelas base.
--
-- RISCO: ALTO
-- EXECUTE IMEDIATAMENTE no Supabase SQL Editor
-- ============================================

-- ============================================
-- PASSO 1: Remover a view antiga
-- ============================================

DROP VIEW IF EXISTS public.dashboard_summary;

-- ============================================
-- PASSO 2: Recriar a view SEM SECURITY DEFINER
-- ============================================

-- Esta view agora usará SECURITY INVOKER (padrão)
-- Isso significa que ela respeitará as permissões e RLS
-- do usuário que está consultando, não do criador da view

CREATE VIEW public.dashboard_summary
WITH (security_invoker = true) -- Explicitar que deve usar permissões do usuário
AS
SELECT
  user_id,
  -- Saldo total (receitas - despesas)
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS balance,
  -- Total de receitas
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
  -- Total de despesas
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
  -- Contagem de transações
  COUNT(*) AS transaction_count
FROM public.transactions
GROUP BY user_id;

-- ============================================
-- PASSO 3: Restaurar comentário da view
-- ============================================

COMMENT ON VIEW public.dashboard_summary IS 'Resumo consolidado para o dashboard - SECURITY INVOKER para respeitar RLS';

-- ============================================
-- PASSO 4: Garantir permissões corretas
-- ============================================

-- Permitir apenas usuários autenticados
REVOKE ALL ON public.dashboard_summary FROM PUBLIC;
REVOKE ALL ON public.dashboard_summary FROM anon;
GRANT SELECT ON public.dashboard_summary TO authenticated;

-- ============================================
-- PASSO 5: Verificação
-- ============================================

-- Execute esta query para verificar se a correção funcionou:
-- Deve retornar apenas os dados do usuário autenticado atual

/*
SELECT * FROM public.dashboard_summary;

-- Deve retornar apenas 1 linha (a do usuário atual)
-- Se retornar múltiplas linhas, o RLS não está funcionando corretamente
*/

-- ============================================
-- PASSO 6: Verificar configuração da view
-- ============================================

-- Execute para confirmar que security_invoker = true
/*
SELECT
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE viewname = 'dashboard_summary';

-- Verifique se a definição NÃO contém "SECURITY DEFINER"
*/

-- ============================================
-- INFORMAÇÕES ADICIONAIS
-- ============================================

-- Como a view funciona agora:
-- 1. Usuário consulta: SELECT * FROM dashboard_summary
-- 2. Postgres aplica RLS da tabela transactions (auth.uid() = user_id)
-- 3. Usuário vê APENAS seus próprios dados agregados
-- 4. ✅ Seguro e respeitando privacidade

-- Antes (COM security definer):
-- 1. Usuário consulta: SELECT * FROM dashboard_summary
-- 2. Postgres IGNORA RLS (usa permissões do criador)
-- 3. Usuário vê dados agregados de TODOS os usuários
-- 4. ❌ FALHA DE SEGURANÇA

-- ============================================
-- FIM DA CORREÇÃO
-- ============================================
