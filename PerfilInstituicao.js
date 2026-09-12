import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase } from './supabase';

export default function PerfilInstituicao({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAluno, setModalAluno] = useState(false);
  const [modalProf, setModalProf] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('cursos');

  // Estado do Perfil e Fotos
  const [perfil, setPerfil] = useState({
    nome: 'Colégio baú',
    tipo: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
    logoUrl: 'https://via.placeholder.com/150',
    descricaoGeral: 'Bem-vindo ao perfil público da instituição.',
    directorGeral: 'Dr. João Pedro',
    directorPedagogico: 'Lic. Manuel Silva',
    infoPauta: 'Acesse ou publique os resultados trimestrais dos alunos aqui.'
  });

  const [editForm, setEditForm] = useState({ ...perfil });

  // Listas Dinâmicas
  const [cursos, setCursos] = useState([
    { id: '1', nome: 'Ensino Geral, Técnico de Informática' },
    { id: '2', nome: 'Gedt' },
    { id: '3', nome: 'Informática' },
    { id: '4', nome: 'Enfermagem' }
  ]);

  const [professores, setProfessores] = useState([
    { id: '1', nome: 'Prof. António Silva', disciplina: 'Matemática', foto: '' },
    { id: '2', nome: 'Profa. Maria Sousa', disciplina: 'Língua Portuguesa', foto: '' }
  ]);

  const [alunos, setAlunos] = useState([]);

  // Formulários Rápido
  const [novoAluno, setNovoAluno] = useState({ nome: '', classe: '', turma: '', foto: '' });
  const [novoProf, setNovoProf] = useState({ nome: '', disciplina: '', foto: '' });
  const [modalCurso, setModalCurso] = useState(false);
  const [novoCurso, setNovoCurso] = useState('');

  const abrirModalEdicao = () => {
    setEditForm({ ...perfil });
    setModalVisible(true);
  };

  const salvarPerfil = async () => {
    if (!editForm.nome.trim()) {
      Alert.alert('Erro', 'O nome da instituição é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        await supabase.from('instituicoes').upsert({
          id: user.user.id,
          nome: editForm.nome,
          tipo: editForm.tipo,
          nif: editForm.nif,
          contacto: editForm.contacto,
          email: editForm.email,
          logo_url: editForm.logoUrl,
          descricao_geral: editForm.descricaoGeral,
          director_geral: editForm.directorGeral,
          director_pedagogico: editForm.directorPedagogico,
          info_pauta: editForm.infoPauta
        });
      }
      setPerfil({ ...editForm });
      setModalVisible(false);
      Alert.alert('Sucesso', 'Perfil e foto atualizados!');
    } catch (err) {
      setPerfil({ ...editForm });
      setModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const cadastrarAluno = () => {
    if (!novoAluno.nome.trim()) {
      Alert.alert('Aviso', 'Preencha o nome do aluno.');
      return;
    }
    setAlunos([...alunos, { ...novoAluno, id: Date.now().toString() }]);
    setNovoAluno({ nome: '', classe: '', turma: '', foto: '' });
    setModalAluno(false);
    Alert.alert('Sucesso', 'Aluno cadastrado com sucesso!');
  };

  const cadastrarProfessor = () => {
    if (!novoProf.nome.trim()) {
      Alert.alert('Aviso', 'Preencha o nome do professor.');
      return;
    }
    setProfessores([...professores, { ...novoProf, id: Date.now().toString() }]);
    setNovoProf({ nome: '', disciplina: '', foto: '' });
    setModalProf(false);
    Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
  };

  const adicionarCurso = () => {
    if (!novoCurso.trim()) return;
    setCursos([...cursos, { id: Date.now().toString(), nome: novoCurso.trim() }]);
    setNovoCurso('');
    setModalCurso(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Topo */}
      <View style={styles.headerTop}>
        <Text style={styles.appTitle}>Portal Escola</Text>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.btnVoltarText}>⬅ Voltar ao Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Cartão de Perfil */}
      <View style={styles.profileCard}>
        <View style={styles.logoContainer}>
          {perfil.logoUrl ? (
            <Image source={{ uri: perfil.logoUrl }} style={styles.logoImage} />
          ) : (
            <Text style={styles.logoPlaceholder}>Sem Foto</Text>
          )}
        </View>

        <Text style={styles.nomeInstituicao}>{perfil.nome}</Text>
        <Text style={styles.infoText}>🏫 {perfil.tipo}</Text>
        <Text style={styles.infoText}>NIF: {perfil.nif}</Text>
        <Text style={styles.infoText}>📞 Contacto: {perfil.contacto}</Text>
        <Text style={styles.infoText}>✉️ Email: {perfil.email}</Text>

        {/* Botões de Ação */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.btnAcaoBlue} onPress={() => setModalAluno(true)}>
            <Text style={styles.btnAcaoText}>+ Cadastrar Aluno</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAcaoGray} onPress={() => setModalProf(true)}>
            <Text style={styles.btnAcaoTextDark}>+ Professor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnEditarPerfil} onPress={abrirModalEdicao}>
            <Text style={styles.btnEditarText}>✏️ Editar Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Publicidade */}
      <View style={styles.pubBox}>
        <Text style={styles.pubTag}>📢 PUBLICIDADE</Text>
        <Text style={styles.pubTitle}>💻 Informática & Tablets Educativos</Text>
        <Text style={styles.pubDesc}>Venda de computadores portáteis e tablets de estudo com suporte técnico.</Text>
      </View>

      {/* Abas */}
      <View style={styles.tabsRow}>
        <TouchableOpacity style={[styles.tabItem, abaAtiva === 'geral' && styles.tabActive]} onPress={() => setAbaAtiva('geral')}>
          <Text style={abaAtiva === 'geral' ? styles.tabActiveText : styles.tabText}>Geral</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, abaAtiva === 'direccao' && styles.tabActive]} onPress={() => setAbaAtiva('direccao')}>
          <Text style={abaAtiva === 'direccao' ? styles.tabActiveText : styles.tabText}>👔 Direcção ({professores.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, abaAtiva === 'cursos' && styles.tabActive]} onPress={() => setAbaAtiva('cursos')}>
          <Text style={abaAtiva === 'cursos' ? styles.tabActiveText : styles.tabText}>Cursos ({cursos.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, abaAtiva === 'pauta' && styles.tabActive]} onPress={() => setAbaAtiva('pauta')}>
          <Text style={abaAtiva === 'pauta' ? styles.tabActiveText : styles.tabText}>📊 Pauta Trimestral</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo Aba Geral */}
      {abaAtiva === 'geral' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <Text style={styles.sectionContentText}>{perfil.descricaoGeral}</Text>
          <Text style={[styles.sectionTitle, { marginTop: 15 }]}>🎓 Alunos Registados ({alunos.length})</Text>
          {alunos.map((a) => (
            <View key={a.id} style={styles.itemCardRow}>
              {a.foto ? <Image source={{ uri: a.foto }} style={styles.itemThumb} /> : <View style={styles.itemThumbPlaceholder}><Text>👤</Text></View>}
              <View>
                <Text style={styles.itemTitle}>{a.nome}</Text>
                <Text style={styles.itemSub}>{a.classe} | Turma: {a.turma}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Conteúdo Aba Direção / Professores */}
      {abaAtiva === 'direccao' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Corpo Directivo</Text>
          <Text style={styles.sectionContentText}>• Director Geral: {perfil.directorGeral}</Text>
          <Text style={styles.sectionContentText}>• Director Pedagógico: {perfil.directorPedagogico}</Text>

          <View style={[styles.sectionHeaderRow, { marginTop: 15 }]}>
            <Text style={styles.sectionTitle}>👨‍🏫 Professores ({professores.length})</Text>
            <TouchableOpacity style={styles.btnAddCurso} onPress={() => setModalProf(true)}>
              <Text style={styles.btnAddCursoText}>+ Professor</Text>
            </TouchableOpacity>
          </View>

          {professores.map((p) => (
            <View key={p.id} style={styles.itemCardRow}>
              {p.foto ? <Image source={{ uri: p.foto }} style={styles.itemThumb} /> : <View style={styles.itemThumbPlaceholder}><Text>👨‍🏫</Text></View>}
              <View>
                <Text style={styles.itemTitle}>{p.nome}</Text>
                <Text style={styles.itemSub}>Disciplina: {p.disciplina}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Conteúdo Aba Cursos */}
      {abaAtiva === 'cursos' && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Cursos Lecionados</Text>
            <TouchableOpacity style={styles.btnAddCurso} onPress={() => setModalCurso(true)}>
              <Text style={styles.btnAddCursoText}>+ Adicionar Curso</Text>
            </TouchableOpacity>
          </View>
          {cursos.map((c) => (
            <View key={c.id} style={styles.cursoCard}>
              <Text style={styles.cursoNome}>• {c.nome}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Modal Editar Perfil & Foto */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Editar Perfil & Foto</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>URL da Foto / Logótipo:</Text>
              <TextInput style={styles.modalInput} placeholder="https://link-da-foto.com/logo.png" value={editForm.logoUrl} onChangeText={(t) => setEditForm({ ...editForm, logoUrl: t })} />

              <Text style={styles.inputLabel}>Nome da Instituição:</Text>
              <TextInput style={styles.modalInput} value={editForm.nome} onChangeText={(t) => setEditForm({ ...editForm, nome: t })} />

              <Text style={styles.inputLabel}>NIF:</Text>
              <TextInput style={styles.modalInput} value={editForm.nif} onChangeText={(t) => setEditForm({ ...editForm, nif: t })} />

              <Text style={styles.inputLabel}>Contacto Telefónico:</Text>
              <TextInput style={styles.modalInput} value={editForm.contacto} onChangeText={(t) => setEditForm({ ...editForm, contacto: t })} />

              <Text style={styles.inputLabel}>Director Geral:</Text>
              <TextInput style={styles.modalInput} value={editForm.directorGeral} onChangeText={(t) => setEditForm({ ...editForm, directorGeral: t })} />
            </ScrollView>
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}><Text style={styles.btnCancelarText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSalvar} onPress={salvarPerfil}>{loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSalvarText}>Salvar</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Cadastrar Aluno */}
      <Modal visible={modalAluno} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎓 Cadastrar Novo Aluno</Text>
            <TextInput style={styles.modalInput} placeholder="Nome do Aluno (*)" value={novoAluno.nome} onChangeText={(t) => setNovoAluno({ ...novoAluno, nome: t })} />
            <TextInput style={[styles.modalInput, { marginTop: 8 }]} placeholder="Classe (Ex: 10ª Classe)" value={novoAluno.classe} onChangeText={(t) => setNovoAluno({ ...novoAluno, classe: t })} />
            <TextInput style={[styles.modalInput, { marginTop: 8 }]} placeholder="Turma (Ex: Turma A)" value={novoAluno.turma} onChangeText={(t) => setNovoAluno({ ...novoAluno, turma: t })} />
            <TextInput style={[styles.modalInput, { marginTop: 8 }]} placeholder="URL da Foto do Aluno (Opcional)" value={novoAluno.foto} onChangeText={(t) => setNovoAluno({ ...novoAluno, foto: t })} />
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalAluno(false)}><Text style={styles.btnCancelarText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSalvar} onPress={cadastrarAluno}><Text style={styles.btnSalvarText}>Cadastrar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Cadastrar Professor */}
      <Modal visible={modalProf} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👨‍🏫 Cadastrar Professor</Text>
            <TextInput style={styles.modalInput} placeholder="Nome do Professor (*)" value={novoProf.nome} onChangeText={(t) => setNovoProf({ ...novoProf, nome: t })} />
            <TextInput style={[styles.modalInput, { marginTop: 8 }]} placeholder="Disciplina / Cadeira" value={novoProf.disciplina} onChangeText={(t) => setNovoProf({ ...novoProf, disciplina: t })} />
            <TextInput style={[styles.modalInput, { marginTop: 8 }]} placeholder="URL da Foto do Professor (Opcional)" value={novoProf.foto} onChangeText={(t) => setNovoProf({ ...novoProf, foto: t })} />
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalProf(false)}><Text style={styles.btnCancelarText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSalvar} onPress={cadastrarProfessor}><Text style={styles.btnSalvarText}>Cadastrar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Curso */}
      <Modal visible={modalCurso} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📚 Novo Curso</Text>
            <TextInput style={styles.modalInput} placeholder="Nome do Curso" value={novoCurso} onChangeText={setNovoCurso} />
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalCurso(false)}><Text style={styles.btnCancelarText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSalvar} onPress={adicionarCurso}><Text style={styles.btnSalvarText}>Adicionar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  appTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E40AF' },
  btnVoltar: { backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnVoltarText: { color: '#334155', fontWeight: 'bold', fontSize: 13 },
  profileCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  logoContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },
  logoPlaceholder: { color: '#64748B', fontWeight: '600', fontSize: 12 },
  nomeInstituicao: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#475569', marginBottom: 2 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 14, gap: 6 },
  btnAcaoBlue: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnAcaoGray: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnEditarPerfil: { flex: 1, backgroundColor: '#F8FAFC', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
  btnAcaoText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  btnAcaoTextDark: { color: '#1E293B', fontWeight: 'bold', fontSize: 12 },
  btnEditarText: { color: '#334155', fontWeight: 'bold', fontSize: 12 },
  pubBox: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  pubTag: { color: '#2563EB', fontWeight: 'bold', fontSize: 11 },
  pubTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E3A8A', marginTop: 2 },
  pubDesc: { fontSize: 12, color: '#3B82F6', marginTop: 2 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E2E8F0', marginBottom: 12 },
  tabItem: { paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#2563EB' },
  tabText: { color: '#64748B', fontWeight: '500', fontSize: 12 },
  tabActiveText: { color: '#2563EB', fontWeight: 'bold', fontSize: 12 },
  sectionContainer: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  sectionContentText: { fontSize: 13, color: '#334155', marginTop: 4 },
  btnAddCurso: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnAddCursoText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  cursoCard: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  cursoNome: { fontSize: 14, color: '#334155' },
  itemCardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 8, backgroundColor: '#F8FAFC', borderRadius: 8, gap: 10 },
  itemThumb: { width: 40, height: 40, borderRadius: 20 },
  itemThumbPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#64748B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 12, padding: 18 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginTop: 6, marginBottom: 2 },
  modalInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 8, backgroundColor: '#F8FAFC', fontSize: 13 },
  modalActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  btnCancelar: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#F1F5F9' },
  btnCancelarText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
  btnSalvar: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#2563EB' },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});
