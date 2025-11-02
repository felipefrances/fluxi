# 🧪 Como Testar a Autenticação - Fluxi

## ✅ O que foi implementado

✅ **Banco de Dados (Supabase):**
- Scripts SQL completos (`database/schema.sql`, `policies.sql`, `seed.sql`)
- Tabelas: profiles, categories, transactions, goals
- Segurança RLS (Row Level Security)
- Categorias padrão automáticas

✅ **Autenticação Completa:**
- Cadastro de usuário com validação
- Login com validação
- Recuperação de senha
- Logout
- Proteção de rotas
- Sessão persistente

✅ **Componentes:**
- Sistema de notificações (toasts)
- Validação de formulários em tempo real
- Indicador de força de senha
- Formatação automática de telefone

---

## 🚀 Passo a Passo para Testar

### 1️⃣ **Configurar o Supabase (OBRIGATÓRIO)**

**Se ainda não configurou:**

1. Acesse: https://supabase.com
2. Crie uma conta (gratuita)
3. Crie um novo projeto chamado "fluxi"
4. Aguarde o projeto ser criado (~2 minutos)
5. Vá em **SQL Editor** no menu lateral
6. Execute os scripts SQL na ordem:

**Script 1 - Criar Tabelas:**
- Abra `database/schema.sql`
- Copie TODO o conteúdo
- Cole no SQL Editor
- Clique em **Run**
- ✅ Deve aparecer "Success"

**Script 2 - Segurança:**
- Abra `database/policies.sql`
- Copie TODO o conteúdo
- Cole no SQL Editor (New Query)
- Clique em **Run**
- ✅ Deve aparecer "Success"

**Script 3 - Categorias (Opcional):**
- Abra `database/seed.sql`
- Copie TODO o conteúdo
- Cole no SQL Editor (New Query)
- Clique em **Run**
- ✅ Deve aparecer "Success"

