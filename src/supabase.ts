import { createClient } from '@supabase/supabase-js';
import type { Instituicao, Curso, Classe, Pauta, Evento, AlunoDestaque, Aluno, Professor } from './types';

const INITIAL_DATA = {
  instituicoes: [
    {
      id: 'inst-01',
      nome: 'Colégio baú',
      nif: '0082506071LA40',
      telefone: '+244 923 456 789',
      contacto: '+244 923 456 789',
      email: 'contacto@colegiobau.ao',
      descricao: 'Instituição de ensino de referência no desenvolvimento cognitivo, técnico e humano de crianças e jovens, com corpo docente qualificado, infraestrutura moderna e rigor pedagógico.',
      logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&auto=format&fit=crop&q=80'
    }
  ] as Instituicao[],
  cursos: [
    { id: 'cur-1', nome: 'Ciências Físicas e Biológicas' },
    { id: 'cur-2', nome: 'Ciências Económicas e Jurídicas' },
    { id: 'cur-3', nome: 'Técnico de Informática' },
    { id: 'cur-4', nome: 'Contabilidade e Gestão Empresarial' }
  ] as Curso[],
  classes: [
    { id: 'cla-1', nome: '7ª Classe do Ensino Primário' },
    { id: 'cla-2', nome: '8ª Classe do I Ciclo' },
    { id: 'cla-3', nome: '9ª Classe do I Ciclo' },
    { id: 'cla-4', nome: '10ª Classe - Ensino Médio' },
    { id: 'cla-5', nome: '11ª Classe - Informática' },
    { id: 'cla-6', nome: '12ª Classe - Finalistas' }
  ] as Classe[],
  pautas: [
    { id: 'pau-1', titulo: 'Pauta Geral do 1º Trimestre - Todas as Turmas' },
    { id: 'pau-2', titulo: 'Pauta Parcial do 2º Trimestre - 10ª e 11ª Classes' },
    { id: 'pau-3', titulo: 'Pauta do Exame Nacional / Exames Finais' }
  ] as Pauta[],
  eventos: [
    { id: 'eve-1', titulo: 'Feira Anual das Ciências e Tecnologias 2026' },
    { id: 'eve-2', titulo: 'Reunião com Encarregados de Educação - 1º Semestre' },
    { id: 'eve-3', titulo: 'Torneio Inter-Turmas de Futsal e Xadrez' }
  ] as Evento[],
  alunos_destaque: [
    { id: 'des-1', nome: 'Mauro Manuel Bento - Média 18.7 v.' },
    { id: 'des-2', nome: 'Esperança Neves Domingos - Campeã de Matemática' },
    { id: 'des-3', nome: 'Adilson António - Melhor Projecto Técnico' }
  ] as AlunoDestaque[],
  alunos: [
    { 
      id: 'alu-1', 
      nome: 'Mauro Manuel Bento', 
      numero_processo: 'PROC-004821',
      foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    { 
      id: 'alu-2', 
      nome: 'Esperança Neves Domingos', 
      numero_processo: 'PROC-004822',
      foto_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
    },
    { 
      id: 'alu-3', 
      nome: 'Adilson António', 
      numero_processo: 'PROC-004823',
      foto_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
    }
  ] as Aluno[],
  professores: [
    { 
      id: 'pro-1', 
      nome: 'Prof. Manuel Cabingano', 
      disciplina: 'Matemática e Física',
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    { 
      id: 'pro-2', 
      nome: 'Prof.ª Teresa Kiala', 
      disciplina: 'Língua Portuguesa e Literatura',
      foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
    }
  ] as Professor[]
};

const STORAGE_KEY = 'colegio_bau_supabase_storage_v1';

function getStoredTables(): typeof INITIAL_DATA {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DATA;
  }
}

function saveStoredTables(data: typeof INITIAL_DATA) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Falha ao salvar no localStorage:', err);
  }
}

const envMeta = (import.meta as unknown as { env?: Record<string, string> }).env;
const envSupabaseUrl = envMeta?.VITE_SUPABASE_URL || '';
const envSupabaseKey = envMeta?.VITE_SUPABASE_ANON_KEY || '';

const hasRealSupabase = Boolean(envSupabaseUrl && envSupabaseKey && envSupabaseUrl.startsWith('http'));
const realClient = hasRealSupabase ? createClient(envSupabaseUrl, envSupabaseKey) : null;

export const supabase = {
  from(tableName: string) {
    if (realClient) {
      return realClient.from(tableName);
    }
    return {
      select(_columns = '*') {
        return {
          limit(_num: number) {
            return {
              async single() {
                const tables = getStoredTables();
                const list = (tables as any)[tableName] || [];
                return { data: list[0] || null, error: null };
              }
            };
          },
          async then(resolve: (res: { data: any[]; error: any }) => void) {
            const tables = getStoredTables();
            const list = (tables as any)[tableName] || [];
            resolve({ data: JSON.parse(JSON.stringify(list)), error: null });
          }
        };
      },
      async insert(records: any[]) {
        const tables = getStoredTables();
        const currentList = (tables as any)[tableName] || [];
        const newRecords = records.map(r => ({
          id: r.id || `${tableName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ...r
        }));
        (tables as any)[tableName] = [...currentList, ...newRecords];
        saveStoredTables(tables);
        return { data: newRecords, error: null };
      },
      update(payload: any) {
        return {
          async eq(field: string, val: any) {
            const tables = getStoredTables();
            const currentList = (tables as any)[tableName] || [];
            (tables as any)[tableName] = currentList.map((item: any) => item[field] === val ? { ...item, ...payload } : item);
            saveStoredTables(tables);
            return { data: payload, error: null };
          }
        };
      },
      delete() {
        return {
          async eq(field: string, val: any) {
            const tables = getStoredTables();
            const currentList = (tables as any)[tableName] || [];
            (tables as any)[tableName] = currentList.filter((item: any) => item[field] !== val);
            saveStoredTables(tables);
            return { data: null, error: null };
          }
        };
      }
    };
  }
};

export function resetarDadosOriginais() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
}
