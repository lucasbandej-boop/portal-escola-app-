export interface Instituicao {
  id?: string;
  nome: string;
  nif: string;
  telefone: string;
  contacto?: string;
  email: string;
  descricao: string;
  logo_url: string;
}

export interface Curso {
  id: string;
  nome: string;
  descricao?: string;
}

export interface Classe {
  id: string;
  nome: string;
  grau?: string;
}

export interface Pauta {
  id: string;
  titulo: string;
  trimestre?: string;
  ano_lectivo?: string;
}

export interface Evento {
  id: string;
  titulo: string;
  data?: string;
}

export interface AlunoDestaque {
  id: string;
  nome: string;
}

export interface Aluno {
  id: string;
  nome: string;
  numero_processo: string;
  foto_url?: string;
}

export interface Professor {
  id: string;
  nome: string;
  disciplina: string;
  foto_url?: string;
}
