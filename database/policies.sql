-- ============================================
-- FLUXI - Políticas de Segurança RLS
-- Row Level Security (Segurança em Nível de Linha)
-- ============================================

-- IMPORTANTE: Execute este script APÓS executar schema.sql

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: profiles
-- ============================================

-- Usuários podem ler apenas seu próprio perfil
CREATE POLICY "Usuários podem ler seu próprio perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usuários podem deletar apenas seu próprio perfil
CREATE POLICY "Usuários podem deletar seu próprio perfil"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================
-- POLÍTICAS: categories
-- ============================================

-- Usuários podem ler apenas suas próprias categorias
CREATE POLICY "Usuários podem ler suas próprias categorias"
  ON public.categories
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias categorias
CREATE POLICY "Usuários podem criar suas próprias categorias"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas suas próprias categorias
CREATE POLICY "Usuários podem atualizar suas próprias categorias"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas suas próprias categorias
CREATE POLICY "Usuários podem deletar suas próprias categorias"
  ON public.categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: transactions
-- ============================================

-- Usuários podem ler apenas suas próprias transações
CREATE POLICY "Usuários podem ler suas próprias transações"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias transações
CREATE POLICY "Usuários podem criar suas próprias transações"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas suas próprias transações
CREATE POLICY "Usuários podem atualizar suas próprias transações"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas suas próprias transações
CREATE POLICY "Usuários podem deletar suas próprias transações"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: goals
-- ============================================

-- Usuários podem ler apenas seus próprios objetivos
CREATE POLICY "Usuários podem ler seus próprios objetivos"
  ON public.goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios objetivos
CREATE POLICY "Usuários podem criar seus próprios objetivos"
  ON public.goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas seus próprios objetivos
CREATE POLICY "Usuários podem atualizar seus próprios objetivos"
  ON public.goals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas seus próprios objetivos
CREATE POLICY "Usuários podem deletar seus próprios objetivos"
  ON public.goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNÇÃO: Criar perfil automaticamente ao criar usuário
-- ============================================

-- Trigger function para criar perfil quando usuário se cadastra
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

-- Trigger que executa a função acima
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- GRANTS: Permissões públicas
-- ============================================

-- Permitir que usuários autenticados acessem as tabelas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- VERIFICAÇÃO DE POLÍTICAS
-- ============================================

-- Para verificar se as políticas foram criadas corretamente, execute:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- ============================================
-- FIM DAS POLÍTICAS RLS
-- ============================================
-- Próximo passo: Execute seed.sql para popular
-- categorias padrão (opcional)
-- ============================================
