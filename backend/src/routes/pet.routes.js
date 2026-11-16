/**
 * Rotas de Pets
 */

const { Router } = require("express");
const petController = require("../controllers/pet.controller");
const { validar } = require("../middlewares/validation.middleware");
const { criarPetSchema } = require("../validators/pet.validator");
const { autenticarObrigatorio } = require("../middlewares/auth.middleware");

const router = Router();

// Listagem de perfis de pets
router.get("/", petController.listar);

// Consulta por ID
router.get("/:id", petController.buscarPorId);

// Criacao manual de perfil de Pet por usuario logado
router.post(
  "/",
  autenticarObrigatorio,
  validar(criarPetSchema),
  petController.criar
);

module.exports = router;
