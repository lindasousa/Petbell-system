/**
 * Script de Teste Automatizado de Metas de Desempenho (Benchmark Petbell)
 * 
 * Requisitos avaliados:
 * - Meta: Carregamento do feed de alertas em ate 3,0 segundos.
 * - Volume de Dados: Carga padrao de 50 registros de alertas com fotos vinculadas.
 * - Metodologia: 1 warmup inicial + 5 medicoes consecutivas consolidando a mediana.
 * - Simulacao de Restricao: Throttle de conexao móvel (Fast 3G / 4G basico ~1.5 Mbps).
 */

const http = require("http");

const API_HOST = "localhost";
const API_PORT = process.env.PORT || 3000;
const ENDPOINT = "/api/alertas?limite=50";

// Velocidade simulada em bytes por segundo (1.5 Mbps = 187.500 bytes/seg)
const BYTES_POR_SEGUNDO_SIMULADOS = (1.5 * 1024 * 1024) / 8;

function executarRequisicao() {
  return new Promise((resolve, reject) => {
    const inicio = performance.now();

    const req = http.get(
      {
        host: API_HOST,
        port: API_PORT,
        path: ENDPOINT,
        headers: { "Accept-Encoding": "identity" },
      },
      (res) => {
        let tamanhoTotal = 0;
        let corpo = "";

        res.on("data", (chunk) => {
          tamanhoTotal += chunk.length;
          corpo += chunk;
        });

        res.on("end", () => {
          const fim = performance.now();
          const tempoRespostaServidorMs = fim - inicio;

          // Latencia de transferencia sob rede simulada a 1.5 Mbps
          const tempoTransferenciaSimuladaMs = (tamanhoTotal / BYTES_POR_SEGUNDO_SIMULADOS) * 1000;
          const tempoTotalEstimadoMs = tempoRespostaServidorMs + tempoTransferenciaSimuladaMs;

          let dadosJson = null;
          try {
            dadosJson = JSON.parse(corpo);
          } catch (e) {
            // parsing
          }

          resolve({
            statusHttp: res.statusCode,
            tamanhoBytes: tamanhoTotal,
            totalRegistros: dadosJson && dadosJson.dados ? dadosJson.dados.length : 0,
            tempoServidorMs: Number(tempoRespostaServidorMs.toFixed(2)),
            tempoRedeSimuladaMs: Number(tempoTransferenciaSimuladaMs.toFixed(2)),
            tempoTotalMs: Number(tempoTotalEstimadoMs.toFixed(2)),
          });
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });
  });
}

function calcularMediana(valores) {
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  if (ordenados.length % 2 !== 0) {
    return ordenados[meio];
  }
  return (ordenados[meio - 1] + ordenados[meio]) / 2;
}

async function rodarBenchmark() {
  console.log("==================================================================");
  console.log(" INICIANDO TESTE DE DESEMPENHO E CARGA - PETBELL FEED");
  console.log(" Parametros: 50 registros de alertas | Rede simulada: 1.5 Mbps");
  console.log(" Meta Numerica: Tempo Total de Carregamento <= 3.000 ms (3 segundos)");
  console.log("==================================================================\n");

  try {
    // 1. Etapa de Aquecimento (Warmup)
    console.log("Executando etapa de aquecimento (warmup)...");
    const warmup = await executarRequisicao();
    console.log(`Aquecimento concluido. Registros obtidos: ${warmup.totalRegistros} | Tempo: ${warmup.tempoTotalMs} ms\n`);

    // 2. 5 Medicoes Consecutivas
    const temposFinais = [];
    console.log("Iniciando 5 medicoes consecutivas...");

    for (let i = 1; i <= 5; i++) {
      const resultado = await executarRequisicao();
      temposFinais.push(resultado.tempoTotalMs);
      console.log(
        `Medicao #${i}: Servidor: ${resultado.tempoServidorMs} ms | Transferencia 1.5 Mbps: ${resultado.tempoRedeSimuladaMs} ms | Total: ${resultado.tempoTotalMs} ms (${resultado.tamanhoBytes} bytes)`
      );
      // Intervalo de 200ms entre requisicoes
      await new Promise((r) => setTimeout(r, 200));
    }

    // 3. Consolidacao pela Mediana
    const medianaFinal = calcularMediana(temposFinais);
    const metaAtingida = medianaFinal <= 3000;

    console.log("\n======================== RESULTADO FINAL ========================");
    console.log(`Mediana Consolidada: ${medianaFinal.toFixed(2)} ms (${(medianaFinal / 1000).toFixed(3)} segundos)`);
    console.log(`Meta Exigida: 3.000 ms (3,0 segundos)`);
    console.log(`Status de Aprovacao: ${metaAtingida ? "APROVADO COM SUCESSO" : "REPROVADO"}`);
    console.log("=================================================================\n");
  } catch (error) {
    console.error("Falha ao executar o teste de desempenho:", error.message);
    console.log("Certifique-se de que o servidor back-end esta ativo em http://localhost:3000");
  }
}

rodarBenchmark();
