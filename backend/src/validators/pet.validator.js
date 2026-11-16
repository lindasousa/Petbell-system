/**
 * Esquema de Validacao Zod para Perfis de Pets
 */

const { z } = require("zod");

const criarPetSchema = z.object({
  nome: z.string().trim().min(2, "O nome do pet deve ter pelo menos 2 caracteres.").optional().nullable(),
  especie: z.string().trim().min(2, "A especie deve ter pelo menos 2 caracteres.").optional().nullable(),
  raca: z.string().trim().max(60).optional().nullable(),
  idade: z.number().int().min(0).max(30).optional().nullable(),
  foto_url: z.string().trim().optional().nullable(),
  status_pet: z.enum(["RESGATADO", "ADOTADO", "ADOCAO", "ABANDONADO", "PERDI_MEU_PET"]).default("ABANDONADO"),
});

module.exports = {
  criarPetSchema,
};
