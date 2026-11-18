/**
 * Interfaces de Dados do Petbell
 */

export type TipoUsuario = 'cidadao' | 'ong' | 'administrador';

export type StatusPet = 
  | 'RESGATADO' 
  | 'ADOTADO' 
  | 'ADOCAO' 
  | 'ABANDONADO' 
  | 'PERDI_MEU_PET';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  telefone: string;
  created_at?: string;
  alertas?: Alerta[];
}

export interface Pet {
  id: string;
  nome: string | null;
  especie: string | null;
  raca: string | null;
  idade: number | null;
  foto_url: string | null;
  status_pet: StatusPet;
  usuario_id: string | null;
  created_at: string;
}

export interface MensagemComunidade {
  id: string;
  alerta_id: string;
  autor_nome: string;
  autor_tipo: string;
  conteudo: string;
  created_at: string;
}

export interface Alerta {
  id: string;
  titulo: string;
  descricao: string;
  localizacao: string;
  latitude: number;
  longitude: number;
  foto_url: string | null;
  status_pet: StatusPet;
  usuario_id: string | null;
  pet_id: string | null;
  created_at: string;
  pet?: Pet;
  usuario?: {
    id: string;
    nome: string;
    tipo: TipoUsuario;
  };
  mensagens?: MensagemComunidade[];
  _count?: {
    mensagens: number;
  };
}

export interface RespostaApi<T> {
  sucesso: boolean;
  mensagem?: string;
  dados?: T;
  meta?: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
  };
  erros?: Array<{ campo: string; mensagem: string }>;
}
