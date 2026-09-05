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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PerfilInstituicao() {
  // Telas: 'regulamento' | 'criarInstituicao' | 'perfil' | 'cadastrar' | 'perfilAluno' | 'cadastrarProf' | 'perfilProf'
  const [currentScreen, setCurrentScreen] = useState('regulamento');
  const [activeTab, setActiveTab] = useState('alunos');

  // --- FORMULÁRIO INICIAL DE INSCRIÇÃO DA INSTITUIÇÃO ---
  const [instForm, setInstForm] = useState({
    nome: 'Colégio baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
    directorGeral: '',
    viceDirector: '',
    fotoUrl: null,
    // Documentos anexos
    docDiarioRepublica: null,
    docNif: null,
    docAlvara: null,
    docBiDirector: null,
  });

  // --- DADOS DO PERFIL GERADO DA INSTITUIÇÃO ---
  const [perfil, setPerfil] = useState({
    nome: 'Colégio baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
    directorGeral: 'Prof. António Mateus',
    viceDirector: 'Lic. Maria dos Santos',
    fotoUrl: null,
  });

  const [cursos, setCursos] = useState('Ensino Geral, Técnico de Informática');
  const [pautas, setPautas] = useState('Nenhuma pauta lançada para este trimestre.');
  const [alunos, setAlunos] = useState('João Pedro (Méd. 18), Maria Mateus (Méd. 19)');
  const [classes, setClasses] = useState('1ª Classe, 2ª Classe, 3ª Classe, 10ª Classe');
  const [eventos, setEventos] = useState('Feira da Ciência - 15/10');
  const [professoresList, setProfessoresList] = useState(['Prof. Mateus', 'Profª Ana']);

  // --- FORMULÁRIO DE REGISTO DE ALUNO ---
  const [totalInscritos, setTotalInscritos] = useState(1);
  const [alunoForm, setAlunoForm] = useState({
    nomeCompleto: '',
    bi: '',
    fotoUrl: null,
    nivel: 'Iniciação',
    curso: 'Informática',
    encarregadoNome: '',
    encarregadoTelefone: '',
  });
  const [alunoRegistado, setAlunoRegistado] = useState(null);

  // --- FORMULÁRIO DE REGISTO DE PROFESSOR ---
  const [profForm, setProfForm] = useState({
    fotoUrl: null,
    nomeCompleto: '',
    bi: '',
    grauAcademico: 'Licenciatura',
    curso: '',
    experiencia: '',
    copiaBiUrl: null,
    certificadoUrl: null,
  });
  const [profRegistado, setProfRegistado] = useState(null);

  // Modal Geral de Edição da Escola
  const [modalVisible, setModalVisible] = useState(false);
  const [editSection, setEditSection] = useState('geral');
  const [tempPerfil, setTempPerfil] = useState(null);
  const [tempCursos, setTempCursos] = useState('');
  const [tempPautas, setTempPautas] = useState('');
  const [tempAlunos, setTempAlunos] = useState('');
  const [tempClasses, setTempClasses] = useState('');
  const [tempEventos, setTempEventos] = useState('');
  const [tempProfessoresText, setTempProfessoresText] = useState('');

  // Seleção de Imagem
  const selecionarImagem = async (callback) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'É necessário permitir o acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      callback(result.assets[0].uri);
    }
  };

  const handleCriarInstituicao = () => {
    if (!instForm.nome || !instForm.nif || !instForm.directorGeral) {
      Alert.alert('Atenção', 'Por favor, introduza o Nome da Instituição, NIF e o Director Geral.');
      return;
    }
    setPerfil({ ...instForm });
    Alert.alert('Sucesso', 'Instituição cadastrada com sucesso!');
    setCurrentScreen('perfil');
  };

  const handleOpenEdit = () => {
    setTempPerfil({ ...perfil });
    setTempCursos(cursos);
    setTempPautas(pautas);
    setTempAlunos(alunos);
    setTempClasses(classes);
    setTempEventos(eventos);
    setTempProfessoresText(professoresList.join(', '));
    setModalVisible(true);
  };

  const handleSaveAll = () => {
    setPerfil({ ...tempPerfil });
    setCursos(tempCursos);
    setPautas(tempPautas);
    setAlunos(tempAlunos);
    setClasses(tempClasses);
    setEventos(tempEventos);
    setProfessoresList(tempProfessoresText.split(',').map((p) => p.trim()).filter(Boolean));
    setModalVisible(false);
    Alert.alert('Sucesso', 'Informações atualizadas!');
  };

  const handleCadastrarAluno = () => {
    if (!alunoForm.nomeCompleto || !alunoForm.bi) {
      Alert.alert('Atenção', 'Preencha o Nome e o BI do aluno.');
      return;
    }
    const numProcesso = `PROC-2026-${String(totalInscritos).padStart(4, '0')}`;
    const siglaCurso = alunoForm.nivel === 'Médio' ? alunoForm.curso.substring(0, 3).toUpperCase() : 'GERAL';
    const siglaNivel = alunoForm.nivel.charAt(0).toUpperCase();
    const numeroTurma = Math.ceil(totalInscritos / 30);
    const codigoTurma = `${siglaCurso}-${siglaNivel}0${numeroTurma}`;

    const novoAluno = { ...alunoForm, numProcesso, codigoTurma };
    setAlunoRegistado(novoAluno);
    setTotalInscritos(totalInscritos + 1);
    Alert.alert('Sucesso', `Aluno cadastrado!\nNº Processo: ${numProcesso}`);
    setCurrentScreen('perfilAluno');
  };

  const handleCadastrarProf = () => {
    if (!profForm.nomeCompleto || !profForm.bi || !profForm.curso) {
      Alert.alert('Atenção', 'Preencha o Nome Completo, BI e o Curso.');
      return;
    }
    setProfRegistado({ ...profForm });
    setProfessoresList([...professoresList, profForm.nomeCompleto]);
    Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
    setCurrentScreen('perfilProf');
  };

  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'direccao', label: '👔 Direcção' },
    { id: 'cursos', label: `Cursos (${cursos ? cursos.split(',').length : 0})` },
    { id: 'pautas', label: '📊 Pauta Trimestral' },
    { id: 'alunos', label: '⭐ Alunos' },
    { id: 'classes', label: '📖 Classes' },
    { id: 'eventos', label: '📅 Eventos' },
    { id: 'professores', label: `📚 Professores (${professoresList.length})` },
  ];

  const renderTabContent = () => {
    if (!perfil) return null;
    switch (activeTab) {
      case 'geral':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Visão Geral</Text>
            <Text style={styles.infoText}>🏫 Categoria: {perfil.categoria}</Text>
            <Text style={styles.infoText}>📜 NIF: {perfil.nif}</Text>
            <Text style={styles.infoText}>📞 Contacto: {perfil.contacto}</Text>
            <Text style={styles.infoText}>✉️ Email: {perfil.email}</Text>
          </View>
        );
      case 'direccao':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Corpo Directivo</Text>
            <Text style={styles.infoText}>👨‍💼 Director Geral: {perfil.directorGeral || 'Não especificado'}</Text>
            <Text style={styles.infoText}>👨‍💼 Vice-Director: {perfil.viceDirector || 'Não especificado'}</Text>
          </View>
        );
      case 'cursos':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Cursos Lecionados</Text>
            <Text style={styles.cardSubtext}>{cursos || 'Nenhum curso registado.'}</Text>
          </View>
        );
      case 'pautas':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Pauta Trimestral</Text>
            <Text style={styles.cardSubtext}>{pautas}</Text>
          </View>
        );
      case 'alunos':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Alunos em Destaque</Text>
            <Text style={styles.cardSubtext}>{alunos}</Text>
          </View>
        );
      case 'classes':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Classes Disponíveis</Text>
            <Text style={styles.cardSubtext}>{classes}</Text>
          </View>
        );
      case 'eventos':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Eventos Agendados</Text>
            <Text style={styles.cardSubtext}>{eventos}</Text>
          </View>
        );
      case 'professores':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Corpo Docente</Text>
            <Text style={styles.cardSubtext}>
              {professoresList.length > 0 ? professoresList.join(', ') : 'Nenhum professor cadastrado.'}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <Text style={styles.topBarTitle}>Portal Escola</Text>
      <TouchableOpacity style={styles.topBarBtn} onPress={() => setCurrentScreen('regulamento')}>
        <Text style={styles.topBarBtnText}>⬅ Voltar ao Menu</Text>
      </TouchableOpacity>
    </View>
  );

  // REGULAMENTO LEGAL
  if (currentScreen === 'regulamento') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderTopBar()}
        <ScrollView style={styles.container}>
          <View style={styles.legalBox}>
            <Text style={styles.legalHeader}>🇦🇴 Regulamento de Legalização em Angola</Text>
            <Text style={styles.legalIntro}>
              Nos termos da legislação do Ministério da Educação de Angola (MED), a abertura e cadastramento exige a submissão dos documentos legais exigidos.
            </Text>

            <Text style={styles.legalSubTitle}>1. Documentos da Instituição:</Text>
            <Text style={styles.legalItem}>• Diário da República / Estatutos da Sociedade.</Text>
            <Text style={styles.legalItem}>• Cartão de Identificação Fiscal (NIF).</Text>
            <Text style={styles.legalItem}>• Alvará de Abertura / Licença do MED.</Text>

            <Text style={styles.legalSubTitle}>2. Corpo Directivo:</Text>
            <Text style={styles.legalItem}>• Nome e B.I. do Director Geral e Vice-Director.</Text>

            <TouchableOpacity style={styles.acceptLegalBtn} onPress={() => setCurrentScreen('criarInstituicao')}>
              <Text style={styles.acceptLegalBtnText}>✓ Li e Compreendi — Ir ao Formulário</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // FORMULÁRIO DE INSCRIÇÃO DA INSTITUIÇÃO
  if (currentScreen === 'criarInstituicao') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderTopBar()}
        <ScrollView style={styles.container}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>🏛️ Inscrição da Instituição</Text>

            <Text style={styles.label}>Logótipo:</Text>
            <View style={styles.photoPickerContainer}>
              {instForm.fotoUrl ? (
                <Image source={{ uri: instForm.fotoUrl }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>Logótipo</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.pickImageBtn}
                onPress={() => selecionarImagem((uri) => setInstForm({ ...instForm, fotoUrl: uri }))}
              >
                <Text style={styles.pickImageBtnText}>🖼️ Selecionar Logótipo</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nome da Instituição:</Text>
            <TextInput style={styles.input} value={instForm.nome} onChangeText={(t) => setInstForm({ ...instForm, nome: t })} />

            <Text style={styles.label}>Categoria:</Text>
            <TextInput style={styles.input} value={instForm.categoria} onChangeText={(t) => setInstForm({ ...instForm, categoria: t })} />

            <Text style={styles.label}>NIF:</Text>
            <TextInput style={styles.input} value={instForm.nif} onChangeText={(t) => setInstForm({ ...instForm, nif: t })} />

            <Text style={styles.label}>Contacto:</Text>
            <TextInput style={styles.input} value={instForm.contacto} onChangeText={(t) => setInstForm({ ...instForm, contacto: t })} />

            <Text style={styles.label}>Email:</Text>
            <TextInput style={styles.input} value={instForm.email} onChangeText={(t) => setInstForm({ ...instForm, email: t })} />

            <Text style={styles.sectionHeader}>👔 Corpo Directivo</Text>

            <Text style={styles.label}>Director Geral:</Text>
            <TextInput style={styles.input} value={instForm.directorGeral} onChangeText={(t) => setInstForm({ ...instForm, directorGeral: t })} placeholder="Ex: Prof. António Mateus" />

            <Text style={styles.label}>Vice-Director:</Text>
            <TextInput style={styles.input} value={instForm.viceDirector} onChangeText={(t) => setInstForm({ ...instForm, viceDirector: t })} placeholder="Ex: Lic. Maria dos Santos" />

            <Text style={styles.sectionHeader}>📂 Enviar Documentos</Text>

            <TouchableOpacity style={styles.docUploadBtn} onPress={() => selecionarImagem((uri) => setInstForm({ ...instForm, docDiarioRepublica: uri }))}>
              <Text style={styles.docUploadText}>{instForm.docDiarioRepublica ? '✅ Diário da República Anexado' : '📄 Anexar Diário da República'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.docUploadBtn} onPress={() => selecionarImagem((uri) => setInstForm({ ...instForm, docNif: uri }))}>
              <Text style={styles.docUploadText}>{instForm.docNif ? '✅ Cartão NIF Anexado' : '🪪 Anexar Cartão NIF'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.docUploadBtn} onPress={() => selecionarImagem((uri) => setInstForm({ ...instForm, docAlvara: uri }))}>
              <Text style={styles.docUploadText}>{instForm.docAlvara ? '✅ Licença MED Anexada' : '🏛️ Anexar Licença / Alvará do MED'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCriarInstituicao}>
              <Text style={styles.saveStudentBtnText}>✓ Concluir e Abrir Perfil</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // CADASTRAR PROFESSOR
  if (currentScreen === 'cadastrarProf') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderTopBar()}
        <ScrollView style={styles.container}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>👨‍🏫 Cadastro de Professor</Text>

            <Text style={styles.label}>Nome Completo:</Text>
            <TextInput style={styles.input} value={profForm.nomeCompleto} onChangeText={(t) => setProfForm({ ...profForm, nomeCompleto: t })} />

            <Text style={styles.label}>BI:</Text>
            <TextInput style={styles.input} value={profForm.bi} onChangeText={(t) => setProfForm({ ...profForm, bi: t })} />

            <Text style={styles.label}>Curso / Especialidade:</Text>
            <TextInput style={styles.input} value={profForm.curso} onChangeText={(t) => setProfForm({ ...profForm, curso: t })} />

            <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCadastrarProf}>
              <Text style={styles.saveStudentBtnText}>✓ Finalizar Registo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // CADASTRAR ALUNO
  if (currentScreen === 'cadastrar') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderTopBar()}
        <ScrollView style={styles.container}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>📋 Ficha de Inscrição do Aluno</Text>

            <Text style={styles.label}>Nome Completo:</Text>
            <TextInput style={styles.input} value={alunoForm.nomeCompleto} onChangeText={(t) => setAlunoForm({ ...alunoForm, nomeCompleto: t })} />

            <Text style={styles.label}>Número do BI:</Text>
            <TextInput style={styles.input} value={alunoForm.bi} onChangeText={(t) => setAlunoForm({ ...alunoForm, bi: t })} />

            <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCadastrarAluno}>
              <Text style={styles.saveStudentBtnText}>✓ Finalizar Inscrição</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PERFIL DA INSTITUIÇÃO
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderTopBar()}
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          {perfil?.fotoUrl ? (
            <Image source={{ uri: perfil.fotoUrl }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>Logótipo</Text>
            </View>
          )}
          <Text style={styles.schoolName}>{perfil?.nome}</Text>
          <Text style={styles.schoolCategory}>🏫 {perfil?.categoria}</Text>
          <Text style={styles.headerInfo}>NIF: {perfil?.nif}</Text>
          <Text style={styles.headerInfo}>📞 Contacto: {perfil?.contacto}</Text>
          <Text style={styles.headerInfo}>✉️ Email: {perfil?.email}</Text>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.blueButton} onPress={() => setCurrentScreen('cadastrar')}>
            <Text style={styles.buttonText}>+ Cadastrar Aluno</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.grayButton} onPress={() => setCurrentScreen('cadastrarProf')}>
            <Text style={styles.grayButtonText}>+ Professor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.grayButton} onPress={handleOpenEdit}>
            <Text style={styles.grayButtonText}>✏️ Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adBanner}>
          <Text style={styles.adTitle}>📢 PUBLICIDADE</Text>
          <Text style={styles.adBody}>💻 Informática & Tablets Educativos</Text>
          <Text style={styles.adSub}>Venda de computadores portáteis e tablets de estudo com suporte técnico.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity key={tab.id} style={[styles.tabButton, isActive && styles.activeTabButton]} onPress={() => setActiveTab(tab.id)}>
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.contentArea}>{renderTabContent()}</View>

        {/* MODAL EDITAR PERFIL */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Perfil Completo</Text>
              <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
                {tempPerfil && (
                  <>
                    <Text style={styles.label}>Nome da Escola:</Text>
                    <TextInput style={styles.input} value={tempPerfil.nome} onChangeText={(t) => setTempPerfil({ ...tempPerfil, nome: t })} />
                    <Text style={styles.label}>Contacto:</Text>
                    <TextInput style={styles.input} value={tempPerfil.contacto} onChangeText={(t) => setTempPerfil({ ...tempPerfil, contacto: t })} />
                  </>
                )}
              </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAll}><Text style={styles.saveBtnText}>Guardar</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  topBarTitle: { fontSize: 22, fontWeight: 'bold', color: '#1d5bd8' },
  topBarBtn: { backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  topBarBtnText: { color: '#334155', fontWeight: 'bold', fontSize: 12 },

  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', marginTop: 15, marginBottom: 15 },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  placeholderImage: { backgroundColor: '#e9ecef', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#6c757d', fontSize: 12, fontWeight: 'bold' },
  schoolName: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  schoolCategory: { fontSize: 13, color: '#555', marginVertical: 3 },
  headerInfo: { fontSize: 13, color: '#666', marginTop: 1 },

  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 5 },
  blueButton: { backgroundColor: '#1d5bd8', paddingVertical: 12, borderRadius: 8, flex: 1.2, marginRight: 6, alignItems: 'center' },
  grayButton: { backgroundColor: '#e9ecef', paddingVertical: 12, borderRadius: 8, flex: 1, marginHorizontal: 3, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  grayButtonText: { color: '#333', fontWeight: 'bold', fontSize: 12 },

  adBanner: { backgroundColor: '#f0f4ff', marginHorizontal: 16, marginTop: 15, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#d0e0ff' },
  adTitle: { fontSize: 11, fontWeight: 'bold', color: '#d97706' },
  adBody: { fontSize: 13, fontWeight: 'bold', color: '#1e3a8a', marginTop: 2 },
  adSub: { fontSize: 11, color: '#64748b', marginTop: 2 },

  tabsContainer: { flexDirection: 'row', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', marginTop: 20 },
  tabButton: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTabButton: { borderBottomColor: '#1d5bd8' },
  tabText: { fontSize: 13, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#1d5bd8', fontWeight: 'bold' },

  contentArea: { padding: 16 },
  cardContent: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  cardSubtext: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  infoText: { fontSize: 13, color: '#334155', marginTop: 4 },

  legalBox: { padding: 20, backgroundColor: '#fff', margin: 16, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  legalHeader: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 10 },
  legalIntro: { fontSize: 13, color: '#334155', lineHeight: 20 },
  legalSubTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginTop: 12 },
  legalItem: { fontSize: 12, color: '#475569', marginLeft: 6, marginTop: 2 },
  acceptLegalBtn: { backgroundColor: '#1d5bd8', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  acceptLegalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  formCard: { padding: 16, backgroundColor: '#fff', margin: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  photoPickerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  previewImage: { width: 70, height: 70, borderRadius: 35, marginRight: 12 },
  pickImageBtn: { backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, alignItems: 'center', flex: 1 },
  pickImageBtnText: { color: '#1e293b', fontWeight: 'bold', fontSize: 12 },
  label: { fontSize: 12, color: '#475569', marginTop: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#f8fafc' },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', marginTop: 18, color: '#0f172a' },
  docUploadBtn: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' },
  docUploadText: { color: '#334155', fontSize: 12, fontWeight: 'bold' },
  saveStudentBtn: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveStudentBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  cancelBtn: { padding: 10, marginRight: 10 },
  cancelBtnText: { color: '#d9534f', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#1d5bd8', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
