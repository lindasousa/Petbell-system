/**
 * Controller de Doacoes Ficticias
 * Fornece dados meramente ilustrativos para campanhas e arrecadacao de suprimentos
 * para ONGs de Sorocaba sem dados bancarios reais ou transacoes financeiras.
 */

function obterDadosDoacao(req, res) {
  const campanhas = [
    {
      id: 1,
      titulo: "Fundo Solidario Racao e Atendimento Medico Sorocaba",
      ong_responsavel: "Associacao Protetora dos Animais de Sorocaba (Ficticia)",
      descricao: "Arrecadacao destinada a compra de racao de alta qualidade e pagamento de consultas veterinarias e castracoes de animais de rua acolhidos.",
      meta_mensal_kg: 500,
      arrecadado_kg: 320,
      chave_pix_tipo: "Chave Aleatoria Ficticia",
      chave_pix: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5925Petbell Sorocaba Projeto6008Sorocaba62070503***6304ABCD",
      ponto_coleta_presencial: "Rua Ficticia de Sorocaba, 100 - Centro, Sorocaba - SP",
      itens_prioritarios: [
        "Racao para caes adultos e filhotes",
        "Racao para gatos castrados",
        "Vermifugos e antiparasitarios",
        "Cobertores e toalhas limpas",
      ],
    },
    {
      id: 2,
      titulo: "Campanha Acolhimento e Lar Provisorio Sorocaba",
      ong_responsavel: "Grupo Voluntario Patinhas Sem Teto (Ficticio)",
      descricao: "Apoio a protetores independentes que oferecem lares temporarios para pets recem-resgatados da chuva ou feridos.",
      meta_mensal_kg: 300,
      arrecadado_kg: 210,
      chave_pix_tipo: "E-mail Ficticio",
      chave_pix: "doacoes.ficticias.sorocaba@petbell.org",
      ponto_coleta_presencial: "Avenida Ficticia, 250 - Campolim, Sorocaba - SP",
      itens_prioritarios: [
        "Areia sanitaria para felinos",
        "Comedouros e bebedouros",
        "Casinhas de transporte",
      ],
    },
  ];

  return res.status(200).json({
    sucesso: true,
    aviso: "Todos os dados bancarios e chaves apresentados sao ficticios para fins de demonstracao academica.",
    dados: campanhas,
  });
}

module.exports = {
  obterDadosDoacao,
};
