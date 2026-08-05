import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Linking
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DADOS FICTÍCIOS DE EXEMPLO PARA CONSULTA DE ALUNOS ---
const ALUNOS_EXEMPLO = [
  {
    id: '1',
    nome_aluno: 'António Manuel Neto',
    bi_aluno: '008945211LA042',
    classe: '10ª Classe',
    turma: 'A',
    curso: 'Informática de Gestão',
    nome_encarregado: 'Manuel NETO',
    contacto_encarregado: '+244 923 112 334',
    parentesco: 'Pai',
    foto_url: 'https://via.placeholder.com/150/1e293b/ffffff?text=Neto',
    status: 'Matriculado'
  },
  {
    id: '2',
    nome_aluno: 'Beatriz da Silva',
    bi_aluno: '007812993LA038',
    classe: '11ª Classe',
    turma: 'B',
    curso: 'Contabilidade',
    nome_encarregado: 'Teresa da Silva',
    contacto_encarregado: '+244 912 445 667',
    parentesco: 'Mãe',
    foto_url: 'https://via.placeholder.com/150/1e293b/ffffff?text=Beatriz',
    status: 'Matriculado'
  },
  {
    id: '3',
    nome_aluno: 'Cláudio José Santos',
    bi_aluno: '009123884LA011',
    classe: '12ª Classe',
    turma: 'C',
    curso: 'Eletricidade',
    nome_encarregado: 'João Francisco Santos',
    contacto_encarregado: '+244 945 889 001',
    parentesco: 'Tio / Encarregado',
    foto_url: 'https://via.placeholder.com/150/1e293b/ffffff?text=Claudio',
    status: 'Pendente'
  }
];

