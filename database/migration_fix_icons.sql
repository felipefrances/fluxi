-- ============================================
-- FLUXI - Migration: Corrigir Ícones das Categorias
-- ============================================
--
-- Este script atualiza os ícones das categorias existentes
-- de nomes antigos para nomes corretos do Material Icons
--
-- Execute este script no Supabase SQL Editor se você já
-- tem categorias criadas com os nomes antigos de ícones
-- ============================================

-- IMPORTANTE: Este script é seguro e pode ser executado múltiplas vezes
-- Ele apenas atualiza os ícones, não afeta transações ou outros dados

BEGIN;

-- ============================================
-- Atualizar ícones de DESPESAS
-- ============================================

-- Alimentação: utensils -> restaurant
UPDATE public.categories
SET icon = 'restaurant'
WHERE type = 'expense'
  AND name = 'Alimentação'
  AND icon IN ('utensils', 'restaurant');

-- Transporte: car -> directions_car
UPDATE public.categories
SET icon = 'directions_car'
WHERE type = 'expense'
  AND name = 'Transporte'
  AND icon IN ('car', 'directions_car');

-- Moradia: home -> home (já está correto, mas garantir)
UPDATE public.categories
SET icon = 'home'
WHERE type = 'expense'
  AND name = 'Moradia'
  AND (icon IS NULL OR icon = 'house' OR icon = 'home');

-- Saúde: heart-pulse -> local_hospital
UPDATE public.categories
SET icon = 'local_hospital'
WHERE type = 'expense'
  AND name = 'Saúde'
  AND icon IN ('heart-pulse', 'heart', 'local_hospital');

-- Educação: graduation-cap -> school
UPDATE public.categories
SET icon = 'school'
WHERE type = 'expense'
  AND name = 'Educação'
  AND icon IN ('graduation-cap', 'school');

-- Lazer: smile -> sports_esports
UPDATE public.categories
SET icon = 'sports_esports'
WHERE type = 'expense'
  AND name = 'Lazer'
  AND icon IN ('smile', 'sports_esports');

-- Vestuário: shirt -> checkroom
UPDATE public.categories
SET icon = 'checkroom'
WHERE type = 'expense'
  AND name = 'Vestuário'
  AND icon IN ('shirt', 'checkroom', 'shopping_bag');

-- Contas: file-text -> receipt
UPDATE public.categories
SET icon = 'receipt'
WHERE type = 'expense'
  AND name = 'Contas'
  AND icon IN ('file-text', 'receipt');

-- Outros: more-horizontal -> category
UPDATE public.categories
SET icon = 'category'
WHERE type = 'expense'
  AND name = 'Outros'
  AND icon IN ('more-horizontal', 'more_horiz', 'category');

-- ============================================
-- Atualizar ícones de RECEITAS
-- ============================================

-- Salário: briefcase -> work
UPDATE public.categories
SET icon = 'work'
WHERE type = 'income'
  AND name = 'Salário'
  AND icon IN ('briefcase', 'work');

-- Freelance: code -> laptop_mac
UPDATE public.categories
SET icon = 'laptop_mac'
WHERE type = 'income'
  AND name = 'Freelance'
  AND icon IN ('code', 'laptop_mac', 'laptop');

-- Investimentos: trending-up -> trending_up (já correto)
UPDATE public.categories
SET icon = 'trending_up'
WHERE type = 'income'
  AND name = 'Investimentos'
  AND icon IN ('trending-up', 'trending_up', 'show_chart');

-- Presente: gift -> card_giftcard
UPDATE public.categories
SET icon = 'card_giftcard'
WHERE type = 'income'
  AND name = 'Presente'
  AND icon IN ('gift', 'card_giftcard', 'redeem');

-- Outros: dollar-sign -> attach_money
UPDATE public.categories
SET icon = 'attach_money'
WHERE type = 'income'
  AND name = 'Outros'
  AND icon IN ('dollar-sign', 'attach_money', 'paid');

-- ============================================
-- Verificar resultados
-- ============================================

-- Mostrar todas as categorias atualizadas
DO $$
DECLARE
  affected_rows INTEGER;
BEGIN
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Total de categorias atualizadas: %', affected_rows;
END $$;

COMMIT;

-- ============================================
-- Consulta para verificar os ícones atuais
-- ============================================

-- Execute esta query para ver o estado atual das suas categorias:
/*
SELECT
  name,
  type,
  icon,
  color,
  COUNT(*) as quantidade_usuarios
FROM public.categories
GROUP BY name, type, icon, color
ORDER BY type, name;
*/

-- ============================================
-- FIM DA MIGRATION
-- ============================================
