import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, Alert, ActivityIndicator, Image, Linking
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [tela, setTela] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [instituicao, setInstituicao] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Auth
  const [emailAuth, setEmailAuth] = useState('');
  const [senhaAuth, setSenhaAuth] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);

  // Form Instituição
  const [instNome, setInstNome] = useState('');
  const [instNif, setInstNif] = useState('');
  const [instDirector, setInstDirector] = useState('');
  const [instSecretaria, setInstSecretaria] = useState('');
  const [instEstudantes, setInstEstudantes] = useState('');
  const [instProfessores, setInstProfessores] = useState('');
  const [instLocalizacao, setInstLocalizacao] = useState('');
  const [instLogoUrl, setInstLogoUrl] = useState('');

  // Form Aluno
  const [alunoNome, setAlunoNome] = useState('');
  const [alunoNasc, setAlunoNasc] = useState('');
  const [alunoBI, setAlunoBI] = useState('');
  const [alunoNivel, setAlunoNivel] = useState('medio');
  const [alunoCursoTurma, setAlunoCursoTurma] = useState('');
  const [alunoProfResp, setAlunoProfResp] = useState('');
  const [alunoEncarregado, setAlunoEncarregado] = useState('');
  const [alunoTelEncarregado, setAlunoTelEncarregado] = useState('');
  const [alunoFotoUrl, setAlunoFotoUrl] = useState('');

  // Form Professor
  const [profNome, setProfNome] = useState('');
  const [profNasc, setProfNasc] = useState('');
  const [profBI, setProfBI] = useState('');
  const [profGrau, setProfGrau] = useState('');
  const [profNivel, setProfNivel] = useState('medio');
  const [profDisciplina, setProfDisciplina] = useState('');
  const [profTel, setProfTel] = useState('');
  const [profFotoUrl, setProfFotoUrl] = useState('');

  // Pesquisa
  const [numProcPesquisa, setNumProcPesquisa] = useState('');
  const [resultadoPesquisa, setResultadoPesquisa] = useState(null);

  // Transferência
  const [transfEmail, setTransfEmail] = useState('');
  const [transfMotivo, setTransfMotivo] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) carregarPerfilInstituicao(session.user.id);
    });
  }, []);

  const carregarPerfilInstituicao = async (userId) => {
    setLoading(true);
    const { data } = await supabase.from('instituicoes').select('*').eq('user_id', userId).maybeSingle();
    if (data) {
      setInstituicao(data);
      setInstNome(data.nome || '');
      setInstNif(data.nif || '');
      setInstDirector(data.director || '');
      setInstSecretaria(data.secretaria || '');
      setInstEstudantes(data.num_estudantes ? String(data.num_estudantes) : '');
      setInstProfessores(data.num_professores ? String(data.num_professores) : '');
      setInstLocalizacao(data.localizacao || '');
      setInstLogoUrl(data.logo_url || '');
      setModoEdicao(false);
    } else {
      setModoEdicao(true);
    }
    setLoading(false);
  };

  const handleUploadFoto = async (event, callbackUrl) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('midia').upload(filePath, file);

      if (uploadError) {
        alert('Erro no carregamento da imagem: ' + uploadError.message);
      } else {
        const { data } = supabase.storage.from('midia').getPublicUrl(filePath);
        callbackUrl(data.publicUrl);
        alert('Fotografia carregada com sucesso!');
      }
    } catch (e) {
      alert('Erro ao selecionar foto: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!emailAuth || !senhaAuth) return alert('Preencha o e-mail e a palavra-passe.');
    setLoading(true);
    if (modoRegistro) {
      const { data, error } = await supabase.auth.signUp({ email: emailAuth, password: senhaAuth });
      if (error) alert('Erro ao registrar: ' + error.message);
      else {
        alert('Conta criada com sucesso! Preencha os dados da instituição.');
        setSession(data.session);
        setTela('perfil_inst');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailAuth, password: senhaAuth });
      if (error) alert('Erro de Login: ' + error.message);
      else {
        setSession(data.session);
        carregarPerfilInstituicao(data.session.user.id);
        setTela('perfil_inst');
      }
    }
    setLoading(false);
  };

  const salvarInstituicao = async () => {
    if (!instNome) return alert('Nome da instituição é obrigatório');
    setLoading(true);
    const payload = {
      user_id: session?.user?.id,
      nome: instNome,
      nif: instNif,
      director: instDirector,
      secretaria: instSecretaria,
      num_estudantes: instEstudantes ? parseInt(instEstudantes) : null,
      num_professores: instProfessores ? parseInt(instProfessores) : null,
      localizacao: instLocalizacao,
      logo_url: instLogoUrl
    };

    let error;
    if (instituicao?.id) {
      const res = await supabase.from('instituicoes').update(payload).eq('id', instituicao.id);
      error = res.error;
    } else {
      const res = await supabase.from('instituicoes').insert([payload]).select().single();
      error = res.error;
      if (res.data) setInstituicao(res.data);
    }

    setLoading(false);
    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      alert('Perfil da instituição guardado com sucesso! 🎉');
      if (session?.user?.id) {
        carregarPerfilInstituicao(session.user.id);
      }
    }
  };

  const cadastrarAluno = async () => {
    if (!alunoNome) return alert('Nome do aluno é obrigatório');
    setLoading(true);
    const numProcesso = 'PROC-' + Math.floor(100000 + Math.random() * 900000);
    
    const { error } = await supabase.from('alunos').insert([{
      instituicao_id: instituicao?.id || null,
      numero_processo: numProcesso,
      nome_completo: alunoNome,
      data_nascimento: alunoNasc || null,
      numero_bilhete: alunoBI,
      nivel_ensino: alunoNivel,
      curso_turma: alunoCursoTurma,
      professor_responsavel: alunoProfResp,
      encarregado_nome: alunoEncarregado,
      encarregado_telefone: alunoTelEncarregado,
      foto_url: alunoFotoUrl
    }]);

    setLoading(false);
    if (error) {
      alert('Erro ao cadastrar aluno: ' + error.message);
    } else {
      alert(`Aluno Cadastrado com Sucesso! 🎉\n\nNº de Processo do Aluno: ${numProcesso}`);
      setAlunoNome(''); setAlunoBI(''); setAlunoCursoTurma(''); setAlunoFotoUrl('');
      setTela('perfil_inst');
    }
  };

  const cadastrarProfessor = async () => {
    if (!profNome) return alert('Nome do professor é obrigatório');
    setLoading(true);
    const { error } = await supabase.from('professores').insert([{
      instituicao_id: instituicao?.id || null,
      nome_completo: profNome,
      data_nascimento: profNasc || null,
      numero_bilhete: profBI,
      grau_academico: profGrau,
      nivel_ensino: profNivel,
      disciplina: profDisciplina,
      telefone: profTel,
      foto_url: profFotoUrl
    }]);

    setLoading(false);
    if (error) alert('Erro ao cadastrar professor: ' + error.message);
    else {
      alert('Professor Cadastrado com Sucesso! 🎉');
      setProfNome(''); setProfBI(''); setProfFotoUrl('');
      setTela('menu');
    }
  };

  const pesquisarPorProcesso = async () => {
    if (!numProcPesquisa) return alert('Introduza o Nº de Processo');
    setLoading(true);
    const { data, error } = await supabase.from('alunos').select('*, instituicoes(nome)').eq('numero_processo', numProcPesquisa.trim()).single();
    setLoading(false);
    if (error || !data) alert('Nenhum registo encontrado para este número de processo.');
    else setResultadoPesquisa(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portal Escola</Text>
        {session ? (
          <TouchableOpacity onPress={() => supabase.auth.signOut().then(() => { setSession(null); setInstituicao(null); setTela('menu'); })} style={styles.btnSair}>
            <Text style={styles.btnSairTxt}>Sair</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>

        {/* 1. MENU PRINCIPAL */}
        {tela === 'menu' && (
          <View>
            <Text style={styles.menuSub}>Menu Principal do Sistema</Text>
            <Text style={styles.menuDesc}>Selecione a opção desejada para navegar:</Text>

            <TouchableOpacity style={styles.cardMenu} onPress={() => setTela(session ? 'perfil_inst' : 'login_inst')}>
              <Text style={styles.cardIcon}>🏫</Text>
              <Text style={styles.cardTitle}>Cadastramento de Instituições</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardMenu} onPress={() => setTela('pesquisa')}>
              <Text style={styles.cardIcon}>🔍</Text>
              <Text style={styles.cardTitle}>Pesquisa de Alunos e Encarregados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardMenu} onPress={() => setTela('cad_prof')}>
              <Text style={styles.cardIcon}>👨‍🏫</Text>
              <Text style={styles.cardTitle}>Cadastramento de Professores</Text>
            </TouchableOpacity>

            {/* BANNER PUBLICIDADE */}
            <View style={styles.bannerAd}>
              <View style={styles.adBadge}><Text style={styles.adBadgeTxt}>👕 Confecção de Uniformes (2 / 3)</Text></View>
              <Text style={styles.adTitle}>Uniformes & Fardamentos</Text>
              <Text style={styles.adDesc}>Produção de fardas escolares para colégios e institutos. Batas, camisas, calças e bordados personalizados com a melhor qualidade de Luanda.</Text>
              <TouchableOpacity style={styles.adBtn} onPress={() => Linking.openURL('tel:929561442')}>
                <Text style={styles.adBtnTxt}>📞 929561442 (Clique para Ligar)</Text>
              </TouchableOpacity>
            </View>

            {/* SUPORTE */}
            <View style={styles.suporteBox}>
              <Text style={styles.suporteTitle}>🎧 Apoio ao Cliente & Suporte</Text>
              <Text style={{ textAlign: 'center', color: '#64748b', marginVertical: 6 }}>Dúvidas ou problemas no portal? Fale conosco:</Text>
              <TouchableOpacity style={styles.btnSuporte} onPress={() => Linking.openURL('tel:929561442')}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>📞 Ligar para o Suporte: 929561442</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 2. TELA LOGIN / REGISTO */}
        {tela === 'login_inst' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{modoRegistro ? 'Criar Conta de Instituição' : 'Entrar no Portal'}</Text>
            <TextInput style={styles.input} placeholder="E-mail" value={emailAuth} onChangeText={setEmailAuth} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Palavra-passe" secureTextEntry value={senhaAuth} onChangeText={setSenhaAuth} />
            
            <TouchableOpacity style={styles.btnPrimary} onPress={handleAuth} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>{modoRegistro ? 'REGISTRAR' : 'ENTRAR'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModoRegistro(!modoRegistro)} style={{ marginTop: 15, alignItems: 'center' }}>
              <Text style={{ color: '#2563eb' }}>{modoRegistro ? 'Já tem conta? Faça Login' : 'Não tem conta? Criar conta de Instituição'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTela('menu')} style={{ marginTop: 15, alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Voltar ao Menu</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. TELA PERFIL DA INSTITUIÇÃO */}
        {tela === 'perfil_inst' && (
          <View>
            <View style={styles.fbHeader}>
              {instLogoUrl ? (
                <Image source={{ uri: instLogoUrl }} style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 10 }} />
              ) : (
                <Text style={{ fontSize: 40 }}>🏫</Text>
              )}
              <Text style={styles.fbTitle}>{instNome || 'Minha Instituição'}</Text>
              <Text style={{ color: '#64748b' }}>NIF / BI: {instNif || 'Não informado'}</Text>
            </View>

            {!modoEdicao && instituicao ? (
              /* MODO VISUALIZAÇÃO DO PERFIL */
              <View style={styles.profileCard}>
                <Text style={styles.profileCardTitle}>📄 Ficha da Instituição</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>👨‍💼 Director Geral:</Text>
                  <Text style={styles.infoValue}>{instDirector || 'Não informado'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📑 Secretaria:</Text>
                  <Text style={styles.infoValue}>{instSecretaria || 'Não informada'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>👨‍🎓 Nº de Estudantes:</Text>
                  <Text style={styles.infoValue}>{instEstudantes || '0'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>👩‍🏫 Nº de Professores:</Text>
                  <Text style={styles.infoValue}>{instProfessores || '0'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📍 Localização:</Text>
                  <Text style={styles.infoValue}>{instLocalizacao || 'Não informada'}</Text>
                </View>

                <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#4b5563', marginTop: 15 }]} onPress={() => setModoEdicao(true)}>
                  <Text style={styles.btnTxt}>✏️ EDITAR DADOS DA INSTITUIÇÃO</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* MODO EDICÃO DO PERFIL */
              <View style={styles.formContainer}>
                <Text style={styles.sectionHeader}>Formulário do Perfil</Text>
                <TextInput style={styles.input} placeholder="Nome Oficial da Instituição" value={instNome} onChangeText={setInstNome} />
                <TextInput style={styles.input} placeholder="NIF / BI" value={instNif} onChangeText={setInstNif} />
                <TextInput style={styles.input} placeholder="Director Geral" value={instDirector} onChangeText={setInstDirector} />
                <TextInput style={styles.input} placeholder="Secretaria" value={instSecretaria} onChangeText={setInstSecretaria} />
                <TextInput style={styles.input} placeholder="Nº de Estudantes" value={instEstudantes} onChangeText={setInstEstudantes} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Nº de Professores" value={instProfessores} onChangeText={setInstProfessores} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Localização" value={instLocalizacao} onChangeText={setInstLocalizacao} />

                <Text style={styles.label}>Logótipo / Imagem da Instituição:</Text>
                <input type="file" accept="image/*" onChange={(e) => handleUploadFoto(e, setInstLogoUrl)} style={{ marginBottom: 15 }} />

                <TouchableOpacity style={styles.btnPrimary} onPress={salvarInstituicao} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>GUARDA/SALVAR DADOS</Text>}
                </TouchableOpacity>

                {instituicao ? (
                  <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setModoEdicao(false)}>
                    <Text style={{ color: '#64748b' }}>Cancelar Edição</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 }} />

            <Text style={styles.sectionHeader}>Ações da Instituição</Text>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setTela('cad_aluno')}>
              <Text style={styles.btnSecTxt}>+ Cadastrar Aluno nesta Instituição</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnSecondary, { marginTop: 10, backgroundColor: '#059669' }]} onPress={() => setTela('transferencia')}>
              <Text style={styles.btnSecTxt}>🔄 Transferência de Estudante</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTela('menu')} style={{ marginVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Voltar ao Menu Principal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. CADASTRO DE ALUNO */}
        {tela === 'cad_aluno' && (
          <View>
            <Text style={styles.formTitle}>Cadastramento de Aluno 🎒</Text>
            <TextInput style={styles.input} placeholder="Nome Completo *" value={alunoNome} onChangeText={setAlunoNome} />
            <TextInput style={styles.input} placeholder="Data de Nascimento (AAAA-MM-DD)" value={alunoNasc} onChangeText={setAlunoNasc} />
            <TextInput style={styles.input} placeholder="Número do Bilhete de Identidade" value={alunoBI} onChangeText={setAlunoBI} />

            <Text style={styles.label}>Fotografia Tipo Passe do Aluno:</Text>
            <input type="file" accept="image/*" onChange={(e) => handleUploadFoto(e, setAlunoFotoUrl)} style={{ marginBottom: 15 }} />

            <Text style={styles.label}>Nível de Ensino:</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TouchableOpacity style={[styles.typeBtn, alunoNivel === 'iniciacao' && styles.typeBtnActive]} onPress={() => setAlunoNivel('iniciacao')}>
                <Text style={alunoNivel === 'iniciacao' ? styles.typeTxtActive : styles.typeTxt}>Iniciação</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, alunoNivel === 'medio' && styles.typeBtnActive]} onPress={() => setAlunoNivel('medio')}>
                <Text style={alunoNivel === 'medio' ? styles.typeTxtActive : styles.typeTxt}>Ensino Médio</Text>
              </TouchableOpacity>
            </View>

            {alunoNivel === 'medio' ? (
              <TextInput style={styles.input} placeholder="Curso / Turma" value={alunoCursoTurma} onChangeText={setAlunoCursoTurma} />
            ) : (
              <TextInput style={styles.input} placeholder="Professor Responsável" value={alunoProfResp} onChangeText={setAlunoProfResp} />
            )}

            <TextInput style={styles.input} placeholder="Nome do Encarregado" value={alunoEncarregado} onChangeText={setAlunoEncarregado} />
            <TextInput style={styles.input} placeholder="Telefone do Encarregado" value={alunoTelEncarregado} onChangeText={setAlunoTelEncarregado} keyboardType="phone-pad" />

            <TouchableOpacity style={styles.btnPrimary} onPress={cadastrarAluno} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>GERAR Nº PROCESSO E CADASTRAR</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTela('perfil_inst')} style={{ marginVertical: 15, alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Voltar ao Perfil</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. CADASTRO DE PROFESSOR */}
        {tela === 'cad_prof' && (
          <View>
            <Text style={styles.formTitle}>Cadastramento de Professor 👨‍🏫</Text>
            <TextInput style={styles.input} placeholder="Nome Completo *" value={profNome} onChangeText={setProfNome} />
            <TextInput style={styles.input} placeholder="Data de Nascimento (AAAA-MM-DD)" value={profNasc} onChangeText={setProfNasc} />
            <TextInput style={styles.input} placeholder="Número do Bilhete de Identidade" value={profBI} onChangeText={setProfBI} />
            <TextInput style={styles.input} placeholder="Grau Académico (Ex: Licenciado)" value={profGrau} onChangeText={setProfGrau} />

            <Text style={styles.label}>Fotografia do Professor:</Text>
            <input type="file" accept="image/*" onChange={(e) => handleUploadFoto(e, setProfFotoUrl)} style={{ marginBottom: 15 }} />

            <Text style={styles.label}>Nível de Atuação:</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TouchableOpacity style={[styles.typeBtn, profNivel === 'iniciacao' && styles.typeBtnActive]} onPress={() => setProfNivel('iniciacao')}>
                <Text style={profNivel === 'iniciacao' ? styles.typeTxtActive : styles.typeTxt}>Iniciação</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, profNivel === 'medio' && styles.typeBtnActive]} onPress={() => setProfNivel('medio')}>
                <Text style={profNivel === 'medio' ? styles.typeTxtActive : styles.typeTxt}>Ensino Médio</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Disciplina Lecionada" value={profDisciplina} onChangeText={setProfDisciplina} />
            <TextInput style={styles.input} placeholder="Número de Telefone" value={profTel} onChangeText={setProfTel} keyboardType="phone-pad" />

            <TouchableOpacity style={styles.btnPrimary} onPress={cadastrarProfessor} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>CADASTRAR PROFESSOR</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTela('menu')} style={{ marginVertical: 15, alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Voltar ao Menu</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. PESQUISA POR Nº DE PROCESSO */}
        {tela === 'pesquisa' && (
          <View>
            <Text style={styles.formTitle}>Consulta de Perfil do Estudante 🔍</Text>
            <TextInput style={styles.input} placeholder="Ex: PROC-123456" value={numProcPesquisa} onChangeText={setNumProcPesquisa} autoCapitalize="characters" />

            <TouchableOpacity style={styles.btnPrimary} onPress={pesquisarPorProcesso} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>PESQUISAR DADOS</Text>}
            </TouchableOpacity>

            {resultadoPesquisa && (
              <View style={styles.resultCard}>
                {resultadoPesquisa.foto_url ? (
                  <Image source={{ uri: resultadoPesquisa.foto_url }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10, alignSelf: 'center' }} />
                ) : null}
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' }}>{resultadoPesquisa.nome_completo}</Text>
                <Text style={{ color: '#2563eb', marginVertical: 4, textAlign: 'center', fontWeight: 'bold' }}>Nº de Processo: {resultadoPesquisa.numero_processo}</Text>
                <Text>🏫 Escola: {resultadoPesquisa.instituicoes?.nome || 'N/A'}</Text>
                <Text>📚 Nível: {resultadoPesquisa.nivel_ensino === 'medio' ? 'Ensino Médio' : 'Iniciação'}</Text>
                {resultadoPesquisa.curso_turma ? <Text>🎓 Curso/Turma: {resultadoPesquisa.curso_turma}</Text> : null}
                {resultadoPesquisa.encarregado_nome ? <Text>👨‍👩‍👦 Encarregado: {resultadoPesquisa.encarregado_nome}</Text> : null}
              </View>
            )}

            <TouchableOpacity onPress={() => setTela('menu')} style={{ marginVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Voltar ao Menu</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 7. TRANSFERÊNCIA */}
        {tela === 'transferencia' && (
          <View>
            <Text style={styles.formTitle}>Transferência de Estudante 🔄</Text>
            <TextInput style={styles.input} placeholder="Nº de Processo do Aluno" value={numProcPesquisa} onChangeText={setNumProcPesquisa} />
            <TextInput style={styles.input} placeholder="E-mail da Instituição de Destino" value={transfEmail} onChangeText={setTransfEmail} autoCapitalize="none" />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Motivo da Transferência" multiline value={transfMotivo} onChangeText={setTransfMotivo} />

            <TouchableOpacity style={styles.btnPrimary} onPress={() => {
              alert(`Solicitação de transferência enviada com sucesso para ${transfEmail}`);
              setTela('perfil_inst');
            }}>
              <Text style={styles.btnTxt}>ENVIAR PEDIDO DE TRANSFERÊNCIA</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTela('perfil_inst')} style={{ marginVertical: 15, alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Voltar ao Perfil</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  btnSair: { backgroundColor: '#e0e7ff', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  btnSairTxt: { color: '#4338ca', fontWeight: 'bold' },
  menuSub: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 10 },
  menuDesc: { fontSize: 13, color: '#64748b', marginBottom: 15 },
  cardMenu: { backgroundColor: '#ffffff', padding: 18, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  cardIcon: { fontSize: 26, marginRight: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  bannerAd: { backgroundColor: '#064e3b', borderRadius: 16, padding: 16, marginTop: 10, marginBottom: 15 },
  adBadge: { backgroundColor: '#047857', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  adBadgeTxt: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  adTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  adDesc: { color: '#a7f3d0', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  adBtn: { backgroundColor: '#022c22', padding: 12, borderRadius: 8, alignItems: 'center' },
  adBtnTxt: { color: '#34d399', fontWeight: 'bold', fontSize: 13 },
  suporteBox: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 30, alignItems: 'center' },
  suporteTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  btnSuporte: { backgroundColor: '#059669', width: '100%', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  formContainer: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
  input: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 10 },
  btnPrimary: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnTxt: { color: '#ffffff', fontWeight: 'bold' },
  btnSecondary: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSecTxt: { color: '#ffffff', fontWeight: 'bold' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 8 },
  typeBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center', marginRight: 8 },
  typeBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeTxt: { color: '#334155' },
  typeTxtActive: { color: '#ffffff', fontWeight: 'bold' },
  fbHeader: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  fbTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginTop: 8 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  resultCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', marginTop: 15 },
  profileCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 15 },
  profileCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  infoLabel: { fontWeight: '600', color: '#475569' },
  infoValue: { color: '#0f172a', fontWeight: 'bold' }
});
