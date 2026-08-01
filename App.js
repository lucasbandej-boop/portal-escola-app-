import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { supabase } from './supabase';

export default function App() {
  // NAVEGAÇÃO
  const [tela, setTela] = useState('login'); // 'login', 'registro', 'validar_email', 'dashboard', 'secretaria', 'turmas', 'notas'
  const [subAbaSecretaria, setSubAbaSecretaria] = useState('estudantes');
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // LOGIN
  const [loginInput, setLoginInput] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // REGISTO DE ESCOLA
  const [regNomeEscola, setRegNomeEscola] = useState('');
  const [regLicenca, setRegLicenca] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFotoUrl, setRegFotoUrl] = useState('');
  const [regSenha, setRegSenha] = useState('');

  // VALIDAÇÃO DE CÓDIGO
  const [codigoGerado, setCodigoGerado] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [dadosEscolaPendente, setDadosEscolaPendente] = useState(null);

  // DADOS DA SECRETARIA E TURMAS
  const [turmas, setTurmas] = useState([]);
  const [estudantes, setEstudantes] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [notasLista, setNotasLista] = useState([]);

  // FORMULÁRIOS DA SECRETARIA
  const [nomeEstudante, setNomeEstudante] = useState('');
  const [numProcesso, setNumProcesso] = useState('');
  const [classeEstudante, setClasseEstudante] = useState('');

  const [nomeProf, setNomeProf] = useState('');
  const [discProf, setDiscProf] = useState('');
  const [telProf, setTelProf] = useState('');

  // FORM TURMAS E NOTAS
  const [novaTurma, setNovaTurma] = useState('');
  const [alunoNome, setAlunoNome] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [mac, setMac] = useState('');
  const [npp, setNpp] = useState('');
  const [npt, setNpt] = useState('');

  const showAlert = (titulo, msg) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${titulo}: ${msg}`);
    } else {
      Alert.alert(titulo, msg);
    }
  };

  // --- LOGIN ---
  const handleLogin = async () => {
    if (!loginInput.trim() || !loginSenha.trim()) {
      showAlert('Atenção', 'Preencha os campos de login e senha.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .or(`numero_licenca.eq.${loginInput.trim()},email.eq.${loginInput.trim()},nome.ilike.%${loginInput.trim()}%`)
        .eq('senha_acesso', loginSenha.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        showAlert('Erro', 'Dados incorretos ou escola não encontrada.');
      } else {
        setUsuario(data);
        setTela('dashboard');
        carregarDadosIsolados(data.id);
      }
    } catch (err) {
      showAlert('Erro no Login', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- INICIAR REGISTO COM CÓDIGO POR EMAIL ---
  const handleEnviarCodigoRegisto = () => {
    if (!regNomeEscola.trim() || !regLicenca.trim() || !regEmail.trim() || !regSenha.trim()) {
      showAlert('Atenção', 'Preencha todos os campos obrigatórios para o registo.');
      return;
    }

    // Gerar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGerado(codigo);

    // Guardar dados temporariamente
    setDadosEscolaPendente({
      nome: regNomeEscola.trim(),
      numero_licenca: regLicenca.trim(),
      email: regEmail.trim().toLowerCase(),
      foto_url: regFotoUrl.trim() || null,
      senha_acesso: regSenha.trim(),
      email_confirmado: true
    });

    // Simulação do envio do código por e-mail (alerta na tela)
    showAlert('Código de Verificação', `O seu código de verificação é: ${codigo}`);
    setTela('validar_email');
  };

  // --- CONFIRMAR CÓDIGO E CRIAR ESCOLA NO BANCO ---
  const handleConfirmarCodigoEFinalizar = async () => {
    if (codigoDigitado.trim() !== codigoGerado) {
      showAlert('Erro', 'Código de verificação incorreto. Tente novamente.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escolas')
        .insert([dadosEscolaPendente])
        .select()
        .single();

      if (error) throw error;

      showAlert('Sucesso', 'Instituição cadastrada e e-mail verificado com sucesso!');
      setUsuario(data);
      setTela('dashboard');
      carregarDadosIsolados(data.id);
    } catch (err) {
      showAlert('Erro ao Cadastrar', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CARREGAR DADOS ---
  const carregarDadosIsolados = (escolaId) => {
    fetchEstudantes(escolaId);
    fetchProfessores(escolaId);
    fetchTurmas(escolaId);
    fetchNotas(escolaId);
  };

  const fetchEstudantes = async (escolaId) => {
    const { data } = await supabase.from('estudantes').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setEstudantes(data);
  };

  const fetchProfessores = async (escolaId) => {
    const { data } = await supabase.from('professores').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setProfessores(data);
  };

  const fetchTurmas = async (escolaId) => {
    const { data } = await supabase.from('turmas').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setTurmas(data);
  };

  const fetchNotas = async (escolaId) => {
    const { data } = await supabase.from('notas').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setNotasLista(data);
  };

  // --- CADASTRAR ESTUDANTE NO BANCO ---
  const handleCadastrarEstudante = async () => {
    if (!nomeEstudante.trim() || !numProcesso.trim() || !classeEstudante.trim()) {
      showAlert('Atenção', 'Por favor, preencha o Nome, Nº de Processo e Classe.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('estudantes').insert([
        {
          escola_id: usuario.id,
          nome: nomeEstudante.trim(),
          numero_processo: numProcesso.trim(),
          classe: classeEstudante.trim()
        }
      ]);

      if (error) throw error;

      showAlert('Sucesso', 'Estudante cadastrado com sucesso!');
      setNomeEstudante('');
      setNumProcesso('');
      setClasseEstudante('');
      fetchEstudantes(usuario.id);
    } catch (err) {
      showAlert('Erro ao Cadastrar Estudante', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CADASTRAR PROFESSOR NO BANCO ---
  const handleCadastrarProfessor = async () => {
    if (!nomeProf.trim() || !discProf.trim()) {
      showAlert('Atenção', 'Por favor, preencha o Nome e a Disciplina.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('professores').insert([
        {
          escola_id: usuario.id,
          nome: nomeProf.trim(),
          disciplina: discProf.trim(),
          telefone: telProf.trim()
        }
      ]);

      if (error) throw error;

      showAlert('Sucesso', 'Professor cadastrado com sucesso!');
      setNomeProf('');
      setDiscProf('');
      setTelProf('');
      fetchProfessores(usuario.id);
    } catch (err) {
      showAlert('Erro ao Cadastrar Professor', err.message);
    } finally {
      setLoading(false);
    }
  };

  // TELA DE LOGIN
  if (tela === 'login') {
    return (
      <SafeAreaView style={styles.containerLogin}>
        <StatusBar barStyle="light-content" />
        <View style={styles.cardLogin}>
          <Text style={styles.logoTitle}>Portal Escola 🎓</Text>
          <Text style={styles.subTitle}>Gestão Escolar Integrada</Text>

          <TextInput style={styles.input} placeholder="E-mail ou Nº Licença" placeholderTextColor="#999" value={loginInput} onChangeText={setLoginInput} />
          <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#999" secureTextEntry value={loginSenha} onChangeText={setLoginSenha} />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>ENTRAR</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLink} onPress={() => setTela('registro')}>
            <Text style={styles.btnLinkText}>Cadastrar Nova Instituição</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // TELA DE REGISTO
  if (tela === 'registro') {
    return (
      <SafeAreaView style={styles.containerLogin}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ width: '100%', alignItems: 'center' }}>
          <View style={styles.cardLogin}>
            <Text style={styles.logoTitle}>Cadastrar Escola 🏫</Text>
            <Text style={styles.subTitle}>Registo com validação de código por e-mail</Text>

            <TextInput style={styles.input} placeholder="Nome Oficial da Escola *" placeholderTextColor="#999" value={regNomeEscola} onChangeText={setRegNomeEscola} />
            <TextInput style={styles.input} placeholder="Nº da Licença / Decreto *" placeholderTextColor="#999" value={regLicenca} onChangeText={setRegLicenca} />
            <TextInput style={styles.input} placeholder="E-mail Institucional *" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" value={regEmail} onChangeText={setRegEmail} />
            <TextInput style={styles.input} placeholder="URL da Fotografia / Logótipo (Opcional)" placeholderTextColor="#999" value={regFotoUrl} onChangeText={setRegFotoUrl} />
            <TextInput style={styles.input} placeholder="Criar Senha *" placeholderTextColor="#999" secureTextEntry value={regSenha} onChangeText={setRegSenha} />

            <TouchableOpacity style={styles.btnSuccess} onPress={handleEnviarCodigoRegisto}>
              <Text style={styles.btnText}>RECEBER CÓDIGO POR EMAIL</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnLink} onPress={() => setTela('login')}>
              <Text style={styles.btnLinkText}>Já tem conta? Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // TELA DE VALIDAÇÃO DO CÓDIGO
  if (tela === 'validar_email') {
    return (
      <SafeAreaView style={styles.containerLogin}>
        <StatusBar barStyle="light-content" />
        <View style={styles.cardLogin}>
          <Text style={styles.logoTitle}>Validar E-mail 📩</Text>
          <Text style={styles.subTitle}>Insira o código de 6 dígitos enviado para {dadosEscolaPendente?.email}</Text>

          <TextInput
            style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
            placeholder="000000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            value={codigoDigitado}
            onChangeText={setCodigoDigitado}
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleConfirmarCodigoEFinalizar} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>CONFIRMAR CÓDIGO E ENTRAR</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // TELA PRINCIPAL / SECRETARIA
  return (
    <SafeAreaView style={styles.containerApp}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topbar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {usuario?.foto_url ? (
            <Image source={{ uri: usuario.foto_url }} style={styles.fotoEscola} />
          ) : (
            <View style={styles.fotoPlaceholder}><Text style={{ color: '#FFF' }}>🏫</Text></View>
          )}
          <View>
            <Text style={styles.topbarTitle}>{usuario?.nome}</Text>
            <Text style={styles.topbarRole}>Licença: {usuario?.numero_licenca}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={() => setTela('login')}>
          <Text style={styles.btnLogoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navMenu}>
        <TouchableOpacity style={[styles.navItem, tela === 'dashboard' && styles.navItemActive]} onPress={() => setTela('dashboard')}>
          <Text style={[styles.navText, tela === 'dashboard' && styles.navTextActive]}>Painel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, tela === 'secretaria' && styles.navItemActive]} onPress={() => setTela('secretaria')}>
          <Text style={[styles.navText, tela === 'secretaria' && styles.navTextActive]}>Secretaria</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentScroll}>
        {tela === 'dashboard' && (
          <View>
            <Text style={styles.sectionTitle}>Resumo Geral</Text>
            <View style={styles.gridStats}>
              <View style={styles.cardStat}>
                <Text style={styles.statNum}>{estudantes.length}</Text>
                <Text style={styles.statLabel}>Estudantes</Text>
              </View>
              <View style={styles.cardStat}>
                <Text style={styles.statNum}>{professores.length}</Text>
                <Text style={styles.statLabel}>Professores</Text>
              </View>
            </View>
          </View>
        )}

        {tela === 'secretaria' && (
          <View>
            <View style={{ flexDirection: 'row', marginBottom: 16, gap: 10 }}>
              <TouchableOpacity
                style={[styles.btnSubAba, subAbaSecretaria === 'estudantes' && styles.btnSubAbaActive]}
                onPress={() => setSubAbaSecretaria('estudantes')}
              >
                <Text style={[styles.btnSubAbaText, subAbaSecretaria === 'estudantes' && styles.btnSubAbaTextActive]}>👨‍🎓 Estudantes ({estudantes.length})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnSubAba, subAbaSecretaria === 'professores' && styles.btnSubAbaActive]}
                onPress={() => setSubAbaSecretaria('professores')}
              >
                <Text style={[styles.btnSubAbaText, subAbaSecretaria === 'professores' && styles.btnSubAbaTextActive]}>👨‍🏫 Professores ({professores.length})</Text>
              </TouchableOpacity>
            </View>

            {/* FORMULÁRIO ESTUDANTES */}
            {subAbaSecretaria === 'estudantes' && (
              <View>
                <Text style={styles.sectionTitle}>Registar Estudante</Text>
                <View style={styles.cardForm}>
                  <Text style={styles.label}>Nome Completo do Aluno:</Text>
                  <TextInput style={styles.inputForm} placeholder="Ex: João Manuel" value={nomeEstudante} onChangeText={setNomeEstudante} />

                  <Text style={styles.label}>Nº do Processo:</Text>
                  <TextInput style={styles.inputForm} placeholder="Ex: 4052" value={numProcesso} onChangeText={setNumProcesso} />

                  <Text style={styles.label}>Classe:</Text>
                  <TextInput style={styles.inputForm} placeholder="Ex: 10ª Classe" value={classeEstudante} onChangeText={setClasseEstudante} />

                  <TouchableOpacity style={styles.btnSuccess} onPress={handleCadastrarEstudante} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>SALVAR ESTUDANTE</Text>}
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Estudantes Registados</Text>
                {estudantes.map((est) => (
                  <View key={est.id} style={styles.listItem}>
                    <View>
                      <Text style={styles.itemTitle}>{est.nome}</Text>
                      <Text style={styles.itemSub}>Proc: {est.numero_processo} | Classe: {est.classe}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* FORMULÁRIO PROFESSORES */}
            {subAbaSecretaria === 'professores' && (
              <View>
                <Text style={styles.sectionTitle}>Registar Professor</Text>
                <View style={styles.cardForm}>
                  <Text style={styles.label}>Nome do Professor:</Text>
                  <TextInput style={styles.inputForm} placeholder="Ex: Professor António" value={nomeProf} onChangeText={setNomeProf} />

                  <Text style={styles.label}>Disciplina:</Text>
                  <TextInput style={styles.inputForm} placeholder="Ex: Matemática" value={discProf} onChangeText={setDiscProf} />

                  <Text style={styles.label}>Telefone de Contacto:</Text>
                  <TextInput style={styles.inputForm} placeholder="Ex: 923000111" value={telProf} onChangeText={setTelProf} />

                  <TouchableOpacity style={styles.btnSuccess} onPress={handleCadastrarProfessor} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>SALVAR PROFESSOR</Text>}
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Professores Registados</Text>
                {professores.map((prof) => (
                  <View key={prof.id} style={styles.listItem}>
                    <View>
                      <Text style={styles.itemTitle}>{prof.nome}</Text>
                      <Text style={styles.itemSub}>Disciplina: {prof.disciplina} | Tel: {prof.telefone || 'Sem contacto'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerLogin: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  cardLogin: { width: '100%', maxWidth: 400, backgroundColor: '#1E293B', borderRadius: 12, padding: 24, marginVertical: 20 },
  logoTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 6 },
  subTitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#334155', color: '#FFF', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 15 },
  btnPrimary: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnSuccess: { backgroundColor: '#10B981', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  btnLink: { marginTop: 16, alignItems: 'center' },
  btnLinkText: { color: '#38BDF8', fontSize: 14 },

  containerApp: { flex: 1, backgroundColor: '#F8FAFC' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  topbarTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  topbarRole: { fontSize: 12, color: '#64748B' },
  fotoEscola: { width: 36, height: 36, borderRadius: 18 },
  fotoPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  btnLogout: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnLogoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 13 },

  navMenu: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  navItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  navItemActive: { borderBottomWidth: 3, borderBottomColor: '#2563EB' },
  navText: { color: '#64748B', fontWeight: '500', fontSize: 14 },
  navTextActive: { color: '#2563EB', fontWeight: 'bold' },

  btnSubAba: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center' },
  btnSubAbaActive: { backgroundColor: '#2563EB' },
  btnSubAbaText: { color: '#475569', fontWeight: 'bold', fontSize: 14 },
  btnSubAbaTextActive: { color: '#FFF' },

  contentScroll: { padding: 16, maxWidth: 800, width: '100%', alignSelf: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  gridStats: { flexDirection: 'row', gap: 12 },
  cardStat: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#2563EB' },
  statLabel: { color: '#64748B', fontSize: 13, marginTop: 4 },

  cardForm: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4 },
  inputForm: { backgroundColor: '#F1F5F9', color: '#0F172A', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  itemSub: { fontSize: 13, color: '#64748B', marginTop: 2 }
});
