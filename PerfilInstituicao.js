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
  const [activeTab, setActiveTab] = useState('cursos');
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

  const [instForm, setInstForm] = useState({
    nome: 'Colégio Baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
    directorGeral: '',
    viceDirector: '',
    fotoUrl: null,
    docDiarioRepublica: null,
    docNif: null,
    docAlvara: null,
    docBiDirector: null,
  });

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
  const [alunosText] = useState('Nenhum aluno cadastrado.');
  const [classes] = useState('1ª Classe, 2ª Classe, 3ª Classe, 10ª Classe');
  const [eventos] = useState('Feira da Ciência - 15/10');
  const [professoresList, setProfessoresList] = useState([]);

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

  // Abrir Modal para criar novo curso ou editar existente
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

  // Salvar alterações ou criar novo curso
  const handleSalvarCurso = () => {
    if (!cursoForm.nome.trim()) {
      Alert.alert('Atenção', 'Por favor, digite o nome do curso.');
      return;
    }

    const vagasTotalNum = parseInt(cursoForm.vagasTotal, 10) || 0;
    const vagasOcupadasNum = parseInt(cursoForm.vagasOcupadas, 10) || 0;

    if (vagasOcupadasNum > vagasTotalNum) {
      Alert.alert('Atenção', 'O número de vagas ocupadas não pode ser maior que o total de vagas.');
      return;
    }

    if (cursoEmEdicao) {
      // Atualizar curso existente
      setCursosList((prev) =>
        prev.map((item) =>
          item.id === cursoEmEdicao.id
            ? {
                ...item,
                nome: cursoForm.nome,
                vagasTotal: vagasTotalNum,
                vagasOcupadas: vagasOcupadasNum,
                icone: cursoForm.icone,
              }
            : item
        )
      );
      Alert.alert('Sucesso', 'Curso atualizado com sucesso!');
    } else {
      // Criar novo curso
      const novoCurso = {
        id: Date.now().toString(),
        nome: cursoForm.nome,
        vagasTotal: vagasTotalNum,
        vagasOcupadas: vagasOcupadasNum,
        icone: cursoForm.icone || '📚',
      };
      setCursosList((prev) => [...prev, novoCurso]);
      Alert.alert('Sucesso', 'Novo curso adicionado!');
    }

    setModalCursoVisivel(false);
  };

  // Eliminar curso
  const handleEliminarCurso = (id) => {
    Alert.alert('Confirmar', 'Deseja realmente eliminar este curso?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setCursosList((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  const handleCriarInstituicao = async () => {
    if (!instForm.nome || !instForm.nif || !instForm.directorGeral) {
      Alert.alert('Atenção', 'Por favor, introduza o Nome da Instituição, NIF e o Nome do Director Geral.');
      return;
    }

    setLoading(true);
    try {
      const fotoUrlRemote = await uploadImageToSupabase(instForm.fotoUrl);
      const docDiarioRemote = await uploadImageToSupabase(instForm.docDiarioRepublica);
      const docNifRemote = await uploadImageToSupabase(instForm.docNif);
      const docAlvaraRemote = await uploadImageToSupabase(instForm.docAlvara);
      const docBiRemote = await uploadImageToSupabase(instForm.docBiDirector);

      const payload = {
        nome: instForm.nome,
        categoria: instForm.categoria,
        nif: instForm.nif,
        contacto: instForm.contacto,
        email: instForm.email,
        director_geral: instForm.directorGeral,
        vice_director: instForm.viceDirector,
        foto_url: fotoUrlRemote,
        doc_diario_republica: docDiarioRemote,
        doc_nif: docNifRemote,
        doc_alvara: docAlvaraRemote,
        doc_bi_director: docBiRemote,
      };

      const { data, error } = await supabase.from('instituicoes').insert([payload]).select().single();

      if (error) throw error;

      setPerfil(data);
      Alert.alert('Sucesso', 'Instituição cadastrada no Supabase!');
      setCurrentScreen('perfil');
    } catch (err) {
      Alert.alert('Erro no Supabase', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastrarAluno = async () => {
    if (!alunoForm.nomeCompleto || !alunoForm.bi) {
      Alert.alert('Atenção', 'Preencha o Nome e o BI do aluno.');
      return;
    }

    if (!perfil?.id) {
      Alert.alert('Erro', 'Nenhuma instituição carregada.');
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

      const payload = {
        instituicao_id: perfil.id,
        nome_completo: alunoForm.nomeCompleto,
        bi: alunoForm.bi,
        foto_url: fotoRemote,
        nivel: alunoForm.nivel,
        curso: alunoForm.curso,
        num_processo: numProcesso,
        codigo_turma: codigoTurma,
        encarregado_nome: alunoForm.encarregadoNome,
        encarregado_telefone: alunoForm.encarregadoTelefone,
      };

      const { data, error } = await supabase.from('alunos').insert([payload]).select().single();

      if (error) throw error;

      setAlunoRegistado(data);
      setTotalInscritos(totalInscritos + 1);
      Alert.alert('Sucesso', `Aluno cadastrado!\nNº Processo: ${numProcesso}`);
      setCurrentScreen('perfilAluno');
    } catch (err) {
      Alert.alert('Erro no Supabase', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastrarProf = async () => {
    if (!profForm.nomeCompleto || !profForm.bi || !profForm.curso) {
      Alert.alert('Atenção', 'Preencha o Nome Completo, BI e o Curso.');
      return;
    }

    if (!perfil?.id) {
      Alert.alert('Erro', 'Nenhuma instituição carregada.');
      return;
    }

    setLoading(true);
    try {
      const fotoRemote = await uploadImageToSupabase(profForm.fotoUrl);
      const copiaBiRemote = await uploadImageToSupabase(profForm.copiaBiUrl);
      const certificadoRemote = await uploadImageToSupabase(profForm.certificadoUrl);

      const payload = {
        instituicao_id: perfil.id,
        nome_completo: profForm.nomeCompleto,
        bi: profForm.bi,
        foto_url: fotoRemote,
        grau_academico: profForm.grauAcademico,
        curso: profForm.curso,
        experiencia: profForm.experiencia,
        copia_bi_url: copiaBiRemote,
        certificado_url: certificadoRemote,
      };

      const { data, error } = await supabase.from('professores').insert([payload]).select().single();

      if (error) throw error;

      setProfRegistado(data);
      setProfessoresList((prev) => [...prev, data.nome_completo]);
      Alert.alert('Sucesso', 'Professor registado com sucesso!');
      setCurrentScreen('perfilProf');
    } catch (err) {
      Alert.alert('Erro no Supabase', err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'direccao', label: '👔 Direcção' },
    { id: 'cursos', label: `Cursos (${cursosList.length})` },
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
            <Text style={styles.infoText}>👨‍💼 Director Geral: {perfil.director_geral || 'Não especificado'}</Text>
            <Text style={styles.infoText}>👨‍💼 Vice-Director: {perfil.vice_director || 'Não especificado'}</Text>
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

            {cursosList.length === 0 ? (
              <Text style={styles.cardSubtext}>Nenhum curso cadastrado no momento.</Text>
            ) : (
              cursosList.map((curso) => {
                const disponiveis = curso.vagasTotal - curso.vagasOcupadas;
                const estaLotado = disponiveis <= 0;
                const percentual = Math.min(100, Math.round((curso.vagasOcupadas / curso.vagasTotal) * 100)) || 0;

                return (
                  <TouchableOpacity
                    key={curso.id}
                    style={styles.cursoCardItem}
                    onPress={() => handleAbrirModalCurso(curso)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cursoMainInfo}>
                      <Text style={styles.cursoIcone}>{curso.icone || '📚'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cursoNomeText}>{curso.nome}</Text>
                        <Text style={styles.cursoVagasText}>
                          {curso.vagasOcupadas} de {curso.vagasTotal} vagas preenchidas
                        </Text>
                      </View>
                      <View style={[styles.badgeVagas, estaLotado ? styles.badgeLotado : styles.badgeDisponivel]}>
                        <Text style={[styles.badgeVagasText, estaLotado ? styles.badgeLotadoText : styles.badgeDisponivelText]}>
                          {estaLotado ? '🚫 Lotado' : `✅ ${disponiveis} vagas`}
                        </Text>
                      </View>
                    </View>

                    {/* Barra de Progresso Visual */}
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${percentual}%`, backgroundColor: estaLotado ? '#ef4444' : '#1d5bd8' },
                        ]}
                      />
                    </View>

                    <View style={styles.cursoActionsRow}>
                      <Text style={styles.editHintText}>✏️ Clica para editar ou alterar vagas</Text>
                      <TouchableOpacity onPress={() => handleEliminarCurso(curso.id)}>
                        <Text style={styles.deleteCursoText}>🗑️ Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        );
      case 'pautas':
        return <View style={styles.cardContent}><Text style={styles.cardTitle}>Pautas</Text><Text style={styles.cardSubtext}>{pautas}</Text></View>;
      case 'alunos':
        return <View style={styles.cardContent}><Text style={styles.cardTitle}>Alunos</Text><Text style={styles.cardSubtext}>{alunosText}</Text></View>;
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
        <Text style={{ marginTop: 10, color: '#334155' }}>A processar no Supabase...</Text>
      </View>
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

      {/* MODAL PARA EDITAÇÃO E CRIAÇÃO DE CURSOS */}
      <Modal visible={modalCursoVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{cursoEmEdicao ? '✏️ Editar Curso e Vagas' : '➕ Novo Curso'}</Text>

            <Text style={styles.label}>Ícone ou Emoji do Curso:</Text>
            <TextInput style={styles.input} value={cursoForm.icone} onChangeText={(t) => setCursoForm({ ...cursoForm, icone: t })} placeholder="Ex: 💻, 📊, 🦷" />

            <Text style={styles.label}>Nome do Curso:</Text>
            <TextInput style={styles.input} value={cursoForm.nome} onChangeText={(t) => setCursoForm({ ...cursoForm, nome: t })} placeholder="Ex: Engenharia de Software" />

            <Text style={styles.label}>Total de Vagas Oferecidas:</Text>
            <TextInput style={styles.input} value={cursoForm.vagasTotal} onChangeText={(t) => setCursoForm({ ...cursoForm, vagasTotal: t })} keyboardType="numeric" />

            <Text style={styles.label}>Vagas Já Ocupadas / Preenchidas:</Text>
            <TextInput style={styles.input} value={cursoForm.vagasOcupadas} onChangeText={(t) => setCursoForm({ ...cursoForm, vagasOcupadas: t })} keyboardType="numeric" />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalCursoVisivel(false)}>
                <Text style={styles.cancelModalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSalvarCurso}>
                <Text style={styles.saveModalBtnText}>Salvar Curso</Text>
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
  placeholderText: { color: '#64748b', fontSize: 11, fontWeight: 'bold' },
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
  cursoActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  editHintText: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic' },
  deleteCursoText: { fontSize: 11, color: '#ef4444', fontWeight: 'bold' },
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
});
