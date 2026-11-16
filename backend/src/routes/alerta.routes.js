/**
 * Rotas de Alertas de Ocorrencias de Animais
 */

const { Router } = require("express");
const alertaController = require("../controllers/alerta.controller");
const { validar } = require("../middlewares/validation.middleware");
const {
  criarAlertaSchema,
  atualizarStatusSchema,
  criarMensagemSchema,
} = require("../validators/alerta.validator");
const {
  autenticarObrigatorio,
  autenticarOpcional,
} = require("../middlewares/auth.middleware");

const router = Router();

// Listagem publica de ocorrencias com filtros
router.get("/", alertaController.listar);

// Consulta detalhada de uma ocorrencia especifica
router.get("/:id", alertaController.buscarPorId);

// Criacao de Alerta: Aberto a cadastrados e nao-cadastrados (autenticacao opcional)
router.post(
  "/",
  autenticarOpcional,
  validar(criarAlertaSchema),
  alertaController.criar
);

// Atualizacao de Status: Restrito a usuarios autenticados (ONG/Admin ou autor original)
router.patch(
  "/:id/status",
  autenticarObrigatorio,
  validar(atualizarStatusSchema),
  alertaController.atualizarStatus
);

// Chat Comunitario do Alerta
router.get("/:id/mensagens", alertaController.listarMensagens);
router.post(
  "/:id/mensagens",
  autenticarOpcional,
  validar(criarMensagemSchema),
  alertaController.adicionarMensagem
);

module.exports = router;
