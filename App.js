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
  const [tela, setTela] = useState('menu'); // 'menu', 'login_inst', 'perfil_inst', 'cad_aluno', 'cad_prof', 'pesquisa', 'transferencia'
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [instituicao, setInstituicao] = useState(null);

  // Form Login/Registro
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

  // Form Aluno
  const [alunoNome, setAlunoNome] = useState('');
  const [alunoNasc, setAlunoNasc] = useState('');
  const [alunoBI, setAlunoBI] = useState('');
  const [alunoNivel, setAlunoNivel] = useState('medio'); // 'medio' ou 'iniciacao'
  const [alunoCursoTurma, setAlunoCursoTurma] = useState('');
  const [alunoProfResp, setAlunoProfResp] = useState('');
  const [alunoEncarregado, setAlunoEncarregado] = useState('');
  const [alunoTelEncarregado, setAlunoTelEncarregado] = useState('');

  // Form Professor
  const [profNome, setProfNome] = useState('');
  const [profNasc, setProfNasc] = useState('');
  const [profBI, setProfBI] = useState('');
  const [profGrau, setProfGrau] = useState('');
  const [profNivel, setProfNivel] = useState('medio');
  const [profDisciplina, setProfDisciplina] = useState('');
  const [profTel, setProfTel] = useState('');

  // Pesquisa
  const [numProcPesquisa, setNumProcPesquisa] = useState('');
  const [resultadoPesquisa, setResultadoPesquisa] = useState(null);

  // Transferência
  const [transfEmail, setTransfEmail] = useState('');
  const [transfMotivo, setTransfMotivo] = useState('');
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) carregarPerfilInstituicao(session.user.id);
    });
  }, []);

  const carregarPerfilInstituicao = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase.from('instituicoes').select('*').eq('user_id', userId).single();
    if (data) {
      setInstituicao(data);
      setInstNome(data.nome);
      setInstNif(data.nif);
      setInstDirector(data.director);
      setInstSecretaria(data.secretaria);
      setInstEstudantes(data.num_estudantes);
      setInstProfessores(data.num_professores);
      setInstLocalizacao(data.localizacao);
    }
    setLoading(false);
  };

  const handleAuth = async () => {
    if (!emailAuth || !senhaAuth) return Alert.alert('Erro', 'Preencha e-mail e palavra-passe');
    setLoading(true);
    if (modoRegistro) {
      const { data, error } = await supabase.auth.signUp({ email: emailAuth, password: senhaAuth });
      if (error) Alert.alert('Erro ao registrar', error.message);
      else Alert.alert('Sucesso', 'Conta criada! Preencha o perfil da instituição.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailAuth, password: senhaAuth });
      if (error) Alert.alert('Erro de Login', error.message);
      else {
        setSession(data.session);
        carregarPerfilInstituicao(data.session.user.id);
        setTela('perfil_inst');
      }
    }
    setLoading(false);
  };

  const salvarInstituicao = async () => {
    if (!instNome) return Alert.alert('Erro', 'Nome da instituição é obrigatório');
    setLoading(true);
    const payload = {
      user_id: session?.user?.id,
      nome: instNome,
      nif: instNif,
      director: instDirector,
      secretaria: instSecretaria,
      num_estudantes: instEstudantes,
      num_professores: instProfessores,
      localizacao: instLocalizacao
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
    if (error) Alert.alert('Erro ao salvar', error.message);
    else Alert.alert('Sucesso 🎉', 'Perfil da instituição atualizado!');
  };

  const cadastrarAluno = async () => {
    if (!alunoNome) return Alert.alert('Erro', 'Nome do aluno é obrigatório');
    setLoading(true);
    const numProcesso = 'PROC-' + Math.floor(100000 + Math.random() * 900000);
    const { error } = await supabase.from('alunos').insert([{
      instituicao_id: instituicao.id,
      numero_processo: numProcesso,
      nome_completo: alunoNome,
      data_nascimento: alunoNasc || null,
      numero_bilhete: alunoBI,
      nivel_ensino: alunoNivel,
      curso_turma: alunoCursoTurma,
      professor_responsavel: alunoProfResp,
      encarregado_nome: alunoEncarregado,
      encarregado_telefone: alunoTelEncarregado
    }]);
    setLoading(false);
    if (error) Alert.alert('Erro ao cadastrar', error.message);
    else {
      Alert.alert('Sucesso 🎉', `Aluno cadastrado! Nº de Processo gerado: ${numProcesso}`);
      setAlunoNome(''); setAlunoBI(''); setAlunoCursoTurma('');
      setTela('perfil_inst');
    }
  };

  const cadastrarProfessor = async () => {
    if (!profNome) return Alert.alert('Erro', 'Nome do professor é obrigatório');
    setLoading(true);
    const { error } = await supabase.from('professores').insert([{
      instituicao_id: instituicao?.id,
      nome_completo: profNome,
      data_nascimento: profNasc || null,
      numero_bilhete: profBI,
      grau_academico: profGrau,
      nivel_ensino: profNivel,
      disciplina: profDisciplina,
      telefone: profTel
    }]);
    setLoading(false);
    if (error) Alert.alert('Erro ao cadastrar', error.message);
    else {
      Alert.alert('Sucesso 🎉', 'Professor cadastrado com sucesso!');
      setProfNome(''); setProfBI('');
      setTela('menu');
    }
  };

  const pesquisarPorProcesso = async () => {
    if (!numProcPesquisa) return Alert.alert('Erro', 'Introduza o Nº de Processo');
    setLoading(true);
    const { data, error } = await supabase.from('alunos').select('*, instituicoes(nome)').eq('numero_processo', numProcPesquisa.trim()).single();
    setLoading(false);
    if (error || !data) Alert.alert('Não encontrado', 'Nenhum registo encontrado para este número de processo.');
    else setResultadoPesquisa(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER PRINCIPAL */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portal Escola</Text>
        {session ? (
          <TouchableOpacity onPress={() => supabase.auth.signOut().then(() => { setSession(null); setTela('menu'); })} style={styles.btnSair}>
            <Text style={styles.btnSairTxt}>Sair</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>

        {/* 1. TELA MENU PRINCIPAL */}
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

            {/* QUADRO DE PUBLICIDADE */}
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

        {/* 2. TELA LOGIN / REGISTO INSTITUIÇÃO */}
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

        {/* 3. TELA PERFIL DA INSTITUIÇÃO (ESTILO PAGINA FACEBOOK / EDITÁVEL) */}
        {tela === 'perfil_inst' && (
          <View>
            <View style={styles.fbHeader}>
              <Text style={{ fontSize: 40 }}>🏫</Text>
              <Text style={styles.fbTitle}>{instNome || 'Minha Instituição'}</Text>
              <Text style={{ color: '#64748b' }}>NIF: {instNif || 'Não informado'}</Text>
            </View>

            <Text style={styles.sectionHeader}>Editar Dados da Instituição</Text>
            <TextInput style={styles.input} placeholder="Nome Oficial da Instituição" value={instNome} onChangeText={setInstNome} />
            <TextInput style={styles.input} placeholder="NIF" value={instNif} onChangeText={setInstNif} />
            <TextInput style={styles.input} placeholder="Director Geral" value={instDirector} onChangeText={setInstDirector} />
            <TextInput style={styles.input} placeholder="Secretaria" value={instSecretaria} onChangeText={setInstSecretaria} />
            <TextInput style={styles.input} placeholder="Nº de Estudantes" value={instEstudantes} onChangeText={setInstEstudantes} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Nº de Professores" value={instProfessores} onChangeText={setInstProfessores} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Localização" value={instLocalizacao} onChangeText={setInstLocalizacao} />

            <TouchableOpacity style={styles.btnPrimary} onPress={salvarInstituicao} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>SALVAR / ATUALIZAR PERFIL</Text>}
            </TouchableOpacity>

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

        {/* 4. TELA CADASTRO DE ALUNO */}
        {tela === 'cad_aluno' && (
          <View>
            <Text style={styles.formTitle}>Cadastramento de Aluno 🎒</Text>
            <TextInput style={styles.input} placeholder="Nome Completo *" value={alunoNome} onChangeText={setAlunoNome} />
            <TextInput style={styles.input} placeholder="Data de Nascimento (AAAA-MM-DD)" value={alunoNasc} onChangeText={setAlunoNasc} />
            <TextInput style={styles.input} placeholder="Número do Bilhete de Identidade" value={alunoBI} onChangeText={setAlunoBI} />

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

        {/* 5. TELA CADASTRO DE PROFESSOR */}
        {tela === 'cad_prof' && (
          <View>
            <Text style={styles.formTitle}>Cadastramento de Professor 👨‍🏫</Text>
            <TextInput style={styles.input} placeholder="Nome Completo *" value={profNome} onChangeText={setProfNome} />
            <TextInput style={styles.input} placeholder="Data de Nascimento (AAAA-MM-DD)" value={profNasc} onChangeText={setProfNasc} />
            <TextInput style={styles.input} placeholder="Número do Bilhete de Identidade" value={profBI} onChangeText={setProfBI} />
            <TextInput style={styles.input} placeholder="Grau Académico (Ex: Licenciado, Bacharel)" value={profGrau} onChangeText={setProfGrau} />
            
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

        {/* 6. TELA PESQUISA SEGURA POR PROCESSO */}
        {tela === 'pesquisa' && (
          <View>
            <Text style={styles.formTitle}>Consulta de Perfil do Estudante 🔍</Text>
            <Text style={{ color: '#64748b', marginBottom: 15 }}>Digite o Número de Processo fornecido pela Instituição:</Text>

            <TextInput style={styles.input} placeholder="Ex: PROC-123456" value={numProcPesquisa} onChangeText={setNumProcPesquisa} autoCapitalize="characters" />

            <TouchableOpacity style={styles.btnPrimary} onPress={pesquisarPorProcesso} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>PESQUISAR DADOS</Text>}
            </TouchableOpacity>

            {resultadoPesquisa && (
              <View style={styles.resultCard}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>{resultadoPesquisa.nome_completo}</Text>
                <Text style={{ color: '#2563eb', marginVertical: 4 }}>Nº de Processo: {resultadoPesquisa.numero_processo}</Text>
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

        {/* 7. TELA TRANSFERÊNCIA DE ESTUDANTE */}
        {tela === 'transferencia' && (
          <View>
            <Text style={styles.formTitle}>Transferência de Estudante 🔄</Text>
            <TextInput style={styles.input} placeholder="Nº de Processo do Aluno" value={numProcPesquisa} onChangeText={setNumProcPesquisa} />
            <TextInput style={styles.input} placeholder="E-mail da Instituição de Destino" value={transfEmail} onChangeText={setTransfEmail} autoCapitalize="none" />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Motivo da Transferência" multiline value={transfMotivo} onChangeText={setTransfMotivo} />

            <TouchableOpacity style={styles.btnPrimary} onPress={() => {
              Alert.alert('Transferência Enviada', `Solicitação enviada por e-mail para ${transfEmail}`);
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
  formContainer: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, marginTop: 20 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
  input: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 10 },
  btnPrimary: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnTxt: { color: '#ffffff', fontWeight: 'bold' },
  btnSecondary: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSecTxt: { color: '#ffffff', fontWeight: 'bold' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  typeBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center', marginRight: 8 },
  typeBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeTxt: { color: '#334155' },
  typeTxtActive: { color: '#ffffff', fontWeight: 'bold' },
  fbHeader: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  fbTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginTop: 8 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  resultCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', marginTop: 15 }
});
