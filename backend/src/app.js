/**
 * Configuracao Central da Aplicacao Express
 * Aplica middlewares de seguranca (Helmet, CORS), parse de JSON e rotas da API.
 */

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

const app = express();

// Protecao de cabecalhos HTTP contra vulnerabilidades comuns
app.use(helmet());

// Politica de CORS flexivel para desenvolvimento local e producao
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:4200",
  "http://localhost:3000",
  "http://127.0.0.1:4200",
  "http://127.0.0.1:8080",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisicoes sem origem (apps mobile, chamadas locais ou Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Aberto para facilitar execucao academica local
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parser de corpo de requisicoes JSON limitado a 2MB para evitar ataques de DoS
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Rota raiz informativa
app.get("/", (req, res) => {
  res.json({
    projeto: "Petbell",
    descricao: "Sistema de Alerta e Salvamento de Animais de Rua em Sorocaba",
    documentacao_api: "/api/health",
  });
});

// Registro de todas as rotas da API sob o prefixo /api
app.use("/api", routes);

// Middleware para rotas inexistentes (404)
app.use(notFoundHandler);

// Middleware centralizado de tratamento seguro de excecoes
app.use(errorHandler);

module.exports = app;
