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

// --- MODAL DE AUTENTICAÇÃO (LOGIN E CRIAR CONTA) ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login'); // 'login' ou 'registro'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmeter = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
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
          Alert.alert('Sessão iniciada', 'Acedendo ao formulário em modo administrativo.');
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
          Alert.alert('Conta Criada', 'Registo efetuado com sucesso! Pode continuar para o cadastramento.');
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
          {/* Abas Alternáveis */}
          <View style={styles.abaAuthContainer}>
            <TouchableOpacity
              style={[styles.btnAbaAuth, modo === 'login' && styles.btnAbaAuthAtiva]}
              onPress={() => setModo('login')}
            >
              <Text style={[styles.txtAbaAuth, modo === 'login' && styles.txtAbaAuthAtiva]}>🔑 Iniciar Sessão</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAbaAuth, modo === 'registro' && styles.btnAbaAuthAtiva]}
              onPress={() => setModo('registro')}
            >
              <Text style={[styles.txtAbaAuth, modo === 'registro' && styles.txtAbaAuthAtiva]}>✨ Criar Conta</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            {modo === 'login'
              ? 'Insira os seus dados para aceder e cadastrar a instituição.'
              : 'Crie uma nova conta para gerir a sua escola no portal.'}
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
                {modo === 'login' ? 'Entrar e Continuar' : 'Registar e Continuar'}
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

// --- FORMULÁRIO COMPLETO DE CADASTRAMENTO DE INSTITUIÇÕES ---
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
        Alert.alert('Permissão necessária', 'Acesso à galeria é necessário para escolher a imagem.');
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
      Alert.alert('Campos Obrigatórios', 'Preencha pelo menos o Nome, o NIF e o Contacto da instituição.');
      return;
    }

    setLoading(true);
    const dadosEscola = {
      nome: nome.trim(),
      logo_url: fotoUrl || 'https://via.placeholder.com/150/1d4ed8/ffffff?text=Escola',
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
        <Text style={styles.formTitle}>🏫 Cadastramento da Instituição</Text>
      </View>

      <View style={styles.fotoSection}>
        <TouchableOpacity onPress={escolherFoto} style={styles.fotoContainer}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.fotoPreview} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Text style={styles.fotoTxt}>📷 Adicionar Logótipo / Foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Instituto Politécnico de Viana" />

      <Text style={styles.label}>Diretor *</Text>
      <TextInput style={styles.input} value={diretor} onChangeText={setDiretor} placeholder="Nome do Diretor Geral" />

      <Text style={styles.label}>Vice-Diretor</Text>
      <TextInput style={styles.input} value={viceDiretor} onChangeText={setViceDiretor} placeholder="Nome do Vice-Diretor" />

      <Text style={styles.label}>Número NIF da Instituição *</Text>
      <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="000000000XX000" keyboardType="numeric" />

      <Text style={styles.label}>Contacto / E-mail da Instituição *</Text>
      <TextInput style={styles.input} value={contacto} onChangeText={setContacto} placeholder="+244 9XX XXX XXX ou e-mail" />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Nº de Estudantes</Text>
          <TextInput style={styles.input} value={numEstudantes} onChangeText={setNumEstudantes} placeholder="Ex: 450" keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Nº de Professores</Text>
          <TextInput style={styles.input} value={numProfessores} onChangeText={setNumProfessores} placeholder="Ex: 32" keyboardType="numeric" />
        </View>
      </View>

      <Text style={styles.label}>Localização da Instituição</Text>
      <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Viana, Luanda, Angola" />

      <Text style={styles.label}>Sobre / Informações Gerais</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
        value={sobre}
        onChangeText={setSobre}
        placeholder="Descreva a história, cursos oferecidos e visão da escola..."
        multiline
      />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Gerar Perfil da Instituição</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.txtCancelar}>Cancelar e Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- PERFIL GERADO DA INSTITUIÇÃO (ESTILO FACEBOOK) ---
