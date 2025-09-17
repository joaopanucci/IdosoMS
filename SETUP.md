# IdosoMS - Sistema de Avaliação de Vulnerabilidade de Idosos

## 📋 Sobre o Projeto

O **IdosoMS** é uma plataforma web para avaliações de índices de vulnerabilidade de idosos no estado de Mato Grosso do Sul. O sistema permite registrar, acompanhar e exportar avaliações **IVCF-20** (Índice de Vulnerabilidade Clínico-Funcional) e **IVSF-10** (Índice de Vulnerabilidade Social-Familiar).

### ✨ Características Principais

- 🔐 **Autenticação segura** com controle de papéis (SuperAdmin, Admin, Coordenador, Agente)
- 🗺️ **Escopo municipal** - cada usuário acessa apenas dados do seu município
- 📊 **Avaliações IVCF-20 e IVSF-10** com cálculo automático de risco
- 📈 **Dashboards e relatórios** com exportação PDF/CSV
- 📱 **PWA** - funciona offline como aplicativo
- 🛡️ **LGPD** - proteção de dados pessoais
- 🌐 **100% client-side** - sem Cloud Functions (Firebase Spark/gratuito)

## 🚀 Configuração Inicial

### 1. Pré-requisitos

- Node.js 18+ e npm/yarn
- Conta no Firebase (plano gratuito Spark)
- Editor de código (VS Code recomendado)

### 2. Clone e Instalação

```bash
# Clone o repositório
git clone <seu-repo-url>
cd IdosoMS

# Instale as dependências
npm install

# Copie o arquivo de ambiente
cp .env.example .env
```

### 3. Configuração do Firebase

1. **Crie um projeto Firebase:**
   - Acesse [Firebase Console](https://console.firebase.google.com)
   - Clique em "Adicionar projeto"
   - Nome: `idoso-ms` (ou outro de sua preferência)
   - Desabilite Google Analytics (opcional)

2. **Configure a aplicação web:**
   - No painel do projeto, clique em "Web" (ícone `</>`)
   - Nome do app: `IdosoMS`
   - Copie as configurações mostradas

3. **Atualize o arquivo `.env`:**
   ```env
   VITE_FIREBASE_API_KEY=sua-api-key-aqui
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto-id
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
   ```

4. **Configure os serviços Firebase:**

   **Authentication:**
   - Vá em Authentication > Sign-in method
   - Habilite "Email/Password"
   
   **Firestore Database:**
   - Vá em Firestore Database > Create database
   - Escolha "Start in production mode"
   - Selecione uma localização (southamerica-east1 recomendado)
   
   **Storage:**
   - Vá em Storage > Get started
   - Aceite as regras padrão (serão sobrescritas)

### 4. Deploy das Regras de Segurança

```bash
# Instale o Firebase CLI
npm install -g firebase-tools

# Faça login no Firebase
firebase login

# Configure o projeto (escolha o projeto criado)
firebase use --add

# Deploy das regras e índices
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes  
firebase deploy --only storage
```

### 5. Executar Localmente

```bash
# Desenvolvimento com hot-reload
npm run dev

# O sistema estará disponível em http://localhost:3000
```

## 👥 Sistema de Usuários e Permissões

### Níveis de Acesso

| Papel | Descrição | Permissões |
|-------|-----------|------------|
| **SuperAdmin** | Administrador estadual | Acesso total a todos os 79 municípios |
| **Admin** | Administrador estadual | Similar ao SuperAdmin, sem ações críticas |
| **Coordenador** | Coordenador municipal | Gerencia apenas seu município |
| **Agente** | Profissional de campo | Cadastra pacientes e aplica avaliações |

### Criação do Primeiro Usuário

Como não há Cloud Functions, o primeiro SuperAdmin deve ser criado manualmente:

1. **Registre-se normalmente** pela interface web
2. **No Firebase Console:**
   - Vá em Authentication > Users
   - Encontre o usuário criado
   - Clique em "Set custom claims"
   - Adicione: `{"role": "superadmin"}`
3. **No Firestore:**
   - Vá na coleção `users`
   - Edite o documento do usuário
   - Defina `role: "superadmin"`

## 🏥 Dados dos Municípios

O sistema já inclui todos os 79 municípios de MS com:
- Códigos IBGE oficiais
- População estimada 2023
- Macro e microrregiões

## 📋 Fluxo de Trabalho

### 1. Onboarding
- SuperAdmin cria Coordenadores Municipais
- Coordenadores criam Agentes de suas equipes

### 2. Operação Diária
- Cadastro de pacientes (dados mínimos - LGPD)
- Aplicação de avaliações IVCF-20/IVSF-10
- Cálculo automático de escores e classificação de risco

### 3. Gestão e Relatórios
- Dashboards por município, equipe, período
- Exportação de relatórios em PDF/CSV
- Comparativos proporcionais à população

## 📊 Avaliações

### IVCF-20 (Índice de Vulnerabilidade Clínico-Funcional)
- 20 questões sobre capacidade funcional
- Classificação: Baixo, Moderado, Alto risco

### IVSF-10 (Índice de Vulnerabilidade Social-Familiar)  
- 10 questões sobre aspectos sociais e familiares
- Classificação: Baixo, Moderado, Alto risco

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
src/
├── auth/           # Gerenciamento de autenticação
├── components/     # Componentes reutilizáveis
├── data/          # Dados estáticos (municípios, etc.)
├── pages/         # Páginas da aplicação
├── services/      # Serviços (Firebase, Router, etc.)
├── utils/         # Utilitários e validadores
└── style.css      # Estilos globais
```

### Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 (Tailwind), JavaScript ES6+
- **Backend:** Firebase (Auth, Firestore, Storage, Hosting)
- **Build:** Vite
- **PWA:** Service Worker, Web App Manifest
- **Charts:** Chart.js
- **Export:** jsPDF, PapaParse

### Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run deploy   # Deploy para Firebase Hosting
```

## 🚀 Deploy em Produção

```bash
# Build da aplicação
npm run build

# Deploy para Firebase Hosting
firebase deploy --only hosting
```

## 🔒 Segurança e LGPD

### Medidas de Proteção
- Pseudoanonimização de CPF (hash SHA-256)
- Mascaramento de dados pessoais em relatórios
- Consentimento obrigatório LGPD
- Regras rigorosas no Firestore (escopo municipal)
- Validações client e server-side

### Dados Armazenados
- **Mínimos necessários:** Nome, data nascimento, município
- **Opcionais:** CPF (hasheado), CNS, contato
- **Não armazenamos:** Endereço completo, dados sensíveis

## 📱 PWA (Progressive Web App)

### Funcionalidades Offline
- Cache de páginas estáticas
- Persistência local de dados (IndexedDB)
- Sincronização quando volta online
- Instalação como app no dispositivo

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

1. **Erro de permissão Firestore**
   - Verifique se as regras foram aplicadas
   - Confirme se o usuário tem role adequado

2. **Build fails**  
   - Apague `node_modules` e rode `npm install`
   - Verifique versões Node.js (18+)

3. **Login não funciona**
   - Verifique configurações Firebase no `.env`
   - Confirme que Authentication está habilitado

### Logs e Debug
- Console do navegador para erros frontend
- Firebase Console > Firestore > para monitorar queries
- Network tab para problemas de conectividade

## 📞 Contato e Contribuição

Este é um sistema desenvolvido para atender especificamente as necessidades de avaliação de vulnerabilidade de idosos no estado de Mato Grosso do Sul, seguindo as melhores práticas de segurança, performance e usabilidade.

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2024