/**
 * Rotas de Autenticacao e Perfil
 */

const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { validar } = require("../middlewares/validation.middleware");
const { cadastroSchema, loginSchema } = require("../validators/auth.validator");
const { loginRateLimiter } = require("../middlewares/rateLimit.middleware");
const { autenticarObrigatorio } = require("../middlewares/auth.middleware");

const router = Router();

// Cadastro de novos usuarios (Cidadaos ou ONGs)
router.post("/cadastrar", validar(cadastroSchema), authController.cadastrar);

// Login de usuarios com limitacao de taxa de requisicoes (anti brute-force)
router.post("/login", loginRateLimiter, validar(loginSchema), authController.login);

// Obter dados do usuario logado (requer token JWT)
router.get("/me", autenticarObrigatorio, authController.me);

// Logout (encerramento formal de sessao)
router.post("/logout", autenticarObrigatorio, authController.logout);

module.exports = router;
