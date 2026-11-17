# Petbell - Sistema de Alerta e Salvamento de Animais de Rua

Projeto Acadêmico Full-Stack | Padrão MVC | Node.js + Express + Zod + Prisma ORM + PostgreSQL | Angular 18 (PWA e Web)

---

## 1. Visão Geral do Projeto

O **Petbell** é uma plataforma desenvolvida para conectar a população, voluntários e ONGs de acolhimento de animais. O gargalo combatido é a lentidão no processo de alerta de animais abandonados ou perdidos quando há exigência de cadastros burocráticos.

### Diferenciais de Engenharia
- **Alerta Rápido sem Cadastro:** Permite que qualquer cidadão registre um animal em situação de risco em poucos segundos, gerando registros com relacionamento nulo (`usuario_id = null`) nas tabelas `Alerta` e `Pet`.
- **Cadastro Automático do Pet:** Ao gerar um alerta, o perfil do pet é criado atomicamente via transação no banco de dados.
- **Controle de Acesso Baseado em Papéis (RBAC / BOLA Protection):** Cidadãos comuns gerenciam unicamente os seus próprios alertas e perfil; ONGs e Administradores possuem acesso exclusivo ao painel de **Monitoramento** e podem atualizar o status de qualquer ocorrência.
- **Privacidade e LGPD:** Contato público nos alertas ocorre exclusivamente através de **Chat Comunitário Interno**, preservando o número de telefone e dados pessoais dos usuários.
- **Acessibilidade WCAG 2.2:** Áreas de toque ergonomicamente superiores a 44x44px, tipografia mínima de 16px, contraste superior a 4.5:1, sem uso de emojis e com suporte a leitores de tela.
- **Geolocalização Interativa (PostGIS / Leaflet):** Renderização de mapa com pinos georreferenciados para consulta e seleção direta de coordenadas.

---

## 2. Estrutura de Diretórios do Projeto

```text
Petbell/
│
├── backend/                             # Camada de Servidor (Node.js + Express + MVC)
│   ├── .env                             # Variaveis de ambiente (Porta, JWT, PostgreSQL)
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma                # Modelos Prisma ORM (Usuario, Pet, Alerta, Chat)
│   │   └── seed.js                      # Semeador com 3 alertas obrigatorios + 47 registros de teste
│   ├── scripts/
│   │   └── performance-test.js          # Benchmark com medicao da mediana em rede 1.5 Mbps
│   └── src/
│       ├── server.js                    # Ponto de entrada HTTP e shutdown gracioso
│       ├── app.js                       # Configuracao Express (Helmet, CORS, Middlewares)
│       ├── config/
│       │   ├── database.js              # Instancia singleton do Prisma Client
│       │   └── jwt.js                   # Configuracoes de seguranca do token JWT
│       ├── middlewares/
│       │   ├── auth.middleware.js        # Autenticacao estrita e opcional (JWT)
│       │   ├── role.middleware.js        # Verificacao de papeis (RBAC / BOLA)
│       │   ├── rateLimit.middleware.js   # Limitador de tentativas no /login
│       │   ├── validation.middleware.js  # Validacao de esquemas Zod
│       │   └── error.middleware.js       # Captura segura de excecoes internas
│       ├── controllers/
│       │   ├── auth.controller.js        # Login, cadastro e sessao
│       │   ├── alerta.controller.js      # Listagem, criacao e status
│       │   ├── pet.controller.js         # Perfil manual de animais
│       │   ├── dashboard.controller.js   # Metricas do monitoramento ONG
│       │   └── doacao.controller.js      # Campanhas de suprimentos ficticias
│       ├── routes/
│       │   ├── index.js                  # Agrupador central /api
│       │   ├── auth.routes.js
│       │   ├── alerta.routes.js
│       │   ├── pet.routes.js
│       │   ├── dashboard.routes.js
│       │   └── doacao.routes.js
│       └── validators/
│           ├── auth.validator.js         # Validadores Zod para usuarios
│           ├── alerta.validator.js       # Validadores Zod para ocorrencias
│           └── pet.validator.js          # Validadores Zod para perfil pet
│
├── frontend/                            # Interface PWA e Web (Angular 18 Standalone)
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── src/
│       ├── index.html                   # HTML base com Leaflet e PWA
│       ├── styles.css                   # Variaveis de cor e acessibilidade WCAG 2.2
│       ├── main.ts                      # Bootstrap standalone com interceptors
│       ├── manifest.webmanifest         # Configuracao do PWA
│       ├── sw.js                        # Service Worker leve
│       └── app/
│           ├── app.component.ts/.html/.css # Shell com toast acessivel
│           ├── app.routes.ts            # Rotas com Guards (authGuard e ongGuard)
│           ├── core/
│           │   ├── models/              # Interfaces TypeScript de dados
│           │   ├── services/            # AuthService, AlertaService, NotificationService
│           │   ├── guards/              # authGuard e ongGuard
│           │   └── interceptors/        # authInterceptor e errorInterceptor
│           ├── components/
│           │   ├── header/              # Barra superior com logo e status
│           │   ├── bottom-nav/          # Menu inferior fixo (Feed, Criar, Gestao, Doacao)
│           │   └── mapa/                # Componente de Mapa Leaflet com marcadores
│           └── pages/
│               ├── feed/                # Feed com chips de status e lista de cards
│               ├── criar-alerta/        # Formulario com validacao em tempo real e GPS
│               ├── detalhes-alerta/     # Foto ampliada, badges, gestao e chat
│               ├── login/               # Autenticacao de Cidadao e ONG
│               ├── cadastro/            # Criacao de conta
│               ├── doacoes/             # Campanhas ficticias e copia de chave PIX
│               ├── monitoramento/       # Painel restrito com metricas e gestao direta
│               └── perfil/              # Historico pessoal e dados protegidos LGPD
│
├── iniciar-backend.bat                  # Script de execucao automatica do Back-end no Windows
├── iniciar-frontend.bat                 # Script de execucao automatica do Front-end no Windows
└── executar-benchmark.bat               # Script para validar a meta de desempenho (sub-3s)
```

---
## 3. Instruções Passo a Passo para Execução no Windows

### Pré-requisitos
- Node.js instalado (v18 ou superior).
- NoSQL instalado e em execução (ou container Docker).

### Passo 1: Configurar e Subir o Back-end (Servidor de Dados / API)
1. Abra um terminal PowerShell na pasta `c:\Users\[NOME]\Documents\Petbell\backend`.
2. Configure a variável `DATABASE_URL` no arquivo `.env` com a sua senha do PostgreSQL:
   ```env
   DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/petbell_db?schema=public"
   ```
3. Instale as dependências:
   ```powershell
   npm.cmd install
   ```
4. Crie a estrutura no banco de dados e execute o semeamento inicial (Seed):
   ```powershell
   npx.cmd prisma migrate dev --name init
   npm.cmd run prisma:seed
   ```
5. Inicie o servidor da API:
   ```powershell
   npm.cmd run dev
   ```
   *O servidor da API iniciará em segundo plano na porta 3000 (`http://localhost:3000/api`). Ele processa as regras de negocio e banco de dados.*

### Passo 2: Configurar e Subir o Front-end (Interface Visual do Website e PWA)
1. Abra outro terminal na pasta `c:\Users\[NOME]\Documents\Petbell\frontend`.
2. Instale as dependências:
   ```powershell
   npm.cmd install
   ```
3. Inicie o servidor de desenvolvimento do Angular:
   ```powershell
   npm.cmd start
   ```
4. **Onde acessar o aplicativo no navegador:**
   Abra o seu navegador de internet diretamente em:
   **`http://localhost:4200`**
