/**
 * Modulo de Conexao com o Banco de Dados via Prisma ORM
 * Garante conexao singleton e isolamento seguro de queries.
 */

const { PrismaClient } = require("@prisma/client");

// Instancia unica do cliente Prisma para evitar sobrecarga de conexoes no pool
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
