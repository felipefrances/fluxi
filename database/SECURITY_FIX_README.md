# 🔒 Correção de Segurança: dashboard_summary View

## ⚠️ Problema Identificado

**Alerta do Supabase:** View `public.dashboard_summary` definida com `SECURITY DEFINER`

### O que isso significa?

Quando uma view é criada com `SECURITY DEFINER`:
- A view executa com as **permissões do criador** (definer)
- **NÃO** usa as permissões do usuário que está consultando
- **BYPASSA** as políticas de Row Level Security (RLS)
- Usuários podem ver dados que não deveriam ter acesso

### Risco de Segurança

#### 🔴 RISCO: ALTO

Com `SECURITY DEFINER`, a view `dashboard_summary`:
- ❌ Permite que qualquer usuário veja dados agregados de **TODOS os usuários**
- ❌ Bypassa completamente o RLS da tabela `transactions`
- ❌ Viola princípio de "least privilege"
- ❌ Exposição de dados financeiros sensíveis

**Exemplo do problema:**
```sql
-- Usuário João consulta:
SELECT * FROM dashboard_summary;

-- COM security_definer (PROBLEMA):
-- Retorna dados de: João, Maria, Pedro, Ana... (TODOS!)

-- SEM security_definer (CORRETO):
-- Retorna dados de: João (apenas)
```

---

## ✅ Solução Aplicada

### 1. Correção Imediata no Supabase

**Execute este arquivo no SQL Editor do Supabase:**
```bash
database/fix_dashboard_summary_security.sql
```

Este script:
1. Remove a view antiga com SECURITY DEFINER
2. Recria a view com `security_invoker = true`
3. Configura permissões corretas
4. Adiciona verificações de segurança

### 2. Atualização do Schema

O arquivo `schema.sql` foi atualizado para incluir:
```sql
CREATE OR REPLACE VIEW public.dashboard_summary
WITH (security_invoker = true)  -- ✅ Respeita RLS do usuário
AS
SELECT ...
```

### 3. Como Funciona Agora

```
┌─────────────────────────────────────────────┐
│ Usuário consulta dashboard_summary          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ View usa SECURITY INVOKER                   │
│ (permissões do usuário atual)               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Postgres aplica RLS da tabela transactions │
│ WHERE auth.uid() = user_id                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ ✅ Usuário vê APENAS seus próprios dados   │
└─────────────────────────────────────────────┘
```

---

## 📋 Checklist de Implementação

### Passo a Passo

- [ ] **1. Backup** - Faça backup do banco antes de executar
- [ ] **2. Execute** `fix_dashboard_summary_security.sql` no Supabase SQL Editor
- [ ] **3. Verifique** se a correção funcionou:
  ```sql
  -- Deve retornar apenas 1 linha (seus dados)
  SELECT * FROM dashboard_summary;
  ```
- [ ] **4. Confirme** que security_invoker está ativo:
  ```sql
  SELECT viewname, definition
  FROM pg_views
  WHERE viewname = 'dashboard_summary';
  -- Deve conter "security_invoker = true"
  ```
- [ ] **5. Teste** com outro usuário para garantir isolamento de dados
- [ ] **6. Resolva** o alerta no Supabase Security Advisor

---

## 🧪 Testes de Validação

### Teste 1: Verificar Isolamento de Dados

```sql
-- Como Usuário A
SELECT * FROM dashboard_summary;
-- Deve retornar: 1 linha (dados do Usuário A)

-- Como Usuário B
SELECT * FROM dashboard_summary;
-- Deve retornar: 1 linha (dados do Usuário B)
```

### Teste 2: Verificar RLS Está Ativo

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'transactions';
-- rowsecurity deve ser: true
```

### Teste 3: Verificar Políticas RLS

```sql
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'transactions';
-- Deve mostrar políticas com auth.uid() = user_id
```

---

## 🔍 Monitoramento Futuro

### Evitar Regressão

1. **Nunca** use `SECURITY DEFINER` em views que acessam dados de usuários
2. **Sempre** use `WITH (security_invoker = true)` em views
3. **Teste** RLS após cada mudança no schema
4. **Monitore** alertas do Supabase Security Advisor

### Views Seguras vs. Inseguras

#### ✅ SEGURO (SECURITY INVOKER)
```sql
CREATE VIEW my_view
WITH (security_invoker = true)
AS SELECT ...;
```

#### ❌ INSEGURO (SECURITY DEFINER)
```sql
CREATE VIEW my_view
WITH (security_definer = true)  -- NUNCA FAÇA ISSO!
AS SELECT ...;
```

---

## 📚 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL View Security](https://www.postgresql.org/docs/current/sql-createview.html)
- [OWASP Access Control](https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control)

---

## 🆘 Troubleshooting

### Problema: "Nenhum dado retornado após correção"

**Causa:** RLS pode estar bloqueando corretamente
**Solução:** Verifique se o usuário está autenticado:
```sql
SELECT auth.uid(); -- Deve retornar um UUID, não NULL
```

### Problema: "Ainda vejo dados de outros usuários"

**Causa:** Script de correção não foi executado
**Solução:** Execute `fix_dashboard_summary_security.sql` novamente

### Problema: "Erro de permissão ao acessar view"

**Causa:** Permissões não configuradas
**Solução:**
```sql
GRANT SELECT ON public.dashboard_summary TO authenticated;
```

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique os logs do Supabase
2. Teste RLS com `SELECT auth.uid()`
3. Revise as políticas RLS em `policies.sql`
4. Execute queries de verificação incluídas no script de correção

---

**Status:** ✅ Correção aplicada
**Data:** 2025-11-01
**Prioridade:** 🔴 CRÍTICA
**Impacto:** Segurança de dados de todos os usuários
