# 📧 Como Confirmar Email Manualmente no Supabase

## Problema

Você criou uma conta mas o link de confirmação aponta para localhost, que não funciona.

## Solução Rápida

### 1. Acessar o Painel do Supabase

1. Vá em: https://app.supabase.com
2. Faça login
3. Selecione seu projeto "fluxi"

### 2. Confirmar Usuário Manualmente

1. No menu lateral, clique em **"Authentication"** (ícone de cadeado 🔐)
2. Clique em **"Users"**
3. Você verá sua conta com status **"⚠️ Email not confirmed"**
4. Clique nos **3 pontinhos (...)** no lado direito da linha
5. Selecione **"Confirm user"** ou **"Verify email"**
6. ✅ Email confirmado!

### 3. Fazer Login

Agora você pode fazer login normalmente:
- Acesse: https://fluxi.vercel.app/pages/login
- Digite seu email e senha
- ✅ Funciona!

---

## Solução Permanente

Para que futuros usuários não tenham esse problema, configure as URLs:

### Configurar Site URL

1. No Supabase, vá em **"Authentication" → "URL Configuration"**
2. Configure:

```
Site URL:
https://fluxi.vercel.app

Redirect URLs (adicione uma por linha):
https://fluxi.vercel.app/**
http://localhost:8000/**
http://localhost:3000/**
```

3. Clique em **"Save"**

---

## O que cada URL faz?

- **Site URL**: URL principal do seu app em produção
- **Redirect URLs**: URLs permitidas para redirecionamento após confirmação de email

Quando você adiciona `https://fluxi.vercel.app/**`, o Supabase vai enviar links de confirmação apontando para o seu site em produção, não para localhost.

---

## Testando

Após configurar, crie uma nova conta de teste e veja que o email de confirmação agora terá o link correto:

```
Antes: localhost:3000/#access_token=...
Depois: https://fluxi.vercel.app/#access_token=...
```

✅ Problema resolvido!
