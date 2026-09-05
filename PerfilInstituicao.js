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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './lib/supabase';

export default function PerfilInstituicao() {
  const [currentScreen, setCurrentScreen] = useState('regulamento');
  const [activeTab, setActiveTab] = useState('geral');
  const [loading, setLoading] = useState(false);

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

  const [perfil, setPerfil] = useState(null);
  const [cursos] = useState('Ensino Geral, Técnico de Informática');
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
    { id: 'cursos', label: 'Cursos' },
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
            <View style={styles.divider} />
            <Text style={styles.cardTitle}>Documentos de Legalização Submetidos</Text>
            <Text style={styles.infoText}>📄 Diário da República: {perfil.doc_diario_republica ? 'Anexado ✅' : 'Pendente ❌'}</Text>
            <Text style={styles.infoText}>🪪 Cartão NIF: {perfil.doc_nif ? 'Anexado ✅' : 'Pendente ❌'}</Text>
            <Text style={styles.infoText}>🏛️ Licença / Alvará: {perfil.doc_alvara ? 'Anexado ✅' : 'Pendente ❌'}</Text>
            <Text style={styles.infoText}>👤 B.I. do Director Geral: {perfil.doc_bi_director ? 'Anexado ✅' : 'Pendente ❌'}</Text>
          </View>
        );
      case 'cursos':
        return <View style={styles.cardContent}><Text style={styles.cardTitle}>Cursos</Text><Text style={styles.cardSubtext}>{cursos}</Text></View>;
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

  if (currentScreen === 'regulamento') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.legalBox}>
          <Text style={styles.legalHeader}>🇦🇴 Regulamento de Legalização de Instituições de Ensino em Angola</Text>
          <Text style={styles.legalIntro}>
            Nos termos do Decreto Executivo do Ministério da Educação (MED), a abertura exige o cumprimento estrito dos requisitos abaixo:
          </Text>
          <Text style={styles.legalSubTitle}>1. Documentos Obrigatórios da Instituição:</Text>
          <Text style={styles.legalItem}>• Publicação do Diário da República.</Text>
          <Text style={styles.legalItem}>• Cartão NIF da Instituição.</Text>
          <Text style={styles.legalItem}>• Alvará de Funcionamento / Licença do MED.</Text>
          <TouchableOpacity style={styles.acceptLegalBtn} onPress={() => setCurrentScreen('criarInstituicao')}>
            <Text style={styles.acceptLegalBtnText}>✓ Li e Compreendi — Ir ao Formulário</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (currentScreen === 'criarInstituicao') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerForm}>
          <Text style={styles.formTitle}>🏛️ Inscrição da Instituição</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('regulamento')}>
            <Text style={styles.backBtnText}>📜 Ver Regulamento</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Logótipo da Instituição:</Text>
          <View style={styles.photoPickerContainer}>
            {instForm.fotoUrl ? (
              <Image source={{ uri: instForm.fotoUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderImage}><Text style={styles.placeholderText}>Logótipo</Text></View>
            )}
            <TouchableOpacity style={styles.pickImageBtn} onPress={() => selecionarImagem((uri) => setInstForm({ ...instForm, fotoUrl: uri }))}>
              <Text style={styles.pickImageBtnText}>🖼️ Selecionar Logótipo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nome da Instituição:</Text>
          <TextInput style={styles.input} value={instForm.nome} onChangeText={(t) => setInstForm({ ...instForm, nome: t })} />

          <Text style={styles.label}>Categoria / Tipo:</Text>
          <TextInput style={styles.input} value={instForm.categoria} onChangeText={(t) => setInstForm({ ...instForm, categoria: t })} />

          <Text style={styles.label}>NIF:</Text>
          <TextInput style={styles.input} value={instForm.nif} onChangeText={(t) => setInstForm({ ...instForm, nif: t })} />

          <Text style={styles.label}>Contacto:</Text>
          <TextInput style={styles.input} value={instForm.contacto} onChangeText={(t) => setInstForm({ ...instForm, contacto: t })} keyboardType="phone-pad" />

          <Text style={styles.label}>Email:</Text>
          <TextInput style={styles.input} value={instForm.email} onChangeText={(t) => setInstForm({ ...instForm, email: t })} keyboardType="email-address" />

          <Text style={styles.sectionHeader}>👔 Corpo Directivo</Text>
          <Text style={styles.label}>Director Geral:</Text>
          <TextInput style={styles.input} value={instForm.directorGeral} onChangeText={(t) => setInstForm({ ...instForm, directorGeral: t })} />

          <Text style={styles.label}>Vice-Director:</Text>
          <TextInput style={styles.input} value={instForm.viceDirector} onChangeText={(t) => setInstForm({ ...instForm, viceDirector: t })} />

          <Text style={styles.sectionHeader}>📂 Documentação Legal</Text>

          <TouchableOpacity style={styles.docUploadBtn} onPress={() => selecionarImagem((uri) => setInstForm({ ...instForm, docDiarioRepublica: uri }))}>
            <Text style={styles.docUploadText}>{instForm.docDiarioRepublica ? '✅ Diário Anexado' : '📄 Anexar Diário da República'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.docUploadBtn} onPress={() => selecionarImagem((uri) => setInstForm({ ...instForm, docNif: uri }))}>
            <Text style={styles.docUploadText}>{instForm.docNif ? '✅ NIF Anexado' : '🪪 Anexar Cartão NIF'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.docUploadBtn} onPress={() => selecionarImagem((uri) => setInstForm({ ...instForm, docAlvara: uri }))}>
            <Text style={styles.docUploadText}>{instForm.docAlvara ? '✅ Alvará Anexado' : '🏛️ Anexar Licença / Alvará'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.docUploadBtn} onPress={() => selecionarImagem((uri) => setInstForm({ ...instForm, docBiDirector: uri }))}>
            <Text style={styles.docUploadText}>{instForm.docBiDirector ? '✅ B.I. Director Anexado' : '👤 Anexar B.I. do Director'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCriarInstituicao}>
            <Text style={styles.saveStudentBtnText}>✓ Salvar no Supabase e Gerar Perfil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (currentScreen === 'cadastrarProf') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerForm}>
          <Text style={styles.formTitle}>👨‍🏫 Cadastro de Professor</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('perfil')}>
            <Text style={styles.backBtnText}>⬅ Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Nome Completo:</Text>
          <TextInput style={styles.input} value={profForm.nomeCompleto} onChangeText={(t) => setProfForm({ ...profForm, nomeCompleto: t })} />

          <Text style={styles.label}>Nº BI:</Text>
          <TextInput style={styles.input} value={profForm.bi} onChangeText={(t) => setProfForm({ ...profForm, bi: t })} />

          <Text style={styles.label}>Curso / Especialidade:</Text>
          <TextInput style={styles.input} value={profForm.curso} onChangeText={(t) => setProfForm({ ...profForm, curso: t })} />

          <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCadastrarProf}>
            <Text style={styles.saveStudentBtnText}>✓ Salvar Professor no Supabase</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (currentScreen === 'perfilProf' && profRegistado) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerForm}>
          <Text style={styles.formTitle}>👨‍🏫 Ficha do Professor</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('perfil')}>
            <Text style={styles.backBtnText}>⬅ Voltar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.studentCard}>
          <Text style={styles.studentName}>{profRegistado.nome_completo}</Text>
          <Text style={styles.studentBadge}>BI: {profRegistado.bi}</Text>
          <Text style={styles.infoRow}>🎓 Grau: {profRegistado.grau_academico}</Text>
          <Text style={styles.infoRow}>📚 Curso: {profRegistado.curso}</Text>
        </View>
      </ScrollView>
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
          <Text style={styles.label}>Nome Completo:</Text>
          <TextInput style={styles.input} value={alunoForm.nomeCompleto} onChangeText={(t) => setAlunoForm({ ...alunoForm, nomeCompleto: t })} />

          <Text style={styles.label}>Nº BI:</Text>
          <TextInput style={styles.input} value={alunoForm.bi} onChangeText={(t) => setAlunoForm({ ...alunoForm, bi: t })} />

          <TouchableOpacity style={styles.saveStudentBtn} onPress={handleCadastrarAluno}>
            <Text style={styles.saveStudentBtnText}>✓ Salvar Aluno no Supabase</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (currentScreen === 'perfilAluno' && alunoRegistado) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerForm}>
          <Text style={styles.formTitle}>🎓 Ficha do Aluno</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen('perfil')}>
            <Text style={styles.backBtnText}>⬅ Voltar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.studentCard}>
          <Text style={styles.studentName}>{alunoRegistado.nome_completo}</Text>
          <Text style={styles.studentBadge}>Nº Processo: {alunoRegistado.num_processo}</Text>
          <Text style={styles.studentBadgeTurma}>Turma: {alunoRegistado.codigo_turma}</Text>
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
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  cardSubtext: { fontSize: 13, color: '#64748b' },
  infoText: { fontSize: 13, color: '#334155', marginTop: 4 },
  legalBox: { padding: 20, backgroundColor: '#fff', margin: 16, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  legalHeader: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 10 },
  legalIntro: { fontSize: 13, color: '#334155', lineHeight: 20 },
  legalSubTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginTop: 12 },
  legalItem: { fontSize: 12, color: '#475569', marginLeft: 6, marginTop: 2 },
  acceptLegalBtn: { backgroundColor: '#1d5bd8', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  acceptLegalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  photoPickerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  previewImage: { width: 70, height: 70, borderRadius: 35, marginRight: 12 },
  pickImageBtn: { backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, alignItems: 'center', flex: 1 },
  pickImageBtnText: { color: '#1e293b', fontWeight: 'bold', fontSize: 12 },
  docUploadBtn: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 8, marginTop: 6, alignItems: 'center' },
  docUploadText: { color: '#334155', fontSize: 12, fontWeight: 'bold' },
  headerForm: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  backBtn: { backgroundColor: '#e2e8f0', padding: 8, borderRadius: 6 },
  backBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  formCard: { padding: 16, backgroundColor: '#fff', margin: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 12, color: '#475569', marginTop: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#f8fafc' },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', marginTop: 18, color: '#0f172a' },
  saveStudentBtn: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveStudentBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  studentCard: { margin: 16, padding: 20, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  studentName: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  studentBadge: { backgroundColor: '#dbeafe', color: '#1e40af', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6, fontWeight: 'bold', fontSize: 12 },
  studentBadgeTurma: { backgroundColor: '#dcfce7', color: '#166534', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4, fontWeight: 'bold', fontSize: 12 },
  divider: { width: '100%', height: 1, backgroundColor: '#e2e8f0', marginVertical: 14 },
  infoRow: { width: '100%', fontSize: 14, color: '#334155', marginTop: 6 },
});
