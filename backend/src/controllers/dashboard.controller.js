/**
 * Controller de Monitoramento e Dashboard
 * Restrito a ONGs e Administradores para acompanhamento estatistico e de gestao.
 */

const prisma = require("../config/database");

/**
 * Retorna estatisticas consolidadas para o painel de monitoramento da ONG
 */
async function obterEstatisticas(req, res, next) {
  try {
    const [
      totalAlertas,
      totalResgatados,
      totalAdotados,
      totalAguardandoAdocao,
      totalAbandonados,
      totalPerdidos,
      totalPets,
    ] = await Promise.all([
      prisma.alerta.count(),
      prisma.alerta.count({ where: { status_pet: "RESGATADO" } }),
      prisma.alerta.count({ where: { status_pet: "ADOTADO" } }),
      prisma.alerta.count({ where: { status_pet: "ADOCAO" } }),
      prisma.alerta.count({ where: { status_pet: "ABANDONADO" } }),
      prisma.alerta.count({ where: { status_pet: "PERDI_MEU_PET" } }),
      prisma.pet.count(),
    ]);

    // Resumo para tomada de decisao rapida
    return res.status(200).json({
      sucesso: true,
      dados: {
        total_alertas: totalAlertas,
        resgatados: totalResgatados,
        adotados: totalAdotados,
        em_adocao: totalAguardandoAdocao,
        abandonados: totalAbandonados,
        perdidos: totalPerdidos,
        total_pets: totalPets,
        taxa_resolucao_percentual: totalAlertas > 0
          ? Number((((totalResgatados + totalAdotados) / totalAlertas) * 100).toFixed(1))
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obterEstatisticas,
};
