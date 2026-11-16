/**
 * Rotas de Doacoes Ficticias
 */

const { Router } = require("express");
const doacaoController = require("../controllers/doacao.controller");

const router = Router();

// Consulta de campanhas e instrucoes de doacao ficticia
router.get("/", doacaoController.obterDadosDoacao);

module.exports = router;
