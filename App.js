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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// --- CARROSSEL PUBLICIDADES ---
function CarrosselPublicidades({ publicidadeLigar }) {
  const anuncios = [
    {
      id: 1,
      tag: '📢 Publicidade Patrocinada',
      titulo: 'Matérias a bom preço',
      corpo: '🇦🇴 Olá Angola, o regresso às aulas já é uma realidade, estamos a disponibilizar materiais de boa qualidade.\nLivros 📕 Cadernos 📓 Folha A4 Lápis',
      corFundo: '#1d4ed8'
    }
  ];

  return (
    <View style={[styles.cardPublicidade, { backgroundColor: anuncios[0].corFundo }]}>
      <Text style={styles.tituloPublicidade}>{anuncios[0].titulo}</Text>
      <Text style={styles.corpoPublicidade}>{anuncios[0].corpo}</Text>
      <TouchableOpacity style={styles.btnLigarPub} onPress={publicidadeLigar}>
        <Text style={styles.telefonePublicidade}>📞 929500600 (Clique para Ligar)</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- MODAL LOGIN ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmeter = async () => {
    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      Alert.alert('Atenção', 'Preencha o e-mail e a palavra-passe.');
      return;
    }

    setLoading(true);
    try {
      if (modo === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailLimpo,
          password: senhaLimpa,
        });

        if (error) {
          Alert.alert('Erro de Acesso', error.message);
        } else if (data?.user) {
          onLoginSucesso(data.user);
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: emailLimpo,
          password: senhaLimpa,
        });

        if (error) {
          Alert.alert('Erro no Registo', error.message);
        } else if (data?.user) {
          if (!data.session) {
            const loginRes = await supabase.auth.signInWithPassword({
              email: emailLimpo,
              password: senhaLimpa,
            });
            if (!loginRes.error && loginRes.data?.user) {
              onLoginSucesso(loginRes.data.user);
              onClose();
              return;
            }
          }
          onLoginSucesso(data.user);
          onClose();
        }
      }
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
          <Text style={styles.darkModalTitle}>Portal Escola 🎓</Text>
          <Text style={styles.darkModalSubtitle}>Sistema Integrado de Gestão Escolar</Text>

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
            <Text style={styles.txtLinkDark}>{modo === 'login' ? 'Cadastrar Nova Instituição' : 'Já tem conta? Entrar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnFecharDark} onPress={onClose}>
            <Text style={styles.txtFecharDark}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- PERFIL DO FACEBOOK ---
function PerfilEstiloFacebook({ dados, tipo, onVoltarHome }) {
  let detalhesExtra = {};
  try {
    detalhesExtra = typeof dados.sobre === 'string' ? JSON.parse(dados.sobre) : (dados.sobre || {});
  } catch (e) {
    detalhesExtra = {};
  }

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
          <Text style={styles.badgePendenteTxt}>⏳ Registado com Sucesso! Pendente de Aprovação</Text>
        </View>
      </View>

      <View style={styles.fbInfoCard}>
        <Text style={styles.fbSectionTitle}>📌 Informações Gravadas</Text>
        <Text style={styles.fbInfoRow}>📧 Email: {dados.email}</Text>
        <Text style={styles.fbInfoRow}>📞 Telefone/Contacto: {dados.telefone || dados.nif}</Text>
        {tipo === 'escola' ? (
          <>
            <Text style={styles.fbInfoRow}>👨‍💼 Director: {detalhesExtra.director || 'N/A'}</Text>
            <Text style={styles.fbInfoRow}>👨‍💼 Vice-Director: {detalhesExtra.vice_director || 'N/A'}</Text>
            <Text style={styles.fbInfoRow}>📍 Localização: {detalhesExtra.localizacao || 'N/A'}</Text>
          </>
        ) : (
          <Text style={styles.fbInfoRow}>📷 Foto: {detalhesExtra.foto_nome || 'Padrão'}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.btnVoltarFb} onPress={onVoltarHome}>
        <Text style={styles.txtVoltarFb}>Voltar ao Menu Principal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- FORM INSTITUIÇÃO ---
function FormCadastramentoInstituicao({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [numeroInst, setNumeroInst] = useState('');
  const [email, setEmail] = useState(usuario?.email || '');
  const [director, setDirector] = useState('');
  const [viceDirector, setViceDirector] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !numeroInst.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha o Nome da Instituição, NIF e Email.');
      return;
    }

    setLoading(true);
    try {
      const dadosExtra = {
        director: director.trim(),
        vice_director: viceDirector.trim(),
        localizacao: localizacao.trim()
      };

      const dadosCad = {
        nome: nome.trim(),
        nif: numeroInst.trim(),
        email: email.trim(),
        status: 'Pendente',
        sobre: JSON.stringify(dadosExtra)
      };

      const { data, error } = await supabase.from('instituicoes').insert([dadosCad]).select();

      if (error) {
        Alert.alert('Erro no Supabase', error.message);
      } else {
        Alert.alert('Sucesso 🎉', 'Instituição cadastrada com sucesso!');
        onConcluir(data && data.length > 0 ? data[0] : dadosCad);
      }
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Legalização de Instituição</Text>
      </View>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Colégio Futuro do Saber" />

      <Text style={styles.label}>Número / NIF *</Text>
      <TextInput style={styles.input} value={numeroInst} onChangeText={setNumeroInst} placeholder="NIF ou Telefone" />

      <Text style={styles.label}>Email da Instituição *</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="contacto@escola.ao" />

      <Text style={styles.label}>Director da Instituição</Text>
      <TextInput style={styles.input} value={director} onChangeText={setDirector} placeholder="Ex: Dr. Manuel dos Santos" />

      <Text style={styles.label}>Vice-Director</Text>
      <TextInput style={styles.input} value={viceDirector} onChangeText={setViceDirector} placeholder="Ex: Prof. Maria António" />

      <Text style={styles.label}>Localização</Text>
      <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Luanda, Viana" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Criar Perfil e Submeter</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- FORM PROFESSOR ---
function FormCadastramentoProfessor({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bi, setBi] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrarProf = async () => {
    if (!nome.trim() || !disciplina.trim() || !telefone.trim()) {
      Alert.alert('Atenção', 'Preencha o Nome, Disciplina e Telefone.');
      return;
    }

    setLoading(true);
    try {
      const dadosProf = {
        nome_completo: nome.trim(),
        disciplina: disciplina.trim(),
        telefone: telefone.trim(),
        num_bilhete: bi.trim(),
        status: 'Pendente',
        email: usuario?.email || 'professor@escola.ao'
      };

      const { data, error } = await supabase.from('professores').insert([dadosProf]).select();

      if (error) {
        Alert.alert('Erro no Supabase', error.message);
      } else {
        Alert.alert('Sucesso 🎉', 'Professor cadastrado com sucesso!');
        onConcluir({
          id: data && data.length > 0 ? data[0].id : null,
          nome: nome.trim(),
          disciplina: disciplina.trim(),
          telefone: telefone.trim(),
          email: usuario?.email || 'Professor',
          sobre: JSON.stringify({ foto_nome: 'Sem Foto' })
        });
      }
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Inscrição de Professor</Text>
      </View>

      <Text style={styles.label}>Nome Completo do Professor *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Maurício João" />

      <Text style={styles.label}>Disciplina / Especialidade *</Text>
      <TextInput style={styles.input} value={disciplina} onChangeText={setDisciplina} placeholder="Ex: Matemática" />

      <Text style={styles.label}>Telefone de Contacto *</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="Ex: 929500600" />

      <Text style={styles.label}>Nº do Bilhete de Identidade (BI)</Text>
      <TextInput style={styles.input} value={bi} onChangeText={setBi} placeholder="Ex: 000000/0" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrarProf} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Criar Perfil Docente</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- HOME ---
function MenuPrincipalHome({ usuario, onNavegarCadastramentoInst, onNavegarCadastramentoProf, onLogout, publicidadeLigar }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.headerRowHome}>
        <Text style={styles.homeTitleHeader}>Portal Escola</Text>
        {usuario && (
          <TouchableOpacity style={styles.btnHeaderLogout} onPress={onLogout}>
            <Text style={styles.txtHeaderLogout}>Sair ({usuario.email.split('@')[0]})</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>

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

// --- MAIN APP ---
export default function App() {
  const [telaAtual, setTelaAtual] = useState('home');
  const [modalLoginVisivel, setModalLoginVisivel] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [dadosPerfilCriado, setDadosPerfilCriado] = useState(null);
  const [tipoPerfil, setTipoPerfil] = useState('escola');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
  cardPublicidade: { borderRadius: 12, padding: 16, marginTop: 12 },
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
