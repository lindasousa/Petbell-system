/**
 * Controller de Autenticacao e Gestao de Sessao
 * Implementa boas praticas de seguranca com bcryptjs e JSON Web Tokens.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const jwtConfig = require("../config/jwt");

/**
 * Cadastra um novo usuario (Cidadao ou ONG)
 */
async function cadastrar(req, res, next) {
  try {
    const { nome, tipo, email, senha, telefone } = req.body;

    // Verificacao de unicidade do e-mail
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Este e-mail ja esta cadastrado no sistema.",
      });
    }

    // Geracao do hash com salt embutido via bcrypt
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Gravacao via Prisma ORM
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        tipo,
        email,
        senha_hash: senhaHash,
        telefone,
      },
      select: {
        id: true,
        nome: true,
        tipo: true,
        email: true,
        telefone: true,
        created_at: true,
      },
    });

    // Geracao do Token JWT para login imediato
    const token = jwt.sign(
      {
        id: novoUsuario.id,
        tipo: novoUsuario.tipo,
        email: novoUsuario.email,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: "Usuario cadastrado com sucesso.",
      dados: {
        usuario: novoUsuario,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Autentica o usuario e emite o token JWT
 * Retorna HTTP 200 se autenticado ou HTTP 401 se credenciais invalidas
 */
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    // Busca do usuario pelo email unico
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Credenciais invalidas. Verifique seu e-mail e senha.",
      });
    }

    // Comparacao segura de senha em tempo constante (anti-timing attacks)
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Credenciais invalidas. Verifique seu e-mail e senha.",
      });
    }

    // Assinatura do JWT com informacoes essenciais do perfil
    const token = jwt.sign(
      {
        id: usuario.id,
        tipo: usuario.tipo,
        email: usuario.email,
        nome: usuario.nome,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Autenticacao realizada com sucesso.",
      dados: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
          telefone: usuario.telefone,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retorna os dados do usuario atualmente autenticado
 */
async function me(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        telefone: true,
        created_at: true,
        alertas: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
      },
    });

    return res.status(200).json({
      sucesso: true,
      dados: usuario,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Encerramento efetivo da sessao (logout)
 */
async function logout(req, res) {
  return res.status(200).json({
    sucesso: true,
    mensagem: "Sessao encerrada com sucesso.",
  });
}

module.exports = {
  cadastrar,
  login,
  me,
  logout,
};
