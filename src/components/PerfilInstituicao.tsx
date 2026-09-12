import React, { useState, useEffect } from 'react';
import { 
  Building2, Phone, Mail, FileText, UserPlus, GraduationCap, Edit3, Trash2, 
  Plus, X, CheckCircle, Calendar, Star, Award, BookOpen, School, Users, Sparkles
} from 'lucide-react';
import { supabase } from '../supabase';
import type { Instituicao, Curso, Classe, Pauta, Evento, AlunoDestaque, Aluno, Professor } from '../types';

export default function PerfilInstituicao() {
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'cursos' | 'classes' | 'pautas' | 'eventos' | 'destaques' | 'alunos' | 'professores'>('geral');
  const [termoBusca, setTermoBusca] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const [modalEditarGeral, setModalEditarGeral] = useState(false);
  const [abaEditar, setAbaEditar] = useState<'instituicao' | 'cursos' | 'classes' | 'pautas' | 'eventos' | 'destaques' | 'alunos' | 'professores'>('instituicao');

  const [modalCadastrarAluno, setModalCadastrarAluno] = useState(false);
  const [modalCadastrarProf, setModalCadastrarProf] = useState(false);

  const [nomeInst, setNomeInst] = useState('');
  const [nifInst, setNifInst] = useState('');
  const [telefoneInst, setTelefoneInst] = useState('');
  const [emailInst, setEmailInst] = useState('');
  const [descricaoInst, setDescricaoInst] = useState('');
  const [fotoLogoBase64, setFotoLogoBase64] = useState('');

  const [novoCurso, setNovoCurso] = useState('');
  const [novaClasse, setNovaClasse] = useState('');
  const [novaPauta, setNovaPauta] = useState('');
  const [novoEvento, setNovoEvento] = useState('');
  const [novoDestaque, setNovoDestaque] = useState('');

  const [nomeAlunoCad, setNomeAlunoCad] = useState('');
  const [numProcessoCad, setNumProcessoCad] = useState('');
  const [fotoAlunoBase64, setFotoAlunoBase64] = useState('');

  const [nomeProfCad, setNomeProfCad] = useState('');
  const [disciplinaCad, setDisciplinaCad] = useState('');
  const [fotoProfBase64, setFotoProfBase64] = useState('');

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [destaques, setDestaques] = useState<AlunoDestaque[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);

  const mostrarNotificacao = (texto: string) => {
    setMensagemSucesso(texto);
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const carregarTudo = async () => {
    setCarregando(true);
    try {
      const { data } = await supabase.from('instituicoes').select('*').limit(1).single();
      if (data) {
        setInstituicao(data);
        setNomeInst(data.nome || 'Colégio baú');
        setNifInst(data.nif || '0082506071LA40');
        setTelefoneInst(data.telefone || data.contacto || '+244 9XX XXX XXX');
        setEmailInst(data.email || 'contacto@escola.ao');
        setDescricaoInst(data.descricao || '');
        setFotoLogoBase64(data.logo_url || '');
      }
      const resCursos = await supabase.from('cursos').select('*');
      if (resCursos.data) setCursos(resCursos.data);

      const resClasses = await supabase.from('classes').select('*');
      if (resClasses.data) setClasses(resClasses.data);

      const resPautas = await supabase.from('pautas').select('*');
      if (resPautas.data) setPautas(resPautas.data);

      const resEventos = await supabase.from('eventos').select('*');
      if (resEventos.data) setEventos(resEventos.data);

      const resDestaques = await supabase.from('alunos_destaque').select('*');
      if (resDestaques.data) setDestaques(resDestaques.data);

      const resAlunos = await supabase.from('alunos').select('*');
      if (resAlunos.data) setAlunos(resAlunos.data);

      const resProfs = await supabase.from('professores').select('*');
      if (resProfs.data) setProfessores(resProfs.data);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const selecionarFotoLocal = (e: React.ChangeEvent<HTMLInputElement>, setFotoState: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setFotoState(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const salvarPerfilInstituicao = async () => {
    const payload = { 
      nome: nomeInst.trim() || 'Colégio baú', 
      nif: nifInst.trim() || '0082506071LA40', 
      telefone: telefoneInst.trim() || '+244 9XX XXX XXX', 
      contacto: telefoneInst.trim() || '+244 9XX XXX XXX', 
      email: emailInst.trim() || 'contacto@escola.ao', 
      descricao: descricaoInst.trim(), 
      logo_url: fotoLogoBase64 
    };
    if (instituicao?.id) {
      await supabase.from('instituicoes').update(payload).eq('id', instituicao.id);
    } else {
      await supabase.from('instituicoes').insert([payload]);
    }
    mostrarNotificacao('Perfil da Instituição Atualizado!');
    carregarTudo();
  };

  const adicionarItem = async (tabela: string, objeto: any, limparFn: () => void) => {
    if (!objeto.nome?.trim() && !objeto.titulo?.trim()) {
      alert('Preencha o campo antes de adicionar.');
      return;
    }
    await supabase.from(tabela).insert([objeto]);
    limparFn();
    mostrarNotificacao('Item adicionado!');
    carregarTudo();
  };

  const deletarItem = async (tabela: string, id: string) => {
    if (confirm('Tem a certeza que deseja excluir este item?')) {
      await supabase.from(tabela).delete().eq('id', id);
      mostrarNotificacao('Item excluído!');
      carregarTudo();
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const alunosFiltrados = alunos.filter(a => 
    a.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
    (a.numero_processo && a.numero_processo.toLowerCase().includes(termoBusca.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-12">
      {mensagemSucesso && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-4 py-2 rounded-full shadow-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {mensagemSucesso}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          
          {/* CABEÇALHO */}
          <div className="text-center pt-8 pb-5 px-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
            {instituicao?.logo_url ? (
              <img 
                src={instituicao.logo_url} 
                alt="Logótipo"
                className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white ring-2 ring-blue-100 mx-auto mb-3" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-700 mx-auto mb-3">
                <School className="w-12 h-12" />
              </div>
            )}

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{instituicao?.nome || 'Colégio baú'}</h2>
            <p className="text-xs font-semibold text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full mt-1.5 border border-blue-100">
              🏫 Escola / Instituição de Ensino
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">NIF: {instituicao?.nif || '0082506071LA40'}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-600" /> {instituicao?.telefone || '+244 9XX XXX XXX'}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-blue-600" /> {instituicao?.email || 'contacto@escola.ao'}</span>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="px-5 py-3.5 bg-white border-b border-slate-100">
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-1">
              <button 
                onClick={() => setModalCadastrarAluno(true)}
                className="flex-1 min-w-[130px] py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> + Cadastrar Aluno
              </button>
              <button 
                onClick={() => setModalCadastrarProf(true)}
                className="flex-1 min-w-[110px] py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-blue-600" /> + Professor
              </button>
              <button 
                onClick={() => setModalEditarGeral(true)}
                className="flex-1 min-w-[100px] py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4 text-amber-600" /> ✏️ Editar
              </button>
            </div>
          </div>

          {/* PUBLICIDADE BANNER */}
          <div className="px-5 py-2.5">
            <div className="w-full p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">📢 PUBLICIDADE</span>
                <h4 className="text-sm font-bold text-blue-950 mt-0.5">Informática & Tablets Educativos</h4>
                <p className="text-xs text-blue-800/85 mt-0.5">Venda de computadores portáteis e tablets escolares com suporte técnico.</p>
              </div>
            </div>
          </div>

          {/* MENU DE ABAS */}
          <div className="border-b border-slate-200 bg-slate-50/60 px-4">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {[
                { id: 'geral', label: 'Geral' },
                { id: 'cursos', label: `Cursos (${cursos.length})` },
                { id: 'classes', label: `Classes (${classes.length})` },
                { id: 'pautas', label: `📊 Pauta Trimestral (${pautas.length})` },
                { id: 'eventos', label: `📅 Eventos (${eventos.length})` },
                { id: 'destaques', label: `⭐ Destaques (${destaques.length})` },
                { id: 'alunos', label: `Alunos (${alunos.length})` },
                { id: 'professores', label: `Professores (${professores.length})` }
              ].map((aba) => (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id as any)}
                  className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold rounded-t-md transition-all border-b-2 -mb-[2px] ${
                    abaAtiva === aba.id 
                      ? 'border-blue-600 text-blue-700 bg-white font-bold shadow-sm' 
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {aba.label}
                </button>
              ))}
            </div>
          </div>

          {/* CONTEÚDO DAS ABAS */}
          <div className="p-5 min-h-[320px] bg-slate-50/30">
            {abaAtiva === 'geral' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-base font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" /> Visão Geral
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{instituicao?.descricao || 'Painel oficial do Portal Escola.'}</p>
                </div>
              </div>
            )}

            {abaAtiva === 'cursos' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-blue-900 flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-blue-600" /> Cursos Lecionados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cursos.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">• {item.nome}</span>
                      <button onClick={() => deletarItem('cursos', item.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'classes' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-blue-900 flex items-center gap-2 mb-4">
                  <School className="w-4 h-4 text-blue-600" /> Classes Disponíveis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {classes.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">🏫 {item.nome}</span>
                      <button onClick={() => deletarItem('classes', item.id)} className="text-slate-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'pautas' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-blue-900 flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-blue-600" /> Pautas Trimestrais
                </h3>
                <div className="space-y-2.5">
                  {pautas.map(item => (
                    <div key={item.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">📊 {item.titulo}</span>
                      <button onClick={() => deletarItem('pautas', item.id)} className="text-slate-400 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'eventos' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-blue-900 flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-blue-600" /> Próximos Eventos
                </h3>
                <div className="space-y-2.5">
                  {eventos.map(item => (
                    <div key={item.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">📅 {item.titulo}</span>
                      <button onClick={() => deletarItem('eventos', item.id)} className="text-slate-400 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'destaques' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-blue-900 flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-amber-500" /> Alunos em Destaque
                </h3>
                <div className="space-y-2.5">
                  {destaques.map(item => (
                    <div key={item.id} className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> {item.nome}
                      </span>
                      <button onClick={() => deletarItem('alunos_destaque', item.id)} className="text-slate-400 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'alunos' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-blue-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" /> Alunos ({alunos.length})
                  </h3>
                  <input 
                    type="text" 
                    placeholder="Filtrar aluno..." 
                    value={termoBusca} 
                    onChange={e => setTermoBusca(e.target.value)} 
                    className="text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {alunosFiltrados.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-3">
                        {item.foto_url ? (
                          <img src={item.foto_url} alt={item.nome} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold">🎒</div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.nome}</h4>
                          <p className="text-xs text-slate-500 font-mono">Proc: {item.numero_processo}</p>
                        </div>
                      </div>
                      <button onClick={() => deletarItem('alunos', item.id)} className="text-slate-400 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'professores' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-blue-900 flex items-center gap-2 mb-4">
                  <GraduationCap className="w-4 h-4 text-blue-600" /> Professores ({professores.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {professores.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-3">
                        {item.foto_url ? (
                          <img src={item.foto_url} alt={item.nome} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold">👨‍🏫</div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.nome}</h4>
                          <p className="text-xs text-blue-700 font-medium">{item.disciplina}</p>
                        </div>
                      </div>
                      <button onClick={() => deletarItem('professores', item.id)} className="text-slate-400 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL EDIÇÃO */}
      {modalEditarGeral && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-blue-950">⚙️ Central de Edição do Perfil</h3>
              <button onClick={() => setModalEditarGeral(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="px-4 py-2 border-b border-slate-200 flex gap-1.5 overflow-x-auto">
              {(['instituicao', 'cursos', 'classes', 'pautas', 'eventos', 'destaques', 'alunos', 'professores'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAbaEditar(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize whitespace-nowrap ${
                    abaEditar === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {abaEditar === 'instituicao' && (
                <div className="space-y-3">
                  <input type="text" className="w-full text-xs p-2.5 border rounded-lg" value={nomeInst} onChange={e => setNomeInst(e.target.value)} placeholder="Nome da Escola" />
                  <input type="text" className="w-full text-xs p-2.5 border rounded-lg" value={nifInst} onChange={e => setNifInst(e.target.value)} placeholder="NIF" />
                  <input type="text" className="w-full text-xs p-2.5 border rounded-lg" value={telefoneInst} onChange={e => setTelefoneInst(e.target.value)} placeholder="Contacto" />
                  <input type="email" className="w-full text-xs p-2.5 border rounded-lg" value={emailInst} onChange={e => setEmailInst(e.target.value)} placeholder="Email" />
                  <textarea rows={3} className="w-full text-xs p-2.5 border rounded-lg" value={descricaoInst} onChange={e => setDescricaoInst(e.target.value)} placeholder="Descrição..." />
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Logótipo da Escola (Galeria):</label>
                    <input type="file" accept="image/*" onChange={e => selecionarFotoLocal(e, setFotoLogoBase64)} className="text-xs" />
                  </div>
                  <button onClick={salvarPerfilInstituicao} className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">
                    Salvar Informações da Escola
                  </button>
                </div>
              )}

              {abaEditar === 'cursos' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" className="flex-1 text-xs p-2.5 border rounded-lg" placeholder="Novo Curso" value={novoCurso} onChange={e => setNovoCurso(e.target.value)} />
                    <button onClick={() => adicionarItem('cursos', { nome: novoCurso }, () => setNovoCurso(''))} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Add</button>
                  </div>
                  {cursos.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-lg">
                      <span className="text-xs font-semibold">{item.nome}</span>
                      <button onClick={() => deletarItem('cursos', item.id)} className="text-red-600 text-xs">Excluir</button>
                    </div>
                  ))}
                </div>
              )}

              {abaEditar === 'classes' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" className="flex-1 text-xs p-2.5 border rounded-lg" placeholder="Nova Classe" value={novaClasse} onChange={e => setNovaClasse(e.target.value)} />
                    <button onClick={() => adicionarItem('classes', { nome: novaClasse }, () => setNovaClasse(''))} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Add</button>
                  </div>
                  {classes.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-lg">
                      <span className="text-xs font-semibold">{item.nome}</span>
                      <button onClick={() => deletarItem('classes', item.id)} className="text-red-600 text-xs">Excluir</button>
                    </div>
                  ))}
                </div>
              )}

              {abaEditar === 'pautas' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" className="flex-1 text-xs p-2.5 border rounded-lg" placeholder="Título da Pauta" value={novaPauta} onChange={e => setNovaPauta(e.target.value)} />
                    <button onClick={() => adicionarItem('pautas', { titulo: novaPauta }, () => setNovaPauta(''))} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Add</button>
                  </div>
                  {pautas.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-lg">
                      <span className="text-xs font-semibold">{item.titulo}</span>
                      <button onClick={() => deletarItem('pautas', item.id)} className="text-red-600 text-xs">Excluir</button>
                    </div>
                  ))}
                </div>
              )}

              {abaEditar === 'eventos' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" className="flex-1 text-xs p-2.5 border rounded-lg" placeholder="Nome do Evento" value={novoEvento} onChange={e => setNovoEvento(e.target.value)} />
                    <button onClick={() => adicionarItem('eventos', { titulo: novoEvento }, () => setNovoEvento(''))} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Add</button>
                  </div>
                  {eventos.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-lg">
                      <span className="text-xs font-semibold">{item.titulo}</span>
                      <button onClick={() => deletarItem('eventos', item.id)} className="text-red-600 text-xs">Excluir</button>
                    </div>
                  ))}
                </div>
              )}

              {abaEditar === 'destaques' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" className="flex-1 text-xs p-2.5 border rounded-lg" placeholder="Aluno em Destaque" value={novoDestaque} onChange={e => setNovoDestaque(e.target.value)} />
                    <button onClick={() => adicionarItem('alunos_destaque', { nome: novoDestaque }, () => setNovoDestaque(''))} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Add</button>
                  </div>
                  {destaques.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 border rounded-lg">
                      <span className="text-xs font-semibold">{item.nome}</span>
                      <button onClick={() => deletarItem('alunos_destaque', item.id)} className="text-red-600 text-xs">Excluir</button>
                    </div>
                  ))}
                </div>
              )}

              {abaEditar === 'alunos' && (
                <div className="space-y-2">
                  {alunos.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 border rounded-lg">
                      <span className="text-xs font-semibold">{item.nome}</span>
                      <button onClick={() => deletarItem('alunos', item.id)} className="text-red-600 text-xs">Excluir</button>
                    </div>
                  ))}
                </div>
              )}

              {abaEditar === 'professores' && (
                <div className="space-y-2">
                  {professores.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 border rounded-lg">
                      <span className="text-xs font-semibold">{item.nome} ({item.disciplina})</span>
                      <button onClick={() => deletarItem('professores', item.id)} className="text-red-600 text-xs">Excluir</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-slate-50">
              <button onClick={() => setModalEditarGeral(false)} className="w-full py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR ALUNO */}
      {modalCadastrarAluno && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-3">
            <h3 className="text-base font-bold text-blue-950">🎓 Cadastrar Aluno</h3>
            <input type="text" placeholder="Nome do Aluno" className="w-full text-xs p-2.5 border rounded-lg" value={nomeAlunoCad} onChange={e => setNomeAlunoCad(e.target.value)} />
            <input type="text" placeholder="Nº de Processo" className="w-full text-xs p-2.5 border rounded-lg" value={numProcessoCad} onChange={e => setNumProcessoCad(e.target.value)} />
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Foto do Aluno:</label>
              <input type="file" accept="image/*" onChange={e => selecionarFotoLocal(e, setFotoAlunoBase64)} className="text-xs" />
            </div>
            <button 
              onClick={() => {
                adicionarItem('alunos', { nome: nomeAlunoCad, numero_processo: numProcessoCad, foto_url: fotoAlunoBase64 }, () => {
                  setNomeAlunoCad(''); setNumProcessoCad(''); setFotoAlunoBase64(''); setModalCadastrarAluno(false);
                });
              }} 
              className="w-full py-2.5 bg-blue-700 text-white text-xs font-bold rounded-xl"
            >
              Cadastrar Aluno
            </button>
            <button onClick={() => setModalCadastrarAluno(false)} className="w-full py-2 text-slate-600 text-xs">Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR PROFESSOR */}
      {modalCadastrarProf && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-3">
            <h3 className="text-base font-bold text-blue-950">👨‍🏫 Cadastrar Professor</h3>
            <input type="text" placeholder="Nome do Professor" className="w-full text-xs p-2.5 border rounded-lg" value={nomeProfCad} onChange={e => setNomeProfCad(e.target.value)} />
            <input type="text" placeholder="Disciplina" className="w-full text-xs p-2.5 border rounded-lg" value={disciplinaCad} onChange={e => setDisciplinaCad(e.target.value)} />
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Foto do Professor:</label>
              <input type="file" accept="image/*" onChange={e => selecionarFotoLocal(e, setFotoProfBase64)} className="text-xs" />
            </div>
            <button 
              onClick={() => {
                adicionarItem('professores', { nome: nomeProfCad, disciplina: disciplinaCad, foto_url: fotoProfBase64 }, () => {
                  setNomeProfCad(''); setDisciplinaCad(''); setFotoProfBase64(''); setModalCadastrarProf(false);
                });
              }} 
              className="w-full py-2.5 bg-blue-700 text-white text-xs font-bold rounded-xl"
            >
              Cadastrar Professor
            </button>
            <button onClick={() => setModalCadastrarProf(false)} className="w-full py-2 text-slate-600 text-xs">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
