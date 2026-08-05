import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Linking
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- MODAL DE LOGIN ESCURO (ESTILO DA IMAGEM) ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login'); // 'login' ou 'registro'
  const [emailOuLicenca, setEmailOuLicenca] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmeter = async () => {
    if (!emailOuLicenca.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      onLoginSucesso({ email: emailOuLicenca.trim() });
      onClose();
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visivel} animationType="fade" transparent={true}>
      <View style={styles.darkModalOverlay}>
        <View style={styles.darkModalCard}>
          {/* Título e Subtítulo */}
          <Text style={styles.darkModalTitle}>Portal Escola 🎓</Text>
          <Text style={styles.darkModalSubtitle}>Sistema Integrado de Gestão Escolar</Text>

          {/* Campo E-mail ou Nº Licença */}
          <TextInput
            style={styles.darkInput}
            placeholder="E-mail ou Nº Licença"
            placeholderTextColor="#9ca3af"
            value={emailOuLicenca}
            onChangeText={setEmailOuLicenca}
            autoCapitalize="none"
          />

          {/* Campo Senha */}
          <TextInput
            style={styles.darkInput}
            placeholder="Senha"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          {/* Botão ENTRAR */}
          <TouchableOpacity style={styles.btnEntrarDark} onPress={handleSubmeter} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.txtEntrarDark}>{modo === 'login' ? 'ENTRAR' : 'REGISTAR E ENTRAR'}</Text>
            )}
          </TouchableOpacity>

          {/* Link Cadastrar Nova Instituição / Alternar Modo */}
          <TouchableOpacity
            style={styles.btnLinkDark}
            onPress={() => setModo(modo === 'login' ? 'registro' : 'login')}
          >
            <Text style={styles.txtLinkDark}>
              {modo === 'login' ? 'Cadastrar Nova Instituição' : 'Já tenho conta / Iniciar Sessão'}
            </Text>
          </TouchableOpacity>

          {/* Botão Fechar Modal */}
          <TouchableOpacity style={styles.btnFecharDark} onPress={onClose}>
            <Text style={styles.txtFecharDark}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- TELA DE CONSULTA DE ALUNOS ---
