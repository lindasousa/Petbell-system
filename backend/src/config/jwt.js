/**
 * Configuracoes de Seguranca do JSON Web Token (JWT)
 *
 * Se JWT_SECRET estiver definido nas variaveis de ambiente, usa ele.
 * Caso contrario, gera uma chave aleatoria segura em tempo de execucao.
 * A chave gerada NAO aparece no codigo-fonte nem no GitHub.
 */

const crypto = require("crypto");

let secret;

if (process.env.JWT_SECRET) {
  secret = process.env.JWT_SECRET;
} else {
  secret = crypto.randomBytes(64).toString("hex");
  console.warn(
    "AVISO: JWT_SECRET nao definido. Usando chave aleatoria gerada automaticamente. " +
      "Tokens serao invalidados se o servidor reiniciar."
  );
}

module.exports = {
  secret,
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
