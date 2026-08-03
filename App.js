import React, { useState, useEffect } from 'react';
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
  // NAVEGAÇÃO GERAL
  const [tela, setTela] = useState('menu_principal'); // 'menu_principal', 'login', 'reg_escola', 'reg_professor', 'consulta_alunos', 'info_app', 'dashboard', 'secretaria', 'validar_email'
  const [subAbaSecretaria, setSubAbaSecretaria] = useState('estudantes');
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // BANNER DE PUBLICIDADE ROTATIVO (MATERIAL ESCOLAR)
  const bannersPublicidade = [
    { titulo: '📚 Papelaria Moderna', desc: 'Tudo em material escolar com 20% de desconto para estudantes!', cor: '#1E3A8A' },
    { titulo: '✏️ Mochilas & Cadernos', desc: 'Equipe os seus alunos com o melhor material didático do mercado.', cor: '#065F46' },
    { titulo: '💻 Tecnologias Educativas', desc: 'Computadores e tablets para escolas com condições especiais.', cor: '#581C87' }
  ];
  const [bannerAtual, setBannerAtual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerAtual((prev) => (prev + 1) % bannersPublicidade.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // CAMPOS DE LOGIN
  const [loginInput, setLoginInput] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // CAMPOS DE REGISTO DE ESCOLA
  const [regNomeEscola, setRegNomeEscola] = useState('');
  const [regLicenca, setRegLicenca] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFotoUrl, setRegFotoUrl] = useState('');
  const [regSenha, setRegSenha] = useState('');

  // CAMPOS DE REGISTO DE PROFESSOR INDEPENDENTE
  const [regNomeProf, setRegNomeProf] = useState('');
  const [regDiscProf, setRegDiscProf] = useState('');
  const [regTelProf, setRegTelProf] = useState('');
  const [regEmailProf, setRegEmailProf] = useState('');
  const [regSenhaProf, setRegSenhaProf] = useState('');

  // VALIDAÇÃO DE CÓDIGO
  const [codigoGerado, setCodigoGerado] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [dadosPendente, setDadosPendente] = useState(null);
  const [tipoPendente, setTipoPendente] = useState('');

  // CONSULTA PÚBLICA DE ALUNOS
  const [termoBuscaAluno, setTermoBuscaAluno] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);

  // DADOS DA SECRETARIA / DASHBOARD
  const [estudantes, setEstudantes] = useState([]);
  const [professores, setProfessores] = useState([]);

  const [nomeEstudante, setNomeEstudante] = useState('');
  const [numProcesso, setNumProcesso] = useState('');
  const [classeEstudante, setClasseEstudante] = useState('');

  const [novoNomeProf, setNovoNomeProf] = useState('');
  const [novoDiscProf, setNovoDiscProf] = useState('');
  const [novoTelProf, setNovoTelProf] = useState('');

  const showAlert = (titulo, msg) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${titulo}: ${msg}`);
    } else {
      Alert.alert(titulo, msg);
    }
  };

  // LOGIN GERAL (Instituição ou Professor)
  const handleLogin = async () => {
    if (!loginInput.trim() || !loginSenha.trim()) {
      showAlert('Atenção', 'Preencha o campo de identificação e a senha.');
      return;
    }
    setLoading(true);
    try {
      // Tentar login na tabela de escolas
      let { data: escolaData } = await supabase
        .from('escolas')
        .select('*')
        .or(`numero_licenca.eq.${loginInput.trim()},email.eq.${loginInput.trim()}`)
        .eq('senha_acesso', loginSenha.trim())
        .maybeSingle();

      if (escolaData) {
        setUsuario({ ...escolaData, tipo_usuario: 'escola' });
        setTela('dashboard');
        carregarDadosEscola(escolaData.id);
        setLoading(false);
        return;
      }

      // Tentar login na tabela de professores
      let { data: profData } = await supabase
        .from('professores')
        .select('*')
        .eq('email', loginInput.trim().toLowerCase())
        .eq('senha_acesso', loginSenha.trim())
        .maybeSingle();

      if (profData) {
        setUsuario({ ...profData, tipo_usuario: 'professor' });
        setTela('dashboard');
        setLoading(false);
        return;
      }

      showAlert('Erro', 'Credenciais inválidas ou utilizador não encontrado.');
    } catch (err) {
      showAlert('Erro no Login', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ENVIAR CÓDIGO DE REGISTO ESCOLA
  const handleEnviarCodigoEscola = () => {
    if (!regNomeEscola.trim() || !regLicenca.trim() || !regEmail.trim() || !regSenha.trim()) {
      showAlert('Atenção', 'Preencha todos os campos obrigatórios da escola.');
      return;
    }
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGerado(codigo);
    setTipoPendente('escola');
    setDadosPendente({
      nome: regNomeEscola.trim(),
      numero_licenca: regLicenca.trim(),
      email: regEmail.trim().toLowerCase(),
      foto_url: regFotoUrl.trim() || null,
      senha_acesso: regSenha.trim()
    });
    showAlert('Código de Verificação', `Seu código de confirmação é: ${codigo}`);
    setTela('validar_email');
  };

  // ENVIAR CÓDIGO DE REGISTO PROFESSOR INDEPENDENTE
  const handleEnviarCodigoProfessor = () => {
    if (!regNomeProf.trim() || !regDiscProf.trim() || !regEmailProf.trim() || !regSenhaProf.trim()) {
      showAlert('Atenção', 'Preencha todos os campos obrigatórios do professor.');
      return;
    }
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGerado(codigo);
    setTipoPendente('professor');
    setDadosPendente({
      nome: regNomeProf.trim(),
      disciplina: regDiscProf.trim(),
      telefone: regTelProf.trim(),
      email: regEmailProf.trim().toLowerCase(),
      senha_acesso: regSenhaProf.trim()
    });
    showAlert('Código de Verificação', `Seu código de confirmação é: ${codigo}`);
    setTela('validar_email');
  };

  // FINALIZAR CÓDIGO E INSERIR NO SUPABASE
  const handleConfirmarCodigo = async () => {
    if (codigoDigitado.trim() !== codigoGerado) {
      showAlert('Erro', 'Código de verificação incorreto.');
      return;
    }
    setLoading(true);
    try {
      const tabela = tipoPendente === 'escola' ? 'escolas' : 'professores';
      const { data, error } = await supabase
        .from(tabela)
        .insert([dadosPendente])
        .select()
        .single();

      if (error) throw error;

      showAlert('Sucesso', 'Registo concluído com sucesso!');
      setUsuario({ ...data, tipo_usuario: tipoPendente });
      setTela('dashboard');
      if (tipoPendente === 'escola') carregarDadosEscola(data.id);
    } catch (err) {
      showAlert('Erro ao Registar', err.message);
    } finally {
      setLoading(false);
    }
  };

  // CARREGAR DADOS DA ESCOLA
  const carregarDadosEscola = (escolaId) => {
    fetchEstudantes(escolaId);
    fetchProfessoresEscola(escolaId);
  };

  const fetchEstudantes = async (escolaId) => {
    const { data } = await supabase.from('estudantes').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setEstudantes(data);
  };

  const fetchProfessoresEscola = async (escolaId) => {
    const { data } = await supabase.from('professores').select('*').eq('escola_id', escolaId).order('created_at', { ascending: false });
    if (data) setProfessores(data);
  };

  // CONSULTAR ALUNOS E ENCARREGADOS PUBLICAMENTE
  const handleConsultarAlunos = async () => {
    if (!termoBuscaAluno.trim()) {
      showAlert('Atenção', 'Digite o nome do aluno ou número de processo para pesquisar.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estudantes')
        .select('*, escolas(nome, numero_licenca)')
        .or(`nome.ilike.%${termoBuscaAluno.trim()}%,numero_processo.eq.${termoBuscaAluno.trim()}`);

      if (error) throw error;
      setResultadosBusca(data || []);
      if (data.length === 0) {
        showAlert('Resultado', 'Nenhum registo encontrado com estes parâmetros.');
      }
    } catch (err) {
      showAlert('Erro na Consulta', err.message);
    } finally {
      setLoading(false);
    }
  };

  // CADASTRAR ESTUDANTE (Pela Instituição ou Professor vinculado)
  const handleCadastrarEstudante = async () => {
    if (!nomeEstudante.trim() || !numProcesso.trim() || !classeEstudante.trim()) {
      showAlert('Atenção', 'Preencha todos os campos do aluno.');
      return;
    }
    const escolaIdAlocar = usuario.tipo_usuario === 'escola' ? usuario.id : usuario.escola_id;
    if (!escolaIdAlocar) {
      showAlert('Erro', 'Este professor não está associado a nenhuma instituição.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('estudantes').insert([
        {
          escola_id: escolaIdAlocar,
          nome: nomeEstudante.trim(),
          numero_processo: numProcesso.trim(),
          classe: classeEstudante.trim()
        }
      ]);
      if (error) throw error;
      showAlert('Sucesso', 'Estudante matriculado com sucesso!');
      setNomeEstudante('');
      setNumProcesso('');
      setClasseEstudante('');
      if (usuario.tipo_usuario === 'escola') fetchEstudantes(usuario.id);
    } catch (err) {
      showAlert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- COMPONENTE DE CABEÇALHO COM BOTÃO LOGIN ---
  const HeaderComLogin = () => (
    <View style={styles.topHeaderPublic}>
      <Text style={styles.topHeaderLogo}>Portal Escolar 🎓</Text>
      <TouchableOpacity style={styles.btnLoginTop} onPress={() => setTela('login')}>
        <Text style={styles.btnLoginTopText}>🔑 Entrar / Login</Text>
      </TouchableOpacity>
    </View>
  );

  // 1. MENU PRINCIPAL
  if (tela === 'menu_principal') {
    const banner = bannersPublicidade[bannerAtual];
    return (
      <SafeAreaView style={styles.containerApp}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <HeaderComLogin />

        <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {/* QUADRO DE PUBLICIDADE (Material Escolar) */}
          <View style={[styles.bannerPublicidade, { backgroundColor: banner.cor }]}>
            <View style={styles.badgePublicidade}><Text style={styles.badgePubText}>📢 Publicidade Patrocinada</Text></View>
            <Text style={styles.bannerPubTitle}>{banner.titulo}</Text>
            <Text style={styles.bannerPubDesc}>{banner.desc}</Text>
          </View>

          <Text style={styles.sectionHeading}>Menu Principal do Sistema</Text>
          <Text style={styles.sectionSub}>Selecione a opção desejada para navegar:</Text>

          <View style={styles.menuGrid}>
            <TouchableOpacity style={styles.menuCard} onPress={() => setTela('reg_escola')}>
              <Text style={styles.menuIcon}>🏫</Text>
              <Text style={styles.menuCardTitle}>Cadastramento de Instituições</Text>
              <Text style={styles.menuCardDesc}>Registe a sua escola para gerir turmas, alunos e notas.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCard} onPress={() => setTela('consulta_alunos')}>
              <Text style={styles.menuIcon}>🔍</Text>
              <Text style={styles.menuCardTitle}>Consulta de Alunos</Text>
              <Text style={styles.menuCardDesc}>Consulte o estado de matrícula e dados de estudantes.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCard} onPress={() => setTela('reg_professor')}>
              <Text style={styles.menuIcon}>👨‍🏫</Text>
              <Text style={styles.menuCardTitle}>Cadastramento de Professores</Text>
              <Text style={styles.menuCardDesc}>Registe-se como docente independente na plataforma.</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCard} onPress={() => setTela('info_app')}>
              <Text style={styles.menuIcon}>ℹ️</Text>
              <Text style={styles.menuCardTitle}>Informação do Aplicativo</Text>
              <Text style={styles.menuCardDesc}>Saiba mais sobre os recursos e vantagens tecnológicas.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. TELA DE LOGIN
  if (tela === 'login') {
    return (
      <SafeAreaView style={styles.containerAuth}>
        <StatusBar barStyle="light-content" backgroundColor="#090D16" />
        <View style={styles.authCard}>
          <TouchableOpacity onPress={() => setTela('menu_principal')} style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
            <Text style={{ color: '#60A5FA', fontSize: 13 }}>← Voltar ao Menu</Text>
          </TouchableOpacity>
          <Text style={styles.authTitle}>Entrar na Conta</Text>
          <Text style={styles.authSubtitle}>Insira as credenciais da sua Instituição ou Professor</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-mail ou Nº Licença</Text>
            <TextInput style={styles.input} placeholder="ex: escola@email.com" placeholderTextColor="#64748B" value={loginInput} onChangeText={setLoginInput} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Palavra-passe</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#64748B" secureTextEntry value={loginSenha} onChangeText={setLoginSenha} />
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryText}>Aceder ao Sistema</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 3. CADASTRAMENTO DE INSTITUIÇÃO
  if (tela === 'reg_escola') {
    return (
      <SafeAreaView style={styles.containerApp}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <HeaderComLogin />
        <ScrollView contentContainerStyle={styles.contentScroll}>
          <TouchableOpacity onPress={() => setTela('menu_principal')} style={{ marginBottom: 14 }}>
            <Text style={{ color: '#2563EB', fontWeight: '600' }}>← Voltar ao Menu</Text>
          </TouchableOpacity>
          <View style={styles.cardForm}>
            <Text style={styles.sectionTitle}>🏫 Registo de Instituição de Ensino</Text>
            
            <Text style={styles.label}>Nome Oficial da Escola *</Text>
            <TextInput style={styles.inputForm} placeholder="ex: Colégio Luanda" placeholderTextColor="#94A3B8" value={regNomeEscola} onChangeText={setRegNomeEscola} />

            <Text style={styles.label}>Nº da Licença / Decreto *</Text>
            <TextInput style={styles.inputForm} placeholder="ex: LIC-2026" placeholderTextColor="#94A3B8" value={regLicenca} onChangeText={setRegLicenca} />

            <Text style={styles.label}>E-mail Institucional *</Text>
            <TextInput style={styles.inputForm} placeholder="escola@dominio.com" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" value={regEmail} onChangeText={setRegEmail} />

            <Text style={styles.label}>URL do Logótipo (Opcional)</Text>
            <TextInput style={styles.inputForm} placeholder="https://..." placeholderTextColor="#94A3B8" value={regFotoUrl} onChangeText={setRegFotoUrl} />

            <Text style={styles.label}>Criar Senha de Acesso *</Text>
            <TextInput style={styles.inputForm} placeholder="••••••••" placeholderTextColor="#94A3B8" secureTextEntry value={regSenha} onChangeText={setRegSenha} />

            <TouchableOpacity style={styles.btnSuccess} onPress={handleEnviarCodigoEscola}>
              <Text style={styles.btnSuccessText}>Receber Código por E-mail</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 4. CADASTRAMENTO DE PROFESSORES INDEPENDENTES
  if (tela === 'reg_professor') {
    return (
      <SafeAreaView style={styles.containerApp}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <HeaderComLogin />
        <ScrollView contentContainerStyle={styles.contentScroll}>
          <TouchableOpacity onPress={() => setTela('menu_principal')} style={{ marginBottom: 14 }}>
            <Text style={{ color: '#2563EB', fontWeight: '600' }}>← Voltar ao Menu</Text>
          </TouchableOpacity>
          <View style={styles.cardForm}>
            <Text style={styles.sectionTitle}>👨‍🏫 Registo de Professor Independente</Text>
            <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>Para professores sem vínculo fixo a uma instituição ou que desejam registo individual.</Text>
            
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput style={styles.inputForm} placeholder="Nome do Professor" placeholderTextColor="#94A3B8" value={regNomeProf} onChangeText={setRegNomeProf} />

            <Text style={styles.label}>Disciplina Principal *</Text>
            <TextInput style={styles.inputForm} placeholder="ex: Matemática / Física" placeholderTextColor="#94A3B8" value={regDiscProf} onChangeText={setRegDiscProf} />

            <Text style={styles.label}>Contacto Telefónico</Text>
            <TextInput style={styles.inputForm} placeholder="ex: 923000000" placeholderTextColor="#94A3B8" value={regTelProf} onChangeText={setRegTelProf} />

            <Text style={styles.label}>E-mail de Acesso *</Text>
            <TextInput style={styles.inputForm} placeholder="professor@email.com" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" value={regEmailProf} onChangeText={setRegEmailProf} />

            <Text style={styles.label}>Criar Senha *</Text>
            <TextInput style={styles.inputForm} placeholder="••••••••" placeholderTextColor="#94A3B8" secureTextEntry value={regSenhaProf} onChangeText={setRegSenhaProf} />

            <TouchableOpacity style={styles.btnSuccess} onPress={handleEnviarCodigoProfessor}>
              <Text style={styles.btnSuccessText}>Concluir Registo de Professor</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 5. CONSULTA DE ALUNOS E ENCARREGADOS
  if (tela === 'consulta_alunos') {
    return (
      <SafeAreaView style={styles.containerApp}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <HeaderComLogin />
        <ScrollView contentContainerStyle={styles.contentScroll}>
          <TouchableOpacity onPress={() => setTela('menu_principal')} style={{ marginBottom: 14 }}>
            <Text style={{ color: '#2563EB', fontWeight: '600' }}>← Voltar ao Menu</Text>
          </TouchableOpacity>
          
          <View style={styles.cardForm}>
            <Text style={styles.sectionTitle}>🔍 Consulta de Alunos e Encarregados</Text>
            <Text style={styles.label}>Pesquisar por Nome do Aluno ou Nº de Processo:</Text>
            <TextInput 
              style={styles.inputForm} 
              placeholder="Digite o nome ou processo..." 
              placeholderTextColor="#94A3B8" 
              value={termoBuscaAluno} 
              onChangeText={setTermoBuscaAluno} 
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleConsultarAlunos} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryText}>Pesquisar Registo</Text>}
            </TouchableOpacity>
          </View>

          {resultadosBusca.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionHeading}>Resultados Encontrados</Text>
              {resultadosBusca.map((aluno) => (
                <View key={aluno.id} style={styles.listItem}>
                  <View style={styles.listAvatar}><Text>🎓</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{aluno.nome}</Text>
                    <Text style={styles.itemSub}>Processo: {aluno.numero_processo} • Classe: {aluno.classe}</Text>
                    <Text style={{ fontSize: 11, color: '#2563EB', marginTop: 2 }}>Instituição: {aluno.escolas?.nome || 'Escola Associada'}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 6. INFORMAÇÃO DO APLICATIVO
  if (tela === 'info_app') {
    return (
      <SafeAreaView style={styles.containerApp}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <HeaderComLogin />
        <ScrollView contentContainerStyle={styles.contentScroll}>
          <TouchableOpacity onPress={() => setTela('menu_principal')} style={{ marginBottom: 14 }}>
            <Text style={{ color: '#2563EB', fontWeight: '600' }}>← Voltar ao Menu</Text>
          </TouchableOpacity>
          <View style={styles.cardForm}>
            <Text style={styles.sectionTitle}>ℹ️ Sobre o Portal Escolar</Text>
            <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 12 }}>
              Este aplicativo é uma solução digital avançada desenvolvida para otimizar a gestão administrativa de instituições de ensino, permitindo o controlo unificado de matrículas de alunos, docentes e secretaria virtual.
            </Text>
            <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 12 }}>
              • **Para Instituições:** Gestão completa de turmas, registo oficial de estudantes e professores associados.{'\n'}
              • **Para Professores:** Acesso para auxiliar na gestão escolar e inserção de alunos.{'\n'}
              • **Para Encarregados:** Transparência na consulta de dados académicos.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 7. VALIDAÇÃO DE CÓDIGO POR EMAIL
  if (tela === 'validar_email') {
    return (
      <SafeAreaView style={styles.containerAuth}>
        <StatusBar barStyle="light-content" backgroundColor="#090D16" />
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Validação de Segurança</Text>
          <Text style={styles.authSubtitle}>Insira o código de 6 dígitos enviado para o seu e-mail.</Text>

          <TextInput
            style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
            placeholder="000000"
            placeholderTextColor="#475569"
            keyboardType="numeric"
            maxLength={6}
            value={codigoDigitado}
            onChangeText={setCodigoDigitado}
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleConfirmarCodigo} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryText}>Confirmar e Concluir</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 8. DASHBOARD LOGADO (Instituição ou Professor)
  return (
    <SafeAreaView style={styles.containerApp}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.topbar}>
        <View style={styles.topbarLeft}>
          <View style={styles.fotoPlaceholder}><Text style={styles.fotoPlaceholderText}>🏫</Text></View>
          <View>
            <Text style={styles.topbarTitle} numberOfLines={1}>{usuario?.nome}</Text>
            <Text style={styles.topbarRole}>Perfil: {usuario?.tipo_usuario === 'escola' ? 'Instituição' : 'Professor'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={() => { setUsuario(null); setTela('menu_principal'); }}>
          <Text style={styles.btnLogoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeBannerTitle}>Painel de Gestão Académica</Text>
          <Text style={styles.welcomeBannerText}>Bem-vindo ao seu espaço de trabalho operativo.</Text>
        </View>

        {usuario?.tipo_usuario === 'escola' && (
          <View>
            <View style={styles.cardForm}>
              <Text style={styles.sectionTitle}>Matricular Novo Aluno</Text>
              
              <Text style={styles.label}>Nome Completo do Aluno</Text>
              <TextInput style={styles.inputForm} placeholder="Nome do estudante" placeholderTextColor="#94A3B8" value={nomeEstudante} onChangeText={setNomeEstudante} />

              <Text style={styles.label}>Nº de Processo</Text>
              <TextInput style={styles.inputForm} placeholder="ex: 2026/05" placeholderTextColor="#94A3B8" value={numProcesso} onChangeText={setNumProcesso} />

              <Text style={styles.label}>Classe</Text>
              <TextInput style={styles.inputForm} placeholder="ex: 10ª Classe" placeholderTextColor="#94A3B8" value={classeEstudante} onChangeText={setClasseEstudante} />

              <TouchableOpacity style={styles.btnSuccess} onPress={handleCadastrarEstudante} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSuccessText}>Registar Aluno na Escola</Text>}
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Estudantes Matriculados ({estudantes.length})</Text>
            {estudantes.map((est) => (
              <View key={est.id} style={styles.listItem}>
                <View style={styles.listAvatar}><Text>🎓</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{est.nome}</Text>
                  <Text style={styles.itemSub}>Processo: {est.numero_processo} • Classe: {est.classe}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {usuario?.tipo_usuario === 'professor' && (
          <View style={styles.cardForm}>
            <Text style={styles.sectionTitle}>Área do Professor Independente</Text>
            <Text style={{ fontSize: 13, color: '#475569', lineHeight: 20 }}>
              Disciplina: <Text style={{ fontWeight: 'bold' }}>{usuario.disciplina}</Text>{'\n'}
              Contacto: <Text style={{ fontWeight: 'bold' }}>{usuario.telefone || 'N/A'}</Text>{'\n'}
              E-mail: <Text style={{ fontWeight: 'bold' }}>{usuario.email}</Text>
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 12 }}>
              Funcionalidades de lecionação e turmas disponíveis em breve.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerAuth: { flex: 1, backgroundColor: '#090D16', justifyContent: 'center', alignItems: 'center', padding: 20 },
  authCard: { width: '100%', maxWidth: 420, backgroundColor: '#111827', borderRadius: 16, padding: 28, borderWidth: 1, borderColor: '#1F2937' },
  authTitle: { fontSize: 24, fontWeight: '700', color: '#F9FAFB', marginBottom: 6 },
  authSubtitle: { fontSize: 13, color: '#9CA3AF', marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '500', color: '#D1D5DB', marginBottom: 6 },
  input: { backgroundColor: '#1F2937', color: '#F9FAFB', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#374151' },
  
  btnPrimary: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },

  containerApp: { flex: 1, backgroundColor: '#F8FAFC' },
  topHeaderPublic: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  topHeaderLogo: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  btnLoginTop: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE' },
  btnLoginTopText: { color: '#1D4ED8', fontWeight: '600', fontSize: 13 },

  contentScroll: { padding: 20, maxWidth: 840, width: '100%', alignSelf: 'center' },

  // BANNER DE PUBLICIDADE
  bannerPublicidade: { borderRadius: 14, padding: 18, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  badgePublicidade: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  badgePubText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  bannerPubTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  bannerPubDesc: { color: '#E2E8F0', fontSize: 13 },

  sectionHeading: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#64748B', marginBottom: 16 },

  menuGrid: { gap: 12 },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'column', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  menuIcon: { fontSize: 24, marginBottom: 8 },
  menuCardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  menuCardDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },

  cardForm: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  inputForm: { backgroundColor: '#F8FAFC', color: '#0F172A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },

  btnSuccess: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  btnSuccessText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  topbarTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  topbarRole: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  fotoPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  fotoPlaceholderText: { fontSize: 18 },
  btnLogout: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#FEE2E2' },
  btnLogoutText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },

  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  listAvatar: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  itemSub: { fontSize: 12, color: '#64748B', marginTop: 2 },

  welcomeBanner: { backgroundColor: '#1E293B', borderRadius: 12, padding: 20, marginBottom: 20 },
  welcomeBannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  welcomeBannerText: { color: '#94A3B8', fontSize: 13, lineHeight: 18 }
});
