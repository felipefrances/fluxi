```
CENTRO UNIVERSITÁRIO FAMETRO - UNIFAMETRO
Curso: Análise e Desenvolvimento de Sistemas
Disciplina: Projeto de Extensão 2 (Semestre 2025.2)
Fortaleza / CE - 2025
```

---

## Equipe

**Equipe de Desenvolvimento:**
- Antonio Olavo Bezerra Vieira
- Caio Lucas Da Silva Lima
- Sara da Silva Cavalcante
- Felipe Frances Guimarães
- Rivena Nobre Diógenes
- Raphael da Costa Pimenta
- Julio Eduardo Coelho da Silva
- Ítalo Gabriel Silva Miranda
- Marcio Gabriel Lopes de Melo

**Supervisor:** Prof. Abraão Henrique S. Rosal

---

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

# Sistema de Gestão Financeira Pessoal

## Sumário

1. [Sobre o Projeto](#1-sobre-o-projeto)
2. [Funcionalidades Principais](#2-funcionalidades-principais)
3. [Stack Tecnológica e Arquitetura](#3-stack-tecnológica-e-arquitetura)
4. [Como Executar o Projeto](#4-como-executar-o-projeto)
5. [Metodologia de Desenvolvimento](#5-metodologia-de-desenvolvimento)
6. [Contexto Acadêmico e Referencial Teórico](#6-contexto-acadêmico-e-referencial-teórico)
7. [Licença](#7-licença)

---

## 1. Sobre o Projeto

### Contexto

A equipe identificou a dificuldade recorrente de estudantes universitários e jovens no início de sua vida profissional em manter controle de suas finanças pessoais. Muitos não utilizam planilhas ou aplicativos e acabam perdendo a noção dos gastos diários, resultando em endividamento ou falta de poupança.

### Problema

A ausência de ferramentas simples e gratuitas para controle financeiro pessoal entre estudantes e jovens no início da vida profissional, aliada à falta de conhecimento financeiro básico, contribui para dificuldades no planejamento de despesas e organização orçamentária.

### Demanda Social e Justificativa

A demanda social é clara: na nossa sociedade, o endividamento é um problema crescente. Por isso, percebemos que jovens e adultos necessitam de apoio para organizar suas finanças e compreender melhor sua relação com o dinheiro. Academicamente, o projeto propicia a integração entre teoria e prática, conectando conhecimentos de tecnologia, design e gestão de projetos a uma demanda social relevante.

### Objetivos

1. Incentivar a comunidade acadêmica e seus familiares a desenvolver hábitos de controle de gastos e planejamento financeiro pessoal.
2. Auxiliar na identificação e superação dos principais problemas enfrentados pela população em relação à gestão de suas finanças.
3. Promover a educação financeira por meio de ferramentas tecnológicas que facilitem o acompanhamento do orçamento e a tomada de decisões conscientes.

---

## 2. Funcionalidades Principais

- **Autenticação:** Cadastro (Sign Up), Login (Sign In) e Recuperação de Senha
- **Dashboard:** Visão geral com saldo atual, gráficos de despesas por categoria e fluxo de receitas vs. despesas
- **Gestão de Transações:** CRUD completo (Criar, Ler, Atualizar, Deletar) para entradas (income) e saídas (expense)
- **Categorias:** Gerenciamento de categorias personalizadas
- **Histórico:** Tela de listagem com todas as transações, com filtros e paginação
- **Perfil:** Atualização de dados do usuário (nome, avatar)

---

## 3. Stack Tecnológica e Arquitetura

### Stack de Tecnologia

- **Linguagem:** TypeScript
- **Framework Frontend:** Next.js (App Router)
- **Backend & DB:** Supabase (BaaS - Postgres)
- **Autenticação:** Supabase Auth (JWT + RLS)
- **Estilização:** TailwindCSS
- **Componentes UI:** Shadcn-UI
- **Gráficos:** Tremor ou Recharts
- **Validação:** Zod

### Arquitetura

**Modelo:** Frontend + BaaS (Backend as a Service)

- **Frontend:** Aplicação Next.js estaticamente gerada (SSG) para a landing page e renderizada no lado do servidor (SSR/CSR) para o dashboard do aplicativo. Hospedada na Vercel.
- **Backend:** O Supabase gerencia o banco de dados Postgres, a autenticação de usuários e as APIs (REST e Realtime).
- **Segurança:** A comunicação é direta do cliente (Next.js) para o Supabase, protegida por tokens JWT e políticas de Row Level Security (RLS) no banco de dados, garantindo que usuários só acessem seus próprios dados.

---

## 4. Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase

### Passos

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/front-end.git
cd front-end
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env.local` na raiz do projeto e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Execute o projeto em modo de desenvolvimento:**

```bash
npm run dev
```

5. **Acesse a aplicação:**

Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000)

---

## 5. Metodologia de Desenvolvimento

### Metodologia Ágil

O projeto adota metodologia ágil (Scrum/Kanban) com sprints quinzenais, proporcionando ciclos curtos de desenvolvimento e feedback contínuo.

### Ferramentas de Gestão e Desenvolvimento

- **Trello:** Gestão de tarefas e sprints
- **GitHub:** Versionamento de código e colaboração
- **Google Docs:** Elaboração de relatórios acadêmicos
- **Google Meet:** Reuniões de planejamento e retrospectivas
- **Figma:** Prototipação de interfaces
- **Vercel:** Deploy do frontend
- **Supabase:** Backend como serviço e banco de dados

### Plano de Ação Resumido

- **Sprints 1-2 (Agosto/Setembro):** Levantamento de requisitos e prototipação no Figma
- **Sprints 3-5 (Setembro/Outubro):** Implementação de autenticação e CRUD de transações
- **Sprints 6-8 (Novembro/Dezembro):** Finalização do MVP (Dashboard, Histórico), testes, elaboração de relatórios (ABNT) e apresentação no simpósio

---

## 6. Contexto Acadêmico e Referencial Teórico

O planejamento financeiro pessoal é um elemento central para a qualidade de vida e a prevenção do endividamento. Após a estabilização do Plano Real em 1994, embora tenha havido aumento no poder de compra, a falta de hábitos de poupança e planejamento resultou em elevados níveis de endividamento (FARIA, 2008). Atualmente, pesquisas apontam que o comprometimento da renda das famílias com dívidas alcançou patamares alarmantes, evidenciando a necessidade de ferramentas acessíveis de apoio ao planejamento financeiro (GRÄF; GRÄF, 2013). Nesse contexto, soluções digitais se apresentam como alternativas viáveis, democratizando o acesso a práticas de educação financeira e contribuindo para a melhoria da qualidade de vida (GOMES, 2023).

### Referências

- FARIA, Daymes Henrique. **Planejamento financeiro como qualidade de vida e estratégia de combate ao endividamento do brasileiro.** Mariana: UFOP, 2023.

- FARIA, Luiz Henrique Chaves de. **Planejamento financeiro pessoal.** Brasília: UniCEUB, 2008.

- GIARETA, Marisa. **Planejamento financeiro pessoal: uma proposta de controle de fluxo de caixa para orçamento familiar.** Porto Alegre: UFRGS, 2011.

- GOMES, Júlia da Silva. **A tecnologia da informação como apoio ao planejamento financeiro pessoal.** Franca: FATEC Dr. Thomaz Novelino, 2023.

- GRÄF, Claudir Olipio; GRÄF, Marleni. Planejamento financeiro: fugindo das dívidas. **Revista da Universidade Vale do Rio Verde**, Três Corações, v. 11, n. 2, p. 183–191, 2013.

- SANTANA, Marcos Vinicius de Almeida et al. Verificar se alunos cursando tecnologia em gestão financeira desenvolveram planejamento financeiro pessoal. **South American Development Society Journal**, v. 9, n. 25, p. 152–178, 2023.

---

## 7. Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com dedicação por alunos da disciplina Extensão II do curso de Análise e Desenvolvimento de Sistemas EAD da UNIFAMETRO - 2025**
