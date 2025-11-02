-- ============================================
-- FLUXI - Sistema de Gestão Financeira Pessoal
-- Schema do Banco de Dados (PostgreSQL/Supabase)
-- ============================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. TABELA: profiles
-- Estende os dados do usuário do Supabase Auth
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. TABELA: categories
-- Categorias de transações (personalizadas por usuário)
-- ============================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT, -- nome do ícone (ex: 'coffee', 'salary', 'shopping')
  color TEXT, -- hex color (ex: '#EF4444')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, name, type)
);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- ============================================
-- 3. TABELA: transactions
-- Lançamentos financeiros (receitas e despesas)
-- ============================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. TABELA: goals
-- Objetivos/Metas financeiras
-- ============================================

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12, 2) DEFAULT 0 CHECK (current_amount >= 0),
  deadline DATE,
  description TEXT,
  icon TEXT,
  color TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. VIEW: dashboard_summary
-- Visão consolidada para o dashboard
-- IMPORTANTE: Usa SECURITY INVOKER para respeitar RLS
-- ============================================

CREATE OR REPLACE VIEW public.dashboard_summary
WITH (security_invoker = true)  -- CRÍTICO: Respeita RLS do usuário, não usa SECURITY DEFINER
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
-- 6. FUNCTION: get_expenses_by_category
-- Retorna despesas agrupadas por categoria
-- ============================================

CREATE OR REPLACE FUNCTION public.get_expenses_by_category(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  category_icon TEXT,
  category_color TEXT,
  total DECIMAL(12, 2),
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.icon,
    c.color,
    COALESCE(SUM(t.amount), 0)::DECIMAL(12, 2) AS total,
    COUNT(t.id) AS transaction_count
  FROM public.categories c
  LEFT JOIN public.transactions t ON t.category_id = c.id
    AND t.user_id = p_user_id
    AND t.type = 'expense'
    AND (p_start_date IS NULL OR t.date >= p_start_date)
    AND (p_end_date IS NULL OR t.date <= p_end_date)
  WHERE c.user_id = p_user_id AND c.type = 'expense'
  GROUP BY c.id, c.name, c.icon, c.color
  ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. COMENTÁRIOS NAS TABELAS (Documentação)
-- ============================================

COMMENT ON TABLE public.profiles IS 'Perfis estendidos dos usuários';
COMMENT ON TABLE public.categories IS 'Categorias personalizadas de receitas e despesas';
COMMENT ON TABLE public.transactions IS 'Lançamentos financeiros (receitas e despesas)';
COMMENT ON TABLE public.goals IS 'Objetivos e metas financeiras dos usuários';
COMMENT ON VIEW public.dashboard_summary IS 'Resumo consolidado para o dashboard - SECURITY INVOKER para respeitar RLS';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
-- Próximo passo: Execute o arquivo policies.sql
-- para configurar as políticas de segurança RLS
-- ============================================
