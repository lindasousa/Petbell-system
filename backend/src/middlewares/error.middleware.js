/**
 * Middleware Centralizado de Tratamento Seguro de Erros e Excecoes
 * Protege a aplicacao contra Information Disclosure (CWE-209),
 * padroniza respostas de falha e mapeia excecoes conhecidas do Prisma ORM e JWT.
 */

function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();

  // Log seguro no console interno para observabilidade e diagnostico sem expor ao cliente
  console.error(`[ERRO_INTERNO ${timestamp}] ${req.method} ${req.originalUrl}`);
  console.error(`Tipo: ${err.name || "Error"} | Mensagem: ${err.message}`);
  if (err.stack) {
    console.error(`Stack trace:\n${err.stack}`);
  }

  // 1. Tratamento especifico de erro de sintaxe JSON no corpo da requisicao (Bad Request)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      sucesso: false,
      codigo: "JSON_INVALIDO",
      mensagem: "Formato JSON invalido no corpo da requisicao.",
    });
  }

  // 2. Tratamento de excecoes do Prisma ORM (banco de dados)
  if (err.name === "PrismaClientKnownRequestError") {
    // P2002: Violacao de restricao de unicidade (ex: e-mail duplicado)
    if (err.code === "P2002") {
      const campo = err.meta?.target ? ` (${Array.isArray(err.meta.target) ? err.meta.target.join(", ") : err.meta.target})` : "";
      return res.status(409).json({
        sucesso: false,
        codigo: "CONFLITO_REGISTRO",
        mensagem: `Conflito de dados: o registro fornecido${campo} ja esta cadastrado no sistema.`,
      });
    }

    // P2025: Registro nao encontrado para atualizacao ou exclusao
    if (err.code === "P2025") {
      return res.status(404).json({
        sucesso: false,
        codigo: "REGISTRO_NAO_ENCONTRADO",
        mensagem: "O registro solicitado nao foi localizado no banco de dados.",
      });
    }

    // P2003: Violacao de integridade referencial / chave estrangeira
    if (err.code === "P2003") {
      return res.status(400).json({
        sucesso: false,
        codigo: "FALHA_INTEGRIDADE",
        mensagem: "Falha de integridade referencial: chave estrangeira ou vinculo invalido.",
      });
    }

    // Outros erros conhecidos do Prisma retornam 400 seguro
    return res.status(400).json({
      sucesso: false,
      codigo: "ERRO_BANCO_DADOS",
      mensagem: "Nao foi possivel processar a operacao com os parametros informados.",
    });
  }

  // Erros de validacao de parametros no Prisma Client
  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({
      sucesso: false,
      codigo: "PARAMETROS_INVALIDOS",
      mensagem: "Parametros de consulta ou gravacao invalidos para o banco de dados.",
    });
  }

  // 3. Tratamento de excecoes de Tokens JWT
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      sucesso: false,
      codigo: "TOKEN_EXPIRADO",
      mensagem: "Token de sessao expirado. Efetue login novamente para continuar.",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      sucesso: false,
      codigo: "TOKEN_INVALIDO",
      mensagem: "Token de autenticacao invalido ou violado.",
    });
  }

  // 4. Erros operacionais com status HTTP explicitamente definidos
  const statusHttp = Number(err.statusCode || err.status);
  if (!isNaN(statusHttp) && statusHttp >= 400 && statusHttp < 500) {
    return res.status(statusHttp).json({
      sucesso: false,
      codigo: err.code || "ERRO_REQUISICAO",
      mensagem: err.message || "Requisicao invalida.",
    });
  }

  // 5. Fallback seguro para erros inesperados (500) ocultando stack traces e detalhes tecnicos
  return res.status(500).json({
    sucesso: false,
    codigo: "ERRO_INTERNO",
    mensagem: "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.",
  });
}

// Handler para rotas inexistentes (404 Not Found)
function notFoundHandler(req, res) {
  return res.status(404).json({
    sucesso: false,
    codigo: "ROTA_NAO_ENCONTRADA",
    mensagem: `Rota nao encontrada: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
