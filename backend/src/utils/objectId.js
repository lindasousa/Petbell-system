/**
 * Validacao de identificadores do MongoDB (ObjectId: 24 caracteres hexadecimais)
 * Evita consultas ao banco com IDs malformados vindos da URL.
 */

function idValido(id) {
  return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
}

module.exports = { idValido };
