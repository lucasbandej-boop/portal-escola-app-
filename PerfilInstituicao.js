import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Image,
  SafeAreaView,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PerfilInstituicao() {
  // Telas: 'regulamento' | 'criarInstituicao' | 'perfil' | 'cadastrar' | 'perfilAluno' | 'cadastrarProf' | 'perfilProf' | 'pesquisaInteligente'
  const [currentScreen, setCurrentScreen] = useState('perfil');
  const [activeTab, setActiveTab] = useState('alunos');

  // --- BASE DE DADOS GLOBAL DE ALUNOS E ENCARREGADOS ---
  const [listaAlunos, setListaAlunos] = useState([
    {
      numProcesso: 'PROC-2026-0001',
      nomeCompleto: 'João Pedro',
      bi: '008923411LA042',
      nivel: 'Médio',
      curso: 'Informática',
      turma: 'INF-M01',
      media: '18',
      encarregadoNome: 'Mateus Pedro',
      encarregadoTelefone: '+244 923 111 222',
      fotoUrl: null,
    },
    {
      numProcesso: 'PROC-2026-0002',
      nomeCompleto: 'Maria Mateus',
      bi: '007123992LA031',
      nivel: 'Médio',
      curso: 'Enfermagem',
      turma: 'ENF-M01',
      media: '19',
      encarregadoNome: 'Ana Maria',
      encarregadoTelefone: '+244 912 333 444',
      fotoUrl: null,
    },
  ]);

  // --- DADOS DA PESQUISA ---
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  // --- FORMULÁRIO DE INSCRIÇÃO DA INSTITUIÇÃO ---
  const [instForm, setInstForm] = useState({
    nome: 'Colégio baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
    directorGeral: 'Prof. António Mateus',
    viceDirector: 'Lic. Maria dos Santos',
    fotoUrl: null,
  });

  const [perfil, setPerfil] = useState({ ...instForm });
  const [cursos, setCursos] = useState('Ensino Geral, Técnico de Informática, Enfermagem');
  const [pautas, setPautas] = useState('Pautas do 1º Trimestre Lançadas.');
  const [professoresList, setProfessoresList] = useState(['Prof. Mateus', 'Profª Ana']);

  // --- FORMULÁRIO DE NOVO CADASTRO DE ALUNO ---
  const [alunoForm, setAlunoForm] = useState({
    nomeCompleto: '',
    bi: '',
    fotoUrl: null,
    nivel: 'Médio',
    curso: 'Informática',
    encarregadoNome: '',
    encarregadoTelefone: '',
  });

  // --- CADASTRAR NOVO ALUNO E GRAVAR NA BASE DE DADOS AUTOMATICAMENTE ---
  const handleCadastrarAluno = () => {
    if (!alunoForm.nomeCompleto || !alunoForm.bi) {
      Alert.alert('Atenção', 'Por favor, preencha o Nome e o B.I. do aluno.');
      return;
    }

    const proximoNum = listaAlunos.length + 1;
    const numProcesso = `PROC-2026-${String(proximoNum).padStart(4, '0')}`;
    const siglaCurso = alunoForm.curso ? alunoForm.curso.substring(0, 3).toUpperCase() : 'GERAL';
    const codigoTurma = `${siglaCurso}-M0${Math.ceil(proximoNum / 30)}`;

    const novoAluno = {
      ...alunoForm,
      numProcesso,
      turma: codigoTurma,
      media: 'Sem nota',
    };

    // GRAVAÇÃO AUTOMÁTICA NA LISTA GLOBAL
    setListaAlunos([...listaAlunos, novoAluno]);
    setAlunoSelecionado(novoAluno);

    Alert.alert(
      'Sucesso!',
      `Aluno cadastrado e sincronizado com o Painel de Pesquisa!\nNº de Processo: ${numProcesso}`
    );

    // Limpa formulário
    setAlunoForm({
      nomeCompleto: '',
      bi: '',
      fotoUrl: null,
      nivel: 'Médio',
      curso: 'Informática',
      encarregadoNome: '',
      encarregadoTelefone: '',
    });

    setCurrentScreen('perfilAluno');
  };

  // --- LÓGICA DA PESQUISA INTELIGENTE (FILTRO EM TEMPO REAL) ---
  const alunosFiltrados = listaAlunos.filter((aluno) => {
    const busca = termoPesquisa.toLowerCase().trim();
    if (!busca) return true; // Se estiver vazio, mostra todos

    return (
      aluno.nomeCompleto.toLowerCase().includes(busca) ||
      aluno.numProcesso.toLowerCase().includes(busca) ||
      aluno.bi.toLowerCase().includes(busca) ||
      (aluno.encarregadoNome && aluno.encarregadoNome.toLowerCase().includes(busca)) ||
      (aluno.encarregadoTelefone && aluno.encarregadoTelefone.toLowerCase().includes(busca))
    );
  });

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <Text style={styles.topBarTitle}>Portal Escola</Text>
      <TouchableOpacity style={styles.topBarBtn} onPress={() => setCurrentScreen('perfil')}>
        <Text style={styles.topBarBtnText}>⬅ Voltar ao Menu</Text>
      </TouchableOpacity>
    </View>
  );

  // --- ECRÃ DE PESQUISA INTELIGENTE DE ALUNOS E ENCARREGADOS ---
  if (currentScreen === 'pesquisaInteligente') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderTopBar()}
        <View style={styles.containerPadding}>
          <Text style={styles.sectionTitle}>🔍 Pesquisa Inteligente de Alunos</Text>
          <Text style={styles.subText}>
            Pesquise por Nome, Nº de Processo, B.I. ou dados do Encarregado:
          </Text>

          {/* CAMPO DE PESQUISA EM TEMPO REAL */}
          <TextInput
            style={styles.searchInput}
            placeholder="Ex: PROC-2026-0001, João, B.I. ou Encarregado..."
            value={termoPesquisa}
            onChangeText={(texto) => setTermoPesquisa(texto)}
          />

          <Text style={styles.resultsCount}>
            Registos encontrados: {alunosFiltrados.length}
          </Text>

          {/* LISTA DINÂMICA LIGADA ÀS INSCRIÇÕES */}
          <FlatList
            data={alunosFiltrados}
            keyExtractor={(item) => item.numProcesso}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.studentCard}
                onPress={() => {
                  setAlunoSelecionado(item);
                  setCurrentScreen('perfilAluno');
                }}
              >
                <View style={styles.studentCardHeader}>
                  <Text style={styles.studentName}>{item.nomeCompleto}</Text>
                  <Text style={styles.processBadge}>{item.numProcesso}</Text>
                </View>
                <Text style={styles.studentDetail}>🪪 B.I.: {item.bi}</Text>
                <Text style={styles.studentDetail}>📚 Curso/Turma: {item.curso} ({item.turma})</Text>
                <Text style={styles.studentDetail}>
                  👨‍👩‍👦 Encarregado: {item.encarregadoNome || 'Não registado'} ({item.encarregadoTelefone || 'N/A'})
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Nenhum aluno ou encarregado encontrado com esses dados.</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  // --- ECRÃ DE PERFIL DO ALUNO ENCONTRADO/CADASTRADO ---
  if (currentScreen === 'perfilAluno' && alunoSelecionado) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderTopBar()}
        <ScrollView style={styles.containerPadding}>
          <View style={styles.profileCard}>
            <Text style={styles.profileBadge}>Nº Processo: {alunoSelecionado.numProcesso}</Text>
            <Text style={styles.profileTitle}>{alunoSelecionado.nomeCompleto}</Text>

            <View style={styles.divider} />

            <Text style={styles.fieldLabel}>🪪 Número do B.I.:</Text>
            <Text style={styles.fieldValue}>{alunoSelecionado.bi}</Text>

            <Text style={styles.fieldLabel}>🎓 Nível & Curso:</Text>
            <Text style={styles.fieldValue}>{alunoSelecionado.nivel} - {alunoSelecionado.curso}</Text>

            <Text style={styles.fieldLabel}>🏫 Turma Atribuída:</Text>
            <Text style={styles.fieldValue}>{alunoSelecionado.turma}</Text>

            <View style={styles.divider} />
            <Text style={styles.sectionSubHeader}>👨‍👩‍👦 Dados do Encarregado de Educação</Text>

            <Text style={styles.fieldLabel}>Nome do Encarregado:</Text>
            <Text style={styles.fieldValue}>{alunoSelecionado.encarregadoNome || 'Não informado'}</Text>

            <Text style={styles.fieldLabel}>Telefone de Contacto:</Text>
            <Text style={styles.fieldValue}>{alunoSelecionado.encarregadoTelefone || 'Não informado'}</Text>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setCurrentScreen('pesquisaInteligente')}
            >
              <Text style={styles.backBtnText}>Voltar à Pesquisa</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- CADASTRO DE NOVO ALUNO ---
  if (currentScreen === 'cadastrar') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderTopBar()}
        <ScrollView style={styles.containerPadding}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>📋 Ficha de Inscrição do Aluno</Text>

            <Text style={styles.label}>Nome Completo do Aluno:</Text>
            <TextInput
              style={styles.input}
              value={alunoForm.nomeCompleto}
              onChangeText={(t) => setAlunoForm({ ...alunoForm, nomeCompleto: t })}
              placeholder="Ex: João Pedro"
            />

            <Text style={styles.label}>Número do B.I.:</Text>
            <TextInput
              style={styles.input}
              value={alunoForm.bi}
              onChangeText={(t) => setAlunoForm({ ...alunoForm, bi: t })}
              placeholder="Ex: 008923411LA042"
            />

            <Text style={styles.label}>Curso:</Text>
            <TextInput
              style={styles.input}
              value={alunoForm.curso}
              onChangeText={(t) => setAlunoForm({ ...alunoForm, curso: t })}
            />

            <Text style={styles.sectionSubHeader}>👨‍👩‍👦 Encarregado de Educação</Text>

            <Text style={styles.label}>Nome do Encarregado:</Text>
            <TextInput
              style={styles.input}
              value={alunoForm.encarregadoNome}
              onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoNome: t })}
              placeholder="Ex: Mateus Pedro"
            />

            <Text style={styles.label}>Telefone do Encarregado:</Text>
            <TextInput
              style={styles.input}
              value={alunoForm.encarregadoTelefone}
              onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoTelefone: t })}
              placeholder="Ex: +244 923 000 111"
            />

            <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCadastrarAluno}>
              <Text style={styles.saveStudentBtnText}>✓ Finalizar Inscrição e Gravar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- ECRÃ PRINCIPAL / PERFIL DA INSTITUIÇÃO ---
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderTopBar()}
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.profileImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>Logótipo</Text>
          </View>
          <Text style={styles.schoolName}>{perfil.nome}</Text>
          <Text style={styles.schoolCategory}>🏫 {perfil.categoria}</Text>
          <Text style={styles.headerInfo}>NIF: {perfil.nif}</Text>
          <Text style={styles.headerInfo}>📞 Contacto: {perfil.contacto}</Text>
          <Text style={styles.headerInfo}>✉️ Email: {perfil.email}</Text>
        </View>

        {/* BOTÕES DE AÇÃO COM BOTÃO DE PESQUISA CONECTADO */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.blueButton} onPress={() => setCurrentScreen('cadastrar')}>
            <Text style={styles.buttonText}>+ Cadastrar Aluno</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchButton} onPress={() => setCurrentScreen('pesquisaInteligente')}>
            <Text style={styles.searchButtonText}>🔍 Pesquisar Alunos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adBanner}>
          <Text style={styles.adTitle}>📢 PUBLICIDADE</Text>
          <Text style={styles.adBody}>💻 Informática & Tablets Educativos</Text>
          <Text style={styles.adSub}>Venda de computadores portáteis e tablets de estudo com suporte técnico.</Text>
        </View>

        {/* LISTA DE ALUNOS ATIVOS NA INSTITUIÇÃO */}
        <View style={styles.contentArea}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>⭐ Total de Alunos Cadastrados: {listaAlunos.length}</Text>
            {listaAlunos.map((item) => (
              <Text key={item.numProcesso} style={styles.infoText}>
                • {item.nomeCompleto} ({item.numProcesso}) - {item.curso}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  containerPadding: { flex: 1, padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  topBarTitle: { fontSize: 22, fontWeight: 'bold', color: '#1d5bd8' },
  topBarBtn: { backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  topBarBtnText: { color: '#334155', fontWeight: 'bold', fontSize: 12 },

  header: { alignItems: 'center', marginTop: 15, marginBottom: 15 },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  placeholderImage: { backgroundColor: '#e9ecef', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#6c757d', fontSize: 12, fontWeight: 'bold' },
  schoolName: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  schoolCategory: { fontSize: 13, color: '#555', marginVertical: 3 },
  headerInfo: { fontSize: 13, color: '#666', marginTop: 1 },

  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 5 },
  blueButton: { backgroundColor: '#1d5bd8', paddingVertical: 12, borderRadius: 8, flex: 1, marginRight: 6, alignItems: 'center' },
  searchButton: { backgroundColor: '#0f766e', paddingVertical: 12, borderRadius: 8, flex: 1, marginLeft: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  searchButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  adBanner: { backgroundColor: '#f0f4ff', marginHorizontal: 16, marginTop: 15, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#d0e0ff' },
  adTitle: { fontSize: 11, fontWeight: 'bold', color: '#d97706' },
  adBody: { fontSize: 13, fontWeight: 'bold', color: '#1e3a8a', marginTop: 2 },
  adSub: { fontSize: 11, color: '#64748b', marginTop: 2 },

  contentArea: { padding: 16 },
  cardContent: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  infoText: { fontSize: 13, color: '#334155', marginTop: 6 },

  // PESQUISA
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  subText: { fontSize: 12, color: '#64748b', marginBottom: 12, marginTop: 4 },
  searchInput: { borderWidth: 1, borderColor: '#1d5bd8', borderRadius: 8, padding: 12, backgroundColor: '#f8fafc', fontSize: 14, marginBottom: 10 },
  resultsCount: { fontSize: 12, fontWeight: 'bold', color: '#0f766e', marginBottom: 10 },
  studentCard: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, marginBottom: 10 },
  studentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  processBadge: { backgroundColor: '#dbeafe', color: '#1e40af', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, fontWeight: 'bold' },
  studentDetail: { fontSize: 12, color: '#475569', marginTop: 2 },
  emptyBox: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 13, textAlign: 'center' },

  // PERFIL DO ALUNO
  profileCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 16 },
  profileBadge: { color: '#1d5bd8', fontWeight: 'bold', fontSize: 12 },
  profileTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 12 },
  fieldLabel: { fontSize: 12, color: '#64748b', fontWeight: 'bold', marginTop: 6 },
  fieldValue: { fontSize: 14, color: '#0f172a', marginTop: 2 },
  sectionSubHeader: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginTop: 8 },
  backBtn: { backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  backBtnText: { color: '#334155', fontWeight: 'bold' },

  // FORMULÁRIO
  formCard: { padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  label: { fontSize: 12, color: '#475569', marginTop: 10, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#f8fafc' },
  saveStudentBtn: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveStudentBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
