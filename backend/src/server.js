/**
 * Ponto de Entrada do Servidor Back-end Petbell
 * Inicializa a porta HTTP e gerencia o desligamento gracioso.
 */

require("dotenv").config();
const app = require("./app");
const prisma = require("./config/database");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Servidor Petbell Back-end em execucao na porta ${PORT}`);
  console.log(` Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(` Endpoints da API disponiveis em http://localhost:${PORT}/api`);
  console.log(` Verificacao de integridade: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Encerramento gracioso da conexao com o banco ao fechar o servidor
async function encerrarServidor(sinal) {
  console.log(`\nRecebido sinal ${sinal}. Encerrando servidor e conexoes...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Conexao com PostgreSQL desconectada com sucesso.");
      process.exit(0);
    } catch (err) {
      console.error("Erro ao encerrar conexao com PostgreSQL:", err);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => encerrarServidor("SIGINT"));
process.on("SIGTERM", () => encerrarServidor("SIGTERM"));
