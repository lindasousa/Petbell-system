/**
 * Middleware de Autorizacao Baseada em Papeis (RBAC)
 * Previne falhas de Broken Access Control (BOLA).
 * Cidadaos comuns sao impedidos de acessar rotas restritas a ONGs e Administradores.
 */

function autorizarPapeis(papeisPermitidos = []) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Requisicao nao autenticada.",
      });
    }

    const { tipo } = req.usuario;

    if (!papeisPermitidos.includes(tipo)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Acesso negado. Seu perfil nao possui permissao para executar esta acao.",
      });
    }

    next();
  };
}

module.exports = {
  autorizarPapeis,
};
