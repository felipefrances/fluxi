# Material Icons - Referência para Categorias

Este documento lista os ícones do **Material Icons Outlined** usados no projeto FLUXI.

🔗 **Fonte oficial:** https://fonts.google.com/icons
📦 **CDN:** Carregado via Google Fonts (dashboard.html)

---

## Ícones Configurados no Seed

### 💸 Categorias de Despesas (expense)

| Categoria | Nome do Ícone | Cor | Visualização |
|-----------|---------------|-----|--------------|
| Alimentação | `restaurant` | #EF4444 | 🍽️ |
| Transporte | `directions_car` | #F59E0B | 🚗 |
| Moradia | `home` | #8B5CF6 | 🏠 |
| Saúde | `local_hospital` | #EC4899 | 🏥 |
| Educação | `school` | #3B82F6 | 🎓 |
| Lazer | `sports_esports` | #10B981 | 🎮 |
| Vestuário | `checkroom` | #6366F1 | 👔 |
| Contas | `receipt` | #EF4444 | 🧾 |
| Outros | `category` | #6B7280 | 📦 |

### 💰 Categorias de Receitas (income)

| Categoria | Nome do Ícone | Cor | Visualização |
|-----------|---------------|-----|--------------|
| Salário | `work` | #10B981 | 💼 |
| Freelance | `laptop_mac` | #3B82F6 | 💻 |
| Investimentos | `trending_up` | #8B5CF6 | 📈 |
| Presente | `card_giftcard` | #EC4899 | 🎁 |
| Outros | `attach_money` | #10B981 | 💵 |

---

## Ícones Alternativos Sugeridos

### Alimentação & Bebidas
- `restaurant` - Restaurante (atual)
- `fastfood` - Fast food
- `local_cafe` - Café
- `local_pizza` - Pizza
- `local_bar` - Bar
- `icecream` - Sorvete

### Transporte
- `directions_car` - Carro (atual)
- `local_taxi` - Táxi
- `directions_bus` - Ônibus
- `train` - Trem
- `flight` - Avião
- `two_wheeler` - Moto
- `local_gas_station` - Posto de gasolina

### Moradia
- `home` - Casa (atual)
- `apartment` - Apartamento
- `cottage` - Chalé
- `house` - Casa alternativa

### Saúde
- `local_hospital` - Hospital (atual)
- `medical_services` - Serviços médicos
- `medication` - Medicação
- `healing` - Cura
- `favorite` - Coração

### Educação
- `school` - Escola (atual)
- `menu_book` - Livro
- `auto_stories` - Histórias
- `psychology` - Psicologia

### Lazer
- `sports_esports` - Jogos (atual)
- `movie` - Cinema
- `celebration` - Celebração
- `music_note` - Música
- `sports_soccer` - Futebol
- `beach_access` - Praia

### Vestuário
- `checkroom` - Guarda-roupa (atual)
- `shopping_bag` - Sacola de compras
- `local_mall` - Shopping

### Contas & Finanças
- `receipt` - Recibo (atual)
- `description` - Descrição
- `payment` - Pagamento
- `credit_card` - Cartão de crédito
- `account_balance` - Conta bancária

### Trabalho & Receitas
- `work` - Trabalho (atual)
- `badge` - Crachá
- `business` - Negócio
- `laptop_mac` - Laptop (atual)
- `code` - Código
- `trending_up` - Subindo (atual)
- `show_chart` - Gráfico
- `attach_money` - Dinheiro (atual)
- `paid` - Pago
- `card_giftcard` - Cartão presente (atual)
- `redeem` - Resgatar

### Outros
- `category` - Categoria (atual)
- `more_horiz` - Mais horizontal
- `label` - Etiqueta
- `bookmark` - Marcador

---

## Como Usar

### No HTML
```html
<span class="material-icons-outlined">restaurant</span>
```

### No JavaScript (dashboard.js)
```javascript
const icon = transaction.categories?.icon || 'attach_money'
```

### No Banco de Dados (Supabase)
```sql
INSERT INTO categories (user_id, name, type, icon, color)
VALUES (user_id, 'Alimentação', 'expense', 'restaurant', '#EF4444');
```

---

## Atualizar Categorias Existentes

Se você já tem categorias no banco com ícones antigos, execute este SQL no Supabase:

```sql
-- Atualizar ícones de despesas
UPDATE categories SET icon = 'restaurant' WHERE name = 'Alimentação' AND type = 'expense';
UPDATE categories SET icon = 'directions_car' WHERE name = 'Transporte' AND type = 'expense';
UPDATE categories SET icon = 'home' WHERE name = 'Moradia' AND type = 'expense';
UPDATE categories SET icon = 'local_hospital' WHERE name = 'Saúde' AND type = 'expense';
UPDATE categories SET icon = 'school' WHERE name = 'Educação' AND type = 'expense';
UPDATE categories SET icon = 'sports_esports' WHERE name = 'Lazer' AND type = 'expense';
UPDATE categories SET icon = 'checkroom' WHERE name = 'Vestuário' AND type = 'expense';
UPDATE categories SET icon = 'receipt' WHERE name = 'Contas' AND type = 'expense';
UPDATE categories SET icon = 'category' WHERE name = 'Outros' AND type = 'expense';

-- Atualizar ícones de receitas
UPDATE categories SET icon = 'work' WHERE name = 'Salário' AND type = 'income';
UPDATE categories SET icon = 'laptop_mac' WHERE name = 'Freelance' AND type = 'income';
UPDATE categories SET icon = 'trending_up' WHERE name = 'Investimentos' AND type = 'income';
UPDATE categories SET icon = 'card_giftcard' WHERE name = 'Presente' AND type = 'income';
UPDATE categories SET icon = 'attach_money' WHERE name = 'Outros' AND type = 'income';
```

---

## Notas Importantes

1. **CDN vs Local:** Atualmente usando CDN do Google Fonts (carregamento online)
2. **Style:** Usando `material-icons-outlined` (contorno)
3. **Fallback:** Se o ícone não existir, mostra `attach_money` por padrão
4. **Personalização:** Usuários podem criar categorias personalizadas com qualquer ícone desta lista

---

**Última atualização:** 2025-11-01
