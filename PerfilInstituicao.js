import React, { useState } from 'react';
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
  const [currentScreen, setCurrentScreen] = useState('perfil');
  const [activeTab, setActiveTab] = useState('alunos');
  const [loading, setLoading] = useState(false);

  // Dados da Instituição
  const [perfil, setPerfil] = useState({
    id: '1',
    nome: 'Colégio Baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
    director_geral: 'Director Geral',
    vice_director: 'Vice-Director',
    foto_url: null,
  });

  // Lista dinâmica de alunos inscritos/cadastrados
  const [alunosList, setAlunosList] = useState([
    {
      id: '1',
      nomeCompleto: 'Mateus António Francisco',
      bi: '008923412LA042',
      numProcesso: 'PROC-2026-0001',
      codigoTurma: 'INF-M01',
      nivel: 'Ensino Médio',
      curso: 'Informática',
      encarregadoNome: 'António Francisco',
      encarregadoTelefone: '+244 923 111 222',
      fotoUrl: null,
    },
  ]);

  // Lista dinâmica de cursos com vagas
  const [cursosList, setCursosList] = useState([
    { id: '1', nome: 'Informática', vagasTotal: 30, vagasOcupadas: 18, icone: '💻' },
    { id: '2', nome: 'Gestão Empresarial', vagasTotal: 25, vagasOcupadas: 25, icone: '📊' },
    { id: '3', nome: 'Dentista', vagasTotal: 15, vagasOcupadas: 4, icone: '🦷' },
  ]);

  // Modal para criar/editar curso
  const [modalCursoVisivel, setModalCursoVisivel] = useState(false);
  const [cursoEmEdicao, setCursoEmEdicao] = useState(null);
  const [cursoForm, setCursoForm] = useState({
    nome: '',
    vagasTotal: '30',
    vagasOcupadas: '0',
    icone: '📚',
  });

  const [pautas] = useState('Nenhuma pauta lançada para este trimestre.');
  const [classes] = useState('1ª Classe, 2ª Classe, 3ª Classe, 10ª Classe');
  const [eventos] = useState('Feira da Ciência - 15/10');
  const [professoresList, setProfessoresList] = useState([]);

  const [totalInscritos, setTotalInscritos] = useState(2);
  const [alunoForm, setAlunoForm] = useState({
    nomeCompleto: '',
    bi: '',
    fotoUrl: null,
    nivel: 'Médio',
    curso: 'Informática',
    encarregadoNome: '',
    encarregadoTelefone: '',
  });
  const [alunoRegistado, setAlunoRegistado] = useState(null);

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
      console.error('Erro no upload de imagem:', err.message);
      return null;
    }
  };

  const selecionarImagem = async (callback) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'É necessário permitir o acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      callback(result.assets[0].uri);
    }
  };

  const handleCadastrarAluno = async () => {
    if (!alunoForm.nomeCompleto || !alunoForm.bi) {
      Alert.alert('Atenção', 'Preencha o Nome e o BI do aluno.');
      return;
    }

    setLoading(true);
    try {
      const numProcesso = `PROC-2026-${String(totalInscritos).padStart(4, '0')}`;
      const siglaCurso = alunoForm.nivel === 'Médio' ? alunoForm.curso.substring(0, 3).toUpperCase() : 'GERAL';
      const siglaNivel = alunoForm.nivel.charAt(0).toUpperCase();
      const numeroTurma = Math.ceil(totalInscritos / 30);
      const codigoTurma = `${siglaCurso}-${siglaNivel}0${numeroTurma}`;

      const fotoRemote = await uploadImageToSupabase(alunoForm.fotoUrl);

      const novoAluno = {
        id: Date.now().toString(),
        nomeCompleto: alunoForm.nomeCompleto,
        bi: alunoForm.bi,
        fotoUrl: fotoRemote,
        nivel: alunoForm.nivel,
        curso: alunoForm.curso,
        numProcesso: numProcesso,
        codigoTurma: codigoTurma,
        encarregadoNome: alunoForm.encarregadoNome,
        encarregadoTelefone: alunoForm.encarregadoTelefone,
      };

      setAlunosList((prev) => [novoAluno, ...prev]);
      setAlunoRegistado(novoAluno);
      setTotalInscritos(totalInscritos + 1);

      Alert.alert('Sucesso', `Aluno cadastrado com sucesso!\nNº Processo: ${numProcesso}`);
      setCurrentScreen('perfil');
      setActiveTab('alunos');
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

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
      Alert.alert('Atenção', 'Por favor, digite o nome do curso.');
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

  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'direccao', label: '👔 Direcção' },
    { id: 'cursos', label: `Cursos (${cursosList.length})` },
    { id: 'pautas', label: '📊 Pauta Trimestral' },
    { id: 'alunos', label: `⭐ Alunos (${alunosList.length})` },
    { id: 'classes', label: '📖 Classes' },
    { id: 'eventos', label: '📅 Eventos' },
    { id: 'professores', label: `📚 Professores (${professoresList.length})` },
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
      case 'direccao':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Corpo Directivo</Text>
            <Text style={styles.infoText}>👨‍💼 Director Geral: {perfil.director_geral}</Text>
            <Text style={styles.infoText}>👨‍💼 Vice-Director: {perfil.vice_director}</Text>
          </View>
        );
      case 'cursos':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cursosHeaderRow}>
              <Text style={styles.cardTitle}>Cursos Lecionados</Text>
              <TouchableOpacity style={styles.addCursoBtn} onPress={() => handleAbrirModalCurso()}>
                <Text style={styles.addCursoBtnText}>+ Novo Curso</Text>
              </TouchableOpacity>
            </View>

            {cursosList.map((curso) => {
              const disponiveis = curso.vagasTotal - curso.vagasOcupadas;
              const estaLotado = disponiveis <= 0;
              const percentual = Math.min(100, Math.round((curso.vagasOcupadas / curso.vagasTotal) * 100)) || 0;

              return (
                <TouchableOpacity key={curso.id} style={styles.cursoCardItem} onPress={() => handleAbrirModalCurso(curso)}>
                  <View style={styles.cursoMainInfo}>
                    <Text style={styles.cursoIcone}>{curso.icone}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cursoNomeText}>{curso.nome}</Text>
                      <Text style={styles.cursoVagasText}>{curso.vagasOcupadas} de {curso.vagasTotal} vagas preenchidas</Text>
                    </View>
                    <View style={[styles.badgeVagas, estaLotado ? styles.badgeLotado : styles.badgeDisponivel]}>
                      <Text style={[styles.badgeVagasText, estaLotado ? styles.badgeLotadoText : styles.badgeDisponivelText]}>
                        {estaLotado ? '🚫 Lotado' : `✅ ${disponiveis} vagas`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${percentual}%`, backgroundColor: estaLotado ? '#ef4444' : '#1d5bd8' }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      case 'alunos':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cursosHeaderRow}>
              <Text style={styles.cardTitle}>Alunos Matriculados ({alunosList.length})</Text>
              <TouchableOpacity style={styles.addCursoBtn} onPress={() => setCurrentScreen('cadastrar')}>
                <Text style={styles.addCursoBtnText}>+ Novo Aluno</Text>
              </TouchableOpacity>
            </View>

            {alunosList.length === 0 ? (
              <Text style={styles.cardSubtext}>Nenhum aluno cadastrado no momento.</Text>
            ) : (
              alunosList.map((aluno) => (
                <View key={aluno.id} style={styles.alunoCardItem}>
                  <View style={styles.alunoCardHeader}>
                    {aluno.fotoUrl ? (
                      <Image source={{ uri: aluno.fotoUrl }} style={styles.alunoAvatar} />
                    ) : (
                      <View style={[styles.alunoAvatar, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>🎓</Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.alunoNomeText}>{aluno.nomeCompleto}</Text>
                      <Text style={styles.alunoBiText}>BI: {aluno.bi}</Text>
                    </View>
                  </View>

                  <View style={styles.alunoTagsRow}>
                    <View style={styles.alunoBadgeProc}>
                      <Text style={styles.alunoBadgeProcText}>📄 {aluno.numProcesso}</Text>
                    </View>
                    <View style={styles.alunoBadgeTurma}>
                      <Text style={styles.alunoBadgeTurmaText}>🏫 Turma: {aluno.codigoTurma}</Text>
                    </View>
                  </View>

                  <View style={styles.dividerLight} />

                  <Text style={styles.alunoInfoRow}>🎓 <Text style={{ fontWeight: 'bold' }}>Curso:</Text> {aluno.curso} ({aluno.nivel})</Text>
                  {aluno.encarregadoNome ? (
                    <Text style={styles.alunoInfoRow}>👨‍👦 <Text style={{ fontWeight: 'bold' }}>Encarregado:</Text> {aluno.encarregadoNome} ({aluno.encarregadoTelefone})</Text>
                  ) : null}
                </View>
              ))
            )}
          </View>
        );
      case 'pautas':
        return <View style={styles.cardContent}><Text style={styles.cardTitle}>Pautas</Text><Text style={styles.cardSubtext}>{pautas}</Text></View>;
      case 'classes':
        return <View style={styles.cardContent}><Text style={styles.cardTitle}>Classes</Text><Text style={styles.cardSubtext}>{classes}</Text></View>;
      case 'eventos':
        return <View style={styles.cardContent}><Text style={styles.cardTitle}>Eventos</Text><Text style={styles.cardSubtext}>{eventos}</Text></View>;
      case 'professores':
        return (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Corpo Docente</Text>
            <Text style={styles.cardSubtext}>{professoresList.length > 0 ? professoresList.join(', ') : 'Nenhum professor cadastrado.'}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1d5bd8" />
        <Text style={{ marginTop: 10, color: '#334155' }}>A processar...</Text>
      </View>
    );
  }

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

          <Text style={styles.label}>Nome do Encarregado de Educação:</Text>
          <TextInput style={styles.input} value={alunoForm.encarregadoNome} onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoNome: t })} placeholder="Ex: Manuel Francisco" />

          <Text style={styles.label}>Telefone do Encarregado:</Text>
          <TextInput style={styles.input} value={alunoForm.encarregadoTelefone} onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoTelefone: t })} keyboardType="phone-pad" placeholder="Ex: +244 923 000 111" />

          <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCadastrarAluno}>
            <Text style={styles.saveStudentBtnText}>✓ Salvar e Gerar Ficha do Aluno</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {perfil?.foto_url ? (
          <Image source={{ uri: perfil.foto_url }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]}><Text style={styles.placeholderText}>Logótipo</Text></View>
        )}
        <Text style={styles.schoolName}>{perfil?.nome || 'Instituição'}</Text>
        <Text style={styles.schoolCategory}>🏫 {perfil?.categoria || 'Geral'}</Text>
        <Text style={styles.headerInfo}>NIF: {perfil?.nif || 'N/A'}</Text>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.blueButton} onPress={() => setCurrentScreen('cadastrar')}>
          <Text style={styles.buttonText}>+ Cadastrar Aluno</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.grayButton} onPress={() => setCurrentScreen('cadastrarProf')}>
          <Text style={styles.grayButtonText}>+ Professor</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.id} style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]} onPress={() => setActiveTab(tab.id)}>
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.contentArea}>{renderTabContent()}</View>

      {/* MODAL CURSOS */}
      <Modal visible={modalCursoVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{cursoEmEdicao ? '✏️ Editar Curso e Vagas' : '➕ Novo Curso'}</Text>

            <Text style={styles.label}>Ícone ou Emoji do Curso:</Text>
            <TextInput style={styles.input} value={cursoForm.icone} onChangeText={(t) => setCursoForm({ ...cursoForm, icone: t })} />

            <Text style={styles.label}>Nome do Curso:</Text>
            <TextInput style={styles.input} value={cursoForm.nome} onChangeText={(t) => setCursoForm({ ...cursoForm, nome: t })} />

            <Text style={styles.label}>Total de Vagas Oferecidas:</Text>
            <TextInput style={styles.input} value={cursoForm.vagasTotal} onChangeText={(t) => setCursoForm({ ...cursoForm, vagasTotal: t })} keyboardType="numeric" />

            <Text style={styles.label}>Vagas Já Ocupadas:</Text>
            <TextInput style={styles.input} value={cursoForm.vagasOcupadas} onChangeText={(t) => setCursoForm({ ...cursoForm, vagasOcupadas: t })} keyboardType="numeric" />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalCursoVisivel(false)}>
                <Text style={styles.cancelModalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSalvarCurso}>
                <Text style={styles.saveModalBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 10 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 15 },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  placeholderImage: { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#64748b', fontSize: 16, fontWeight: 'bold' },
  schoolName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  schoolCategory: { fontSize: 13, color: '#555', marginVertical: 2 },
  headerInfo: { fontSize: 13, color: '#666' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 },
  blueButton: { backgroundColor: '#1d5bd8', paddingVertical: 12, borderRadius: 8, flex: 1, marginRight: 4, alignItems: 'center' },
  grayButton: { backgroundColor: '#e9ecef', paddingVertical: 12, borderRadius: 8, flex: 1, marginHorizontal: 3, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  grayButtonText: { color: '#333', fontWeight: 'bold', fontSize: 12 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', marginTop: 15 },
  tabButton: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTabButton: { borderBottomColor: '#1d5bd8' },
  tabText: { fontSize: 13, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#1d5bd8', fontWeight: 'bold' },
  contentArea: { padding: 16 },
  cardContent: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  cardSubtext: { fontSize: 13, color: '#64748b', marginTop: 8 },
  infoText: { fontSize: 13, color: '#334155', marginTop: 4 },
  cursosHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addCursoBtn: { backgroundColor: '#1d5bd8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addCursoBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cursoCardItem: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 12 },
  cursoMainInfo: { flexDirection: 'row', alignItems: 'center' },
  cursoIcone: { fontSize: 22, marginRight: 10 },
  cursoNomeText: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  cursoVagasText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  badgeVagas: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeDisponivel: { backgroundColor: '#dcfce7' },
  badgeDisponivelText: { color: '#15803d', fontSize: 11, fontWeight: 'bold' },
  badgeLotado: { backgroundColor: '#fee2e2' },
  badgeLotadoText: { color: '#b91c1c', fontSize: 11, fontWeight: 'bold' },
  progressBarBackground: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  alunoCardItem: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, marginBottom: 12 },
  alunoCardHeader: { flexDirection: 'row', alignItems: 'center' },
  alunoAvatar: { width: 45, height: 45, borderRadius: 22.5 },
  alunoNomeText: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  alunoBiText: { fontSize: 12, color: '#64748b' },
  alunoTagsRow: { flexDirection: 'row', marginTop: 8, gap: 6 },
  alunoBadgeProc: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  alunoBadgeProcText: { color: '#1e40af', fontSize: 11, fontWeight: 'bold' },
  alunoBadgeTurma: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  alunoBadgeTurmaText: { color: '#166534', fontSize: 11, fontWeight: 'bold' },
  dividerLight: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
  alunoInfoRow: { fontSize: 12, color: '#334155', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  label: { fontSize: 12, color: '#475569', marginTop: 10, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#f8fafc' },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelModalBtn: { backgroundColor: '#e2e8f0', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginRight: 8 },
  cancelModalBtnText: { color: '#475569', fontWeight: 'bold' },
  saveModalBtn: { backgroundColor: '#16a34a', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  saveModalBtnText: { color: '#fff', fontWeight: 'bold' },
  headerForm: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  backBtn: { backgroundColor: '#e2e8f0', padding: 8, borderRadius: 6 },
  backBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  formCard: { padding: 16, backgroundColor: '#fff', margin: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  saveStudentBtn: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveStudentBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