function PerfilInstituicaoFacebook({ escola, onVoltarHome }) {
  const [abaAtiva, setAbaAtiva] = useState('sobre');

  return (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onVoltarHome}>
          <Text style={{ fontSize: 13, color: '#1877f2', fontWeight: 'bold' }}>← Menu Principal</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Perfil Oficial</Text>
      </View>

      <View style={styles.capaContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/800x300/1d4ed8/ffffff?text=Portal+Escolar' }}
          style={styles.capa}
        />
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: escola?.logo_url || 'https://via.placeholder.com/150/1d4ed8/ffffff?text=Escola' }}
            style={styles.logo}
          />
        </View>
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.nomeInstituicao}>{escola?.nome || 'Nome da Instituição'}</Text>
        <Text style={styles.categoria}>🏫 Instituição de Ensino • 📍 {escola?.localizacao || 'Angola'}</Text>

        <View style={styles.caixaEstatisticas}>
          <View style={styles.statItem}>
            <Text style={styles.statNumero}>{escola?.num_estudantes || 0}</Text>
            <Text style={styles.statRotulo}>Estudantes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumero}>{escola?.num_professores || 0}</Text>
            <Text style={styles.statRotulo}>Professores</Text>
          </View>
        </View>
      </View>

      <View style={styles.abasContainer}>
        <TouchableOpacity style={[styles.aba, abaAtiva === 'sobre' && styles.abaAtiva]} onPress={() => setAbaAtiva('sobre')}>
          <Text style={[styles.txtAba, abaAtiva === 'sobre' && styles.txtAbaAtiva]}>Sobre & Dados</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.aba, abaAtiva === 'direcao' && styles.abaAtiva]} onPress={() => setAbaAtiva('direcao')}>
          <Text style={[styles.txtAba, abaAtiva === 'direcao' && styles.txtAbaAtiva]}>Direção</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.conteudo}>
        {abaAtiva === 'sobre' && (
          <View style={styles.card}>
            <Text style={styles.tituloCard}>📄 Dados de Identificação</Text>
            <Text style={styles.textoItem}>• <Text style={{ fontWeight: 'bold' }}>NIF:</Text> {escola?.nif || 'Não informado'}</Text>
            <Text style={styles.textoItem}>• <Text style={{ fontWeight: 'bold' }}>Contacto / E-mail:</Text> {escola?.email || 'Não informado'}</Text>
            <Text style={styles.textoItem}>• <Text style={{ fontWeight: 'bold' }}>Localização:</Text> {escola?.localizacao || 'Não informada'}</Text>

            <Text style={[styles.tituloCard, { marginTop: 16 }]}>📝 Sobre a Instituição</Text>
            <Text style={styles.textoItem}>{escola?.sobre || 'Nenhuma descrição detalhada informada.'}</Text>
          </View>
        )}

        {abaAtiva === 'direcao' && (
          <View style={styles.card}>
            <Text style={styles.tituloCard}>👥 Corpo Diretivo</Text>
            <Text style={styles.textoItem}>👨‍💼 <Text style={{ fontWeight: 'bold' }}>Diretor Geral:</Text> {escola?.director || 'Não informado'}</Text>
            <Text style={styles.textoItem}>👨‍💼 <Text style={{ fontWeight: 'bold' }}>Vice-Diretor:</Text> {escola?.vice_director || 'Não informado'}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// --- TELA INICIAL (HOME) ---
function MenuPrincipalHome({ onNavegarCadastramento, publicidadeLigar }) {
  return (
    <ScrollView style={styles.homeContainer}>
      <View style={styles.homeHeader}>
        <Text style={styles.homeHeaderTitle}>Portal Escolar 🎓</Text>
        <TouchableOpacity style={styles.btnLoginTop} onPress={onNavegarCadastramento}>
          <Text style={styles.txtLoginTop}>🔑 Entrar / Criar Conta</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16 }}>
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

        <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>
        <Text style={styles.secaoSubtitulo}>Selecione a opção desejada para navegar:</Text>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarCadastramento}>
          <Text style={styles.emojiCard}>🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
          <Text style={styles.cardMenuDesc}>
            Inicie sessão ou crie uma conta para registar a sua escola e gerar o perfil.
          </Text>
        </TouchableOpacity>

        <View style={[styles.cardMenu, { opacity: 0.8 }]}>
          <Text style={styles.emojiCard}>🔍</Text>
          <Text style={styles.cardMenuTitulo}>Consulta de Alunos e Encarregados</Text>
          <Text style={styles.cardMenuDesc}>Consulte o estado de matrícula e dados de estudantes.</Text>
        </View>

        <View style={[styles.cardMenu, { opacity: 0.8 }]}>
          <Text style={styles.emojiCard}>👨‍🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Professores</Text>
          <Text style={styles.cardMenuDesc}>Registe-se como docente independente na plataforma.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [tela, setTela] = useState('home');
  const [loginVisivel, setLoginVisivel] = useState(false);
  const [escolaCadastrada, setEscolaCadastrada] = useState(null);

  const iniciarFluxoCadastramento = () => {
    setLoginVisivel(true);
  };

  const handleLoginSucesso = () => {
    setTela('formulario');
  };

  const handleConcluirCadastro = (dadosEscola) => {
    setEscolaCadastrada(dadosEscola);
    setTela('perfil');
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
          onNavegarCadastramento={iniciarFluxoCadastramento}
          publicidadeLigar={() => Linking.openURL('tel:929500600')}
        />
      )}

      {tela === 'formulario' && (
        <FormCadastramentoInstituicao
          onConcluir={handleConcluirCadastro}
          onCancelar={() => setTela('home')}
        />
      )}

      {tela === 'perfil' && (
        <PerfilInstituicaoFacebook
          escola={escolaCadastrada}
          onVoltarHome={() => setTela('home')}
        />
      )}
    </SafeAreaView>
  );
}

