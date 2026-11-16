/**
 * Middleware de Autenticacao JWT
 * Verifica e decodifica o token do cabecalho Authorization.
 */

const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const prisma = require("../config/database");

/**
 * Autenticacao estrita: Bloqueia requisicoes sem token valido com HTTP 401
 */
async function autenticarObrigatorio(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Acesso nao autorizado. Token JWT nao fornecido ou invalido.",
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, jwtConfig.secret);

    // Consulta de seguranca para garantir que o usuario ainda existe no banco
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        telefone: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuario do token nao localizado no sistema.",
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Token expirado ou invalido. Faca login novamente.",
    });
  }
}

/**
 * Autenticacao opcional: Identifica o usuario se o token existir, mas nao bloqueia se ausente.
 * Fundamental para o requisito de permitir criacao de alertas sem cadastro previo.
 */
async function autenticarOpcional(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = jwt.verify(token, jwtConfig.secret);

      const usuario = await prisma.usuario.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          telefone: true,
        },
      });

      if (usuario) {
        req.usuario = usuario;
      }
    }
  } catch (err) {
    // Falha silenciosa intencional no opcional, segue como usuario anonimo
    req.usuario = null;
  }
  next();
}

module.exports = {
  autenticarObrigatorio,
  autenticarOpcional,
};
