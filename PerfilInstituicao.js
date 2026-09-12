import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { supabase } from './supabase';

export default function PerfilInstituicao({ onVoltar }) {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Estados de dados da instituição
  const [instituicao, setInstituicao] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('cursos'); // 'geral', 'direcao', 'cursos', 'pauta'

  // Lista dinâmica de Cursos
  const [cursos, setCursos] = useState([]);
  const [modalCursoVisivel, setModalCursoVisivel] = useState(false);
  const [nomeCurso, setNomeCurso] = useState('');
  const [areaCurso, setAreaCurso] = useState('');
  const [duracaoCurso, setDuracaoCurso] = useState('');

  // Campos de Login / Cadastro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeEscola, setNomeEscola] = useState('');
  const [nif, setNif] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) carregarDadosInstituicao(session.user.id);
      setCheckingSession(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) carregarDadosInstituicao(session.user.id);
      setCheckingSession(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const carregarDadosInstituicao = async (userId) => {
    setLoading(true);
    // Buscar Perfil da Escola
    const { data: perfilData } = await supabase
      .from('instituicoes')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (perfilData) {
      setInstituicao(perfilData);
      carregarCursos(perfilData.id);
    } else {
      // Mock inicial caso a tabela esteja limpa
      setCursos([
        { id: '1', nome: 'Ensino Geral', area: 'Península / Primário', duracao: '1ª à 9ª Classe', icone: '📚' },
        { id: '2', nome: 'Técnico de Informática', area: 'Ensino Técnico Profissional', duracao: '10ª à 13ª Classe', icone: '💻' }
      ]);
    }
    setLoading(false);
  };

  const carregarCursos = async (instId) => {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('instituicao_id', instId);

    if (!error && data && data.length > 0) {
      setCursos(data);
    } else {
      setCursos([
        { id: '1', nome: 'Ensino Geral', area: 'Ensino Geral', duracao: '1ª à 9ª Classe', icone: '📚' },
        { id: '2', nome: 'Técnico de Informática', area: 'Ensino Técnico', duracao: '10ª à 13ª Classe', icone: '💻' }
      ]);
    }
  };

  const handleAdicionarCurso = async () => {
    if (!nomeCurso.trim()) {
      Alert.alert('Aviso', 'Preencha o nome do curso.');
      return;
    }

    const icone = areaCurso.toLowerCase().includes('técnic') || areaCurso.toLowerCase().includes('informátic') ? '💻' : '📚';

    const novoCurso = {
      id: Date.now().toString(),
      nome: nomeCurso,
      area: areaCurso || 'Ensino Geral',
      duracao: duracaoCurso || 'Geral',
      icone: icone,
    };

    if (instituicao?.id) {
      await supabase.from('cursos').insert([{ ...novoCurso, instituicao_id: instituicao.id }]);
    }

    setCursos([...cursos, novoCurso]);
    setNomeCurso('');
    setAreaCurso('');
    setDuracaoCurso('');
    setModalCursoVisivel(false);
    Alert.alert('Sucesso!', 'Curso adicionado com sucesso!');
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a palavra-passe.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Erro ao Entrar', error.message);
  };

  const handleSignUp = async () => {
    if (!email || !password || !nomeEscola) {
      Alert.alert('Atenção', 'Preencha o nome da instituição, e-mail e palavra-passe.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome_escola: nomeEscola, nif: nif } },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Erro ao Criar Conta', error.message);
    } else {
      Alert.alert('Sucesso!', 'Conta criada com sucesso!');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (checkingSession) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#1d5bd8" />
      </View>
    );
  }

  // TELA DE AUTENTICAÇÃO
  if (!session) {
    return (
      <ScrollView contentContainerStyle={styles.authContainer}>
        {onVoltar && (
          <TouchableOpacity style={styles.backBtnTop} onPress={onVoltar}>
            <Text style={styles.backBtnText}>⬅ Voltar ao Menu</Text>
          </TouchableOpacity>
        )}

        <View style={styles.authBox}>
          <Text style={styles.authLogo}>🏫 Portal Escolar</Text>
          <Text style={styles.authSubtitle}>Área da Instituição / Escola</Text>

          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[styles.tabBtn, authMode === 'login' && styles.tabBtnActive]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.tabBtnText, authMode === 'login' && styles.tabBtnTextActive]}>Entrar / Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, authMode === 'register' && styles.tabBtnActive]}
              onPress={() => setAuthMode('register')}
            >
              <Text style={[styles.tabBtnText, authMode === 'register' && styles.tabBtnTextActive]}>Criar Conta</Text>
            </TouchableOpacity>
          </View>

          {authMode === 'register' && (
            <>
              <Text style={styles.label}>Nome da Escola / Instituição (*):</Text>
              <TextInput style={styles.input} value={nomeEscola} onChangeText={setNomeEscola} placeholder="Ex: Colégio Baú" />

              <Text style={styles.label}>NIF da Instituição:</Text>
              <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="Ex: 0082506071LA40" />
            </>
          )}

          <Text style={styles.label}>E-mail Institucional (*):</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="escola@exemplo.com" />

          <Text style={styles.label}>Palavra-passe (*):</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

          {loading ? (
            <ActivityIndicator size="large" color="#1d5bd8" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.authPrimaryBtn} onPress={authMode === 'login' ? handleSignIn : handleSignUp}>
              <Text style={styles.authPrimaryBtnText}>{authMode === 'login' ? 'Entrar no Sistema' : 'Criar Conta da Escola'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  // TELA DO PERFIL COM DESIGN ESTILO FACEBOOK & CURSOS PERSONALIZADOS
  return (
    <ScrollView style={styles.container}>
      {/* CAPA & FOTO DO PERFIL */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarIcon}>🏫</Text>
        </View>
        <Text style={styles.schoolTitle}>{instituicao?.nome || 'Colégio baú'}</Text>
        <Text style={styles.schoolSubtitle}>🏫 Escola / Instituição de Ensino</Text>
        <Text style={styles.infoText}>NIF: {instituicao?.nif || '0082506071LA40'}</Text>
        <Text style={styles.infoText}>📞 Contacto: +244 922500600</Text>
        <Text style={styles.infoText}>✉️ Email: {session.user.email}</Text>

        {/* BOTÕES RÁPIDOS DE AÇÃO */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnActionBlue}>
            <Text style={styles.btnActionBlueText}>+ Cadastrar Aluno</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnActionGray}>
            <Text style={styles.btnActionGrayText}>+ Professor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnActionGray}>
            <Text style={styles.btnActionGrayText}>✏️ Editar Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BANNER DE PUBLICIDADE */}
      <View style={styles.pubBanner}>
        <Text style={styles.pubBadge}>📢 PUBLICIDADE</Text>
        <Text style={styles.pubTitle}>💻 Informática & Tablets Educativos</Text>
        <Text style={styles.pubDesc}>Venda de computadores portáteis e tablets de estudo com suporte técnico.</Text>
      </View>

      {/* MENU DE ABAS ESTILO PRINT */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tabHeader, abaAtiva === 'geral' && styles.tabHeaderActive]} onPress={() => setAbaAtiva('geral')}>
          <Text style={[styles.tabHeaderText, abaAtiva === 'geral' && styles.tabHeaderTextActive]}>Geral</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabHeader, abaAtiva === 'direcao' && styles.tabHeaderActive]} onPress={() => setAbaAtiva('direcao')}>
          <Text style={[styles.tabHeaderText, abaAtiva === 'direcao' && styles.tabHeaderTextActive]}>👔 Direcção</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabHeader, abaAtiva === 'cursos' && styles.tabHeaderActive]} onPress={() => setAbaAtiva('cursos')}>
          <Text style={[styles.tabHeaderText, abaAtiva === 'cursos' && styles.tabHeaderTextActive]}>📚 Cursos ({cursos.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabHeader, abaAtiva === 'pauta' && styles.tabHeaderActive]} onPress={() => setAbaAtiva('pauta')}>
          <Text style={[styles.tabHeaderText, abaAtiva === 'pauta' && styles.tabHeaderTextActive]}>📊 Pauta Trimestral</Text>
        </TouchableOpacity>
      </View>

      {/* SEÇÃO DINÂMICA DE CURSOS */}
      {abaAtiva === 'cursos' && (
        <View style={styles.cursosContainer}>
          <View style={styles.cursosHeader}>
            <View>
              <Text style={styles.sectionTitle}>Cursos Lecionados</Text>

            </View>
            <TouchableOpacity style={styles.btnAddCurso} onPress={() => setModalCursoVisivel(true)}>
              <Text style={styles.btnAddCursoText}>+ Adicionar Curso</Text>
            </TouchableOpacity>
          </View>

          {/* LISTA DE CARDS DE CURSOS */}
          {cursos.map((item) => (
            <View key={item.id} style={styles.cursoCard}>
              <View style={styles.cursoIconBox}>
                <Text style={styles.cursoIconText}>{item.icone || '📚'}</Text>
              </View>
              <View style={styles.cursoDetails}>
                <Text style={styles.cursoNome}>{item.nome}</Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.badgeArea}>{item.area || 'Ensino Geral'}</Text>
                  <Text style={styles.badgeDuracao}>{item.duracao || 'Geral'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ABA GERAL */}
      {abaAtiva === 'geral' && (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <Text style={styles.generalText}>Bem-vindo ao perfil público da instituição. Aqui os encarregados e alunos encontram o histórico, contactos e localização do colégio.</Text>
        </View>
      )}

      {/* ABA DIRECÇÃO */}
      {abaAtiva === 'direcao' && (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Corpo Directivo</Text>
          <Text style={styles.generalText}>• Director Geral: Dr. João Pedro</Text>
          <Text style={styles.generalText}>• Director Pedagógico: Lic. Manuel Silva</Text>
        </View>
      )}

      {/* ABA PAUTA */}
      {abaAtiva === 'pauta' && (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Pauta Trimestral & Boletins</Text>
          <Text style={styles.generalText}>Acesse ou publique os resultados trimestrais dos alunos aqui.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtnFooter} onPress={handleSignOut}>
        <Text style={styles.logoutBtnFooterText}>🚪 Terminar Sessão</Text>
      </TouchableOpacity>

      {/* MODAL DE ADICIONAR CURSO */}
      <Modal visible={modalCursoVisivel} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>➕ Novo Curso Lecionado</Text>

            <Text style={styles.label}>Nome do Curso (*):</Text>
            <TextInput style={styles.input} placeholder="Ex: Técnico de Enfermagem, Ensino Geral" value={nomeCurso} onChangeText={setNomeCurso} />

            <Text style={styles.label}>Área / Especialidade:</Text>
            <TextInput style={styles.input} placeholder="Ex: Saúde, Ensino Técnico, Puniv" value={areaCurso} onChangeText={setAreaCurso} />

            <Text style={styles.label}>Classes / Duração:</Text>
            <TextInput style={styles.input} placeholder="Ex: 10ª à 13ª Classe" value={duracaoCurso} onChangeText={setDuracaoCurso} />

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.btnCancelModal} onPress={() => setModalCursoVisivel(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSaveModal} onPress={handleAdicionarCurso}>
                <Text style={styles.btnSaveText}>Salvar Curso</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f1f5f9' },
  authBox: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  authLogo: { fontSize: 22, fontWeight: 'bold', color: '#1d5bd8', textAlign: 'center' },
  authSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 15 },
  tabSelector: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 4, marginBottom: 15 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabBtnActive: { backgroundColor: '#1d5bd8' },
  tabBtnText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
  tabBtnTextActive: { color: '#fff' },
  label: { fontSize: 12, color: '#475569', marginTop: 10, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#fff' },
  authPrimaryBtn: { backgroundColor: '#1d5bd8', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  authPrimaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  backBtnTop: { alignSelf: 'flex-start', marginBottom: 15 },
  backBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },

  // CABEÇALHO DO PERFIL
  profileHeaderCard: { backgroundColor: '#FFF', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 3, borderColor: '#2563EB' },
  avatarIcon: { fontSize: 40 },
  schoolTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  schoolSubtitle: { fontSize: 13, color: '#4B5563', marginVertical: 2 },
  infoText: { fontSize: 12, color: '#6B7280' },

  actionRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  btnActionBlue: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnActionBlueText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  btnActionGray: { backgroundColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnActionGrayText: { color: '#1F2937', fontWeight: 'bold', fontSize: 12 },

  pubBanner: { backgroundColor: '#EFF6FF', padding: 12, margin: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  pubBadge: { color: '#2563EB', fontSize: 10, fontWeight: 'bold' },
  pubTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E3A8A', marginTop: 2 },
  pubDesc: { fontSize: 11, color: '#3B82F6', marginTop: 2 },

  // ABAS
  tabsContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabHeader: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabHeaderActive: { borderBottomWidth: 3, borderBottomColor: '#2563EB' },
  tabHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#6B7280' },
  tabHeaderTextActive: { color: '#2563EB' },

  // SEÇÃO CURSOS
  cursosContainer: { padding: 16 },
  cursosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  btnAddCurso: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnAddCursoText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  cursoCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  cursoIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cursoIconText: { fontSize: 22 },
  cursoDetails: { flex: 1 },
  cursoNome: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  badgeArea: { backgroundColor: '#DBEAFE', color: '#1E40AF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 10, fontWeight: 'bold' },
  badgeDuracao: { backgroundColor: '#F3F4F6', color: '#4B5563', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 10 },

  sectionBox: { padding: 16, backgroundColor: '#FFF', margin: 16, borderRadius: 12 },
  generalText: { fontSize: 13, color: '#4B5563', marginTop: 6 },

  logoutBtnFooter: { margin: 16, backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, alignItems: 'center' },
  logoutBtnFooterText: { color: '#DC2626', fontWeight: 'bold', fontSize: 12 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  modalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 },
  btnCancelModal: { backgroundColor: '#E5E7EB', padding: 10, borderRadius: 6 },
  btnCancelText: { color: '#374151', fontWeight: 'bold' },
  btnSaveModal: { backgroundColor: '#2563EB', padding: 10, borderRadius: 6 },
  btnSaveText: { color: '#FFF', fontWeight: 'bold' },
});
