/**
 * Middleware para Validacao de Requisicoes com Zod
 */

function validar(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed; // Atribui os dados limpos e validados
      next();
    } catch (err) {
      if (err.errors) {
        const errosFormatados = err.errors.map((e) => ({
          campo: e.path.join("."),
          mensagem: e.message,
        }));
        return res.status(400).json({
          sucesso: false,
          mensagem: "Dados de entrada invalidos.",
          erros: errosFormatados,
        });
      }
      return res.status(400).json({
        sucesso: false,
        mensagem: "Erro na validacao dos dados fornecidos.",
      });
    }
  };
}

module.exports = {
  validar,
};