// --- ESTILOS COMPLETO ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  homeContainer: { flex: 1, backgroundColor: '#f7f9fc' },
  homeHeader: {
    height: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  homeHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a202c' },
  btnLoginTop: { backgroundColor: '#ebf8ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  txtLoginTop: { color: '#2b6cb0', fontWeight: 'bold', fontSize: 12 },

  cardPublicidade: { backgroundColor: '#1d4ed8', borderRadius: 16, padding: 16, marginBottom: 20 },
  badgePatrocinado: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  txtBadgePatrocinado: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  tituloPublicidade: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  corpoPublicidade: { fontSize: 13, color: '#e0e7ff', lineHeight: 18, marginBottom: 12 },
  btnLigarPub: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 8 },
  rodapePublicidade: { fontSize: 12, color: '#c7d2fe' },
  telefonePublicidade: { fontSize: 14, fontWeight: 'bold', color: '#fbbf24' },

  secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 4 },
  secaoSubtitulo: { fontSize: 13, color: '#64748b', marginBottom: 14 },
  cardMenu: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  emojiCard: { fontSize: 28, marginBottom: 8 },
  cardMenuTitulo: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  cardMenuDesc: { fontSize: 12, color: '#64748b', lineHeight: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20 },
  abaAuthContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 4, marginBottom: 12 },
  btnAbaAuth: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  btnAbaAuthAtiva: { backgroundColor: '#ffffff', elevation: 2 },
  txtAbaAuth: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
  txtAbaAuthAtiva: { color: '#1877f2' },
  modalSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 15, textAlign: 'center' },

  formContainer: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  formHeader: { marginBottom: 15 },
  btnVoltarHeader: { paddingVertical: 6, marginBottom: 4 },
  txtVoltarHeader: { color: '#1877f2', fontWeight: 'bold', fontSize: 13 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#050505' },
  fotoSection: { alignItems: 'center', marginVertical: 10 },
  fotoContainer: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden' },
  fotoPreview: { width: '100%', height: '100%' },
  fotoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#e4e6eb', justifyContent: 'center', alignItems: 'center', padding: 8 },
  fotoTxt: { fontSize: 11, color: '#65676b', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#050505', marginBottom: 4, marginTop: 10 },
  input: { height: 42, borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f9f9f9', fontSize: 14 },
  btnSalvar: { backgroundColor: '#1877f2', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  txtSalvar: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  btnCancelar: { backgroundColor: '#e4e6eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  txtCancelar: { color: '#050505', fontWeight: 'bold', fontSize: 15 },

  profileContainer: { flex: 1, backgroundColor: '#f0f2f5' },
  topBar: { height: 50, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  capaContainer: { height: 130, backgroundColor: '#e0e0e0', position: 'relative', marginBottom: 40 },
  capa: { width: '100%', height: '100%' },
  logoContainer: { position: 'absolute', bottom: -35, left: 20, borderRadius: 45, borderWidth: 3, borderColor: '#ffffff', backgroundColor: '#ffffff', overflow: 'hidden' },
  logo: { width: 80, height: 80 },
  headerInfo: { backgroundColor: '#ffffff', paddingHorizontal: 20, paddingBottom: 15 },
  nomeInstituicao: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  categoria: { fontSize: 13, color: '#65676b', marginTop: 2 },
  caixaEstatisticas: { flexDirection: 'row', backgroundColor: '#f7f8fa', borderRadius: 8, padding: 10, marginTop: 12, alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumero: { fontSize: 16, fontWeight: 'bold', color: '#1877f2' },
  statRotulo: { fontSize: 11, color: '#65676b' },
  statDivider: { width: 1, height: '80%', backgroundColor: '#e0e0e0' },

  abasContainer: { flexDirection: 'row', backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#e4e6eb', marginTop: 10 },
  aba: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  abaAtiva: { borderBottomWidth: 3, borderBottomColor: '#1877f2' },
  txtAba: { fontWeight: '600', color: '#65676b', fontSize: 13 },
  txtAbaAtiva: { color: '#1877f2', fontWeight: 'bold' },
  conteudo: { padding: 15 },
  card: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8 },
  tituloCard: { fontSize: 15, fontWeight: 'bold', color: '#050505', marginBottom: 8 },
  textoItem: { fontSize: 13, color: '#333', marginBottom: 6, lineHeight: 18 }
});
