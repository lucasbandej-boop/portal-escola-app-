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
  ActivityIndicator,
  Modal,
  Linking
} from 'react-native';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

function CarrosselPublicidades({ publicidadeLigar }) {
  return (
    <View style={styles.cardPublicidade}>
      <Text style={styles.tituloPublicidade}>📢 Publicidade Patrocinada</Text>
      <Text style={styles.corpoPublicidade}>
        🇦🇴 Olá Angola, o regresso às aulas já é uma realidade, estamos a disponibilizar materiais de boa qualidade.{'\n'}
        Livros 📕 Cadernos 📓 Folha A4 Lápis
      </Text>
      <TouchableOpacity style={styles.btnLigarPub} onPress={publicidadeLigar}>
        <Text style={styles.telefonePublicidade}>📞 929500600 (Clique para Ligar)</Text>
      </TouchableOpacity>
    </View>
  );
}

function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgErro, setMsgErro] = useState('');

  const handleSubmeter = async () => {
    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      setMsgErro('Preencha o e-mail e a palavra-passe.');
      return;
    }

    setLoading(true);
    setMsgErro('');

    try {
      const endpoint = modo === 'login' ? 'token?grant_type=password' : 'signup';
      const response = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailLimpo, password: senhaLimpa })
      });

      const data = await response.json();

      if (!response.ok) {
        setMsgErro(data.error_description || data.msg || 'Erro na autenticação.');
      } else {
        const user = data.user || data;
        onLoginSucesso(user);
        onClose();
      }
    } catch (err) {
      setMsgErro('Erro de rede ao conectar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visivel} animationType="fade" transparent={true}>
      <View style={styles.darkModalOverlay}>
        <View style={styles.darkModalCard}>
          <Text style={styles.darkModalTitle}>Portal Escola 🎓</Text>
          <Text style={styles.darkModalSubtitle}>Sistema Integrado de Gestão Escolar</Text>

          {msgErro ? <Text style={styles.txtErroModal}>{msgErro}</Text> : null}

          <TextInput
            style={styles.darkInput}
            placeholder="E-mail de acesso"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.darkInput}
            placeholder="Palavra-passe"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.btnEntrarDark} onPress={handleSubmeter} disabled={loading}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.txtEntrarDark}>{modo === 'login' ? 'ENTRAR' : 'REGISTAR E ENTRAR'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLinkDark} onPress={() => setModo(modo === 'login' ? 'registro' : 'login')}>
            <Text style={styles.txtLinkDark}>{modo === 'login' ? 'Criar Nova Conta' : 'Já tem conta? Entrar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnFecharDark} onPress={onClose}>
            <Text style={styles.txtFecharDark}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function PerfilEstiloFacebook({ dados, tipo, onVoltarHome }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.fbCover}>
        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>
          {tipo === 'escola' ? '🏛️ PERFIL INSTITUCIONAL' : '👨‍🏫 PERFIL DOCENTE'}
        </Text>
      </View>

      <View style={styles.fbHeaderCard}>
        <View style={styles.fbAvatar}>
          <Text style={{ fontSize: 32 }}>{tipo === 'escola' ? '🏫' : '👨‍🏫'}</Text>
        </View>
        <Text style={styles.fbName}>{dados.nome || dados.nome_completo}</Text>
        <Text style={styles.fbSub}>{tipo === 'escola' ? `NIF: ${dados.nif}` : `Disciplina: ${dados.disciplina}`}</Text>

        <View style={styles.badgePendenteContainer}>
          <Text style={styles.badgePendenteTxt}>⏳ Gravação Confirmada! Pendente de Aprovação</Text>
        </View>
      </View>

      <View style={styles.fbInfoCard}>
        <Text style={styles.fbSectionTitle}>📌 Informações Gravadas</Text>
        <Text style={styles.fbInfoRow}>📧 Email: {dados.email}</Text>
        <Text style={styles.fbInfoRow}>📞 Contacto: {dados.telefone || dados.nif}</Text>
      </View>

      <TouchableOpacity style={styles.btnVoltarFb} onPress={onVoltarHome}>
        <Text style={styles.txtVoltarFb}>Voltar ao Menu Principal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FormCadastramentoInstituicao({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState(usuario?.email || '');
  const [director, setDirector] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const handleCadastrar = async () => {
    if (!nome.trim() || !nif.trim()) {
      setErroForm('Preencha o Nome da Instituição e o NIF.');
      return;
    }

    setLoading(true);
    setErroForm('');

    const objetoEnvio = {
      nome: nome.trim(),
      nif: nif.trim(),
      email: email.trim() || 'contacto@escola.ao',
      estado_aprovacao: 'pendente'
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/instituicoes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(objetoEnvio)
      });

      const resData = await response.json();

      if (!response.ok) {
        setErroForm(resData.message || 'Erro ao gravar na base de dados.');
      } else {
        onConcluir(resData && resData.length > 0 ? resData[0] : objetoEnvio);
      }
    } catch (err) {
      setErroForm('Falha na ligação de rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Cadastrar Instituição</Text>
      </View>

      {erroForm ? <Text style={styles.txtErroForm}>{erroForm}</Text> : null}

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Colégio Futuro do Saber" />

      <Text style={styles.label}>Número / NIF *</Text>
      <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="NIF ou Número de Registo" />

      <Text style={styles.label}>Email de Contacto</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="escola@contacto.com" />

      <Text style={styles.label}>Director da Instituição</Text>
      <TextInput style={styles.input} value={director} onChangeText={setDirector} placeholder="Ex: Dr. Manuel" />

      <Text style={styles.label}>Localização</Text>
      <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Luanda, Viana" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Gravar Instituição</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function FormCadastramentoProfessor({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bi, setBi] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const handleCadastrarProf = async () => {
    if (!nome.trim() || !disciplina.trim() || !telefone.trim()) {
      setErroForm('Preencha Nome, Disciplina e Telefone.');
      return;
    }

    setLoading(true);
    setErroForm('');

    const objetoEnvio = {
      nome_completo: nome.trim(),
      disciplina: disciplina.trim(),
      telefone: telefone.trim(),
      num_bilhete: bi.trim(),
      email: usuario?.email || 'professor@escola.ao'
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/professores`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(objetoEnvio)
      });

      const resData = await response.json();

      if (!response.ok) {
        setErroForm(resData.message || 'Erro ao gravar na base de dados.');
      } else {
        onConcluir(resData && resData.length > 0 ? resData[0] : objetoEnvio);
      }
    } catch (err) {
      setErroForm('Falha na ligação de rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Cadastrar Professor</Text>
      </View>

      {erroForm ? <Text style={styles.txtErroForm}>{erroForm}</Text> : null}

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: João Manuel" />

      <Text style={styles.label}>Disciplina / Especialidade *</Text>
      <TextInput style={styles.input} value={disciplina} onChangeText={setDisciplina} placeholder="Ex: Matemática" />

      <Text style={styles.label}>Telefone *</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="Ex: 929500600" />

      <Text style={styles.label}>Nº Bilhete de Identidade (BI)</Text>
      <TextInput style={styles.input} value={bi} onChangeText={setBi} placeholder="Ex: 000000000LA000" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrarProf} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Gravar Professor</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuPrincipalHome({ usuario, onNavegarCadastramentoInst, onNavegarCadastramentoProf, onLogout, publicidadeLigar }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.headerRowHome}>
        <Text style={styles.homeTitleHeader}>Portal Escola 🎓</Text>
        {usuario && (
          <TouchableOpacity style={styles.btnHeaderLogout} onPress={onLogout}>
            <Text style={styles.txtHeaderLogout}>Sair</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.secaoTitulo}>Menu Principal</Text>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.cardEmoji}>🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoProf}>
          <Text style={styles.cardEmoji}>👨‍🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Professor</Text>
        </TouchableOpacity>

        <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState('home');
  const [modalLoginVisivel, setModalLoginVisivel] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [dadosPerfilCriado, setDadosPerfilCriado] = useState(null);
  const [tipoPerfil, setTipoPerfil] = useState('escola');

  const ligarParaSuporte = () => {
    Linking.openURL('tel:929500600');
  };

  const solicitarAutenticacao = (destino) => {
    if (!usuario) {
      setAcaoPendente(destino);
      setModalLoginVisivel(true);
    } else {
      setTelaAtual(destino);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="dark" />

      {telaAtual === 'home' && (
        <MenuPrincipalHome
          usuario={usuario}
          onLogout={handleLogout}
          onNavegarCadastramentoInst={() => solicitarAutenticacao('cadastramento')}
          onNavegarCadastramentoProf={() => solicitarAutenticacao('cadastramento_prof')}
          publicidadeLigar={ligarParaSuporte}
        />
      )}

      {telaAtual === 'cadastramento' && (
        <FormCadastramentoInstituicao
          usuario={usuario}
          onConcluir={(dados) => {
            setDadosPerfilCriado(dados);
            setTipoPerfil('escola');
            setTelaAtual('perfil_facebook');
          }}
          onCancelar={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'cadastramento_prof' && (
        <FormCadastramentoProfessor
          usuario={usuario}
          onConcluir={(dados) => {
            setDadosPerfilCriado(dados);
            setTipoPerfil('professor');
            setTelaAtual('perfil_facebook');
          }}
          onCancelar={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'perfil_facebook' && dadosPerfilCriado && (
        <PerfilEstiloFacebook
          dados={dadosPerfilCriado}
          tipo={tipoPerfil}
          onVoltarHome={() => setTelaAtual('home')}
        />
      )}

      <ModalLogin
        visivel={modalLoginVisivel}
        onClose={() => setModalLoginVisivel(false)}
        onLoginSucesso={(usr) => {
          setUsuario(usr);
          if (acaoPendente) {
            setTelaAtual(acaoPendente);
            setAcaoPendente(null);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRowHome: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 45, paddingBottom: 15, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  homeTitleHeader: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  btnHeaderLogout: { backgroundColor: '#fee2e2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  txtHeaderLogout: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  cardMenuImageStyle: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardEmoji: { fontSize: 24, marginBottom: 8 },
  cardMenuTitulo: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cardPublicidade: { backgroundColor: '#1d4ed8', borderRadius: 12, padding: 16, marginTop: 12 },
  tituloPublicidade: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' },
  corpoPublicidade: { color: '#f8fafc', fontSize: 13, marginTop: 4 },
  btnLigarPub: { marginTop: 10, backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 6 },
  telefonePublicidade: { color: '#fbbf24', fontWeight: 'bold' },
  formContainer: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  formHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  btnVoltarHeader: { marginRight: 15 },
  txtVoltarHeader: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 14, color: '#0f172a' },
  btnSalvar: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  txtSalvar: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  txtErroForm: { color: '#dc2626', backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 13 },
  txtErroModal: { color: '#ef4444', backgroundColor: '#450a0a', padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 13, textAlign: 'center' },
  darkModalOverlay: { flex: 1, backgroundColor: 'rgba(11, 19, 36, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  darkModalCard: { backgroundColor: '#1b253b', width: '100%', borderRadius: 16, padding: 24 },
  darkModalTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  darkModalSubtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  darkInput: { backgroundColor: '#243049', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, color: '#ffffff', marginBottom: 12 },
  btnEntrarDark: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  txtEntrarDark: { color: '#ffffff', fontWeight: 'bold' },
  btnLinkDark: { marginTop: 16, alignItems: 'center' },
  txtLinkDark: { color: '#38bdf8', fontSize: 13 },
  btnFecharDark: { marginTop: 16, alignItems: 'center' },
  txtFecharDark: { color: '#64748b', fontSize: 13 },
  fbCover: { height: 100, backgroundColor: '#1877f2', justifyContent: 'flex-end', padding: 12 },
  fbHeaderCard: { backgroundColor: '#ffffff', padding: 16, alignItems: 'center' },
  fbAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#e4e6eb', justifyContent: 'center', alignItems: 'center', marginTop: -35, borderWidth: 3, borderColor: '#ffffff' },
  fbName: { fontSize: 18, fontWeight: 'bold', color: '#050505', marginTop: 8 },
  fbSub: { fontSize: 13, color: '#65676b' },
  badgePendenteContainer: { marginTop: 10, backgroundColor: '#dcfce7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  badgePendenteTxt: { color: '#15803d', fontSize: 12, fontWeight: 'bold' },
  fbInfoCard: { backgroundColor: '#ffffff', padding: 16, marginTop: 10 },
  fbSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#050505', marginBottom: 8 },
  fbInfoRow: { fontSize: 13, color: '#334155', marginBottom: 6 },
  btnVoltarFb: { backgroundColor: '#1877f2', padding: 14, margin: 16, borderRadius: 8, alignItems: 'center' },
  txtVoltarFb: { color: '#ffffff', fontWeight: 'bold' }
});
