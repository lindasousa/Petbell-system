/**
 * Middleware de Limitacao de Taxa (Rate Limiting)
 * Bloqueia tentativas repetidas de ataques de forca bruta no endpoint de login.
 */

const rateLimit = require("express-rate-limit");

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  max: 10, // Limite maximo de 10 tentativas por IP dentro do periodo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sucesso: false,
    mensagem: "Muitas tentativas consecutivas de login detectadas. Por favor, aguarde 15 minutos antes de tentar novamente.",
  },
});

module.exports = {
  loginRateLimiter,
};
