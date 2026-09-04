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

  // --- DADOS DA INSTITUIÇÃO ---
  const [perfil, setPerfil] = useState({
    nome: 'Colégio baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
    fotoUrl: null, // Imagem da escola selecionada da galeria
  });

  // --- FORMULÁRIO DE REGISTO DE ALUNO ---
  const [totalInscritos, setTotalInscritos] = useState(1);
  const [alunoForm, setAlunoForm] = useState({
    nomeCompleto: '',
    bi: '',
    fotoUrl: null, // Imagem do aluno selecionada da galeria
    nivel: 'Iniciação',
    curso: 'Informática',
    encarregadoNome: '',
    encarregadoTelefone: '',
    certificadoPdf: '',
  });

  const [alunoRegistado, setAlunoRegistado] = useState(null);

  // Modal de Edição da Escola
  const [modalVisible, setModalVisible] = useState(false);
  const [tempPerfil, setTempPerfil] = useState({ ...perfil });

  // --- FUNÇÃO PARA ABRIR A GALERIA DO TELEMÓVEL ---
  const selecionarFotoDaGaleria = async (tipo) => {
    // Solicitar permissão de acesso à galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'É necessário permitir o acesso à galeria para escolher uma foto.');
      return;
    }

    // Abrir a galeria
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

  // --- LÓGICA DE CADASTRO DE ALUNO ---
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

    const novoAluno = {
      ...alunoForm,
      numProcesso,
      codigoTurma,
    };

    setAlunoRegistado(novoAluno);
    setTotalInscritos(totalInscritos + 1);
    Alert.alert('Sucesso', `Aluno cadastrado com sucesso!\nNº Processo: ${numProcesso}\nTurma: ${codigoTurma}`);
    setCurrentScreen('perfilAluno');
  };

  const handleSaveAll = () => {
    setPerfil({ ...tempPerfil });
    setModalVisible(false);
    Alert.alert('Sucesso', 'Informações da instituição atualizadas!');
  };

  // --- TELA DE CADASTRO DO ALUNO ---
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
              <Text style={styles.pickImageBtnText}>🖼️ Escolher da Galeria</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nome Completo:</Text>
          <TextInput
            style={styles.input}
            value={alunoForm.nomeCompleto}
            onChangeText={(t) => setAlunoForm({ ...alunoForm, nomeCompleto: t })}
            placeholder="Ex: João Manuel Mateus"
          />

          <Text style={styles.label}>Número do Bilhete de Identidade (BI):</Text>
          <TextInput
            style={styles.input}
            value={alunoForm.bi}
            onChangeText={(t) => setAlunoForm({ ...alunoForm, bi: t })}
            placeholder="000000000LA000"
          />

          <Text style={styles.label}>Nível de Ensino:</Text>
          <View style={styles.radioGroup}>
            {['Iniciação', 'Primário', 'Médio'].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.radioBtn, alunoForm.nivel === n && styles.radioActive]}
                onPress={() => setAlunoForm({ ...alunoForm, nivel: n })}
              >
                <Text style={alunoForm.nivel === n ? styles.radioTextActive : styles.radioText}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {alunoForm.nivel === 'Médio' && (
            <>
              <Text style={styles.label}>Escolher Curso:</Text>
              <TextInput
                style={styles.input}
                value={alunoForm.curso}
                onChangeText={(t) => setAlunoForm({ ...alunoForm, curso: t })}
                placeholder="Ex: Informática, Contabilidade"
              />
            </>
          )}

          <Text style={styles.sectionHeader}>👨‍👩‍👦 Dados do Encarregado de Educação</Text>
          <Text style={styles.label}>Nome Completo do Encarregado:</Text>
          <TextInput
            style={styles.input}
            value={alunoForm.encarregadoNome}
            onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoNome: t })}
            placeholder="Nome do Encarregado"
          />

          <Text style={styles.label}>Número de Telefone:</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={alunoForm.encarregadoTelefone}
            onChangeText={(t) => setAlunoForm({ ...alunoForm, encarregadoTelefone: t })}
            placeholder="+244 9XX XXX XXX"
          />

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

  // --- TELA PRINCIPAL DA INSTITUIÇÃO ---
  return (
    <ScrollView style={styles.container}>
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
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.blueButton} onPress={() => setCurrentScreen('cadastrar')}>
          <Text style={styles.buttonText}>+ Cadastrar Aluno</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.grayButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.grayButtonText}>✏️ Editar Escola</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Logótipo & Dados</Text>

            <Text style={styles.label}>Logótipo da Escola:</Text>
            <TouchableOpacity style={styles.pickImageBtn} onPress={() => selecionarFotoDaGaleria('escola')}>
              <Text style={styles.pickImageBtnText}>🖼️ Selecionar Logótipo da Galeria</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Nome:</Text>
            <TextInput style={styles.input} value={tempPerfil.nome} onChangeText={(t) => setTempPerfil({ ...tempPerfil, nome: t })} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAll}><Text style={styles.saveBtnText}>Guardar</Text></TouchableOpacity>
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

  // Estilos de seleção de fotos da galeria
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
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  cancelBtn: { padding: 10, marginRight: 10 },
  cancelBtnText: { color: '#d9534f', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#1d5bd8', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