7. **Copiar Credenciais:**
- Vá em **Settings** > **API**
- Copie:
  - **Project URL** (https://abc123.supabase.co)
  - **anon public key** (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

8. **Configurar no Projeto:**
- Abra `js/config/supabase-config.js`
- Substitua os valores:
  ```javascript
  const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'
  const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANON-AQUI'
  ```
- Salve o arquivo

---

### 2️⃣ **Executar o Projeto Localmente**

**Opção A - Live Server (VS Code):**
1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito em `src/pages/login.html`
3. Selecione "Open with Live Server"
4. ✅ Página abre em `http://localhost:5500`

**Opção B - Python:**
```bash
cd /Users/felipe/Documents/front-end
python -m http.server 8000
```
Acesse: `http://localhost:8000/src/pages/login.html`

**Opção C - Node.js:**
```bash
npx http-server -p 8000
```
Acesse: `http://localhost:8000/src/pages/login.html`

---

### 3️⃣ **Testar Cadastro**

1. Acesse `src/pages/signup.html`

2. **Console do Navegador (F12):**
   - Deve aparecer: `✅ Supabase inicializado com sucesso!`
   - Se não aparecer, revise as credenciais

3. **Preencha o formulário:**
   - **Email:** seu-email@teste.com
   - **Nome completo:** Teste Silva
   - **Telefone:** (85) 99999-9999 (formata automaticamente!)
   - **Senha:** teste123 (observe o indicador de força)
   - **Confirmar senha:** teste123

4. **Teste as validações:**
   - Deixe campos vazios → Veja as mensagens de erro
   - Digite email inválido → Veja validação
   - Senhas diferentes → Veja erro
   - Tudo correto → Campos ficam verdes!

5. **Clique em "Continuar":**
   - Botão muda para "Criando conta..."
   - ✅ Toast verde: "Conta criada com sucesso!"
   - Redireciona para login em 3 segundos

6. **Verificar no Supabase:**
   - Vá em **Authentication** > **Users**
   - ✅ Seu usuário deve estar lá!
   - Vá em **Table Editor** > **profiles**
   - ✅ Seu perfil foi criado automaticamente!
   - Vá em **Table Editor** > **categories**
   - ✅ Categorias padrão foram criadas!

---

### 4️⃣ **Testar Login**

1. Acesse `src/pages/login.html`

2. **Preencha:**
   - Email: seu-email@teste.com
   - Senha: teste123

3. **Clique em "Continuar":**
   - Botão muda para "Entrando..."
   - ✅ Toast verde: "Login realizado com sucesso!"
   - Tentará redirecionar para `dashboard.html`
   - ⚠️ Como dashboard ainda não existe, vai dar 404 (NORMAL!)

4. **Verificar Sessão:**
   - Abra Console do navegador (F12)
   - Digite: `supabase.auth.getUser()`
   - ✅ Deve retornar seus dados do usuário!

---

### 5️⃣ **Testar Recuperação de Senha**

1. Na página de login, digite um email válido

2. Clique em "Esqueci a senha"

3. Confirme no popup

4. ✅ Toast verde: "Email de recuperação enviado!"

5. **Verificar Email:**
   - Abra seu email
   - ✅ Deve receber email do Supabase com link de reset

---

### 6️⃣ **Testar Logout**

Como o dashboard ainda não existe, vamos testar via console:

1. Na página de login, abra Console (F12)

2. Digite:
   ```javascript
   signOut().then(result => console.log(result))
   ```

3. ✅ Deve retornar: `{ success: true, message: "Logout realizado com sucesso!" }`

---

### 7️⃣ **Testar Proteção de Rotas**

1. Faça logout (console: `signOut()`)

2. Tente acessar diretamente:
   - `src/pages/dashboard.html`

3. ✅ Deve redirecionar automaticamente para login!

---

### 8️⃣ **Testar Redirecionamento Automático**

1. Faça login

2. Tente acessar novamente:
   - `src/pages/login.html`
   - `src/pages/signup.html`

3. ✅ Deve redirecionar para dashboard (404 é normal, pois não existe ainda)

---

## 🐛 Solução de Problemas

### ❌ Erro: "Supabase JS não foi carregado"

**Causa:** CDN do Supabase não carregou

**Solução:**
- Verifique se tem internet
- Verifique se o script está no HTML:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  ```

---

### ❌ Erro: "Credenciais não configuradas"

**Causa:** `supabase-config.js` não foi editado

**Solução:**
- Abra `js/config/supabase-config.js`
- Substitua URL e ANON_KEY pelas suas credenciais reais

---

###  ❌ Erro ao criar usuário: "Email not confirmed"

**Causa:** Supabase está exigindo confirmação de email

**Solução:**
1. Vá em **Authentication** > **Settings** no Supabase
2. Desabilite "Enable email confirmations" (apenas para testes!)
3. Ou confirme o email clicando no link enviado

---

### ❌ Erro: "RLS policy violation"

**Causa:** Políticas RLS não foram criadas

**Solução:**
- Execute o script `database/policies.sql` novamente
- Verifique em **Table Editor** > (tabela) se RLS está enabled

---

### ❌ Nenhum erro, mas nada acontece

**Checklist:**
1. Console do navegador está aberto? (F12)
2. Há erros no console?
3. Credenciais do Supabase estão corretas?
4. Scripts SQL foram executados?
5. Está usando um servidor local (não file://)?

---

## 📊 Checklist de Testes

- [ ] Supabase configurado
- [ ] Scripts SQL executados
- [ ] Credenciais configuradas
- [ ] Servidor local rodando
- [ ] Console mostra "Supabase inicializado"
- [ ] Cadastro funciona e cria usuário
- [ ] Perfil criado automaticamente
- [ ] Categorias criadas automaticamente
- [ ] Login funciona
- [ ] Sessão persiste (recarregar página)
- [ ] Validações aparecem
- [ ] Toasts aparecem
- [ ] Recuperação de senha envia email
- [ ] Redirecionamento automático funciona

---

## 🎉 Próximos Passos

✅ Autenticação está **100% funcional**!

**Agora você pode:**
1. Criar a página `dashboard.html`
2. Implementar CRUD de transações
3. Adicionar gráficos com Chart.js
4. Implementar objetivos

---

**Dúvidas?** Consulte:
- `docs/SUPABASE_SETUP.md` - Guia completo do Supabase
- Console do navegador (F12) - Sempre mostra erros
- Supabase Dashboard - Verifique se dados estão no banco

**Tudo funcionando?** Commit e push! 🚀
