# 🏥 Sistema de Gerenciamento e Agendamento de Consultas — Frontend

Interface web moderna, responsiva e reativa para agendamento de consultas médicas, gestão de especialistas e controle de agendas clínicas em tempo real, desenvolvida com **Vue 3**, **Vite**, **Tailwind CSS**, **Pinia** e **Vue Router**.

---

## 🚀 Tecnologias Utilizadas

| Tecnologia | Finalidade |
| :--- | :--- |
| **Vue 3 (Composition API)** | Framework reativo com `<script setup>` SFCs |
| **Vite 8** | Build tool e servidor de desenvolvimento ultrarrápido (HMR) |
| **Tailwind CSS v4** | Estilização utilitária moderna e totalmente responsiva |
| **Pinia** | Gerenciamento de estado global reativo e tipado |
| **Vue Router 4** | Roteamento SPA com Navigation Guards e controle de acesso |
| **Axios** | Cliente HTTP com interceptors de token JWT e tratamento de erros |
| **Lucide Vue Next** | Ícones consistentes e acessíveis |

---

## 🏗️ Arquitetura do Projeto

```text
teste-tecnico-frontend/
├── public/                     # Favicons e recursos públicos estáticos
├── src/
│   ├── assets/                 # Imagens e logotipos
│   ├── components/             # Componentes modulares e reutilizáveis
│   │   ├── common/             # Componentes globais (Navbar, Toasts, Modais, Badges, Spinners)
│   │   ├── horarios/           # Cards de horários e filtros dinâmicos
│   │   ├── especialistas/      # Modais de cadastro e edição de especialistas
│   │   └── agendas/            # Modais de criação de agendas semanais
│   ├── services/               # Camada de comunicação HTTP com o Backend (Axios)
│   │   ├── api.js              # Instância do Axios e interceptadores de Authorization/401
│   │   ├── authService.js      # Login, perfil (/me), registro e renovação de token
│   │   ├── especialistaService.js # CRUD de especialistas
│   │   ├── agendaService.js    # Listagem e criação de agendas
│   │   └── horarioService.js   # Catálogo, agendamento, cancelamento e minhas consultas
│   ├── stores/                 # Gerenciamento de estado global com Pinia
│   │   ├── auth.js             # Sessão, token JWT e perfil (cliente vs interno)
│   │   ├── horarios.js         # Estado de horários, filtros e agendamentos
│   │   ├── especialistas.js    # Estado e listagem de especialistas
│   │   ├── agendas.js          # Estado de agendas cadastradas
│   │   └── toast.js            # Sistema global de notificações flutuantes
│   ├── router/
│   │   └── index.js            # Definição de rotas, meta-tags e Navigation Guards
│   ├── views/                  # Telas e páginas principais da aplicação
│   │   ├── HomeView.vue        # Catálogo público de horários com filtros e agendamento
│   │   ├── LoginView.vue       # Tela de login com atalho para credenciais de teste
│   │   ├── RegistroView.vue    # Formulário de cadastro de novos pacientes
│   │   ├── MinhasConsultasView.vue # Área do paciente para acompanhar e cancelar consultas
│   │   └── admin/
│   │       ├── EspecialistasView.vue # Gestão de médicos (CRUD + Soft Delete)
│   │       └── AgendasView.vue # Gestão de agendas e horários de atendimento
│   ├── App.vue                 # Componente raiz com Navbar, Toasts e RouterView
│   ├── main.js                 # Ponto de entrada (Vue + Pinia + Router)
│   └── style.css               # Importação e configuração do Tailwind CSS
├── .env.example                # Modelo de variáveis de ambiente
├── package.json                # Dependências e scripts do Node.js
└── vite.config.js              # Configuração do bundler Vite e Tailwind
```

---

## 🎯 Funcionalidades & Telas Implementadas

### 🗓️ 1. Catálogo e Agendamento em Tempo Real (`/`)
* **Listagem Reativa de Horários:** Exibição em cards com data, hora de início/encerramento, médico e especialidade.
* **Filtros Combinados:** Filtragem instantânea por médico/especialista, data de atendimento e status da vaga (*Disponíveis*, *Reservados* ou *Todos*).
* **Agendamento Seguro:** Modal de confirmação antes de reservar para prevenir cliques acidentais.
* **Prevenção de Conflitos:** Feedback visual imediato em caso de horários já reservados ou passados.

---

### 🔐 2. Autenticação & Atalho de Demonstração (`/login` e `/registro`)
* **Contas Rápidas com 1 Clique:** Botões para preenchimento imediato de credenciais de teste (*Admin*, *Recepção*, *Paciente*).
* **Cadastro de Paciente:** Formulário de autocadastro público com login automático pós-registro.
* **Proteção de Rotas:** Redirecionamento automático caso o usuário tente acessar páginas restritas sem login.

---

### 📋 3. Área do Paciente: Minhas Consultas (`/minhas-consultas`)
* Listagem exclusiva das consultas agendadas pelo usuário logado.
* **Cancelamento de Consultas:** Modal com confirmação de exclusão para liberação imediata da vaga para outros pacientes.

---

### 👑 4. Painel Administrativo / Perfil Interno (`/admin/...`)
* **Gestão de Especialistas (`/admin/especialistas`):**
  * Tabela com busca rápida em tempo real por nome, especialidade ou e-mail.
  * Modal para criação e edição de especialistas.
  * Exclusão lógica (*Soft Delete*) com aviso de impacto sobre agendas vinculadas.
* **Gestão de Agendas (`/admin/agendas`):**
  * Seletor interativo dos dias da semana (Seg, Ter, Qua, Qui, Sex, Sáb, Dom).
  * **Cálculo de Duração em Tempo Real:** Calcula e exibe instantaneamente a duração de cada consulta (ex: *4 horas ÷ 4 vagas = 60 min por consulta*).
  * Criação com **geração automática** das vagas para os próximos 30 dias no backend.

---

### 🔔 5. Notificações & Feedback Visual
* **Toasts Flutuantes:** Avisos animados de sucesso, erro e informação no canto superior da tela.
* **Feedback de Carregamento:** Indicadores visuais e spinners durante requisições assíncronas.

---

## 🔑 Credenciais de Teste

| Perfil | Usuário | Senha | Acesso / Permissões |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` | Acesso total (Especialistas, Agendas, Consultas) |
| **Recepção / Atendente** | `recepcao` | `senha123` | Gerenciar Especialistas e Agendas |
| **Paciente (Cliente)** | `paciente_joao` | `senha123` | Visualizar, Agendar e Cancelar consultas próprias |

---

## 📦 Instalação e Execução Local

### Pré-requisitos
* **Node.js 18+** e **npm** instalados.
* Backend Django rodando em `http://localhost:8000`.

### 1️⃣ Clonar o repositório e entrar na pasta:
```bash
git clone https://github.com/Francisco-Cassio/teste-tecnico-frontend.git
cd teste-tecnico-frontend
```

### 2️⃣ Configurar variáveis de ambiente:
```bash
cp .env.example .env
```
O arquivo `.env` deve conter:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3️⃣ Instalar as dependências:
```bash
npm install
```

### 4️⃣ Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`.

### 5️⃣ Gerar build de produção:
```bash
npm run build
```

---

## 🌐 Integração com o Backend

O frontend se conecta diretamente à API RESTful desenvolvida em Django REST Framework:
* 🔗 **Base da API:** `http://localhost:8000/api/`
* 🔗 **Documentação Swagger do Backend:** `http://localhost:8000/api/docs/`
