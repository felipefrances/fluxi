# 🎯 Instruções de Configuração - Página de Perfil

Este documento contém as instruções para configurar o sistema de perfil de usuário com upload de fotos no Supabase.

## ✅ O que já foi implementado

- ✅ Página de perfil (`profile.html`) com formulário completo
- ✅ Estilos da página de perfil (`profile.css`)
- ✅ Service para upload de avatar (`profile.service.js`)
- ✅ Lógica da página (`profile.js`)
- ✅ Integração com todas as páginas (dashboard, goals, transactions)
- ✅ Links da sidebar atualizados
- ✅ Exibição de avatar em todas as páginas

## 📋 Passos Manuais Necessários no Supabase

### Passo 1: Criar o Bucket de Storage para Avatares

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique no botão **New Bucket**
5. Preencha os campos:
   - **Name:** `avatars`
   - **Public:** ✅ **Marque como TRUE** (para permitir acesso público às imagens)
6. Clique em **Create Bucket**

### Passo 2: Configurar Políticas de Storage (RLS)

Após criar o bucket, você precisa configurar as políticas de acesso:

1. Ainda em **Storage**, clique no bucket `avatars`
2. Vá na aba **Policies**
3. Clique em **New Policy**

#### Política 1: Permitir Upload (INSERT)
```sql
-- Nome: Users can upload their own avatar
-- Operação: INSERT
-- Target roles: authenticated

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Política 2: Permitir Leitura Pública (SELECT)
```sql
-- Nome: Avatar images are publicly accessible
-- Operação: SELECT
-- Target roles: public, authenticated

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Política 3: Permitir Atualização (UPDATE)
```sql
-- Nome: Users can update their own avatar
-- Operação: UPDATE
-- Target roles: authenticated

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Política 4: Permitir Exclusão (DELETE)
```sql
-- Nome: Users can delete their own avatar
-- Operação: DELETE
-- Target roles: authenticated

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Passo 3: Adicionar Coluna `avatar_url` na Tabela Profiles

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o seguinte SQL (ou use o arquivo `migrations/add_avatar_to_profiles.sql`):

```sql
-- Migration: Add avatar_url column to profiles table
-- Date: 2025-11-02
-- Description: Adds avatar_url column to store user profile photos from Supabase Storage

-- Add avatar_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image stored in Supabase Storage avatars bucket';
```

4. Clique em **Run** para executar a migração

### Passo 4: Verificar se tudo está funcionando

1. Acesse a página de perfil no aplicativo
2. Clique em "Alterar foto de perfil"
3. Selecione uma imagem (máx. 5MB)
4. Aguarde o upload
5. Verifique se a foto aparece:
   - Na página de perfil
   - No canto superior direito de todas as páginas

## 🔧 Solução de Problemas

### Erro: "The resource already exists"
- O bucket `avatars` já foi criado. Verifique se o nome está correto.

### Erro: "new row violates row-level security policy"
- As políticas de RLS não foram configuradas corretamente. Revise o Passo 2.

### Erro: "Failed to upload image"
- Verifique se o bucket está marcado como **Public**
- Verifique se as políticas de storage foram criadas
- Verifique a conexão com o Supabase no arquivo `supabase-config.js`

### Avatar não aparece após upload
- Limpe o cache do navegador (Ctrl + Shift + R)
- Verifique no Supabase Storage se o arquivo foi enviado
- Verifique no banco se a coluna `avatar_url` foi atualizada na tabela `profiles`

## 📁 Arquivos Criados

```
/src/pages/profile.html           - Página de perfil HTML
/src/styles/profile.css            - Estilos da página de perfil
/js/profile.js                     - Lógica da página de perfil
/js/services/profile.service.js    - Service para upload e gerenciamento de perfil
/migrations/add_avatar_to_profiles.sql - Migração SQL para adicionar coluna avatar_url
```

## 📚 Referências

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads/standard-uploads)

---

**Última atualização:** 2025-11-02
**Status:** Implementação completa - Aguardando configuração do Supabase
