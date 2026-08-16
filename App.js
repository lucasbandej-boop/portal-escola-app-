import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 max-w-md mx-auto">
      {/* Cabeçalho */}
      <header className="flex justify-between items-center my-4">
        <h1 className="text-2xl font-bold text-slate-900">Portal Escola</h1>
        <span className="bg-indigo-100 text-indigo-700 font-medium px-3 py-1 rounded-full text-sm flex items-center gap-1">
          📢 Publicidade
        </span>
      </header>

      {/* Título do Menu */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Menu Principal do Sistema</h2>
        <p className="text-sm text-slate-500">Selecione a opção desejada para navegar:</p>
      </div>

      {/* Opções de Navegação */}
      <div className="space-y-4 mb-6">
        <button className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-transform">
          <span className="text-3xl">🏫</span>
          <span className="font-bold text-slate-800 text-base">Cadastramento de Instituições</span>
        </button>

        <button className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-transform">
          <span className="text-3xl">🔍</span>
          <span className="font-bold text-slate-800 text-base">Pesquisa de Alunos e Encarregados</span>
        </button>

        <button className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-transform">
          <span className="text-3xl">👨‍🏫</span>
          <span className="font-bold text-slate-800 text-base">Cadastramento de Professores</span>
        </button>
      </div>

      {/* Quadro de Publicidade */}
      <div className="bg-[#1e293b] text-white p-6 rounded-2xl shadow-sm mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="bg-slate-700/60 text-xs px-2.5 py-1 rounded-full text-slate-300 flex items-center gap-1">
            💻 Tecnologia Escolar
          </span>
          <a href="#" className="text-amber-400 text-xs font-semibold hover:underline">
            Ver Todas →
          </a>
        </div>

        <h3 className="text-lg font-bold mb-1">Softwares & Equipamentos</h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Computadores, impressoras e redes para instituições de ensino com assistência técnica garantida em Luanda.
        </p>

        <p className="text-xs text-slate-400 mb-2">
          Para mais informações ligue no número abaixo:
        </p>

        <a 
          href="tel:929500600" 
          className="flex items-center justify-center gap-2 bg-[#0f172a] text-amber-400 py-3 rounded-xl font-bold text-sm border border-slate-700/50 hover:bg-slate-900 transition-colors"
        >
          📞 929500600 (Clique para Ligar)
        </a>
      </div>

      {/* Quadro de Apoio ao Cliente */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-lg">🎧</span>
          <h4 className="text-sm font-bold text-slate-800">Apoio ao Cliente & Suporte</h4>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Dúvidas ou problemas no portal? Fale conosco:
        </p>
        <a 
          href="tel:929500600" 
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-semibold text-xs hover:bg-emerald-700 transition-colors w-full shadow-sm"
        >
          📞 Ligar para o Suporte: 929500600
        </a>
      </div>
    </div>
  );
}
