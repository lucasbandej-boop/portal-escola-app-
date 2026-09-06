import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './lib/supabase';

export default function PerfilInstituicao() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  const [loading, setLoading] = useState(false);

  // Estados de Auth (Email e Senha)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeEscola, setNomeEscola] = useState('');
  const [nif, setNif] = useState('');

  // Estados da Aplicação Principais
  const [currentScreen, setCurrentScreen] = useState('perfil');
  const [activeTab, setActiveTab] = useState('alunos');

  // Dados da Instituição (Dinâmicos via Auth/Supabase)
  const [perfil, setPerfil] = useState({
    nome: 'Colégio Baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: '',
    director_geral: 'Director Geral',
    vice_director: 'Vice-Director',
    foto_url: null,
  });

  // Lista dinâmica de alunos
  const [alunosList, setAlunosList] = useState([]);
  
  // Cursos
  const [cursosList, setCursosList] = useState([
    { id: '1', nome: 'Informática', vagasTotal: 30, vagasOcupadas: 18, icone: '💻' },
    { id: '2', nome: 'Gestão Empresarial', vagasTotal: 25, vagasOcupadas: 25, icone: '📊' },
    { id: '3', nome: 'Dentista', vagasTotal: 15, vagasOcupadas: 4, icone: '🦷' },
  ]);

  // Modal Curso
  const [modalCursoVisivel, setModalCursoVisivel] = useState(false);
  const [cursoEmEdicao, setCursoEmEdicao] = useState(null);
  const [cursoForm, setCursoForm] = useState({ nome: '', vagasTotal: '30', vagasOcupadas: '0', icone: '📚' });

  // Formulário Aluno
  const [alunoForm, setAlunoForm] = useState({
    nomeCompleto: '',
    bi: '',
    fotoUrl: null,
    nivel: 'Médio',
    curso: 'Informática',
    encarregadoNome: '',
    encarregadoTelefone: '',
  });

  // Verificação de Sessão Ativa ao Iniciar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setPerfil((prev) => ({ ...prev, email: session.user.email }));
        carregarAlunos();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setPerfil((prev) => ({ ...prev, email: session.user.email }));
        carregarAlunos();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // CARREGAR ALUNOS DO SUPABASE
  const carregarAlunos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Erro ao carregar alunos:', error.message);
      } else if (data) {
        const alunosMapeados = data.map((a) => ({
          id: a.id,
          nomeCompleto: a.nome_completo,
          bi: a.bi,
          numProcesso: a.num_processo,
          codigoTurma: a.codigo_turma,
          nivel: a.nivel,
          curso: a.curso,
          encarregadoNome: a.encarregado_nome,
          encarregadoTelefone: a.encarregado_telefone,
          fotoUrl: a.foto_url,
        }));
        setAlunosList(alunosMapeados);
      }
    } catch (err) {
      console.log('Erro Supabase:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÕES DE AUTENTICAÇÃO (LOGIN / REGISTRO / LOGOUT)
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Informe o email e a palavra-passe.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      Alert.alert('Erro ao Criar Conta', error.message);
    } else {
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
      setAuthMode('login');
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha o email e a palavra-passe.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      Alert.alert('Erro ao Entrar', error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // UPLOAD DA FOTO DE ALUNO
  const uploadImageToSupabase = async (uri) => {
    if (!uri || uri.startsWith('http')) return uri;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `uploads/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Erro upload:', err.message);
      return null;
    }
  };

  // CADASTRO DE ALUNOS
  const handleCadastrarAluno = async () => {
    if (!alunoForm.nomeCompleto || !alunoForm.bi) {
      Alert.alert('Atenção', 'Preencha o Nome e o BI do aluno.');
      return;
    }

    setLoading(true);
    try {
      const totalInscritos = alunosList.length + 1;
      const numProcesso = `PROC-2026-${String(totalInscritos).padStart(4, '0')}`;
      const siglaCurso = alunoForm.nivel === 'Médio' ? alunoForm.curso.substring(0, 3).toUpperCase() : 'GERAL';
      const siglaNivel = alunoForm.nivel.charAt(0).toUpperCase();
      const numeroTurma = Math.ceil(totalInscritos / 30);
      const codigoTurma = `${siglaCurso}-${siglaNivel}0${numeroTurma}`;

      const fotoRemote = await uploadImageToSupabase(alunoForm.fotoUrl);

      const { error } = await supabase.from('alunos').insert([
        {
          nome_completo: alunoForm.nomeCompleto,
          bi: alunoForm.bi,
          foto_url: fotoRemote,
          nivel: alunoForm.nivel,
          curso: alunoForm.curso,
          num_processo: numProcesso,
          codigo_turma: codigoTurma,
          encarregado_nome: alunoForm.encarregadoNome,
          encarregado_telefone: alunoForm.encarregadoTelefone,
        },
      ]);

      if (error) throw error;

      Alert.alert('Sucesso', `Aluno cadastrado com sucesso!\nNº Processo: ${numProcesso}`);
      setAlunoForm({
        nomeCompleto: '',
        bi: '',
        fotoUrl: null,
        nivel: 'Médio',
        curso: 'Informática',
        encarregadoNome: '',
        encarregadoTelefone: '',
      });
      await carregarAlunos();
      setCurrentScreen('perfil');
      setActiveTab('alunos');
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message);
    } finally {
      setLoading(false);
    }
  };

  // CURSOS LOGIC
  const handleAbrirModalCurso = (curso = null) => {
    if (curso) {
      setCursoEmEdicao(curso);
      setCursoForm({
        nome: curso.nome,
        vagasTotal: String(curso.vagasTotal),
        vagasOcupadas: String(curso.vagasOcupadas),
        icone: curso.icone || '📚',
      });
    } else {
      setCursoEmEdicao(null);
      setCursoForm({ nome: '', vagasTotal: '30', vagasOcupadas: '0', icone: '📚' });
    }
    setModalCursoVisivel(true);
  };

  const handleSalvarCurso = () => {
    if (!cursoForm.nome.trim()) {
      Alert.alert('Atenção', 'Digite o nome do curso.');
      return;
    }
    const vagasTotalNum = parseInt(cursoForm.vagasTotal, 10) || 0;
    const vagasOcupadasNum = parseInt(cursoForm.vagasOcupadas, 10) || 0;

    if (cursoEmEdicao) {
      setCursosList((prev) =>
        prev.map((item) =>
          item.id === cursoEmEdicao.id
            ? { ...item, nome: cursoForm.nome, vagasTotal: vagasTotalNum, vagasOcupadas: vagasOcupadasNum, icone: cursoForm.icone }
            : item
        )
      );
    } else {
      const novoCurso = {
        id: Date.now().toString(),
        nome: cursoForm.nome,
        vagasTotal: vagasTotalNum,
        vagasOcupadas: vagasOcupadasNum,
        icone: cursoForm.icone || '📚',
      };
      setCursosList((prev) => [...prev, novoCurso]);
    }
    setModalCursoVisivel(false);
  };

  // TELA DE AUTENTICAÇÃO (SE NÃO ESTIVER LOGADO)
  if (!session) {
    return (
      <ScrollView contentContainerStyle={styles.authContainer}>
        <View style={styles.authBox}>
          <Text style={styles.authLogo}>🏫 Portal Escolar</Text>
          <Text style={styles.authSubtitle}>
            {authMode === 'login' ? 'Entre no sistema da sua instituição' : 'Crie uma nova conta institucional'}
          </Text>

          {authMode === 'register' && (
            <>
              <Text style={styles.label}>Nome da Escola / Instituição:</Text>
              <TextInput style={styles.input} value={nomeEscola} onChangeText={setNomeEscola} placeholder="Ex: Colégio Baú" />

              <Text style={styles.label}>NIF da Instituição:</Text>
              <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="Ex: 0082506071LA40" />
            </>
          )}

          <Text style={styles.label}>E-mail:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="escola@exemplo.com"
          />

          <Text style={styles.label}>Palavra-passe:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          {loading ? (
            <ActivityIndicator size="large" color="#1d5bd8" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity
              style={styles.authPrimaryBtn}
              onPress={authMode === 'login' ? handleSignIn : handleSignUp}
            >
              <Text style={styles.authPrimaryBtnText}>
                {authMode === 'login' ? 'Entrar no Portal' : 'Criar Conta'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.switchAuthBtn}
            onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            <Text style={styles.switchAuthText}>
              {authMode === 'login'
                ? 'Não tem uma conta? Cadastre a sua Escola'
                : 'Já tem uma conta? Fazer Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // TELA SECUNDÁRIA: CADASTRO DE ALUNO
  if (currentScreen === 'cadastrar') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerForm}>
          <Text style={styles.formTitle}>📋 Cadastro de Aluno</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('perfil')}>
            <Text style={styles.backBtnText}>⬅ Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Nome Completo do Aluno:</Text>
          <TextInput style={styles.input} value={alunoForm.nomeCompleto} onChangeText={(t) => setAlunoForm({ ...alunoForm, nomeCompleto: t })} placeholder="Ex: João Manuel" />

          <Text style={styles.label}>Nº B.I. / Cédula:</Text>
          <TextInput style={styles.input} value={alunoForm.bi} onChangeText={(t) => setAlunoForm({ ...alunoForm, bi: t })} placeholder="Ex: 008923412LA042" />

          <Text style={styles.label}>Curso Pretendido:</Text>
          <TextInput style={styles.input} value={alunoForm.curso} onChangeText={(t) => setAlunoForm({ ...alunoForm, curso: t })} placeholder="Ex: Informática" />

          <Text style={styles.label}>Nome do Encarregado:</Text>
          <TextInput style={styles.input} value={alunoForm.encarregadoNome} onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoNome: t })} placeholder="Ex: Manuel Francisco" />

          <Text style={styles.label}>Telefone do Encarregado:</Text>
          <TextInput style={styles.input} value={alunoForm.encarregadoTelefone} onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoTelefone: t })} keyboardType="phone-pad" placeholder="Ex: +244 923 000 111" />

          <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCadastrarAluno}>
            <Text style={styles.saveStudentBtnText}>✓ Salvar no Banco de Dados</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'direccao', label: '👔 Direcção' },
    { id: 'cursos', label: `Cursos (${cursosList.length})` },
    { id: 'alunos', label: `⭐ Alunos (${alunosList.length})` },
  ];

  // TELA PRINCIPAL
  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.userEmailText}>📍 {session.user.email}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Text style={styles.logoutBtnText}>Sair 🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={[styles.profileImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>Logótipo</Text>
        </View>
        <Text style={styles.schoolName}>{perfil.nome}</Text>
        <Text style={styles.schoolCategory}>🏫 {perfil.categoria}</Text>
        <Text style={styles.headerInfo}>NIF: {perfil.nif}</Text>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.blueButton} onPress={() => setCurrentScreen('cadastrar')}>
          <Text style={styles.buttonText}>+ Cadastrar Aluno</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.id} style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]} onPress={() => setActiveTab(tab.id)}>
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.contentArea}>
        {activeTab === 'geral' && (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Visão Geral</Text>
            <Text style={styles.infoText}>🏫 Categoria: {perfil.categoria}</Text>
            <Text style={styles.infoText}>📜 NIF: {perfil.nif}</Text>
            <Text style={styles.infoText}>✉️ Email Conectado: {session.user.email}</Text>
          </View>
        )}

        {activeTab === 'alunos' && (
          <View style={styles.cardContent}>
            <View style={styles.cursosHeaderRow}>
              <Text style={styles.cardTitle}>Alunos ({alunosList.length})</Text>
              <TouchableOpacity style={styles.addCursoBtn} onPress={() => setCurrentScreen('cadastrar')}>
                <Text style={styles.addCursoBtnText}>+ Novo Aluno</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#1d5bd8" />
            ) : alunosList.length === 0 ? (
              <Text style={styles.cardSubtext}>Nenhum aluno cadastrado.</Text>
            ) : (
              alunosList.map((aluno) => (
                <View key={aluno.id} style={styles.alunoCardItem}>
                  <Text style={styles.alunoNomeText}>{aluno.nomeCompleto}</Text>
                  <Text style={styles.alunoBiText}>BI: {aluno.bi}</Text>
                  <Text style={styles.alunoInfoRow}>🎓 Curso: {aluno.curso}</Text>
                  <Text style={styles.alunoInfoRow}>📄 Processo: {aluno.numProcesso}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 10 },
  authContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f1f5f9' },
  authBox: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  authLogo: { fontSize: 24, fontWeight: 'bold', color: '#1d5bd8', textAlign: 'center', marginBottom: 6 },
  authSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  authPrimaryBtn: { backgroundColor: '#1d5bd8', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  authPrimaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchAuthBtn: { marginTop: 15, alignItems: 'center' },
  switchAuthText: { color: '#1d5bd8', fontSize: 13, fontWeight: '600' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  userEmailText: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  logoutBtnText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  header: { alignItems: 'center', marginBottom: 15 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  placeholderImage: { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#64748b', fontSize: 14, fontWeight: 'bold' },
  schoolName: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  schoolCategory: { fontSize: 13, color: '#64748b' },
  headerInfo: { fontSize: 12, color: '#94a3b8' },
  actionButtonsRow: { paddingHorizontal: 16, marginBottom: 10 },
  blueButton: { backgroundColor: '#1d5bd8', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tabButton: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTabButton: { borderBottomColor: '#1d5bd8' },
  tabText: { fontSize: 13, color: '#64748b' },
  activeTabText: { color: '#1d5bd8', fontWeight: 'bold' },
  contentArea: { padding: 16 },
  cardContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cardSubtext: { fontSize: 13, color: '#64748b', marginTop: 8 },
  infoText: { fontSize: 13, color: '#334155', marginTop: 6 },
  cursosHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addCursoBtn: { backgroundColor: '#1d5bd8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  addCursoBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  alunoCardItem: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginBottom: 8 },
  alunoNomeText: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  alunoBiText: { fontSize: 12, color: '#64748b' },
  alunoInfoRow: { fontSize: 12, color: '#334155', marginTop: 2 },
  label: { fontSize: 12, color: '#475569', marginTop: 10, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#fff' },
  headerForm: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  formTitle: { fontSize: 18, fontWeight: 'bold' },
  backBtn: { backgroundColor: '#e2e8f0', padding: 8, borderRadius: 6 },
  backBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  formCard: { padding: 16, backgroundColor: '#fff', margin: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  saveStudentBtn: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveStudentBtnText: { color: '#fff', fontWeight: 'bold' },
});
