/**
 * Controller de Alertas e Ocorrencias
 * Implementa criacao anonima/rapida, listagem com filtros e gestao de status por papeis.
 */

const prisma = require("../config/database");

/**
 * Lista alertas com filtros opcionais de status, busca textual e ordenacao recente
 */
async function listar(req, res, next) {
  try {
    const { status, busca, limite = 50, pagina = 1 } = req.query;

    const where = {};

    // Filtro por Status oficial
    if (status && status !== "TODOS") {
      where.status_pet = status;
    }

    // Filtro por busca textual (titulo ou localizacao)
    if (busca && busca.trim()) {
      where.OR = [
        { titulo: { contains: busca.trim(), mode: "insensitive" } },
        { localizacao: { contains: busca.trim(), mode: "insensitive" } },
      ];
    }

    const take = Math.min(Math.max(parseInt(limite, 10) || 50, 1), 100);
    const skip = (Math.max(parseInt(pagina, 10) || 1, 1) - 1) * take;

    const [total, alertas] = await Promise.all([
      prisma.alerta.count({ where }),
      prisma.alerta.findMany({
        where,
        take,
        skip,
        orderBy: { created_at: "desc" },
        include: {
          pet: {
            select: {
              id: true,
              nome: true,
              especie: true,
              raca: true,
              idade: true,
            },
          },
          _count: {
            select: { mensagens: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      sucesso: true,
      meta: {
        total,
        pagina: parseInt(pagina, 10) || 1,
        limite: take,
        total_paginas: Math.ceil(total / take),
      },
      dados: alertas,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Recupera um alerta especifico com mensagens do chat comunitario
 */
async function buscarPorId(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Identificador de alerta invalido.",
      });
    }

    const alerta = await prisma.alerta.findUnique({
      where: { id },
      include: {
        pet: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
        mensagens: {
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!alerta) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Alerta nao encontrado.",
      });
    }

    return res.status(200).json({
      sucesso: true,
      dados: alerta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cria um novo alerta de ocorrencia
 * Regra: Nao exige cadastro previo. Se o usuario estiver logado, associa o ID.
 * Regra: Cadastra automaticamente o perfil do Pet vinculado ao alerta.
 */
async function criar(req, res, next) {
  try {
    const {
      titulo,
      descricao,
      localizacao,
      latitude,
      longitude,
      foto_url,
      status_pet = "ABANDONADO",
      pet_nome,
      pet_especie,
      pet_raca,
    } = req.body;

    const usuarioId = req.usuario ? req.usuario.id : null;

    // Foto padrao caso o usuario nao tenha anexado uma imagem
    const fotoFinal =
      foto_url && foto_url.trim() !== ""
        ? foto_url
        : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80";

    // Transacao atomica para garantir a integridade entre Pet e Alerta
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Criacao automatica do perfil do Pet
      const novoPet = await tx.pet.create({
        data: {
          nome: pet_nome || titulo.slice(0, 30),
          especie: pet_especie || "Nao informada",
          raca: pet_raca || "Mestico",
          foto_url: fotoFinal,
          status_pet,
          usuario_id: usuarioId,
        },
      });

      // 2. Criacao do Alerta associado
      const novoAlerta = await tx.alerta.create({
        data: {
          titulo,
          descricao,
          localizacao,
          latitude: Number(latitude),
          longitude: Number(longitude),
          foto_url: fotoFinal,
          status_pet,
          usuario_id: usuarioId,
          pet_id: novoPet.id,
        },
        include: {
          pet: true,
        },
      });

      return novoAlerta;
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Alerta de animal registrado com sucesso.",
      dados: resultado,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Atualiza o status de um alerta existente
 * Regra: ONGs e Administradores podem alterar o status de qualquer alerta.
 * Regra: Cidadaos comuns apenas podem alterar status dos seus proprios alertas.
 */
async function atualizarStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status_pet } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Identificador de alerta invalido.",
      });
    }

    const alerta = await prisma.alerta.findUnique({
      where: { id },
    });

    if (!alerta) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Alerta nao encontrado para atualizacao.",
      });
    }

    // Verificacao de autorizacao (BOLA protection)
    const isGestor = req.usuario.tipo === "ong" || req.usuario.tipo === "administrador";
    const isAutor = alerta.usuario_id === req.usuario.id;

    if (!isGestor && !isAutor) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Voce nao tem permissao para alterar o status deste alerta.",
      });
    }

    // Atualizacao em lote do alerta e do pet associado
    const alertaAtualizado = await prisma.$transaction(async (tx) => {
      const atualizado = await tx.alerta.update({
        where: { id },
        data: { status_pet },
      });

      if (alerta.pet_id) {
        await tx.pet.update({
          where: { id: alerta.pet_id },
          data: { status_pet },
        });
      }

      return atualizado;
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: `Status atualizado para ${status_pet} com sucesso.`,
      dados: alertaAtualizado,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Lista as mensagens comunitarias de um alerta especifico
 */
async function listarMensagens(req, res, next) {
  try {
    const alertaId = parseInt(req.params.id, 10);

    const mensagens = await prisma.mensagemComunidade.findMany({
      where: { alerta_id: alertaId },
      orderBy: { created_at: "asc" },
    });

    return res.status(200).json({
      sucesso: true,
      dados: mensagens,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Envia uma mensagem para o chat comunitario do alerta
 */
async function adicionarMensagem(req, res, next) {
  try {
    const alertaId = parseInt(req.params.id, 10);
    const { conteudo, autor_nome } = req.body;

    const alertaExiste = await prisma.alerta.findUnique({
      where: { id: alertaId },
    });

    if (!alertaExiste) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Alerta nao encontrado.",
      });
    }

    const autorTipo = req.usuario ? req.usuario.tipo : "comunidade";
    const autorNomeFinal = req.usuario ? req.usuario.nome : (autor_nome || "Cidadao Solidario");

    const novaMensagem = await prisma.mensagemComunidade.create({
      data: {
        alerta_id: alertaId,
        autor_nome: autorNomeFinal,
        autor_tipo: autorTipo,
        conteudo,
      },
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Mensagem enviada no chat comunitario.",
      dados: novaMensagem,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizarStatus,
  listarMensagens,
  adicionarMensagem,
};
