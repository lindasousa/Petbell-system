/**
 * Script de Semeamento (Seed) do Banco de Dados Petbell
 * Cria os usuarios base (ONG, Cidadao, Administrador), 3 alertas obrigatorios
 * e registros adicionais para atender o teste de carga de 50 registros.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Protecao para producao: nao apaga dados existentes, a menos que SEED_FORCE=true
  const totalUsuarios = await prisma.usuario.count();
  if (totalUsuarios > 0 && process.env.SEED_FORCE !== "true") {
    console.log("Banco ja possui dados. Seed ignorado (defina SEED_FORCE=true para recriar).");
    return;
  }

  console.log("Iniciando semeamento do banco de dados Petbell...");

  // Limpeza previa das tabelas em ordem de dependencia
  await prisma.mensagemComunidade.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.usuario.deleteMany();

  // Geracao de senhas com hash e salt de 10 rounds (bcrypt)
  const salt = await bcrypt.genSalt(10);
  const senhaHashPadrao = await bcrypt.hash("petbell123", salt);
  // Em producao, a senha do administrador vem de variavel de ambiente (nao fica no codigo)
  const senhaHashAdmin = process.env.SEED_ADMIN_PASSWORD
    ? await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, salt)
    : senhaHashPadrao;

  // 1. Criacao dos Usuarios de Referencia
  const ongUsuario = await prisma.usuario.create({
    data: {
      nome: "Associacao Protetora dos Animais de Sorocaba",
      tipo: "ong",
      email: "contato@ongsorocaba.org",
      senha_hash: senhaHashPadrao,
      telefone: "(15) 3211-0000",
    },
  });

  const cidadaoUsuario = await prisma.usuario.create({
    data: {
      nome: "Carlos Eduardo Silva",
      tipo: "cidadao",
      email: "carlos.silva@emailficticio.com",
      senha_hash: senhaHashPadrao,
      telefone: "(15) 99888-1234",
    },
  });

  const adminUsuario = await prisma.usuario.create({
    data: {
      nome: "Administrador Central Petbell",
      tipo: "administrador",
      email: "admin@petbell.org",
      senha_hash: senhaHashAdmin,
      telefone: "(15) 3000-9999",
    },
  });

  console.log("Usuarios criados com sucesso.");

  // 2. Criacao dos 3 Alertas Ficticios Obrigatorios

  // Alerta 1: Rex - Vira-lata Amarelo (Perdi meu Pet)
  const petRex = await prisma.pet.create({
    data: {
      nome: "Rex",
      especie: "Canina",
      raca: "Vira-lata",
      idade: 3,
      foto_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
      status_pet: "PERDI_MEU_PET",
      usuario_id: cidadaoUsuario.id,
    },
  });

  const alertaRex = await prisma.alerta.create({
    data: {
      titulo: "Rex - Vira-lata Amarelo",
      descricao: "Cachorro de porte medio, pelagem amarela clara, usando coleira vermelha sem identificacao. Muito docil.",
      localizacao: "Parque Campolim, Sorocaba - SP",
      latitude: -23.5325,
      longitude: -47.4665,
      foto_url: petRex.foto_url,
      status_pet: "PERDI_MEU_PET",
      usuario_id: cidadaoUsuario.id,
      pet_id: petRex.id,
    },
  });

  // Mensagem inicial no chat comunitario do Rex
  await prisma.mensagemComunidade.create({
    data: {
      alerta_id: alertaRex.id,
      autor_nome: "Mariana Alcantara",
      autor_tipo: "comunidade",
      conteudo: "Avistei um cão parecido proximo a pista de caminhada ha cerca de 30 minutos.",
    },
  });

  // Alerta 2: Mimi - Gata Siamesa (Resgatado pela ONG)
  const petMimi = await prisma.pet.create({
    data: {
      nome: "Mimi",
      especie: "Felina",
      raca: "Siames",
      idade: 2,
      foto_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
      status_pet: "RESGATADO",
      usuario_id: ongUsuario.id,
    },
  });

  const alertaMimi = await prisma.alerta.create({
    data: {
      titulo: "Mimi - Gato Siames",
      descricao: "Gata siamesa resgatada em caixa de papelao proximo a rodoviaria. Ja recebeu atendimento veterinario e esta sob cuidados da ONG.",
      localizacao: "Centro, Sorocaba - SP",
      latitude: -23.5015,
      longitude: -47.458,
      foto_url: petMimi.foto_url,
      status_pet: "RESGATADO",
      usuario_id: ongUsuario.id,
      pet_id: petMimi.id,
    },
  });

  // Alerta 3: Thor - Cao Mestico de Porte Grande (Aguardando Adoção)
  // Criado de forma rapida por cidadao anonimo na rua (sem cadastro -> usuario_id nulo)
  const petThor = await prisma.pet.create({
    data: {
      nome: "Thor",
      especie: "Canina",
      raca: "Mestico Pastor",
      idade: 4,
      foto_url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
      status_pet: "ADOCAO",
      usuario_id: null,
    },
  });

  await prisma.alerta.create({
    data: {
      titulo: "Thor - Mestico de Pastor para Adocao",
      descricao: "Animal saudavel, vacinado e castrado, procura lar definitivo com espaco para correr.",
      localizacao: "Alem Ponte, Sorocaba - SP",
      latitude: -23.498,
      longitude: -47.442,
      foto_url: petThor.foto_url,
      status_pet: "ADOCAO",
      usuario_id: null,
      pet_id: petThor.id,
    },
  });

  console.log("3 Alertas principais cadastrados.");

  // 3. Carga Adicional de 47 Alertas Ficticios para Alcance da Meta de 50 Registros
  const bairrosSorocaba = [
    { nome: "Vila Hortencia", lat: -23.508, lng: -47.441 },
    { nome: "Trujillo", lat: -23.493, lng: -47.468 },
    { nome: "Jardim dos Estados", lat: -23.518, lng: -47.472 },
    { nome: "Santa Rosalia", lat: -23.491, lng: -47.445 },
    { nome: "Vila Haro", lat: -23.512, lng: -47.432 },
    { nome: "Wanel Ville", lat: -23.486, lng: -47.502 },
    { nome: "Eden", lat: -23.435, lng: -47.378 },
    { nome: "Brigadeiro Tobias", lat: -23.514, lng: -47.339 },
    { nome: "Jardim Simus", lat: -23.498, lng: -47.489 },
    { nome: "Aparecidinha", lat: -23.468, lng: -47.362 },
  ];

  const statusDisponiveis = [
    "ABANDONADO",
    "ADOCAO",
    "RESGATADO",
    "PERDI_MEU_PET",
    "ADOTADO",
  ];

  const fotosBanco = [
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=75",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=75",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=75",
    "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=75",
    "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=400&q=75",
  ];

  const alertasAdicionais = [];
  for (let i = 4; i <= 50; i++) {
    const bairroRef = bairrosSorocaba[(i - 4) % bairrosSorocaba.length];
    const statusRef = statusDisponiveis[(i - 4) % statusDisponiveis.length];
    const fotoRef = fotosBanco[(i - 4) % fotosBanco.length];

    // Variacao pequena de coordenadas ao redor do bairro
    const variacaoLat = (Math.random() - 0.5) * 0.008;
    const variacaoLng = (Math.random() - 0.5) * 0.008;

    alertasAdicionais.push({
      titulo: `Alerta #${i} - Animal em ${bairroRef.nome}`,
      descricao: `Ocorrencia registrada para auxilio ao animal na regiao de ${bairroRef.nome}. Necessita de verificacao ou abrigo.`,
      localizacao: `${bairroRef.nome}, Sorocaba - SP`,
      latitude: Number((bairroRef.lat + variacaoLat).toFixed(6)),
      longitude: Number((bairroRef.lng + variacaoLng).toFixed(6)),
      foto_url: fotoRef,
      status_pet: statusRef,
      usuario_id: i % 2 === 0 ? cidadaoUsuario.id : null,
    });
  }

  await prisma.alerta.createMany({
    data: alertasAdicionais,
  });

  console.log("Carga de 50 registros gerada com sucesso para testes de desempenho.");
}

main()
  .catch((e) => {
    console.error("Erro durante o processo de seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
