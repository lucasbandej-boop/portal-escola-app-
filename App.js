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
  // --- ESTADOS DE NAVEGAÇÃO ---
  const [tela, setTela] = useState('login'); // 'login', 'registro', 'validar_email', 'dashboard', 'turmas', 'notas', 'secretaria'
  const [subAbaSecretaria, setSubAbaSecretaria] = useState('estudantes'); // 'estudantes' ou 'professores'
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // --- LOGIN ---
  const [loginInput, setLoginInput] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // --- REGISTO ---
  const [regNomeEscola, setRegNomeEscola] = useState('');
  const [regLicenca, setRegLicenca] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFotoUrl, setRegFotoUrl] = useState('');
  const [regSenha, setRegSenha] = useState('');

  // --- VALIDAÇÃO DE E-MAIL ---
  const [codigoEnviado, setCodigoEnviado] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [escolaPendente, setEscolaPendente] = useState(null);

  // --- DADOS DA ESCOLA ---
  const [turmas, setTurmas] = useState([]);
  const [novaTurma, setNovaTurma] = useState('');
  const [anoLectivo, setAnoLectivo] = useState('2026');

  const [alunoNome, setAlunoNome] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [mac, setMac] = useState('');
  const [npp, setNpp] = useState('');
  const [npt, setNpt] = useState('');
  const [notasLista, setNotasLista] = useState([]);

  // --- SECRETARIA VIRTUAL ---
  const [estudantes, setEstudantes] = useState([]);
  const [professores, setProfessores] = useState([]);

  // Form Estudantes
  const [nomeEstudante, setNomeEstudante] = useState('');
  const [numProcesso, setNumProcesso] = useState('');
  const [classeEstudante, setClasseEstudante] = useState('');

  // Form Professores
  const [nomeProf, setNomeProf] = useState('');
  const [discProf, setDiscProf] = useState('');
  const [telProf, setTelProf] = useState('');

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
      showAlert('Atenção', 'Preencha a Licença/E-mail/Nome e a Senha.');
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
        showAlert('Erro', 'Credenciais inválidas.');
      } else if (data.email_confirmado === false) {
        showAlert('Atenção', 'Conta ainda não confirmada.');
        setEscolaPendente(data);
        gerarEnviarCodigo(data.email);
        setTela('validar_email');
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

  // --- REGISTO ---
  const gerarEnviarCodigo = (email) => {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoEnviado(codigo);
    showAlert('Código Enviado', `Código enviado para ${email}.\n\n[CÓDIGO DE TESTE]: ${codigo}`);
  };

  const handleCriarConta = async () => {
    if (!regNomeEscola.trim() || !regLicenca.trim() || !regEmail.trim() || !regSenha.trim()) {
      showAlert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escolas')
        .insert([
          {
            nome: regNomeEscola.trim(),
            numero_licenca: regLicenca.trim(),
            email: regEmail.trim().toLowerCase(),
            foto_url: regFotoUrl.trim() || null,
            senha_acesso: regSenha.trim(),
            email_confirmado: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setEscolaPendente(data);
      gerarEnviarCodigo(data.email);
      setTela('validar_email');
    } catch (err) {
      showAlert('Erro ao Criar Conta', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarCodigo = async () => {
    if (codigoDigitado.trim() !== codigoEnviado) {
      showAlert('Erro', 'Código de verificação incorreto.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('escolas')
        .update({ email_confirmado: true })
        .eq('id', escolaPendente.id);

      if (error) throw error;

      showAlert('Sucesso', 'Conta ativada com sucesso!');
      setTela('login');
      setCodigoDigitado('');
    } catch (err) {
      showAlert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setTurmas([]);
    setNotasLista([]);
    setEstudantes([]);
    setProfessores([]);
    setTela('login');
  };

  // --- CARREGAR DADOS ISOLADOS ---
  const carregarDadosIsolados = async (escolaId) => {
    fetchTurmas(escolaId);
    fetchNotas(escolaId);
    fetchEstudantes(escolaId);
    fetchProfessores(escolaId);
  };

  const fetchTurmas = async (escolaId) => {
    const { data } = await supabase.from('turmas').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setTurmas(data);
  };

  const fetchNotas = async (escolaId) => {
    const { data } = await supabase.from('notas').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setNotasLista(data);
  };

  const fetchEstudantes = async (escolaId) => {
    const { data } = await supabase.from('estudantes').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setEstudantes(data);
  };

  const fetchProfessores = async (escolaId) => {
    const { data } = await supabase.from('professores').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setProfessores(data);
  };

  // --- AÇÕES DA SECRETARIA VIRTUAL ---
  const handleCadastrarEstudante = async () => {
    if (!nomeEstudante.trim() || !numProcesso.trim() || !classeEstudante.trim()) {
      showAlert('Atenção', 'Preencha o nome, número de processo e classe.');
      return;
    }
    const { error } = await supabase.from('estudantes').insert([
      {
        escola_id: usuario.id,
        nome: nomeEstudante.trim(),
        numero_processo: numProcesso.trim(),
        classe: classeEstudante.trim()
      }
    ]);
    if (error) {
      showAlert('Erro', error.message);
    } else {
      showAlert('Sucesso', 'Estudante matriculado na secretaria!');
      setNomeEstudante('');
      setNumProcesso('');
      setClasseEstudante('');
      fetchEstudantes(usuario.id);
    }
  };

  const handleCadastrarProfessor = async () => {
    if (!nomeProf.trim() || !discProf.trim()) {
      showAlert('Atenção', 'Preencha o nome e a disciplina.');
      return;
    }
    const { error } = await supabase.from('professores').insert([
      {
        escola_id: usuario.id,
        nome: nomeProf.trim(),
        disciplina: discProf.trim(),
        telefone: telProf.trim()
      }
    ]);
    if (error) {
      showAlert('Erro', error.message);
    } else {
      showAlert('Sucesso', 'Professor cadastrado com sucesso!');
      setNomeProf('');
      setDiscProf('');
      setTelProf('');
      fetchProfessores(usuario.id);
    }
  };

  const handleCriarTurma = async () => {
    if (!novaTurma.trim()) return;
    const { error } = await supabase.from('turmas').insert([{ nome: novaTurma, ano_lectivo: anoLectivo, escola_id: usuario.id }]);
    if (error) {
      showAlert('Erro', error.message);
    } else {
      showAlert('Sucesso', 'Turma cadastrada!');
      setNovaTurma('');
      fetchTurmas(usuario.id);
    }
  };

  const handleSalvarNota = async () => {
    if (!alunoNome || !disciplina) {
      showAlert('Atenção', 'Preencha o aluno e a disciplina.');
      return;
    }
    const nMac = parseFloat(mac) || 0;
    const nNpp = parseFloat(npp) || 0;
    const nNpt = parseFloat(npt) || 0;

    const { error } = await supabase.from('notas').insert([
      { aluno_nome: alunoNome, disciplina, mac: nMac, npp: nNpp, npt: nNpt, escola_id: usuario.id }
    ]);

    if (error) {
      showAlert('Erro', error.message);
    } else {
      showAlert('Sucesso', 'Nota lançada!');
      setAlunoNome(''); setMac(''); setNpp(''); setNpt('');
      fetchNotas(usuario.id);
    }
  };

  // --- TELA LOGIN ---
  if (tela === 'login') {
    return (
      <SafeAreaView style={styles.containerLogin}>
        <StatusBar barStyle="light-content" />
        <View style={styles.cardLogin}>
          <Text style={styles.logoTitle}>Portal Escola 🎓</Text>
          <Text style={styles.subTitle}>Sistema Integrado de Gestão Escolar</Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail, Nome ou Nº Licença"
            placeholderTextColor="#999"
            value={loginInput}
            onChangeText={setLoginInput}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha de Acesso"
            placeholderTextColor="#999"
            secureTextEntry
            value={loginSenha}
            onChangeText={setLoginSenha}
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>ENTRAR NO PORTAL</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLink} onPress={() => setTela('registro')}>
            <Text style={styles.btnLinkText}>Não tem conta? Cadastrar Instituição</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- TELA REGISTO ---
  if (tela === 'registro') {
    return (
      <SafeAreaView style={styles.containerLogin}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ width: '100%', alignItems: 'center' }}>
          <View style={styles.cardLogin}>
            <Text style={styles.logoTitle}>Cadastrar Instituição 🏫</Text>
            <Text style={styles.subTitle}>Crie a conta oficial da sua escola</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome Oficial da Escola"
              placeholderTextColor="#999"
              value={regNomeEscola}
              onChangeText={setRegNomeEscola}
            />

            <TextInput
              style={styles.input}
              placeholder="Número da Licença / Decreto"
              placeholderTextColor="#999"
              value={regLicenca}
              onChangeText={setRegLicenca}
            />

            <TextInput
              style={styles.input}
              placeholder="E-mail Institucional Oficial"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={regEmail}
              onChangeText={setRegEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Link da Fotografia / Logótipo (URL)"
              placeholderTextColor="#999"
              value={regFotoUrl}
              onChangeText={setRegFotoUrl}
            />

            <TextInput
              style={styles.input}
              placeholder="Criar Senha Forte"
              placeholderTextColor="#999"
              secureTextEntry
              value={regSenha}
              onChangeText={setRegSenha}
            />

            <TouchableOpacity style={styles.btnSuccess} onPress={handleCriarConta} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>CONTINUAR & VALIDAR E-MAIL</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnLink} onPress={() => setTela('login')}>
              <Text style={styles.btnLinkText}>Já tem conta? Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- TELA VALIDAÇÃO ---
  if (tela === 'validar_email') {
    return (
      <SafeAreaView style={styles.containerLogin}>
        <StatusBar barStyle="light-content" />
        <View style={styles.cardLogin}>
          <Text style={styles.logoTitle}>Validar E-mail 📩</Text>
          <Text style={styles.subTitle}>Código enviado para {escolaPendente?.email}</Text>

          <TextInput
            style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 6 }]}
            placeholder="000000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            value={codigoDigitado}
            onChangeText={setCodigoDigitado}
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleConfirmarCodigo} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>VALIDAR & ATIVAR CONTA</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- DASHBOARD E MÓDULOS ---
  return (
    <SafeAreaView style={styles.containerApp}>
      <StatusBar barStyle="dark-content" />

      {/* Topbar com Foto/Logótipo */}
      <View style={styles.topbar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {usuario?.foto_url ? (
            <Image source={{ uri: usuario.foto_url }} style={styles.fotoEscola} />
          ) : (
            <View style={styles.fotoPlaceholder}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>🏫</Text></View>
          )}
          <View>
            <Text style={styles.topbarTitle}>{usuario?.nome}</Text>
            <Text style={styles.topbarRole}>Licença: {usuario?.numero_licenca}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.btnLogoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Navegação Principal */}
      <View style={styles.navMenu}>
        <TouchableOpacity style={[styles.navItem, tela === 'dashboard' && styles.navItemActive]} onPress={() => setTela('dashboard')}>
          <Text style={[styles.navText, tela === 'dashboard' && styles.navTextActive]}>Painel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, tela === 'secretaria' && styles.navItemActive]} onPress={() => setTela('secretaria')}>
          <Text style={[styles.navText, tela === 'secretaria' && styles.navTextActive]}>Secretaria</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, tela === 'turmas' && styles.navItemActive]} onPress={() => setTela('turmas')}>
          <Text style={[styles.navText, tela === 'turmas' && styles.navTextActive]}>Turmas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, tela === 'notas' && styles.navItemActive]} onPress={() => setTela('notas')}>
          <Text style={[styles.navText, tela === 'notas' && styles.navTextActive]}>Pautas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentScroll}>
        {/* PAINEL */}
        {tela === 'dashboard' && (
          <View>
            <Text style={styles.sectionTitle}>Resumo da Instituição</Text>
            <View style={styles.gridStats}>
              <View style={styles.cardStat}>
                <Text style={styles.statNum}>{estudantes.length}</Text>
                <Text style={styles.statLabel}>Estudantes</Text>
              </View>
              <View style={styles.cardStat}>
                <Text style={styles.statNum}>{professores.length}</Text>
                <Text style={styles.statLabel}>Professores</Text>
              </View>
              <View style={styles.cardStat}>
                <Text style={styles.statNum}>{turmas.length}</Text>
                <Text style={styles.statLabel}>Turmas</Text>
              </View>
            </View>
          </View>
        )}

        {/* SECRETARIA VIRTUAL */}
        {tela === 'secretaria' && (
          <View>
            {/* Sub-abas da Secretaria */}
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
                <Text style={styles.sectionTitle}>Matricular Novo Estudante</Text>
                <View style={styles.cardForm}>
                  <TextInput style={styles.inputForm} placeholder="Nome Completo do Estudante" value={nomeEstudante} onChangeText={setNomeEstudante} />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TextInput style={[styles.inputForm, { flex: 1 }]} placeholder="Nº de Processo" value={numProcesso} onChangeText={setNumProcesso} />
                    <TextInput style={[styles.inputForm, { flex: 1 }]} placeholder="Classe (Ex: 10ª)" value={classeEstudante} onChangeText={setClasseEstudante} />
                  </View>
                  <TouchableOpacity style={styles.btnSuccess} onPress={handleCadastrarEstudante}>
                    <Text style={styles.btnText}>Matricular Estudante</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Lista de Estudantes Matriculados</Text>
                {estudantes.map((est) => (
                  <View key={est.id} style={styles.listItem}>
                    <View>
                      <Text style={styles.itemTitle}>{est.nome}</Text>
                      <Text style={styles.itemSub}>Proc. Nº: {est.numero_processo} | Classe: {est.classe}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* FORMULÁRIO PROFESSORES */}
            {subAbaSecretaria === 'professores' && (
              <View>
                <Text style={styles.sectionTitle}>Cadastrar Novo Professor</Text>
                <View style={styles.cardForm}>
                  <TextInput style={styles.inputForm} placeholder="Nome do Professor" value={nomeProf} onChangeText={setNomeProf} />
                  <TextInput style={styles.inputForm} placeholder="Disciplina Principal (Ex: Física)" value={discProf} onChangeText={setDiscProf} />
                  <TextInput style={styles.inputForm} placeholder="Telefone / Contacto" value={telProf} onChangeText={setTelProf} />
                  <TouchableOpacity style={styles.btnSuccess} onPress={handleCadastrarProfessor}>
                    <Text style={styles.btnText}>Cadastrar Professor</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Corpo Docente (Professores)</Text>
                {professores.map((prof) => (
                  <View key={prof.id} style={styles.listItem}>
                    <View>
                      <Text style={styles.itemTitle}>{prof.nome}</Text>
                      <Text style={styles.itemSub}>Disciplina: {prof.disciplina} | Tel: {prof.telefone || 'N/A'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TURMAS */}
        {tela === 'turmas' && (
          <View>
            <Text style={styles.sectionTitle}>Cadastrar Nova Turma</Text>
            <View style={styles.cardForm}>
              <TextInput style={styles.inputForm} placeholder="Nome da Turma" value={novaTurma} onChangeText={setNovaTurma} />
              <TouchableOpacity style={styles.btnSuccess} onPress={handleCriarTurma}>
                <Text style={styles.btnText}>Adicionar Turma</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Turmas Existentes</Text>
            {turmas.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <Text style={styles.itemTitle}>{item.nome}</Text>
                <Text style={styles.itemSub}>Ano Lectivo: {item.ano_lectivo}</Text>
              </View>
            ))}
          </View>
        )}

        {/* NOTAS */}
        {tela === 'notas' && (
          <View>
            <Text style={styles.sectionTitle}>Lançar Notas (Pauta)</Text>
            <View style={styles.cardForm}>
              <TextInput style={styles.inputForm} placeholder="Nome do Aluno" value={alunoNome} onChangeText={setAlunoNome} />
              <TextInput style={styles.inputForm} placeholder="Disciplina" value={disciplina} onChangeText={setDisciplina} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput style={[styles.inputForm, { flex: 1 }]} placeholder="MAC" keyboardType="numeric" value={mac} onChangeText={setMac} />
                <TextInput style={[styles.inputForm, { flex: 1 }]} placeholder="NPP" keyboardType="numeric" value={npp} onChangeText={setNpp} />
                <TextInput style={[styles.inputForm, { flex: 1 }]} placeholder="NPT" keyboardType="numeric" value={npt} onChangeText={setNpt} />
              </View>
              <TouchableOpacity style={styles.btnSuccess} onPress={handleSalvarNota}>
                <Text style={styles.btnText}>Salvar na Pauta</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Pauta de Notas</Text>
            {notasLista.map((n) => (
              <View key={n.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{n.aluno_nome}</Text>
                  <Text style={styles.itemSub}>{n.disciplina} | MAC: {n.mac} | NPP: {n.npp} | NPT: {n.npt}</Text>
                </View>
                <View style={[styles.badgeMedia, { backgroundColor: (n.media || 0) >= 10 ? '#10B981' : '#EF4444' }]}>
                  <Text style={styles.badgeText}>{n.media ? Number(n.media).toFixed(1) : '0.0'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerLogin: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  cardLogin: { width: '100%', maxWidth: 420, backgroundColor: '#1E293B', borderRadius: 12, padding: 24, marginVertical: 20 },
  logoTitle: { fontSize: 26, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 6 },
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
  fotoEscola: { width: 40, height: 40, borderRadius: 20 },
  fotoPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  btnLogout: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnLogoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 13 },

  navMenu: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  navItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  navItemActive: { borderBottomWidth: 3, borderBottomColor: '#2563EB' },
  navText: { color: '#64748B', fontWeight: '500', fontSize: 13 },
  navTextActive: { color: '#2563EB', fontWeight: 'bold' },

  btnSubAba: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center' },
  btnSubAbaActive: { backgroundColor: '#2563EB' },
  btnSubAbaText: { color: '#475569', fontWeight: 'bold', fontSize: 14 },
  btnSubAbaTextActive: { color: '#FFF' },

  contentScroll: { padding: 16, maxWidth: 900, width: '100%', alignSelf: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  gridStats: { flexDirection: 'row', gap: 12 },
  cardStat: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#2563EB' },
  statLabel: { color: '#64748B', fontSize: 13, marginTop: 4 },

  cardForm: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  inputForm: { backgroundColor: '#F1F5F9', color: '#0F172A', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 15 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  itemSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  badgeMedia: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
