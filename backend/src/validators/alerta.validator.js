/**
 * Esquemas de Validacao Zod para Alertas e Mensagens Comunitarias
 */

const { z } = require("zod");

const statusPetEnum = z.enum(
  ["RESGATADO", "ADOTADO", "ADOCAO", "ABANDONADO", "PERDI_MEU_PET"],
  {
    errorMap: () => ({
      message: "Status invalido. Valores aceitos: RESGATADO, ADOTADO, ADOCAO, ABANDONADO, PERDI_MEU_PET.",
    }),
  }
);

// Validacao para Criacao de Alerta (Rapido, com ou sem login)
const criarAlertaSchema = z.object({
  titulo: z
    .string({ required_error: "O titulo da ocorrencia e obrigatorio." })
    .trim()
    .min(5, "O titulo deve ter pelo menos 5 caracteres.")
    .max(100, "O titulo deve ter no maximo 100 caracteres."),
  descricao: z
    .string({ required_error: "A descricao e obrigatoria." })
    .trim()
    .min(10, "A descricao deve ter pelo menos 10 caracteres."),
  localizacao: z
    .string({ required_error: "A localizacao ou bairro e obrigatoria." })
    .trim()
    .min(3, "A localizacao deve ter pelo menos 3 caracteres."),
  latitude: z
    .number({ required_error: "A coordenada de latitude e obrigatoria." })
    .min(-90)
    .max(90),
  longitude: z
    .number({ required_error: "A coordenada de longitude e obrigatoria." })
    .min(-180)
    .max(180),
  foto_url: z.string().trim().optional().nullable(),
  status_pet: statusPetEnum.default("ABANDONADO"),
  pet_nome: z.string().trim().optional().nullable(),
  pet_especie: z.string().trim().optional().nullable(),
  pet_raca: z.string().trim().optional().nullable(),
});

// Validacao para Atualizacao de Status
const atualizarStatusSchema = z.object({
  status_pet: statusPetEnum,
});

// Validacao para Envio de Mensagem no Chat Comunitario
const criarMensagemSchema = z.object({
  conteudo: z
    .string({ required_error: "A mensagem nao pode ser vazia." })
    .trim()
    .min(2, "A mensagem deve ter pelo menos 2 caracteres.")
    .max(500, "A mensagem deve ter no maximo 500 caracteres."),
  autor_nome: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(60)
    .default("Cidadao Solidario"),
});

module.exports = {
  criarAlertaSchema,
  atualizarStatusSchema,
  criarMensagemSchema,
};
