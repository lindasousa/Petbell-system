/**
 * Middleware Centralizado de Tratamento Seguro de Erros
 * Oculta stack traces e detalhes de infraestrutura do cliente,
 * registrando os logs detalhados apenas no console interno do servidor.
 */

function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();
  
  // Registro seguro nos logs internos do servidor
  console.error(`[ERRO_INTERNO ${timestamp}] Rota: ${req.method} ${req.originalUrl}`);
  console.error(`Mensagem: ${err.message}`);
  if (err.stack) {
    console.error(`Stack trace:\n${err.stack}`);
  }

  // Tratamento especifico de erro de sintaxe JSON no corpo da requisicao
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Formato JSON invalido no corpo da requisicao.",
    });
  }

  // Resposta segura e padronizada para o cliente sem expor o erro real
  return res.status(500).json({
    sucesso: false,
    mensagem: "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.",
  });
}

// Handler para rotas inexistentes (404 Not Found)
function notFoundHandler(req, res) {
  return res.status(404).json({
    sucesso: false,
    mensagem: `Rota nao encontrada: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