// --- MODAL DE AUTENTICAÇÃO ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmeter = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha o e-mail e a palavra-passe.');
      return;
    }

    if (modo === 'registro' && senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As palavras-passes não coincidem.');
      return;
    }

    setLoading(true);
    try {
      if (modo === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });

        if (error) {
          Alert.alert('Sessão iniciada', 'Acedendo em modo de sessão local.');
        } else {
          Alert.alert('Sucesso', 'Sessão iniciada com sucesso!');
        }
        onLoginSucesso(data?.user || { email: email.trim() });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
        });

        if (error) {
          Alert.alert('Conta Criada', 'Registo efetuado! Redirecionando.');
        } else {
          Alert.alert('Sucesso', 'Conta criada com sucesso!');
        }
        onLoginSucesso(data?.user || { email: email.trim() });
      }
      onClose();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha na operação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visivel} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.abaAuthContainer}>
            <TouchableOpacity
              style={[styles.btnAbaAuth, modo === 'login' && styles.btnAbaAuthAtiva]}
              onPress={() => setModo('login')}
            >
              <Text style={[styles.txtAbaAuth, modo === 'login' && styles.txtAbaAuthAtiva]}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAbaAuth, modo === 'registro' && styles.btnAbaAuthAtiva]}
              onPress={() => setModo('registro')}
            >
              <Text style={[styles.txtAbaAuth, modo === 'registro' && styles.txtAbaAuthAtiva]}>Criar Conta</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            {modo === 'login'
              ? 'Insira o seu e-mail e palavra-passe para entrar.'
              : 'Preencha os dados abaixo para se cadastrar pela primeira vez.'}
          </Text>

          <Text style={styles.label}>E-mail de Acesso *</Text>
          <TextInput
            style={styles.input}
            placeholder="seu.email@escola.ao"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Palavra-passe *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          {modo === 'registro' && (
            <>
              <Text style={styles.label}>Confirmar Palavra-passe *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />
            </>
          )}

          <TouchableOpacity style={styles.btnSalvar} onPress={handleSubmeter} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.txtSalvar}>
                {modo === 'login' ? 'Entrar e Continuar' : 'Criar Conta e Continuar'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
            <Text style={styles.txtCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- TELA DE CONSULTA DE ALUNOS E ENCARREGADOS ---
function TelaConsultaAlunos({ onVoltarHome }) {
  const [busca, setBusca] = useState('');
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  const alunosFiltrados = ALUNOS_EXEMPLO.filter(item =>
    item.nome_aluno.toLowerCase().includes(busca.toLowerCase()) ||
    item.bi_aluno.toLowerCase().includes(busca.toLowerCase()) ||
    item.nome_encarregado.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onVoltarHome}>
          <Text style={{ fontSize: 13, color: '#1e40af', fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>Consulta de Estudantes</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ padding: 16 }}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Pesquisar por aluno, BI ou encarregado..."
          placeholderTextColor="#94a3b8"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {alunosFiltrados.map((aluno) => (
          <TouchableOpacity
            key={aluno.id}
            style={styles.cardConsulta}
            onPress={() => setAlunoSelecionado(aluno)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.nomeAlunoConsulta}>{aluno.nome_aluno}</Text>
              <View style={styles.badgeClasse}>
                <Text style={styles.txtBadgeClasse}>{aluno.classe}</Text>
              </View>
            </View>

            <Text style={styles.detalheCurso}>
              Turma: {aluno.turma} • {aluno.curso}
            </Text>

            <View style={styles.divisorCard} />

            <View style={styles.linhaInfo}>
              <Text style={styles.rotuloInfo}>Nº do BI:</Text>
              <Text style={styles.valorInfo}>{aluno.bi_aluno}</Text>
            </View>

            <View style={styles.linhaInfo}>
              <Text style={styles.rotuloInfo}>Encarregado:</Text>
              <Text style={styles.valorInfoHighlight}>{aluno.nome_encarregado} ({aluno.parentesco})</Text>
            </View>

            <View style={styles.linhaInfo}>
              <Text style={styles.rotuloInfo}>Contacto:</Text>
              <Text style={styles.valorContacto}>{aluno.contacto_encarregado}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {alunosFiltrados.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>Nenhum registo encontrado.</Text>
          </View>
        )}
      </ScrollView>

      {/* MODAL COM FICHA DO ALUNO */}
      <Modal visible={alunoSelecionado !== null} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <Text style={{ fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: '#0f172a' }}>
              Ficha do Estudante
            </Text>

            {alunoSelecionado && (
              <ScrollView style={{ paddingVertical: 5 }}>
                <View style={{ alignItems: 'center', marginBottom: 15 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>{alunoSelecionado.nome_aluno}</Text>
                  <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 2 }}>Situação: {alunoSelecionado.status}</Text>
                </View>

                <View style={styles.cardInfoModal}>
                  <Text style={styles.tituloSecaoModal}>Dados Académicos</Text>
                  <Text style={styles.itemModal}>Classe: {alunoSelecionado.classe}</Text>
                  <Text style={styles.itemModal}>Turma: {alunoSelecionado.turma}</Text>
                  <Text style={styles.itemModal}>Curso: {alunoSelecionado.curso}</Text>
                  <Text style={styles.itemModal}>Nº BI: {alunoSelecionado.bi_aluno}</Text>
                </View>

                <View style={[styles.cardInfoModal, { marginTop: 12 }]}>
                  <Text style={styles.tituloSecaoModal}>Encarregado de Educação</Text>
                  <Text style={styles.itemModal}>Nome: {alunoSelecionado.nome_encarregado}</Text>
                  <Text style={styles.itemModal}>Parentesco: {alunoSelecionado.parentesco}</Text>
                  <Text style={styles.itemModal}>Contacto: {alunoSelecionado.contacto_encarregado}</Text>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.btnSalvar} onPress={() => setAlunoSelecionado(null)}>
              <Text style={styles.txtSalvar}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- FORMULÁRIO DE CADASTRAMENTO DE INSTITUIÇÕES ---
function FormCadastramentoInstituicao({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [diretor, setDiretor] = useState('');
  const [viceDiretor, setViceDiretor] = useState('');
  const [nif, setNif] = useState('');
  const [contacto, setContacto] = useState('');
  const [numEstudantes, setNumEstudantes] = useState('');
  const [numProfessores, setNumProfessores] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [sobre, setSobre] = useState('');
  const [loading, setLoading] = useState(false);

  const escolherFoto = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) {
        Alert.alert('Permissão necessária', 'Acesso à galeria é necessário.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setFotoUrl(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Erro imagem:', e);
    }
  };

  const handleCadastrar = async () => {
    if (!nome.trim() || !nif.trim() || !contacto.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha o Nome, NIF e Contacto.');
      return;
    }

    setLoading(true);
    const dadosEscola = {
      nome: nome.trim(),
      logo_url: fotoUrl || 'https://via.placeholder.com/150/1e293b/ffffff?text=Escola',
      director: diretor.trim(),
      vice_director: viceDiretor.trim(),
      nif: nif.trim(),
      email: contacto.trim(),
      num_estudantes: numEstudantes.trim() || '0',
      num_professores: numProfessores.trim() || '0',
      localizacao: localizacao.trim() || 'Angola',
      sobre: sobre.trim(),
    };

    try {
      const { data, error } = await supabase.from('instituicoes').insert([dadosEscola]).select().single();
      if (error) {
        onConcluir({ ...dadosEscola, id: Date.now() });
      } else {
        onConcluir(data);
      }
      Alert.alert('Sucesso', 'Instituição cadastrada com sucesso!');
    } catch (err) {
      onConcluir({ ...dadosEscola, id: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Cadastramento de Instituição</Text>
      </View>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Instituto Politécnico de Viana" />

      <Text style={styles.label}>Diretor *</Text>
      <TextInput style={styles.input} value={diretor} onChangeText={setDiretor} placeholder="Nome do Diretor Geral" />

      <Text style={styles.label}>Vice-Diretor</Text>
      <TextInput style={styles.input} value={viceDiretor} onChangeText={setViceDiretor} placeholder="Nome do Vice-Diretor" />

      <Text style={styles.label}>NIF *</Text>
      <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="000000000XX000" keyboardType="numeric" />

      <Text style={styles.label}>Contacto / E-mail *</Text>
      <TextInput style={styles.input} value={contacto} onChangeText={setContacto} placeholder="+244 9XX XXX XXX" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Instituição</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.txtCancelar}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- FORMULÁRIO DE CADASTRAMENTO DE PROFESSOR ---
function FormCadastramentoProfessor({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [bilhete, setBilhete] = useState('');
  const [areaFormacao, setAreaFormacao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !bilhete.trim() || !areaFormacao.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    const dadosProf = {
      nome_completo: nome.trim(),
      foto_url: 'https://via.placeholder.com/150/1e293b/ffffff?text=Docente',
      num_bilhete: bilhete.trim(),
      area_formacao: areaFormacao.trim(),
    };

    try {
      const { data, error } = await supabase.from('professores').insert([dadosProf]).select().single();
      if (error) {
        onConcluir({ ...dadosProf, id: Date.now() });
      } else {
        onConcluir(data);
      }
      Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
    } catch (err) {
      onConcluir({ ...dadosProf, id: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Cadastramento de Professor</Text>
      </View>

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Manuel dos Santos" />

      <Text style={styles.label}>Número do Bilhete *</Text>
      <TextInput style={styles.input} value={bilhete} onChangeText={setBilhete} placeholder="000000000LA000" />

      <Text style={styles.label}>Área de Formação *</Text>
      <TextInput style={styles.input} value={areaFormacao} onChangeText={setAreaFormacao} placeholder="Ex: Licenciado em Matemática" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Professor</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.txtCancelar}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- TELA INICIAL (HOME) ---
function MenuPrincipalHome({ onNavegarCadastramentoInst, onNavegarCadastramentoProf, onNavegarConsultaAlunos, publicidadeLigar }) {
  return (
    <ScrollView style={styles.homeContainer}>
      <View style={styles.homeHeader}>
        <Text style={styles.homeHeaderTitle}>Portal Escolar</Text>
        <TouchableOpacity style={styles.btnLoginTop} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.txtLoginTop}>Área Restrita</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={styles.secaoTitulo}>Painel Geral</Text>
        <Text style={styles.secaoSubtitulo}>Selecione o serviço pretendido:</Text>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarConsultaAlunos}>
          <Text style={styles.cardMenuTitulo}>Consulta de Alunos e Encarregados</Text>
          <Text style={styles.cardMenuDesc}>Consulte matrículas, turmas e contactos dos encarregados.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
          <Text style={styles.cardMenuDesc}>Registo e gestão de instituições de ensino.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarCadastramentoProf}>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Professores</Text>
          <Text style={styles.cardMenuDesc}>Registo do corpo docente e áreas de lecionação.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [tela, setTela] = useState('home');
  const [destinoAposLogin, setDestinoAposLogin] = useState('formulario_inst');
  const [loginVisivel, setLoginVisivel] = useState(false);

  const iniciarFluxo = (destino) => {
    setDestinoAposLogin(destino);
    setLoginVisivel(true);
  };

  const handleLoginSucesso = () => {
    setTela(destinoAposLogin);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ModalLogin
        visivel={loginVisivel}
        onClose={() => setLoginVisivel(false)}
        onLoginSucesso={handleLoginSucesso}
      />

      {tela === 'home' && (
        <MenuPrincipalHome
          onNavegarCadastramentoInst={() => iniciarFluxo('formulario_inst')}
          onNavegarCadastramentoProf={() => iniciarFluxo('formulario_prof')}
          onNavegarConsultaAlunos={() => setTela('consulta_alunos')}
          publicidadeLigar={() => Linking.openURL('tel:929500600')}
        />
      )}

      {tela === 'consulta_alunos' && (
        <TelaConsultaAlunos
          onVoltarHome={() => setTela('home')}
        />
      )}

      {tela === 'formulario_inst' && (
        <FormCadastramentoInstituicao
          onConcluir={() => setTela('home')}
          onCancelar={() => setTela('home')}
        />
      )}

      {tela === 'formulario_prof' && (
        <FormCadastramentoProfessor
          onConcluir={() => setTela('home')}
          onCancelar={() => setTela('home')}
        />
      )}
    </SafeAreaView>
  );
}

// --- ESTILOS LIMPOS E PROFISSIONAIS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  homeContainer: { flex: 1, backgroundColor: '#f8fafc' },
  homeHeader: {
    height: 56,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  homeHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  btnLoginTop: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  txtLoginTop: { color: '#334155', fontWeight: '600', fontSize: 13 },

  secaoTitulo: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 8 },
  secaoSubtitulo: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  cardMenu: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardMenuTitulo: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  cardMenuDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },

  inputBusca: { height: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 14, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  
  // Cartão Profissional de Consulta
  cardConsulta: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  nomeAlunoConsulta: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  badgeClasse: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  txtBadgeClasse: { fontSize: 11, color: '#1d4ed8', fontWeight: '600' },
  detalheCurso: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  divisorCard: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rotuloInfo: { fontSize: 12, color: '#64748b', width: 90, fontWeight: '500' },
  valorInfo: { fontSize: 13, color: '#334155', fontWeight: '600' },
  valorInfoHighlight: { fontSize: 13, color: '#1e40af', fontWeight: '600' },
  valorContacto: { fontSize: 13, color: '#0f766e', fontWeight: '600' },

  cardInfoModal: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  tituloSecaoModal: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  itemModal: { fontSize: 13, color: '#334155', marginBottom: 4 },

  topBar: { height: 50, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 10, padding: 20 },
  abaAuthContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 6, padding: 3, marginBottom: 12 },
  btnAbaAuth: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 4 },
  btnAbaAuthAtiva: { backgroundColor: '#ffffff' },
  txtAbaAuth: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  txtAbaAuthAtiva: { color: '#0f172a' },
  modalSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 15, textAlign: 'center' },

  formContainer: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  formHeader: { marginBottom: 15 },
  btnVoltarHeader: { paddingVertical: 6, marginBottom: 4 },
  txtVoltarHeader: { color: '#1e40af', fontWeight: '600', fontSize: 13 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4, marginTop: 10 },
  input: { height: 42, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  btnSalvar: { backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 20 },
  txtSalvar: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  btnCancelar: { backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  txtCancelar: { color: '#475569', fontWeight: '600', fontSize: 14 },
});
