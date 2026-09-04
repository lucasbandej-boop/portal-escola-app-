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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PerfilInstituicao() {
  const [currentScreen, setCurrentScreen] = useState('perfil');
  const [activeTab, setActiveTab] = useState('geral');

  // --- DADOS DA INSTITUIÇÃO ---
  const [perfil, setPerfil] = useState({
    nome: 'Colégio baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
    fotoUrl: null,
  });

  const [cursos, setCursos] = useState('Ensino Geral, Técnico de Informática');
  const [pautas, setPautas] = useState('Nenhuma pauta lançada para este trimestre.');
  const [alunos, setAlunos] = useState('João Pedro (Méd. 18), Maria Mateus (Méd. 19)');
  const [classes, setClasses] = useState('1ª Classe, 2ª Classe, 3ª Classe, 10ª Classe');
  const [eventos, setEventos] = useState('Feira da Ciência - 15/10');
  const [professores, setProfessores] = useState('Prof. Mateus, Profª Ana');

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
    certificadoPdf: '',
  });

  const [alunoRegistado, setAlunoRegistado] = useState(null);

  // Modal Geral de Edição da Escola
  const [modalVisible, setModalVisible] = useState(false);
  const [editSection, setEditSection] = useState('geral');
  const [tempPerfil, setTempPerfil] = useState({ ...perfil });
  const [tempCursos, setTempCursos] = useState(cursos);
  const [tempPautas, setTempPautas] = useState(pautas);
  const [tempAlunos, setTempAlunos] = useState(alunos);
  const [tempClasses, setTempClasses] = useState(classes);
  const [tempEventos, setTempEventos] = useState(eventos);
  const [tempProfessores, setTempProfessores] = useState(professores);

  // --- FUNÇÃO PARA ABRIR A GALERIA DO TELEMÓVEL ---
  const selecionarFotoDaGaleria = async (tipo) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'É necessário permitir o acesso à galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (tipo === 'aluno') {
        setAlunoForm({ ...alunoForm, fotoUrl: uri });
      } else if (tipo === 'escola') {
        setTempPerfil({ ...tempPerfil, fotoUrl: uri });
      }
    }
  };

  const handleOpenEdit = () => {
    setTempPerfil({ ...perfil });
    setTempCursos(cursos);
    setTempPautas(pautas);
    setTempAlunos(alunos);
    setTempClasses(classes);
    setTempEventos(eventos);
    setTempProfessores(professores);
    setModalVisible(true);
  };

  const handleSaveAll = () => {
    setPerfil({ ...tempPerfil });
    setCursos(tempCursos);
    setPautas(tempPautas);
    setAlunos(tempAlunos);
    setClasses(tempClasses);
    setEventos(tempEventos);
    setProfessores(tempProfessores);
    setModalVisible(false);
    Alert.alert('Sucesso', 'Todas as informações foram atualizadas!');
  };

  const handleCadastrarAluno = () => {
    if (!alunoForm.nomeCompleto || !alunoForm.bi) {
      Alert.alert('Atenção', 'Por favor, preencha o Nome Completo e o BI.');
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
    Alert.alert('Sucesso', `Aluno cadastrado com sucesso!\nNº Processo: ${numProcesso}\nTurma: ${codigoTurma}`);
    setCurrentScreen('perfilAluno');
  };

  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'cursos', label: `Cursos (${cursos ? cursos.split(',').length : 0})` },
    { id: 'pautas', label: '📊 Pauta Trimestral' },
    { id: 'alunos', label: '⭐ Alunos' },
    { id: 'classes', label: '📖 Classes' },
    { id: 'eventos', label: '📅 Eventos' },
    { id: 'professores', label: `📚 Professores (${professores ? professores.split(',').length : 0})` },
  ];

  const renderTabContent = () => {
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
            <Text style={styles.cardSubtext}>{professores}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  // --- TELA DE CADASTRO DE ALUNOS ---
  if (currentScreen === 'cadastrar') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerForm}>
          <Text style={styles.formTitle}>📋 Ficha de Inscrição do Aluno</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('perfil')}>
            <Text style={styles.backBtnText}>⬅ Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Fotografia do Aluno:</Text>
          <View style={styles.photoPickerContainer}>
            {alunoForm.fotoUrl ? (
              <Image source={{ uri: alunoForm.fotoUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Sem Foto</Text>
              </View>
            )}
            <TouchableOpacity style={styles.pickImageBtn} onPress={() => selecionarFotoDaGaleria('aluno')}>
              <Text style={styles.pickImageBtnText}>🖼️ Selecionar Foto da Galeria</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nome Completo:</Text>
          <TextInput style={styles.input} value={alunoForm.nomeCompleto} onChangeText={(t) => setAlunoForm({ ...alunoForm, nomeCompleto: t })} placeholder="Ex: João Manuel Mateus" />

          <Text style={styles.label}>Número do Bilhete de Identidade (BI):</Text>
          <TextInput style={styles.input} value={alunoForm.bi} onChangeText={(t) => setAlunoForm({ ...alunoForm, bi: t })} placeholder="000000000LA000" />

          <Text style={styles.label}>Nível de Ensino:</Text>
          <View style={styles.radioGroup}>
            {['Iniciação', 'Primário', 'Médio'].map((n) => (
              <TouchableOpacity key={n} style={[styles.radioBtn, alunoForm.nivel === n && styles.radioActive]} onPress={() => setAlunoForm({ ...alunoForm, nivel: n })}>
                <Text style={alunoForm.nivel === n ? styles.radioTextActive : styles.radioText}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {alunoForm.nivel === 'Médio' && (
            <>
              <Text style={styles.label}>Escolher Curso:</Text>
              <TextInput style={styles.input} value={alunoForm.curso} onChangeText={(t) => setAlunoForm({ ...alunoForm, curso: t })} placeholder="Ex: Informática, Contabilidade" />
            </>
          )}

          <Text style={styles.sectionHeader}>👨‍👩‍👦 Dados do Encarregado de Educação</Text>
          <Text style={styles.label}>Nome Completo do Encarregado:</Text>
          <TextInput style={styles.input} value={alunoForm.encarregadoNome} onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoNome: t })} placeholder="Nome do Encarregado" />

          <Text style={styles.label}>Número de Telefone:</Text>
          <TextInput style={styles.input} keyboardType="phone-pad" value={alunoForm.encarregadoTelefone} onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoTelefone: t })} placeholder="+244 9XX XXX XXX" />

          <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCadastrarAluno}>
            <Text style={styles.saveStudentBtnText}>✓ Finalizar Inscrição</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // --- TELA DE PERFIL DO ALUNO ---
  if (currentScreen === 'perfilAluno' && alunoRegistado) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerForm}>
          <Text style={styles.formTitle}>🎓 Perfil do Estudante</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('perfil')}>
            <Text style={styles.backBtnText}>⬅ Início</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.studentCard}>
          {alunoRegistado.fotoUrl ? (
            <Image source={{ uri: alunoRegistado.fotoUrl }} style={styles.studentAvatar} />
          ) : (
            <View style={[styles.studentAvatar, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>Sem Foto</Text>
            </View>
          )}
          <Text style={styles.studentName}>{alunoRegistado.nomeCompleto}</Text>
          <Text style={styles.studentBadge}>Nº Processo: {alunoRegistado.numProcesso}</Text>
          <Text style={styles.studentBadgeTurma}>Turma Gerada: {alunoRegistado.codigoTurma}</Text>

          <View style={styles.divider} />

          <Text style={styles.infoRow}>🪪 <Text style={styles.bold}>BI:</Text> {alunoRegistado.bi}</Text>
          <Text style={styles.infoRow}>📚 <Text style={styles.bold}>Nível:</Text> {alunoRegistado.nivel}</Text>
          {alunoRegistado.nivel === 'Médio' && (
            <Text style={styles.infoRow}>💻 <Text style={styles.bold}>Curso:</Text> {alunoRegistado.curso}</Text>
          )}

          <View style={styles.divider} />
          <Text style={styles.sectionHeader}>👨‍👩‍👦 Encarregado de Educação</Text>
          <Text style={styles.infoRow}>👤 <Text style={styles.bold}>Nome:</Text> {alunoRegistado.encarregadoNome || 'Não informado'}</Text>
          <Text style={styles.infoRow}>📞 <Text style={styles.bold}>Contacto:</Text> {alunoRegistado.encarregadoTelefone || 'Não informado'}</Text>
        </View>
      </ScrollView>
    );
  }

  // --- TELA PRINCIPAL DO PERFIL COM TODAS AS ABAS ---
  return (
    <ScrollView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        {perfil.fotoUrl ? (
          <Image source={{ uri: perfil.fotoUrl }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>Logótipo</Text>
          </View>
        )}
        <Text style={styles.schoolName}>{perfil.nome}</Text>
        <Text style={styles.schoolCategory}>🏫 {perfil.categoria}</Text>
        <Text style={styles.headerInfo}>NIF: {perfil.nif}</Text>
        <Text style={styles.headerInfo}>📞 Contacto: {perfil.contacto}</Text>
        <Text style={styles.headerInfo}>✉️ Email: {perfil.email}</Text>
      </View>

      {/* OS 3 BOTÕES SUPERIORES */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.blueButton} onPress={() => setCurrentScreen('cadastrar')}>
          <Text style={styles.buttonText}>+ Cadastrar Aluno</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.grayButton}>
          <Text style={styles.grayButtonText}>+ Professor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.grayButton} onPress={handleOpenEdit}>
          <Text style={styles.grayButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>

      {/* PAINEL DE PUBLICIDADE */}
      <View style={styles.adBanner}>
        <Text style={styles.adTitle}>📢 PUBLICIDADE</Text>
        <Text style={styles.adBody}>💻 Informática & Tablets Educativos</Text>
        <Text style={styles.adSub}>Venda de computadores portáteis e tablets de estudo com suporte técnico.</Text>
      </View>

      {/* MENU DAS ABAS NAVEGÁVEIS */}
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

      {/* CONTEÚDO DAS ABAS */}
      <View style={styles.contentArea}>{renderTabContent()}</View>

      {/* MODAL EDITAR TUDO (COM BOTAO DA GALERIA) */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil Completo</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalSubTabs}>
              {[
                { id: 'geral', title: 'Dados Gerais' },
                { id: 'cursos', title: 'Cursos' },
                { id: 'pautas', title: 'Pautas' },
                { id: 'alunos', title: 'Alunos' },
                { id: 'classes', title: 'Classes' },
                { id: 'eventos', title: 'Eventos' },
                { id: 'professores', title: 'Professores' },
              ].map((sec) => (
                <TouchableOpacity key={sec.id} style={[styles.modalSubTabBtn, editSection === sec.id && styles.modalSubTabActive]} onPress={() => setEditSection(sec.id)}>
                  <Text style={editSection === sec.id ? styles.modalSubTabTextActive : styles.modalSubTabText}>{sec.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
              {editSection === 'geral' && (
                <>
                  <Text style={styles.label}>Logótipo da Escola:</Text>
                  <TouchableOpacity style={styles.pickImageBtn} onPress={() => selecionarFotoDaGaleria('escola')}>
                    <Text style={styles.pickImageBtnText}>🖼️ Selecionar Logótipo da Galeria</Text>
                  </TouchableOpacity>
                  <Text style={styles.label}>Nome da Instituição:</Text>
                  <TextInput style={styles.input} value={tempPerfil.nome} onChangeText={(t) => setTempPerfil({ ...tempPerfil, nome: t })} />
                  <Text style={styles.label}>Categoria:</Text>
                  <TextInput style={styles.input} value={tempPerfil.categoria} onChangeText={(t) => setTempPerfil({ ...tempPerfil, categoria: t })} />
                  <Text style={styles.label}>NIF:</Text>
                  <TextInput style={styles.input} value={tempPerfil.nif} onChangeText={(t) => setTempPerfil({ ...tempPerfil, nif: t })} />
                  <Text style={styles.label}>Contacto:</Text>
                  <TextInput style={styles.input} value={tempPerfil.contacto} onChangeText={(t) => setTempPerfil({ ...tempPerfil, contacto: t })} />
                  <Text style={styles.label}>Email:</Text>
                  <TextInput style={styles.input} value={tempPerfil.email} onChangeText={(t) => setTempPerfil({ ...tempPerfil, email: t })} />
                </>
              )}

              {editSection === 'cursos' && <TextInput style={[styles.input, { height: 80 }]} multiline value={tempCursos} onChangeText={setTempCursos} />}
              {editSection === 'pautas' && <TextInput style={[styles.input, { height: 80 }]} multiline value={tempPautas} onChangeText={setTempPautas} />}
              {editSection === 'alunos' && <TextInput style={[styles.input, { height: 80 }]} multiline value={tempAlunos} onChangeText={setTempAlunos} />}
              {editSection === 'classes' && <TextInput style={[styles.input, { height: 80 }]} multiline value={tempClasses} onChangeText={setTempClasses} />}
              {editSection === 'eventos' && <TextInput style={[styles.input, { height: 80 }]} multiline value={tempEventos} onChangeText={setTempEventos} />}
              {editSection === 'professores' && <TextInput style={[styles.input, { height: 80 }]} multiline value={tempProfessores} onChangeText={setTempProfessores} />}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAll}><Text style={styles.saveBtnText}>Guardar Tudo</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 10 },
  header: { alignItems: 'center', marginBottom: 15 },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  placeholderImage: { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#64748b', fontSize: 11, fontWeight: 'bold' },
  schoolName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  schoolCategory: { fontSize: 13, color: '#555', marginVertical: 2 },
  headerInfo: { fontSize: 13, color: '#666' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 },
  blueButton: { backgroundColor: '#1d5bd8', paddingVertical: 12, borderRadius: 8, flex: 1, marginRight: 4, alignItems: 'center' },
  grayButton: { backgroundColor: '#e9ecef', paddingVertical: 12, borderRadius: 8, flex: 1, marginHorizontal: 3, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  grayButtonText: { color: '#333', fontWeight: 'bold', fontSize: 12 },
  adBanner: { backgroundColor: '#f0f4ff', marginHorizontal: 12, marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#d0e0ff' },
  adTitle: { fontSize: 11, fontWeight: 'bold', color: '#d97706' },
  adBody: { fontSize: 13, fontWeight: 'bold', color: '#1e3a8a', marginTop: 2 },
  adSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', marginTop: 15 },
  tabButton: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTabButton: { borderBottomColor: '#1d5bd8' },
  tabText: { fontSize: 13, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#1d5bd8', fontWeight: 'bold' },
  contentArea: { padding: 16 },
  cardContent: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  cardSubtext: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  infoText: { fontSize: 13, color: '#334155', marginTop: 4 },

  photoPickerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  previewImage: { width: 70, height: 70, borderRadius: 35, marginRight: 12 },
  pickImageBtn: { backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, alignItems: 'center', flex: 1 },
  pickImageBtnText: { color: '#1e293b', fontWeight: 'bold', fontSize: 12 },

  headerForm: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  backBtn: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 6 },
  backBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  formCard: { padding: 16 },
  label: { fontSize: 12, color: '#475569', marginTop: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#f8fafc' },
  radioGroup: { flexDirection: 'row', marginTop: 6 },
  radioBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center', marginRight: 6 },
  radioActive: { backgroundColor: '#1d5bd8', borderColor: '#1d5bd8' },
  radioText: { color: '#334155', fontSize: 12 },
  radioTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', marginTop: 16, color: '#0f172a' },
  saveStudentBtn: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveStudentBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  studentCard: { margin: 16, padding: 20, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  studentAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  studentName: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  studentBadge: { backgroundColor: '#dbeafe', color: '#1e40af', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6, fontWeight: 'bold', fontSize: 12 },
  studentBadgeTurma: { backgroundColor: '#dcfce7', color: '#166534', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4, fontWeight: 'bold', fontSize: 12 },
  divider: { width: '100%', height: 1, backgroundColor: '#e2e8f0', marginVertical: 14 },
  infoRow: { width: '100%', fontSize: 14, color: '#334155', marginTop: 6 },
  bold: { fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#111' },
  modalSubTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6 },
  modalSubTabBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6, backgroundColor: '#f0f0f0' },
  modalSubTabActive: { backgroundColor: '#1d5bd8' },
  modalSubTabText: { fontSize: 12, color: '#444' },
  modalSubTabTextActive: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  cancelBtn: { padding: 10, marginRight: 10 },
  cancelBtnText: { color: '#d9534f', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#1d5bd8', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
