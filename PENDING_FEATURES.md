# ✅ Funcionalidades Pendentes - FLUXI

~~Este documento lista as funcionalidades que ainda precisam ser implementadas.~~

**STATUS: TODAS AS FUNCIONALIDADES FORAM IMPLEMENTADAS! 🎉**

Veja o documento `IMPLEMENTATION_COMPLETE.md` para detalhes completos da implementação.

---

## ✅ STATUS DAS IMPLEMENTAÇÕES

- ✅ **Página de Perfil do Usuário** - Implementada em `7f08bed`
- ✅ **Sistema de Tema Claro/Escuro** - Implementado em `c3fc23a`

---

## 1. 👤 Página de Perfil do Usuário

### Localização
- Criar: `/src/pages/profile.html`
- CSS: `/src/styles/profile.css`
- JS: `/js/profile.js`

### Funcionalidades Necessárias

#### 1.1 Edição de Dados do Perfil
- Nome completo
- Email (somente leitura, vem do Supabase Auth)
- Alterar senha
- Botão "Salvar alterações"

#### 1.2 Upload de Foto de Perfil

**Armazenamento no Supabase Storage:**

```sql
-- Criar bucket de avatars no Supabase
-- Painel: Storage → New Bucket
-- Nome: avatars
-- Public: true
```

**Atualizar tabela profiles:**
```sql
ALTER TABLE public.profiles
ADD COLUMN avatar_url TEXT;
```

**Service de Upload (criar `profile.service.js`):**
```javascript
async function uploadAvatar(file) {
  const { data: { user } } = await supabase.auth.getUser()
  const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Atualizar profiles
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  return publicUrl
}
```

#### 1.3 Exibir Foto no Avatar

**Atualizar `dashboard.js`, `goals.js`, `transactions.js`:**

```javascript
async function loadUserInfo() {
  const user = await getCurrentUser()
  if (user) {
    const userNameEl = document.querySelector('.avatar-text .name')
    const avatarIcon = document.querySelector('.avatar-icon')

    if (userNameEl) {
      userNameEl.textContent = user.user_metadata?.full_name || 'Usuário'
    }

    // Buscar avatar do banco
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (data?.avatar_url && avatarIcon) {
      avatarIcon.style.backgroundImage = `url(${data.avatar_url})`
      avatarIcon.style.backgroundSize = 'cover'
      avatarIcon.innerHTML = '' // Remove ícone
    }
  }
}
```

**CSS do Avatar:**
```css
.avatar-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: var(--color-primary);
  background-position: center;
  background-repeat: no-repeat;
}
```

---

## 2. 🌓 Sistema de Tema Claro/Escuro

### Paleta de Cores - Tema Escuro

```css
/* src/styles/theme-dark.css */

[data-theme="dark"] {
  /* Backgrounds */
  --color-bg: #1a1a1a;
  --color-white: #2d2d2d;

  /* Text */
  --color-text: #e5e5e5;
  --color-gray: #a0a0a0;

  /* Primary (mantém roxa mas ajusta luminosidade) */
  --color-primary: #7B61FF;

  /* Cards */
  --card-bg: #2d2d2d;
  --card-border: #3d3d3d;

  /* Inputs */
  --input-bg: #252525;
  --input-border: #404040;

  /* Sidebar */
  --sidebar-bg: #242424;
  --sidebar-border: #333;

  /* Gradientes (cards principais) */
  --gradient-start: #7B61FF;
  --gradient-end: #5C3FD6;
}
```

### Implementação

#### 2.1 Toggle de Tema

**HTML (adicionar na página de configurações):**
```html
<div class="theme-switcher">
  <label>
    <span>Tema escuro</span>
    <input type="checkbox" id="themeToggle">
  </label>
</div>
```

#### 2.2 Service de Tema (`theme.service.js`)

```javascript
function initTheme() {
  const savedTheme = localStorage.getItem('fluxi_theme') || 'light'
  setTheme(savedTheme)
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('fluxi_theme', theme)
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light'
  const newTheme = current === 'light' ? 'dark' : 'light'
  setTheme(newTheme)
}

// Inicializar automaticamente
initTheme()
```

#### 2.3 Incluir em Todas as Páginas

```html
<link rel="stylesheet" href="../styles/theme-dark.css" />
<script src="../../js/services/theme.service.js"></script>
```

**Adicionar listener:**
```javascript
document.getElementById('themeToggle')?.addEventListener('change', toggleTheme)
```

### Teste de Contraste (Importante!)

Verificar legibilidade em:
- ✅ Texto sobre fundo
- ✅ Botões primários
- ✅ Cards
- ✅ Gráficos
- ✅ Ícones

Use: https://webaim.org/resources/contrastchecker/

---

## 3. 📝 Checklist de Implementação

### Página de Perfil
- [ ] Criar `profile.html`
- [ ] Criar `profile.css`
- [ ] Criar `profile.js`
- [ ] Criar `profile.service.js`
- [ ] Criar bucket `avatars` no Supabase
- [ ] Adicionar coluna `avatar_url` na tabela `profiles`
- [ ] Implementar upload de foto
- [ ] Atualizar avatar em todas as páginas
- [ ] Atualizar link da sidebar

### Tema Escuro
- [ ] Criar `theme-dark.css`
- [ ] Criar `theme.service.js`
- [ ] Adicionar toggle nas configurações
- [ ] Incluir scripts em todas as páginas
- [ ] Testar contraste de todas as cores
- [ ] Ajustar cores específicas se necessário

---

## 4. 🎨 Exemplo de Estrutura de Perfil

```html
<!-- profile.html -->
<section class="profile-section">
  <div class="profile-card">
    <h2>Meu Perfil</h2>

    <div class="profile-avatar-section">
      <div class="profile-avatar">
        <img id="avatarPreview" src="" alt="Avatar">
        <span class="material-icons-outlined">person</span>
      </div>
      <input type="file" id="avatarInput" accept="image/*" hidden>
      <button class="btn-secondary" onclick="document.getElementById('avatarInput').click()">
        Alterar foto
      </button>
    </div>

    <form id="profileForm">
      <div class="form-group">
        <label>Nome completo</label>
        <input type="text" id="fullName" required>
      </div>

      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" readonly>
      </div>

      <div class="form-group">
        <label>Nova senha (opcional)</label>
        <input type="password" id="newPassword">
      </div>

      <button type="submit" class="btn-primary">Salvar alterações</button>
    </form>
  </div>
</section>
```

---

## 5. 📚 Recursos Úteis

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Dark Mode Best Practices](https://web.dev/prefers-color-scheme/)

---

**Última atualização:** 2025-11-02
**Status:** Documentação completa para implementação
