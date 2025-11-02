# 🔧 Guia de Configuração do Supabase - Fluxi

## 📋 Índice
1. [Criar Conta no Supabase](#1-criar-conta-no-supabase)
2. [Criar Projeto](#2-criar-projeto)
3. [Executar Scripts SQL](#3-executar-scripts-sql)
4. [Obter Credenciais](#4-obter-credenciais)
5. [Configurar no Projeto](#5-configurar-no-projeto)
6. [Testar Conexão](#6-testar-conexão)
7. [Verificar Políticas RLS](#7-verificar-políticas-rls)

---

## 1. Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub, Google ou email
4. ✅ Conta criada!

---

## 2. Criar Projeto

1. No dashboard, clique em **"New Project"**

2. Preencha os dados:
   - **Name:** `fluxi` (ou outro nome)
   - **Database Password:** Crie uma senha forte (GUARDE!)
   - **Region:** `South America (São Paulo)` (mais próximo)
   - **Pricing Plan:** `Free` (0$/mês)

3. Clique em **"Create new project"**

4. ⏳ Aguarde 1-2 minutos enquanto o projeto é provisionado

5. ✅ Projeto criado!

---

## 3. Executar Scripts SQL

### 3.1. Abrir SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### 3.2. Executar Schema (Tabelas)

1. Abra o arquivo `database/schema.sql` no VS Code
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. ✅ Deve aparecer: "Success. No rows returned"

### 3.3. Executar Policies (Segurança)

1. Clique em **"New query"** novamente
2. Abra o arquivo `database/policies.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**
6. ✅ Deve aparecer: "Success. No rows returned"

### 3.4. Executar Seed (Categorias Padrão) - OPCIONAL

1. Clique em **"New query"**
2. Abra o arquivo `database/seed.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**
6. ✅ Pronto! Categorias padrão serão criadas automaticamente para novos usuários

---

## 4. Obter Credenciais

### 4.1. Acessar Settings > API

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**

### 4.2. Copiar Credenciais

Você verá duas informações importantes:

**📍 Project URL:**
```
https://abc123xyz.supabase.co
```

**🔑 Project API keys > anon public:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:**
- ✅ A chave `anon public` pode ser exposta no frontend
- ❌ NUNCA exponha a chave `service_role` (ela tem acesso total)

---

## 5. Configurar no Projeto

### 5.1. Editar supabase-config.js

1. Abra o arquivo: `js/config/supabase-config.js`

2. Substitua os valores:

```javascript
const SUPABASE_URL = 'https://abc123xyz.supabase.co' // Cole sua URL aqui
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUz...' // Cole sua chave anon aqui
```

3. Salve o arquivo

4. ✅ Configuração completa!

---

## 6. Testar Conexão

### 6.1. Abrir Página no Navegador

1. Abra qualquer página HTML do projeto (ex: `index.html`)
2. Abra o **DevTools** do navegador (F12)
3. Vá na aba **Console**

### 6.2. Verificar Mensagens

Você deve ver:

```
✅ Supabase inicializado com sucesso!
```

Se aparecer erro:
```
❌ Supabase JS não foi carregado!
```
→ Verifique se o script CDN está no HTML

Se aparecer:
```
⚠️ ERRO: Credenciais do Supabase não configuradas!
```
→ Você esqueceu de configurar o supabase-config.js

---

## 7. Verificar Políticas RLS

### 7.1. Acessar Table Editor

1. No menu lateral do Supabase, clique em **"Table Editor"**
2. Você verá as tabelas criadas:
   - `profiles`
   - `categories`
   - `transactions`
   - `goals`

### 7.2. Verificar RLS Ativado

1. Clique em qualquer tabela (ex: `transactions`)
2. No topo da tela, você verá um escudo 🛡️ com:
   - **"RLS enabled"** ✅
   - **"4 policies active"**

3. Clique em **"View policies"** para ver as regras

### 7.3. Entender as Políticas

Exemplo de política na tabela `transactions`:

```sql
Policy: "Usuários podem ler suas próprias transações"
Command: SELECT
Using: (auth.uid() = user_id)
```

Isso significa:
- Um usuário só consegue **ler** transações onde o `user_id` = ID dele
- Impossível ver transações de outros usuários 🔒

---

## 8. Testar Cadastro de Usuário

### 8.1. Teste Manual

1. Abra a página `pages/cadastro.html` no navegador
2. Preencha o formulário:
   - **Nome:** Teste Silva
   - **Email:** teste@email.com
   - **Senha:** 123456
   - **Telefone:** (85) 99999-9999

3. Clique em **"Criar conta"**

4. ✅ Deve aparecer mensagem de sucesso

### 8.2. Verificar no Supabase

1. No Supabase Dashboard, vá em **"Authentication"** > **"Users"**
2. Você verá o usuário criado com:
   - Email: teste@email.com
   - Status: ⚠️ Não confirmado (até clicar no link do email)

3. Vá em **"Table Editor"** > **"profiles"**
4. Você verá o perfil criado automaticamente (graças ao trigger!)

5. Vá em **"Table Editor"** > **"categories"**
6. Você verá as categorias padrão criadas automaticamente!

---

## 9. Estrutura do Banco de Dados

### Diagrama de Relacionamentos

```
┌─────────────────┐
│   auth.users    │ (Gerenciado pelo Supabase)
│   - id (PK)     │
│   - email       │
│   - password    │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│    profiles     │
│   - id (PK/FK)  │───┐
│   - full_name   │   │
│   - avatar_url  │   │
│   - phone       │   │
└─────────────────┘   │
                      │
                      │ 1:N
         ┌────────────┼────────────┬────────────┐
         ▼            ▼            ▼            ▼
┌─────────────┐ ┌──────────────┐ ┌────────┐ ┌────────┐
│ categories  │ │ transactions │ │ goals  │ │  ...   │
│ - id (PK)   │ │ - id (PK)    │ │ - id   │ │        │
│ - user_id   │ │ - user_id    │ │ - user │ │        │
│ - name      │ │ - category_id│ │  _id   │ │        │
│ - type      │ │ - amount     │ │ - name │ │        │
│ - icon      │ │ - date       │ │ - goal │ │        │
└─────────────┘ └──────────────┘ └────────┘ └────────┘
```

---

## 10. Dicas e Boas Práticas

### ✅ DO's (Faça)

- ✅ Use as políticas RLS para proteger dados
- ✅ Sempre teste com múltiplos usuários
- ✅ Use `auth.uid()` para filtrar dados por usuário
- ✅ Faça backup dos scripts SQL
- ✅ Use variáveis de ambiente em produção

### ❌ DON'Ts (Não faça)

- ❌ Nunca desabilite RLS em produção
- ❌ Nunca exponha a chave `service_role`
- ❌ Nunca confie apenas na validação frontend
- ❌ Nunca hardcode credenciais no código
- ❌ Nunca delete dados de produção sem backup

---

## 11. Comandos Úteis SQL

### Ver todos os usuários
```sql
SELECT * FROM auth.users;
```

### Ver perfis com emails
```sql
SELECT p.*, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id;
```

### Ver transações de um usuário específico
```sql
SELECT * FROM transactions
WHERE user_id = 'cole-uuid-aqui'
ORDER BY date DESC;
```

### Limpar todas as transações (CUIDADO!)
```sql
DELETE FROM transactions;
```

### Ver resumo de gastos por categoria
```sql
SELECT
  c.name,
  SUM(t.amount) as total
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.type = 'expense'
GROUP BY c.name
ORDER BY total DESC;
```

---

## 12. Troubleshooting (Resolução de Problemas)

### Erro: "row-level security policy"

**Problema:** Tentando acessar dados sem autenticação

**Solução:**
1. Verifique se o usuário está logado: `await supabase.auth.getUser()`
2. Verifique se as políticas RLS existem
3. Verifique se o `user_id` está correto

---

### Erro: "duplicate key value violates unique constraint"

**Problema:** Tentando inserir dado duplicado

**Solução:**
1. Verifique constraints UNIQUE nas tabelas
2. Use `ON CONFLICT DO NOTHING` ou `DO UPDATE`

---

### Dados não aparecem no frontend

**Checklist:**
1. [ ] Usuário está autenticado?
2. [ ] RLS está habilitado?
3. [ ] Políticas estão corretas?
4. [ ] Dados realmente existem no banco?
5. [ ] Console do navegador mostra erros?

---

## 13. Recursos Adicionais

- 📚 **Documentação Oficial:** https://supabase.com/docs
- 🎥 **Tutoriais em Vídeo:** https://www.youtube.com/@Supabase
- 💬 **Discord da Comunidade:** https://discord.supabase.com
- 🐛 **GitHub Issues:** https://github.com/supabase/supabase

---

## ✅ Checklist Final

- [ ] Conta no Supabase criada
- [ ] Projeto criado (região São Paulo)
- [ ] Scripts SQL executados (schema + policies + seed)
- [ ] Credenciais copiadas
- [ ] Arquivo supabase-config.js configurado
- [ ] Conexão testada no console
- [ ] RLS verificado nas tabelas
- [ ] Cadastro de usuário testado
- [ ] Categorias padrão criadas automaticamente

---

🎉 **Parabéns! Seu Supabase está configurado e pronto para uso!**

Próximo passo: Implementar as páginas HTML e conectar com os serviços JavaScript.

---

**Dúvidas?** Consulte a documentação oficial ou pergunte no grupo da equipe!
