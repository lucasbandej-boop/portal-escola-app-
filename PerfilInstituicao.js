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

export default function PerfilInstituicao() {
  // Tela Ativa: 'perfil' (Instituição), 'cadastrar' (Formulário Aluno), 'perfilAluno' (Visualização Aluno)
  const [currentScreen, setCurrentScreen] = useState('perfil');
  const [activeTab, setActiveTab] = useState('geral');

  // --- DADOS DA INSTITUIÇÃO ---
  const [perfil, setPerfil] = useState({
    nome: 'Colégio baú',
    categoria: 'Escola / Instituição de Ensino',
    nif: '0082506071LA40',
    contacto: '+244 9XX XXX XXX',
    email: 'contacto@escola.ao',
    fotoUrl: 'https://via.placeholder.com/100',
  });

  const [cursos, setCursos] = useState('Informática, Enfermagem, Contabilidade');
  const [pautas, setPautas] = useState('Nenhuma pauta lançada para este trimestre.');
  const [alunos, setAlunos] = useState('João Pedro (Méd. 18), Maria Mateus (Méd. 19)');
  const [classes, setClasses] = useState('Iniciação, 1ª a 6ª Classe, 10ª a 12ª Classe');
  const [eventos, setEventos] = useState('Feira da Ciência - 15/10');
  const [professores, setProfessores] = useState('Prof. Mateus, Profª Ana');

  // --- FORMULÁRIO DE REGISTO DE ALUNO ---
  const [totalInscritos, setTotalInscritos] = useState(1); // Para gerar processo e turma
  const [alunoForm, setAlunoForm] = useState({
    nomeCompleto: '',
    bi: '',
    fotoUrl: '',
    nivel: 'Iniciação', // 'Iniciação', 'Primário', 'Médio'
    curso: 'Informática',
    encarregadoNome: '',
    encarregadoTelefone: '',
    certificadoPdf: '',
  });

  // Aluno Recém-Cadastrado para Visualização do Perfil
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

  // --- LÓGICA DE CADASTRO DE ALUNO ---
  const handleCadastrarAluno = () => {
    if (!alunoForm.nomeCompleto || !alunoForm.bi) {
      Alert.alert('Atenção', 'Por favor, preencha o Nome Completo e o BI.');
      return;
    }

    // Gerar Número do Processo Automático
    const numProcesso = `PROC-2026-${String(totalInscritos).padStart(4, '0')}`;

    // Gerar Código de Turma Automático
    const siglaCurso = alunoForm.nivel === 'Médio' ? alunoForm.curso.substring(0, 3).toUpperCase() : 'GERAL';
    const siglaNivel = alunoForm.nivel.charAt(0).toUpperCase();
    const numeroTurma = Math.ceil(totalInscritos / 30); // Nova turma a cada 30 inscritos
    const codigoTurma = `${siglaCurso}-${siglaNivel}0${numeroTurma}`;

    const novoAluno = {
      ...alunoForm,
      numProcesso,
      codigoTurma,
      fotoUrl: alunoForm.fotoUrl || 'https://via.placeholder.com/150',
    };

    setAlunoRegistado(novoAluno);
    setTotalInscritos(totalInscritos + 1);
    Alert.alert('Sucesso', `Aluno cadastrado com sucesso!\nNº Processo: ${numProcesso}\nTurma: ${codigoTurma}`);
    setCurrentScreen('perfilAluno');
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
    Alert.alert('Sucesso', 'Informações da instituição atualizadas!');
  };

  // --- RENDEREZAR TELA DO FORMULÁRIO DE CADASTRO DO ALUNO ---
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

          <Text style={styles.label}>Link/URL da Fotografia:</Text>
          <TextInput
            style={styles.input}
            value={alunoForm.fotoUrl}
            onChangeText={(t) => setAlunoForm({ ...alunoForm, fotoUrl: t })}
            placeholder="https://..."
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

          {/* Opção Específica para Ensino Médio */}
          {alunoForm.nivel === 'Médio' && (
            <>
              <Text style={styles.label}>Escolher Curso:</Text>
              <TextInput
                style={styles.input}
                value={alunoForm.curso}
                onChangeText={(t) => setAlunoForm({ ...alunoForm, curso: t })}
                placeholder="Ex: Informática, Contabilidade"
              />

              <Text style={styles.label}>Certificado de Conclusão (PDF - Link):</Text>
              <TextInput
                style={styles.input}
                value={alunoForm.certificadoPdf}
                onChangeText={(t) => setAlunoForm({ ...alunoForm, certificadoPdf: t })}
                placeholder="Link do certificado em PDF"
              />
            </>
          )}

          {/* Dados do Encarregado */}
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

  // --- RENDERIZAR PERFIL GERADO PARA O ESTUDANTE E ENCARREGADO ---
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
          <Image source={{ uri: alunoRegistado.fotoUrl }} style={styles.studentAvatar} />
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

          {alunoRegistado.certificadoPdf ? (
            <TouchableOpacity style={styles.pdfBtn}>
              <Text style={styles.pdfBtnText}>📄 Ver Certificado de Conclusão (PDF)</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    );
  }

  // --- TELA PRINCIPAL (PERFIL DA ESCOLA) ---
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: perfil.fotoUrl }} style={styles.profileImage} />
        <Text style={styles.schoolName}>{perfil.nome}</Text>
        <Text style={styles.schoolCategory}>🏫 {perfil.categoria}</Text>
        <Text style={styles.headerInfo}>NIF: {perfil.nif}</Text>
        <Text style={styles.headerInfo}>📞 Contacto: {perfil.contacto}</Text>
        <Text style={styles.headerInfo}>✉️ Email: {perfil.email}</Text>
      </View>

      <View style={styles.actionButtonsRow}>
        {/* BOTOES QUE NAVEGAM PARA O REGISTO DE ALUNO */}
        <TouchableOpacity style={styles.blueButton} onPress={() => setCurrentScreen('cadastrar')}>
          <Text style={styles.buttonText}>+ Cadastrar Aluno</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.grayButton}>
          <Text style={styles.grayButtonText}>+ Professor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.grayButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.grayButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.adBanner}>
        <Text style={styles.adTitle}>📢 PUBLICIDADE</Text>
        <Text style={styles.adBody}>💻 Informática & Tablets Educativos</Text>
        <Text style={styles.adSub}>Venda de computadores portáteis e tablets de estudo com suporte técnico.</Text>
      </View>

      <View style={styles.contentArea}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Painel do Portal Escolar</Text>
          <Text style={styles.infoText}>Inscrições Registadas: {totalInscritos - 1}</Text>
          <Text style={styles.infoText}>Cursos Ativos: {cursos}</Text>
        </View>
      </View>

      {/* Modal de Edição de Dados da Escola */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Instituição</Text>
            <Text style={styles.label}>Nome:</Text>
            <TextInput style={styles.input} value={tempPerfil.nome} onChangeText={(t) => setTempPerfil({ ...tempPerfil, nome: t })} />
            <Text style={styles.label}>Contacto:</Text>
            <TextInput style={styles.input} value={tempPerfil.contacto} onChangeText={(t) => setTempPerfil({ ...tempPerfil, contacto: t })} />
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
  profileImage: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e2e8f0', marginBottom: 10 },
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
  contentArea: { padding: 16 },
  cardContent: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#334155', marginTop: 4 },
  
  // Estilos do Formulário e Perfil do Aluno
  headerForm: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  backBtn: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 6 },
  backBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  formCard: { padding: 16 },
  label: { fontSize: 12, color: '#475569', marginTop: 10, fontWeight: '600' },
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
  pdfBtn: { marginTop: 16, backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center' },
  pdfBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  cancelBtn: { padding: 10, marginRight: 10 },
  cancelBtnText: { color: '#d9534f', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#1d5bd8', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
