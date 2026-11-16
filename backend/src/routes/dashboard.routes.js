/**
 * Rotas de Monitoramento e Estatisticas
 * Protegidas por middleware de autenticacao e checagem de perfil (ONG e Administrador).
 */

const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { autenticarObrigatorio } = require("../middlewares/auth.middleware");
const { autorizarPapeis } = require("../middlewares/role.middleware");

const router = Router();

// Estatisticas para painel de controle restrito de ONGs
router.get(
  "/estatisticas",
  autenticarObrigatorio,
  autorizarPapeis(["ong", "administrador"]),
  dashboardController.obterEstatisticas
);

module.exports = router;
