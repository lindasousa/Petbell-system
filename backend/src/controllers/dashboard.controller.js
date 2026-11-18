/**
 * Controller de Monitoramento e Dashboard
 * Restrito a ONGs e Administradores para acompanhamento estatistico e de gestao.
 * Refatorado para alta performance: substitui multiplas consultas concorrentes por agregacao nativa (groupBy).
 */

const prisma = require("../config/database");

/**
 * Retorna estatisticas consolidadas para o painel de monitoramento da ONG
 * Otimizacao estrutural: utiliza agregacao por grupo no banco de dados para consolidar
 * metricas de status em um unico round-trip de rede e conexao ao MongoDB.
 */
async function obterEstatisticas(req, res, next) {
  try {
    // Reducao de round-trips: uma unica agregacao agrupada para todos os status + contagem de pets
    const [contagensStatus, totalPets] = await Promise.all([
      prisma.alerta.groupBy({
        by: ["status_pet"],
        _count: {
          _all: true,
        },
      }),
      prisma.pet.count(),
    ]);

    // Mapeamento em O(N) dos totais consolidados por status com fallback seguro para 0
    const contagemPorStatus = contagensStatus.reduce((acc, item) => {
      acc[item.status_pet] = item._count._all;
      return acc;
    }, {});

    const totalResgatados = contagemPorStatus["RESGATADO"] || 0;
    const totalAdotados = contagemPorStatus["ADOTADO"] || 0;
    const totalAguardandoAdocao = contagemPorStatus["ADOCAO"] || 0;
    const totalAbandonados = contagemPorStatus["ABANDONADO"] || 0;
    const totalPerdidos = contagemPorStatus["PERDI_MEU_PET"] || 0;

    // Total de alertas derivado da soma dos agrupamentos para garantir consistencia atomica
    const totalAlertas =
      totalResgatados +
      totalAdotados +
      totalAguardandoAdocao +
      totalAbandonados +
      totalPerdidos;

    const taxaResolucao = totalAlertas > 0
      ? Number((((totalResgatados + totalAdotados) / totalAlertas) * 100).toFixed(1))
      : 0;

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
        taxa_resolucao_percentual: taxaResolucao,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obterEstatisticas,
};
