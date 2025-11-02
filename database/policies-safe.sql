-- ============================================
-- FLUXI - Políticas de Segurança RLS (VERSÃO SEGURA)
-- Row Level Security (Segurança em Nível de Linha)
-- ============================================

-- IMPORTANTE: Execute APÓS schema.sql

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.goals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Usuários podem ler seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem deletar seu próprio perfil" ON public.profiles;

-- Categories
DROP POLICY IF EXISTS "Usuários podem ler suas próprias categorias" ON public.categories;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias categorias" ON public.categories;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias categorias" ON public.categories;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias categorias" ON public.categories;

-- Transactions
DROP POLICY IF EXISTS "Usuários podem ler suas próprias transações" ON public.transactions;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias transações" ON public.transactions;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias transações" ON public.transactions;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias transações" ON public.transactions;

-- Goals
DROP POLICY IF EXISTS "Usuários podem ler seus próprios objetivos" ON public.goals;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios objetivos" ON public.goals;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios objetivos" ON public.goals;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios objetivos" ON public.goals;

-- ============================================
-- CRIAR POLÍTICAS: profiles
-- ============================================

CREATE POLICY "Usuários podem ler seu próprio perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem deletar seu próprio perfil"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================
-- CRIAR POLÍTICAS: categories
-- ============================================

CREATE POLICY "Usuários podem ler suas próprias categorias"
  ON public.categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias categorias"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias categorias"
  ON public.categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CRIAR POLÍTICAS: transactions
-- ============================================

CREATE POLICY "Usuários podem ler suas próprias transações"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias transações"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias transações"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CRIAR POLÍTICAS: goals
-- ============================================

CREATE POLICY "Usuários podem ler seus próprios objetivos"
  ON public.goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios objetivos"
  ON public.goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios objetivos"
  ON public.goals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios objetivos"
  ON public.goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CRIAR FUNÇÃO: handle_new_user
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CRIAR TRIGGER: on_auth_user_created
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- GRANTS: Permissões
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ✅ Deve retornar 16 políticas (4 por tabela)
