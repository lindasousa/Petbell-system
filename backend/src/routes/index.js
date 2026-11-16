/**
 * Roteador Principal da API Petbell
 * Agrupa todas as rotas de modulos com o prefixo /api.
 */

const { Router } = require("express");
const authRoutes = require("./auth.routes");
const alertaRoutes = require("./alerta.routes");
const petRoutes = require("./pet.routes");
const dashboardRoutes = require("./dashboard.routes");
const doacaoRoutes = require("./doacao.routes");

const router = Router();

// Endpoint de verificacao de integridade (Health Check)
router.get("/health", (req, res) => {
  return res.status(200).json({
    sucesso: true,
    status: "online",
    versao: "1.0.0",
    aplicacao: "Petbell API",
    horario: new Date().toISOString(),
  });
});

// Modulos da API
router.use("/auth", authRoutes);
router.use("/alertas", alertaRoutes);
router.use("/pets", petRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/doacoes", doacaoRoutes);

module.exports = router;
