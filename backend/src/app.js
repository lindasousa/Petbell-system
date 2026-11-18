/**
 * Configuracao Central da Aplicacao Express
 * Aplica middlewares de seguranca (Helmet, CORS, Rate Limit), parse de JSON e rotas da API.
 * Em producao tambem serve o front-end Angular compilado (mesma origem da API).
 */

const fs = require("fs");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

const app = express();

// Necessario atras do proxy reverso do Railway para identificar o IP real do cliente
// (usado pelo rate limit). Sem isso, todos os visitantes compartilhariam o mesmo IP.
app.set("trust proxy", 1);

// Protecao de cabecalhos HTTP contra vulnerabilidades comuns.
// A CSP libera apenas o necessario: tiles do OpenStreetMap e fotos externas dos alertas (https).
// O Referrer-Policy envia apenas a origem do site: a politica de uso do OpenStreetMap
// bloqueia tiles requisitados sem Referer.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "blob:", "https:"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// ---------- CORS restrito ----------
// Em producao o front-end e servido pelo proprio Express (mesma origem), entao o CORS
// so e necessario para origens externas explicitamente configuradas em FRONTEND_URL.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:4200")
  .split(",")
  .map((origem) => origem.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisicoes sem origem (Postman, curl, apps mobile)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Nega sem gerar erro 500: o navegador bloqueia a resposta por falta do cabecalho
      return callback(null, false);
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parser de corpo de requisicoes JSON limitado a 2MB para evitar ataques de DoS
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ---------- Rate Limit da API ----------
// 100 requisicoes por IP a cada 15 minutos (aplicado apenas a /api, nao aos arquivos estaticos)
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,  // Envia RateLimit-* nos headers
  legacyHeaders: false,
  message: {
    sucesso: false,
    mensagem:
      "Limite de requisicoes excedido. Aguarde 15 minutos e tente novamente.",
  },
});

// Registro de todas as rotas da API sob o prefixo /api
app.use("/api", apiRateLimiter, routes);
app.use("/api", notFoundHandler);

// ---------- Front-end Angular (build de producao) ----------
const frontendDir = path.join(__dirname, "..", "..", "frontend", "dist", "petbell-frontend", "browser");
const indexHtml = path.join(frontendDir, "index.html");

if (fs.existsSync(indexHtml)) {
  app.use(express.static(frontendDir, { index: false }));

  // Fallback do SPA: qualquer rota GET nao encontrada devolve o index.html do Angular
  app.get("*", (req, res) => {
    res.sendFile(indexHtml);
  });
} else {
  // Rota raiz informativa quando o front-end nao foi compilado (desenvolvimento)
  app.get("/", (req, res) => {
    res.json({
      projeto: "Petbell",
      descricao: "Sistema de Alerta e Salvamento de Animais de Rua em Sorocaba",
      documentacao_api: "/api/health",
    });
  });
}

// Middleware para rotas inexistentes (404)
app.use(notFoundHandler);

// Middleware centralizado de tratamento seguro de excecoes
app.use(errorHandler);

module.exports = app;
