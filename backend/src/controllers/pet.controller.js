/**
 * Controller de Pets
 * Permite o cadastro manual do perfil de animais por ONGs e Cidadaos autenticados.
 */

const prisma = require("../config/database");

/**
 * Lista pets cadastrados com filtro opcional por status
 */
async function listar(req, res, next) {
  try {
    const { status_pet, especie } = req.query;
    const where = {};

    if (status_pet) where.status_pet = status_pet;
    if (especie) where.especie = { contains: especie, mode: "insensitive" };

    const pets = await prisma.pet.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
      },
    });

    return res.status(200).json({
      sucesso: true,
      dados: pets,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Busca perfil do Pet por identificador
 */
async function buscarPorId(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        alertas: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
      },
    });

    if (!pet) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Pet nao encontrado.",
      });
    }

    return res.status(200).json({
      sucesso: true,
      dados: pet,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cadastro manual de Pet (ONG ou Cidadao autenticado)
 */
async function criar(req, res, next) {
  try {
    const { nome, especie, raca, idade, foto_url, status_pet } = req.body;

    const novoPet = await prisma.pet.create({
      data: {
        nome,
        especie,
        raca,
        idade: idade ? parseInt(idade, 10) : null,
        foto_url,
        status_pet: status_pet || "ABANDONADO",
        usuario_id: req.usuario.id,
      },
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Perfil de animal cadastrado com sucesso.",
      dados: novoPet,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
};
