Refatoração do Projeto IdosoMS

⚠️ Importante: NÃO criar arquivos de teste ou extras desnecessários. Só refatorar e organizar o que já existe no projeto, deixando ele funcional com Firebase (plano gratuito).

🎯 Objetivo Geral

Refatorar o projeto IdosoMS que atualmente é 100% em HTML + Tailwind + JS inline + localStorage.
Migrar para Firebase (Firestore + Auth) no plano gratuito (sem Storage).
O sistema deve permitir login por CPF + senha, persistir dados no Firestore e respeitar regras de acesso por papel (Agente, Coordenador, Gerente, Admin).

🔹 Etapa 1 — Organização de Arquivos

Reorganizar a estrutura do projeto sem mudar as telas HTML existentes:

public/
 ├─ index.html
 ├─ login.html
 ├─ inicio.html
 ├─ dashboard.html
 ├─ cadastrarpaciente.html
 ├─ avaliacao.html
 ├─ validacao.html
 ├─ autorizarcadastro.html
 ├─ assets/
 │   ├─ css/
 │   │   └─ base.css
 │   └─ js/
 │       ├─ firebase.js       # inicialização do Firebase
 │       ├─ auth.js           # login/logout, guarda de rotas
 │       ├─ dal.js            # camada de acesso ao Firestore
 │       ├─ ui.js             # funções de UI (toast, modal, validações)
 │       ├─ validators.js     # validações (CPF, campos, etc.)
 │       ├─ pages/
 │       │   ├─ page-login.js
 │       │   ├─ page-inicio.js
 │       │   ├─ page-dashboard.js
 │       │   ├─ page-cadastrar-paciente.js
 │       │   ├─ page-avaliacao.js
 │       │   └─ page-validacao.js
 │       └─ components/
 │           └─ header.js     # carrega header dinâmico com nome/município



🔹 Etapa 2 — Firebase
Arquivo firebase.js

Usar Firebase v9 modular (import via CDN).

Exportar auth e db.

Autenticação

Login deve ser CPF + senha (não e-mail).

Estrutura no Firestore:

users/{cpf} → nome, municipio, cargo, registro, senhaHash, role.

Validar login consultando documento do usuário no Firestore e comparando hash da senha.

Guardar sessão em localStorage/sessionStorage.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDZNDV_eM5dhRYGu-euVqymZN6Q0br2DBA",
  authDomain: "sesidosoms.firebaseapp.com",
  projectId: "sesidosoms",
  storageBucket: "sesidosoms.firebasestorage.app",
  messagingSenderId: "932828334430",
  appId: "1:932828334430:web:02544c8138af68719ee7cf",
  measurementId: "G-H1MNREBYM4"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

🔹 Etapa 3 — Autenticação e Rotas

Arquivo auth.js:

Função login(cpf, senha): busca user no Firestore, valida senha.

Função logout().

Função onUserReady(cb): retorna usuário logado + perfil do Firestore.

Função requireAuth(redirect): se não logado, redireciona para login.html.

🔹 Etapa 4 — Camada de Dados (Firestore)

Arquivo dal.js:

CRUD de pacientes (pacientes/{id}).

CRUD de avaliações (avaliacoes/{id}).

Funções:

listarAvaliacoes({ status, data, paciente }).

aprovarAvaliacao(id, usuario).

rejeitarAvaliacao(id, motivo, usuario).

cadastrarPaciente(dados, usuario).

🔹 Etapa 5 — Regras de Segurança (Firestore Rules)

Definir:

Usuário só acessa dados do próprio município.

Agente: pode criar pacientes e avaliações.

Coordenador/Gerente: podem aprovar/rejeitar.

Admin: acesso total.

Usuário não pode alterar seu próprio role.

🔹 Etapa 6 — Páginas
login.html + page-login.js

Formulário pede CPF + senha.

Ao logar, salva usuário e redireciona para inicio.html.

inicio.html + page-inicio.js

Carrega nome e município do usuário logado no header.

Botão logout.

cadastrarpaciente.html + page-cadastrar-paciente.js

Form envia dados para coleção pacientes.

Só agentes/coordenadores/gerentes podem cadastrar.

avaliacao.html + page-avaliacao.js

Form grava respostas de IVCF20 e IVSF10 em avaliacoes/{id} com status pendente.

validacao.html + page-validacao.js

Lista avaliações com filtro por status, data, paciente.

Botões "Aprovar" e "Rejeitar" salvam no Firestore.

Modal de detalhes mostra perguntas + respostas.

Estatísticas (pendentes/aprovadas/rejeitadas/total).

🔹 Etapa 7 — Componentes Compartilhados
header.js

Carrega header.html dinamicamente.

Preenche nomeUsuario e municipioUsuario com dados do usuário logado.

🔹 Etapa 8 — Boas Práticas

Não usar alert/confirm. Substituir por UI amigável (toasts, modais).

Não usar innerHTML direto com dados do Firestore (risco XSS). Usar createElement ou sanitize.

Usar type="module" em todos os scripts.

Não criar arquivos de exemplo/teste além dos listados aqui.

👉 Copilot, siga exatamente essas etapas.
Não crie arquivos extras. Apenas refatore e reorganize os já existentes para usar Firebase como backend (Auth + Firestore), com login via CPF.