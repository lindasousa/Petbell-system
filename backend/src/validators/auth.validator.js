/**
 * Esquemas de Validacao para Autenticacao e Usuarios utilizando Zod
 * Previne injecoes de scripts maliciosos e dados invalidos.
 */

const { z } = require("zod");

// Validacao para Cadastro de Usuario (Cidadao ou ONG)
const cadastroSchema = z.object({
  nome: z
    .string({ required_error: "O nome e obrigatorio." })
    .trim()
    .min(3, "O nome deve ter no minimo 3 caracteres.")
    .max(120, "O nome deve ter no maximo 120 caracteres."),
  // "administrador" nao e aceito no cadastro publico (evita escalonamento de privilegio)
  tipo: z.enum(["cidadao", "ong"], {
    errorMap: () => ({ message: "O tipo de usuario deve ser 'cidadao' ou 'ong'." }),
  }),
  email: z
    .string({ required_error: "O e-mail e obrigatorio." })
    .trim()
    .email("Formato de e-mail invalido.")
    .toLowerCase(),
  senha: z
    .string({ required_error: "A senha e obrigatoria." })
    .min(6, "A senha deve conter no minimo 6 caracteres.")
    .max(100, "A senha deve conter no maximo 100 caracteres."),
  telefone: z
    .string({ required_error: "O telefone e obrigatorio." })
    .trim()
    .min(8, "Telefone invalido.")
    .max(20, "Telefone muito longo."),
});

// Validacao para Login
const loginSchema = z.object({
  email: z
    .string({ required_error: "O e-mail e obrigatorio." })
    .trim()
    .email("Formato de e-mail invalido.")
    .toLowerCase(),
  senha: z
    .string({ required_error: "A senha e obrigatoria." })
    .min(1, "A senha e obrigatoria."),
});

module.exports = {
  cadastroSchema,
  loginSchema,
};
