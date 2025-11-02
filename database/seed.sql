-- ============================================
-- FLUXI - Dados Iniciais (Seed)
-- Categorias padrão para novos usuários
-- ============================================

-- IMPORTANTE: Este script é OPCIONAL
-- Pode ser executado para ter categorias padrão pré-criadas
-- Ou as categorias podem ser criadas pelo próprio usuário na interface

-- ============================================
-- FUNÇÃO: Criar categorias padrão para um usuário
-- ============================================

CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Categorias de DESPESAS (expense)
  -- Usando nomes de ícones do Material Icons Outlined (https://fonts.google.com/icons)
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (p_user_id, 'Alimentação', 'expense', 'restaurant', '#EF4444'),
    (p_user_id, 'Transporte', 'expense', 'directions_car', '#F59E0B'),
    (p_user_id, 'Moradia', 'expense', 'home', '#8B5CF6'),
    (p_user_id, 'Saúde', 'expense', 'local_hospital', '#EC4899'),
    (p_user_id, 'Educação', 'expense', 'school', '#3B82F6'),
    (p_user_id, 'Lazer', 'expense', 'sports_esports', '#10B981'),
    (p_user_id, 'Vestuário', 'expense', 'checkroom', '#6366F1'),
    (p_user_id, 'Contas', 'expense', 'receipt', '#EF4444'),
    (p_user_id, 'Outros', 'expense', 'category', '#6B7280')
  ON CONFLICT (user_id, name, type) DO NOTHING;

  -- Categorias de RECEITAS (income)
  -- Usando nomes de ícones do Material Icons Outlined (https://fonts.google.com/icons)
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (p_user_id, 'Salário', 'income', 'work', '#10B981'),
    (p_user_id, 'Freelance', 'income', 'laptop_mac', '#3B82F6'),
    (p_user_id, 'Investimentos', 'income', 'trending_up', '#8B5CF6'),
    (p_user_id, 'Presente', 'income', 'card_giftcard', '#EC4899'),
    (p_user_id, 'Outros', 'income', 'attach_money', '#10B981')
  ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Criar categorias padrão ao criar perfil
-- ============================================

-- Função que cria categorias padrão quando um novo usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.create_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa após inserção no profiles
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_categories();

-- ============================================
-- DADOS DE EXEMPLO (APENAS PARA TESTES)
-- ============================================

-- ATENÇÃO: Os dados abaixo são apenas para demonstração
-- NÃO execute em produção!
-- Eles requerem um user_id real do Supabase Auth

/*
-- Exemplo de inserção de transações (substitua 'SEU_USER_ID_AQUI' por um UUID real)
DO $$
DECLARE
  demo_user_id UUID := 'SEU_USER_ID_AQUI'; -- Substitua por um UUID real
  cat_alimentacao UUID;
  cat_salario UUID;
BEGIN
  -- Buscar IDs das categorias
  SELECT id INTO cat_alimentacao FROM public.categories
    WHERE user_id = demo_user_id AND name = 'Alimentação' LIMIT 1;

  SELECT id INTO cat_salario FROM public.categories
    WHERE user_id = demo_user_id AND name = 'Salário' LIMIT 1;

  -- Inserir transações de exemplo
  IF cat_alimentacao IS NOT NULL AND cat_salario IS NOT NULL THEN
    INSERT INTO public.transactions (user_id, category_id, type, amount, description, date) VALUES
      (demo_user_id, cat_salario, 'income', 2000.00, 'Salário de Janeiro', '2025-01-05'),
      (demo_user_id, cat_alimentacao, 'expense', 15.00, 'Café da manhã', '2025-01-10'),
      (demo_user_id, cat_alimentacao, 'expense', 35.50, 'Almoço', '2025-01-10'),
      (demo_user_id, cat_alimentacao, 'expense', 20.00, 'Supermercado', '2025-01-11');
  END IF;
END $$;
*/

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON FUNCTION public.create_default_categories IS 'Cria categorias padrão para um novo usuário';

-- ============================================
-- FIM DO SEED
-- ============================================
-- Agora o banco de dados está completo!
-- Configure o frontend para conectar ao Supabase
-- ============================================
