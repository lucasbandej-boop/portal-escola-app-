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
} from 'react-native';

export default function PerfilInstituicao() {
  // Estado para controlar a aba ativa na visualização
  const [activeTab, setActiveTab] = useState('geral');

  // Dados Gerais do Perfil
  const [perfil, setPerfil] = useState({
    nome: 'Colégio baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
  });

  // Dados das outras seções do Perfil
  const [cursos, setCursos] = useState('Ensino Geral, Técnico de Informática');
  const [pautas, setPautas] = useState('Nenhuma pauta lançada para este trimestre.');
  const [alunos, setAlunos] = useState('João Pedro (Méd. 18), Maria Mateus (Méd. 19)');
  const [classes, setClasses] = useState('1ª Classe, 2ª Classe, 3ª Classe, 10ª Classe');
  const [eventos, setEventos] = useState('Feira da Ciência - 15/10');
  const [professores, setProfessores] = useState('Prof. Mateus, Profª Ana');

  // Modal Geral de Edição
  const [modalVisible, setModalVisible] = useState(false);
  const [editSection, setEditSection] = useState('geral'); // 'geral', 'cursos', 'pautas', 'alunos', 'classes', 'eventos', 'professores'

  // Copia temporária dos dados para edição no modal
  const [tempPerfil, setTempPerfil] = useState({ ...perfil });
  const [tempCursos, setTempCursos] = useState(cursos);
  const [tempPautas, setTempPautas] = useState(pautas);
  const [tempAlunos, setTempAlunos] = useState(alunos);
  const [tempClasses, setTempClasses] = useState(classes);
  const [tempEventos, setTempEventos] = useState(eventos);
  const [tempProfessores, setTempProfessores] = useState(professores);

  // Abrir o modal com os dados atuais
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

  // Salvar todas as alterações feitas de uma vez
  const handleSaveAll = () => {
    setPerfil({ ...tempPerfil });
    setCursos(tempCursos);
    setPautas(tempPautas);
    setAlunos(tempAlunos);
    setClasses(tempClasses);
    setEventos(tempEventos);
    setProfessores(tempProfessores);

    setModalVisible(false);
    Alert.alert('Sucesso', 'Todas as informações do perfil foram atualizadas!');
  };

  // Abas de navegação da tela principal
  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'cursos', label: `Cursos (${cursos ? cursos.split(',').length : 0})` },
    { id: 'pautas', label: '📊 Pauta Trimestral' },
    { id: 'alunos', label: '⭐ Alunos' },
    { id: 'classes', label: '📖 Classes' },
    { id: 'eventos', label: '📅 Eventos' },
    { id: 'professores', label: `📚 Professores (${professores ? professores.split(',').length : 0})` },
  ];

  // Renderizar o conteúdo da aba selecionada na tela principal
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

  return (
    <ScrollView style={styles.container}>
      {/* --- CABEÇALHO DO PERFIL --- */}
      <View style={styles.header}>
        <Text style={styles.schoolName}>{perfil.nome}</Text>
        <Text style={styles.schoolCategory}>🏫 {perfil.categoria}</Text>
        <Text style={styles.headerInfo}>NIF: {perfil.nif}</Text>
        <Text style={styles.headerInfo}>📞 Contacto: {perfil.contacto}</Text>
        <Text style={styles.headerInfo}>✉️ Email: {perfil.email}</Text>
      </View>

      {/* --- BARRAS DE BOTÕES SUPERIORES --- */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.blueButton}>
          <Text style={styles.buttonText}>+ Cadastrar Aluno</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.grayButton}>
          <Text style={styles.grayButtonText}>+ Professor</Text>
        </TouchableOpacity>

        {/* BOTÃO ÚNICO DE EDIÇÃO DO PERFIL */}
        <TouchableOpacity style={styles.grayButton} onPress={handleOpenEdit}>
          <Text style={styles.grayButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>

      {/* --- PAINEL DE PUBLICIDADE (NÃO EDITÁVEL PELO BOTÃO) --- */}
      <View style={styles.adBanner}>
        <Text style={styles.adTitle}>📢 PUBLICIDADE</Text>
        <Text style={styles.adBody}>💻 Informática & Tablets Educativos</Text>
        <Text style={styles.adSub}>Venda de computadores portáteis e tablets de estudo com suporte técnico.</Text>
      </View>

      {/* --- MENU DE ABAS NAVEGÁVEIS --- */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* --- ÁREA DE CONTEÚDO DAS ABAS --- */}
      <View style={styles.contentArea}>{renderTabContent()}</View>

      {/* --- MODAL POPUP PARA EDITAR TODAS AS INFORMAÇÕES DO PERFIL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil Completo</Text>

            {/* Menu de Seções dentro do Modal */}
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
                <TouchableOpacity
                  key={sec.id}
                  style={[styles.modalSubTabBtn, editSection === sec.id && styles.modalSubTabActive]}
                  onPress={() => setEditSection(sec.id)}
                >
                  <Text style={editSection === sec.id ? styles.modalSubTabTextActive : styles.modalSubTabText}>
                    {sec.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Formulários de Edição por Seção */}
            <ScrollView style={{ maxHeight: 300, marginTop: 10 }}>
              {editSection === 'geral' && (
                <>
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

              {editSection === 'cursos' && (
                <>
                  <Text style={styles.label}>Cursos (separados por vírgula):</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline value={tempCursos} onChangeText={setTempCursos} />
                </>
              )}

              {editSection === 'pautas' && (
                <>
                  <Text style={styles.label}>Informação de Pautas Trimestrais:</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline value={tempPautas} onChangeText={setTempPautas} />
                </>
              )}

              {editSection === 'alunos' && (
                <>
                  <Text style={styles.label}>Alunos em Destaque:</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline value={tempAlunos} onChangeText={setTempAlunos} />
                </>
              )}

              {editSection === 'classes' && (
                <>
                  <Text style={styles.label}>Classes Leccionadas:</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline value={tempClasses} onChangeText={setTempClasses} />
                </>
              )}

              {editSection === 'eventos' && (
                <>
                  <Text style={styles.label}>Eventos:</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline value={tempEventos} onChangeText={setTempEventos} />
                </>
              )}

              {editSection === 'professores' && (
                <>
                  <Text style={styles.label}>Professores:</Text>
                  <TextInput style={[styles.input, { height: 80 }]} multiline value={tempProfessores} onChangeText={setTempProfessores} />
                </>
              )}
            </ScrollView>

            {/* Botoes de acao do Modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAll}>
                <Text style={styles.saveBtnText}>Guardar Tudo</Text>
              </TouchableOpacity>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#111' },
  modalSubTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6 },
  modalSubTabBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6, backgroundColor: '#f0f0f0' },
  modalSubTabActive: { backgroundColor: '#1d5bd8' },
  modalSubTabText: { fontSize: 12, color: '#444' },
  modalSubTabTextActive: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  label: { fontSize: 12, color: '#666', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#fafafa' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  cancelBtn: { padding: 10, marginRight: 10 },
  cancelBtnText: { color: '#d9534f', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#1d5bd8', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