function TelaConsultaAlunos({ onVoltarHome, onNavegarNovoEstudante }) {
  const [busca, setBusca] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstudantes();
  }, []);

  const carregarEstudantes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('estudantes').select('*').order('id', { ascending: false });
      if (error) throw error;
      setAlunos(data || []);
    } catch (err) {
      console.log('Erro ao carregar:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const alunosFiltrados = alunos.filter(item =>
    (item.nome_completo && item.nome_completo.toLowerCase().includes(busca.toLowerCase())) ||
    (item.num_bilhete && item.num_bilhete.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onVoltarHome}>
          <Text style={{ fontSize: 13, color: '#1e40af', fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>Consulta de Estudantes</Text>
        <TouchableOpacity onPress={onNavegarNovoEstudante}>
          <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: '700' }}>+ Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16 }}>
        <TextInput
          style={styles.inputBusca}
          placeholder="Pesquisar por aluno ou BI..."
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#0f172a" style={{ marginTop: 20 }} />
        ) : alunosFiltrados.length > 0 ? (
          alunosFiltrados.map((aluno) => (
            <View key={aluno.id} style={styles.cardConsulta}>
              <Text style={styles.nomeAlunoConsulta}>{aluno.nome_completo}</Text>
              <Text style={styles.detalheCurso}>Classe: {aluno.classe_ou_ano} • Turma: {aluno.turma}</Text>
              <Text style={styles.detalheCurso}>BI: {aluno.num_bilhete}</Text>
              <Text style={styles.valorInfoHighlight}>Encarregado: {aluno.encarregado_nome} ({aluno.encarregado_telefone})</Text>
            </View>
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>Nenhum estudante registado.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// --- FORMULÁRIOS DE CADASTRAMENTO ---
function FormCadastramentoEstudante({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [bilhete, setBilhete] = useState('');
  const [classe, setClasse] = useState('');
  const [turma, setTurma] = useState('');
  const [encarregadoNome, setEncarregadoNome] = useState('');
  const [encarregadoTel, setEncarregadoTel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !bilhete.trim()) {
      Alert.alert('Atenção', 'Preencha o Nome e o Número do BI.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('estudantes').insert([
      {
        nome_completo: nome.trim(),
        num_bilhete: bilhete.trim(),
        classe_ou_ano: classe.trim() || '10ª Classe',
        turma: turma.trim() || 'A',
        encarregado_nome: encarregadoNome.trim() || 'Não informado',
        encarregado_telefone: encarregadoTel.trim() || 'Não informado',
      }
    ]);
    setLoading(false);
    if (error) {
      Alert.alert('Erro ao Salvar', error.message);
    } else {
      Alert.alert('Sucesso', 'Estudante registado com sucesso!');
      onConcluir();
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Cadastramento de Estudante</Text>
      </View>
      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: António Manuel" />
      <Text style={styles.label}>Número do BI *</Text>
      <TextInput style={styles.input} value={bilhete} onChangeText={setBilhete} placeholder="000000000LA000" />
      <Text style={styles.label}>Classe</Text>
      <TextInput style={styles.input} value={classe} onChangeText={setClasse} placeholder="Ex: 10ª Classe" />
      <Text style={styles.label}>Turma</Text>
      <TextInput style={styles.input} value={turma} onChangeText={setTurma} placeholder="Ex: A" />
      <Text style={styles.label}>Encarregado de Educação</Text>
      <TextInput style={styles.input} value={encarregadoNome} onChangeText={setEncarregadoNome} placeholder="Ex: Manuel NETO" />
      <Text style={styles.label}>Contacto do Encarregado</Text>
      <TextInput style={styles.input} value={encarregadoTel} onChangeText={setEncarregadoTel} placeholder="+244 9XX XXX XXX" keyboardType="phone-pad" />
      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Estudante</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function FormCadastramentoInstituicao({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [diretor, setDiretor] = useState('');
  const [nif, setNif] = useState('');
  const [contacto, setContacto] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !nif.trim()) {
      Alert.alert('Atenção', 'Preencha o Nome e o NIF da instituição.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('instituicoes').insert([
      {
        nome: nome.trim(),
        director: diretor.trim() || 'Direção Geral',
        nif: nif.trim(),
        email: contacto.trim() || 'contacto@escola.ao',
      }
    ]);
    setLoading(false);
    if (error) {
      Alert.alert('Erro ao Salvar', error.message);
    } else {
      Alert.alert('Sucesso', 'Instituição cadastrada com sucesso!');
      onConcluir();
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
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Instituto Politécnico" />
      <Text style={styles.label}>Diretor</Text>
      <TextInput style={styles.input} value={diretor} onChangeText={setDiretor} placeholder="Nome do Diretor" />
      <Text style={styles.label}>NIF *</Text>
      <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="000000000XX000" />
      <Text style={styles.label}>Contacto / E-mail</Text>
      <TextInput style={styles.input} value={contacto} onChangeText={setContacto} placeholder="+244 9XX XXX XXX" />
      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Instituição</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function FormCadastramentoProfessor({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [bilhete, setBilhete] = useState('');
  const [areaFormacao, setAreaFormacao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !bilhete.trim()) {
      Alert.alert('Atenção', 'Preencha o Nome Completo e o Bilhete.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('professores').insert([
      {
        nome_completo: nome.trim(),
        num_bilhete: bilhete.trim(),
        area_formacao: areaFormacao.trim() || 'Ensino Geral',
      }
    ]);
    setLoading(false);
    if (error) {
      Alert.alert('Erro ao Salvar', error.message);
    } else {
      Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
      onConcluir();
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
      <Text style={styles.label}>Área de Formação</Text>
      <TextInput style={styles.input} value={areaFormacao} onChangeText={setAreaFormacao} placeholder="Ex: Matemática" />
      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Professor</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- MENU PRINCIPAL (HOME) ---
function MenuPrincipalHome({ onNavegarCadastramentoInst, onNavegarCadastramentoProf, onNavegarConsultaAlunos, publicidadeLigar }) {
  return (
    <ScrollView style={styles.homeContainer} contentContainerStyle={{ padding: 16 }}>
      {/* Banner de Publicidade Patrocinada */}
      <View style={styles.cardPublicidade}>
        <View style={styles.badgePatrocinado}>
          <Text style={styles.txtBadgePatrocinado}>📢 Publicidade Patrocinada</Text>
        </View>
        <Text style={styles.tituloPublicidade}>Matérias a bom preço</Text>
        <Text style={styles.corpoPublicidade}>
          🇦🇴 Olá Angola, o regresso às aulas já é uma realidade, estamos a disponibilizar materiais de boa qualidade.{'\n'}
          Livros 📕{'\n'}
          Caderno 📓{'\n'}
          Folha 4{'\n'}
          Lápis
        </Text>
        <TouchableOpacity style={styles.btnLigarPub} onPress={publicidadeLigar}>
          <Text style={styles.rodapePublicidade}>
            Para mais informações ligue no número abaixo:{'\n'}
            <Text style={styles.telefonePublicidade}>📞 929500600 (Clique para Ligar)</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Título do Menu */}
      <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>
      <Text style={styles.secaoSubtitulo}>Selecione a opção desejada para navegar:</Text>

      {/* Card 1 */}
      <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoInst}>
        <Text style={styles.cardEmoji}>🏫</Text>
        <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
        <Text style={styles.cardMenuDesc}>
          Registe a sua escola para gerir turmas, alunos e professores.
        </Text>
      </TouchableOpacity>

      {/* Card 2 */}
      <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarConsultaAlunos}>
        <Text style={styles.cardEmoji}>🔍</Text>
        <Text style={styles.cardMenuTitulo}>Consulta de Alunos e Encarregados</Text>
        <Text style={styles.cardMenuDesc}>
          Consulte o estado de matrícula e dados de estudantes.
        </Text>
      </TouchableOpacity>

      {/* Card 3 */}
      <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoProf}>
        <Text style={styles.cardEmoji}>👨‍🏫</Text>
        <Text style={styles.cardMenuTitulo}>Cadastramento de Professores</Text>
        <Text style={styles.cardMenuDesc}>
          Registe-se como docente independente na plataforma.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

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
          onNavegarNovoEstudante={() => iniciarFluxo('formulario_estudante')}
        />
      )}

      {tela === 'formulario_estudante' && (
        <FormCadastramentoEstudante
          onConcluir={() => setTela('consulta_alunos')}
          onCancelar={() => setTela('consulta_alunos')}
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

// --- ESTILOS COMPLETO (INCLUINDO DESIGN ESCURO DO MODAL) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  homeContainer: { flex: 1, backgroundColor: '#f8fafc' },

  // MODAL LOGIN ESTILO ESCURO (IMAGEM)
  darkModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 26, 0.85)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  darkModalCard: {
    backgroundColor: '#172033',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#26334d',
    alignItems: 'center'
  },
  darkModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4
  },
  darkModalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24
  },
  darkInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#243047',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  btnEntrarDark: {
    width: '100%',
    height: 48,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  txtEntrarDark: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  btnLinkDark: {
    paddingVertical: 8
  },
  txtLinkDark: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600'
  },
  btnFecharDark: {
    marginTop: 12,
    paddingVertical: 6
  },
  txtFecharDark: {
    color: '#64748b',
    fontSize: 12
  },

  // ESTILOS GERAIS DA HOME E FORMULÁRIOS
  cardPublicidade: { 
    backgroundColor: '#1d4ed8', 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 24,
    elevation: 4
  },
  badgePatrocinado: { 
    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 12, 
    marginBottom: 12 
  },
  txtBadgePatrocinado: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  tituloPublicidade: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  corpoPublicidade: { fontSize: 14, color: '#e0e7ff', lineHeight: 22, marginBottom: 14 },
  btnLigarPub: { backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 12 },
  rodapePublicidade: { fontSize: 13, color: '#c7d2fe', lineHeight: 18 },
  telefonePublicidade: { fontSize: 15, fontWeight: 'bold', color: '#fbbf24' },

  secaoTitulo: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  secaoSubtitulo: { fontSize: 14, color: '#64748b', marginBottom: 18 },

  cardMenuImageStyle: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    elevation: 2
  },
  cardEmoji: { fontSize: 32, marginBottom: 10 },
  cardMenuTitulo: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  cardMenuDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },

  inputBusca: { height: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 14, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  cardConsulta: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  nomeAlunoConsulta: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  detalheCurso: { fontSize: 13, color: '#64748b', marginTop: 2 },
  valorInfoHighlight: { fontSize: 13, color: '#1e40af', fontWeight: '600', marginTop: 4 },
  topBar: { height: 50, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  formContainer: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  formHeader: { marginBottom: 15 },
  btnVoltarHeader: { paddingVertical: 6, marginBottom: 4 },
  txtVoltarHeader: { color: '#1e40af', fontWeight: '600', fontSize: 13 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4, marginTop: 10 },
  input: { height: 42, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  btnSalvar: { backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 20 },
  txtSalvar: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
});
