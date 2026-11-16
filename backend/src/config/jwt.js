/**
 * Configuracoes de Seguranca do JSON Web Token (JWT)
 */

module.exports = {
  secret: process.env.JWT_SECRET || "petbell_chave_secreta_padrao_desenvolvimento_2026",
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
