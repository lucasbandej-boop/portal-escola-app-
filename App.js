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
import * as DocumentPicker from 'expo-document-picker';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- COMPONENTE DE QUADRO DE PUBLICIDADE ROTATIVO (CARROSSEL) ---
function CarrosselPublicidades({ publicidadeLigar }) {
  const anuncios = [
    {
      id: 1,
      tag: '📢 Publicidade Patrocinada',
      titulo: 'Matérias a bom preço',
      corpo: '🇦🇴 Olá Angola, o regresso às aulas já é uma realidade, estamos a disponibilizar materiais de boa qualidade.\nLivros 📕 Cadernos 📓 Folha A4 Lápis',
      corFundo: '#1d4ed8'
    },
    {
      id: 2,
      tag: '👔 Confecção de Uniformes',
      titulo: 'Uniformes & Fardamentos',
      corpo: 'Produção de fardas escolares para colégios e institutos.\nBatas, camisas, calças e bordados personalizados com a melhor qualidade de Luanda.',
      corFundo: '#0f766e'
    },
    {
      id: 3,
      tag: '💻 Tecnologia Escolar',
      titulo: 'Softwares & Equipamentos',
      corpo: 'Computadores, impressoras e redes para instituições de ensino com assistência técnica garantida em Luanda.',
      corFundo: '#4338ca'
    }
  ];

  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % anuncios.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [anuncios.length]);

  const anuncioAtual = anuncios[indiceAtual];

  return (
    <View style={[styles.cardPublicidade, { backgroundColor: anuncioAtual.corFundo }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={styles.badgePatrocinado}>
          <Text style={styles.txtBadgePatrocinado}>{anuncioAtual.tag}</Text>
        </View>
        <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '600' }}>
          {indiceAtual + 1} / {anuncios.length}
        </Text>
      </View>

      <Text style={styles.tituloPublicidade}>{anuncioAtual.titulo}</Text>
      <Text style={styles.corpoPublicidade}>{anuncioAtual.corpo}</Text>

      <TouchableOpacity style={styles.btnLigarPub} onPress={publicidadeLigar}>
        <Text style={styles.rodapePublicidade}>
          Para mais informações ligue:{'\n'}
          <Text style={styles.telefonePublicidade}>📞 929500600 (Clique para Ligar)</Text>
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
        {anuncios.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setIndiceAtual(idx)}
            style={{
              width: idx === indiceAtual ? 18 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: idx === indiceAtual ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)',
              marginHorizontal: 3,
            }}
          />
        ))}
      </View>
    </View>
  );
}

// --- MODAL DE LOGIN E OTP ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login');
  const [emailOuLicenca, setEmailOuLicenca] = useState('');
  const [senha, setSenha] = useState('');
  const [codigoOtp, setCodigoOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmeter = async () => {
    if (!emailOuLicenca.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      if (modo === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailOuLicenca.trim(),
          password: senha,
        });

        if (error) {
          Alert.alert('Aviso de Acesso', error.message || 'Credenciais inválidas.');
        } else {
          Alert.alert('Sucesso', 'Sessão iniciada!');
          onLoginSucesso(data?.user);
          onClose();
        }
      } else if (modo === 'registro') {
        const { error } = await supabase.auth.signUp({
          email: emailOuLicenca.trim(),
          password: senha,
        });

        if (error) {
          Alert.alert('Erro no Cadastro', error.message);
        } else {
          Alert.alert(
            'Código Enviado ✉️',
            `Enviamos um código de confirmação de 6 dígitos para ${emailOuLicenca.trim()}.`
          );
          setModo('verificar_codigo');
        }
      }
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha na operação.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigoOtp.trim() || codigoOtp.trim().length < 6) {
      Alert.alert('Atenção', 'Insira o código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailOuLicenca.trim(),
        token: codigoOtp.trim(),
        type: 'signup'
      });

      if (error) {
        Alert.alert('Código Inválido', error.message || 'O código digitado está incorreto.');
      } else {
        Alert.alert('Conta Confirmada 🎉', 'E-mail verificado com sucesso!');
        onLoginSucesso(data?.user);
        onClose();
      }
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao verificar código.');
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

          {modo !== 'verificar_codigo' ? (
            <>
              <TextInput
                style={styles.darkInput}
                placeholder="E-mail ou Nº Licença"
                placeholderTextColor="#9ca3af"
                value={emailOuLicenca}
                onChangeText={setEmailOuLicenca}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                style={styles.darkInput}
                placeholder="Senha"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />

              <TouchableOpacity style={styles.btnEntrarDark} onPress={handleSubmeter} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.txtEntrarDark}>{modo === 'login' ? 'ENTRAR' : 'CRIAR CONTA E RECEBER CÓDIGO'}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnLinkDark}
                onPress={() => setModo(modo === 'login' ? 'registro' : 'login')}
              >
                <Text style={styles.txtLinkDark}>
                  {modo === 'login' ? 'Cadastrar Nova Instituição' : 'Já tenho conta / Iniciar Sessão'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ color: '#38bdf8', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                Insira o código de 6 dígitos enviado para:{'\n'}
                <Text style={{ fontWeight: 'bold', color: '#ffffff' }}>{emailOuLicenca}</Text>
              </Text>

              <TextInput
                style={[styles.darkInput, { textAlign: 'center', fontSize: 20, letterSpacing: 6 }]}
                placeholder="000000"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                maxLength={6}
                value={codigoOtp}
                onChangeText={setCodigoOtp}
              />

              <TouchableOpacity style={styles.btnEntrarDark} onPress={handleVerificarCodigo} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.txtEntrarDark}>CONFIRMAR CÓDIGO</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnLinkDark} onPress={() => setModo('registro')}>
                <Text style={styles.txtLinkDark}>Reenviar código / Voltar</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.btnFecharDark} onPress={onClose}>
            <Text style={styles.txtFecharDark}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- TELA DE LEGALIZAÇÃO (DECRETO 37/23) ---
function TelaLegalizacaoEscola({ onVoltarHome, onIrParaCadastro }) {
  const [ficheiroPdf, setFicheiroPdf] = useState(null);
  const [nomeEscola, setNomeEscola] = useState('');
  const [contacto, setContacto] = useState('');
  const [loading, setLoading] = useState(false);

  const selecionarPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setFicheiroPdf(res.assets[0]);
        Alert.alert('Ficheiro Anexado', `Documento selecionado: ${res.assets[0].name}`);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar o ficheiro PDF.');
    }
  };

  const enviarProcesso = async () => {
    if (!nomeEscola.trim() || !contacto.trim()) {
      Alert.alert('Atenção', 'Insira o nome da instituição e o contacto telefónico.');
      return;
    }

    if (!ficheiroPdf) {
      Alert.alert('Ficheiro Ausente', 'Por favor, anexe o ficheiro PDF.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('instituicoes').insert([
        {
          nome: nomeEscola.trim(),
          nif: contacto.trim(),
          email: 'processo.legalizacao@escola.ao',
          sobre: JSON.stringify({
            status_legalizacao: 'Em Análise',
            ficheiro_nome: ficheiroPdf.name,
            tamanho_bytes: ficheiroPdf.size
          })
        }
      ]);

      if (error) throw error;

      Alert.alert('Processo Submetido! 🎉', 'Documentação enviada com sucesso.');
      onIrParaCadastro();
    } catch (err) {
      Alert.alert('Erro ao Submeter', err.message || 'Falha ao registar o processo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onVoltarHome}>
          <Text style={{ fontSize: 13, color: '#1e40af', fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>Legalização de Instituição</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.cardNotaLegal}>
          <Text style={styles.tituloNotaLegal}>📜 Nota Explicativa e Requisitos Legais</Text>
          <Text style={styles.corpoNotaLegal}>
            Processo regulado pelo <Text style={{ fontWeight: 'bold' }}>Decreto Presidencial n.º 37/23</Text>.
          </Text>
        </View>

        <Text style={styles.secaoFormHeader}>Requisitos Essenciais</Text>
        <View style={styles.boxRequisitos}>
          <Text style={styles.itemRequisito}>• Certidão de Registo Comercial e Estatutos.</Text>
          <Text style={styles.itemRequisito}>• Projeto Pedagógico e Regulamento Interno.</Text>
          <Text style={styles.itemRequisito}>• Título de propriedade ou contrato de arrendamento do imóvel escolar.</Text>
          <Text style={styles.itemRequisito}>• Parecer técnico de salubridade e segurança contra incêndios.</Text>
        </View>

        <View style={styles.boxEnvioPdf}>
          <Text style={styles.tituloBoxEnvio}>📤 Submeter Processo</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da Escola"
            value={nomeEscola}
            onChangeText={setNomeEscola}
          />
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Telefone de Contacto"
            keyboardType="phone-pad"
            value={contacto}
            onChangeText={setContacto}
          />

          <TouchableOpacity style={styles.btnSelecionarPdf} onPress={selecionarPdf}>
            <Text style={styles.txtSelecionarPdf}>
              {ficheiroPdf ? `📄 ${ficheiroPdf.name}` : '📎 Anexar Ficheiro PDF Completo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnEnviarProcesso} onPress={enviarProcesso} disabled={loading}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.txtEnviarProcesso}>ENVIAR PROCESSO</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// --- TELA DE QUADRO DE PUBLICIDADES ---
function TelaQuadroPublicidades({ onVoltarHome, publicidadeLigar }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onVoltarHome}>
          <Text style={{ fontSize: 13, color: '#1e40af', fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>Quadro de Publicidades</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
      </ScrollView>
    </View>
  );
}

// --- CADASTRAMENTO DE INSTITUIÇÃO ---
function FormCadastramentoInstituicao({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [numeroInst, setNumeroInst] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !numeroInst.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('instituicoes').insert([
      { nome: nome.trim(), nif: numeroInst.trim(), email: email.trim() }
    ]);
    setLoading(false);

    if (error) {
      Alert.alert('Erro ao Salvar', error.message);
    } else {
      Alert.alert('Sucesso', 'Instituição cadastrada!');
      onConcluir();
    }
  };

  return (
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Cadastramento de Instituição</Text>
      </View>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Colégio Progresso" />

      <Text style={styles.label}>Número / NIF *</Text>
      <TextInput style={styles.input} value={numeroInst} onChangeText={setNumeroInst} placeholder="NIF ou Telefone" />

      <Text style={styles.label}>Email *</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="escola@dominio.ao" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Instituição</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- CONSULTA DE ALUNOS ---
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
      const { data } = await supabase.from('estudantes').select('*').order('id', { ascending: false });
      setAlunos(data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

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
        <TextInput style={styles.inputBusca} placeholder="Pesquisar por aluno..." value={busca} onChangeText={setBusca} />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#0f172a" style={{ marginTop: 20 }} />
        ) : (
          alunos.map((aluno) => (
            <View key={aluno.id} style={styles.cardConsulta}>
              <Text style={styles.nomeAlunoConsulta}>{aluno.nome_completo}</Text>
              <Text style={styles.detalheCurso}>BI: {aluno.num_bilhete}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// --- MENU PRINCIPAL (HOME) ---
function MenuPrincipalHome({ onNavegarCadastramentoInst, onNavegarConsultaAlunos, onNavegarQuadroPub, onNavegarLegalizacao, publicidadeLigar }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.headerRowHome}>
        <Text style={styles.homeTitleHeader}>Portal Escola</Text>
        <TouchableOpacity style={styles.btnHeaderPub} onPress={onNavegarQuadroPub}>
          <Text style={styles.txtHeaderPub}>📢 Publicidade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.homeContainer} contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>
        <Text style={styles.secaoSubtitulo}>Selecione a opção desejada para navegar:</Text>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarLegalizacao}>
          <Text style={styles.cardEmoji}>📜</Text>
          <Text style={styles.cardMenuTitulo}>Legalização e Licenciamento</Text>
          <Text style={styles.cardMenuDesc}>
            Consulte os requisitos do Decreto 37/23 e submeta os documentos em PDF.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.cardEmoji}>🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
          <Text style={styles.cardMenuDesc}>
            Registe a sua escola para gerir turmas, alunos e professores.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarConsultaAlunos}>
          <Text style={styles.cardEmoji}>🔍</Text>
          <Text style={styles.cardMenuTitulo}>Consulta de Alunos e Encarregados</Text>
          <Text style={styles.cardMenuDesc}>
            Consulte o estado de matrícula e dados de estudantes.
          </Text>
        </TouchableOpacity>

        {/* QUADRO DE PUBLICIDADE ROTATIVO GARANTIDO NO RODAPÉ */}
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 6 }}>DESTAQUES E PUBLICIDADE</Text>
          <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [tela, setTela] = useState('home');
  const [loginVisivel, setLoginVisivel] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ModalLogin
        visivel={loginVisivel}
        onClose={() => setLoginVisivel(false)}
        onLoginSucesso={() => setTela('formulario_inst')}
      />

      {tela === 'home' && (
        <MenuPrincipalHome
          onNavegarCadastramentoInst={() => setLoginVisivel(true)}
          onNavegarConsultaAlunos={() => setTela('consulta_alunos')}
          onNavegarQuadroPub={() => setTela('quadro_publicidades')}
          onNavegarLegalizacao={() => setTela('legalizacao')}
          publicidadeLigar={() => Linking.openURL('tel:929500600')}
        />
      )}

      {tela === 'legalizacao' && (
        <TelaLegalizacaoEscola
          onVoltarHome={() => setTela('home')}
          onIrParaCadastro={() => setTela('formulario_inst')}
        />
      )}

      {tela === 'quadro_publicidades' && (
        <TelaQuadroPublicidades
          onVoltarHome={() => setTela('home')}
          publicidadeLigar={() => Linking.openURL('tel:929500600')}
        />
      )}

      {tela === 'consulta_alunos' && (
        <TelaConsultaAlunos
          onVoltarHome={() => setTela('home')}
          onNavegarNovoEstudante={() => setTela('formulario_inst')}
        />
      )}

      {tela === 'formulario_inst' && (
        <FormCadastramentoInstituicao
          onConcluir={() => setTela('home')}
          onCancelar={() => setTela('home')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  homeContainer: { flex: 1, backgroundColor: '#f8fafc' },

  headerRowHome: {
    height: 54,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  homeTitleHeader: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  btnHeaderPub: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe' },
  txtHeaderPub: { fontSize: 12, fontWeight: 'bold', color: '#1d4ed8' },

  darkModalOverlay: { flex: 1, backgroundColor: 'rgba(10, 15, 26, 0.85)', justifyContent: 'center', paddingHorizontal: 20 },
  darkModalCard: { backgroundColor: '#172033', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#26334d', alignItems: 'center' },
  darkModalTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 4 },
  darkModalSubtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  darkInput: { width: '100%', height: 48, backgroundColor: '#243047', borderRadius: 8, paddingHorizontal: 16, fontSize: 14, color: '#ffffff', marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  btnEntrarDark: { width: '100%', height: 48, backgroundColor: '#2563eb', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  txtEntrarDark: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  btnLinkDark: { paddingVertical: 8 },
  txtLinkDark: { color: '#38bdf8', fontSize: 13, fontWeight: '600' },
  btnFecharDark: { marginTop: 12, paddingVertical: 6 },
  txtFecharDark: { color: '#64748b', fontSize: 12 },

  cardNotaLegal: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#bfdbfe', marginBottom: 16 },
  tituloNotaLegal: { fontSize: 16, fontWeight: 'bold', color: '#1e40af', marginBottom: 6 },
  corpoNotaLegal: { fontSize: 13, color: '#334155', lineHeight: 20 },

  boxRequisitos: { backgroundColor: '#ffffff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  itemRequisito: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 6 },

  boxEnvioPdf: { backgroundColor: '#ffffff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#cbd5e1', marginTop: 10 },
  tituloBoxEnvio: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  btnSelecionarPdf: { backgroundColor: '#f1f5f9', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', marginVertical: 12 },
  txtSelecionarPdf: { color: '#1e293b', fontWeight: '600', fontSize: 13 },
  btnEnviarProcesso: { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  txtEnviarProcesso: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },

  cardPublicidade: { borderRadius: 16, padding: 16, marginTop: 4, marginBottom: 20, elevation: 3 },
  badgePatrocinado: { backgroundColor: 'rgba(255, 255, 255, 0.25)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
  txtBadgePatrocinado: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  tituloPublicidade: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  corpoPublicidade: { fontSize: 13, color: '#e0e7ff', lineHeight: 20, marginBottom: 12 },
  btnLigarPub: { backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 10, borderRadius: 10 },
  rodapePublicidade: { fontSize: 12, color: '#c7d2fe', lineHeight: 16 },
  telefonePublicidade: { fontSize: 14, fontWeight: 'bold', color: '#fbbf24' },

  secaoTitulo: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  secaoSubtitulo: { fontSize: 14, color: '#64748b', marginBottom: 16 },

  cardMenuImageStyle: { backgroundColor: '#ffffff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardMenuTitulo: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  cardMenuDesc: { fontSize: 12, color: '#64748b', lineHeight: 17 },

  inputBusca: { height: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 14, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  cardConsulta: { backgroundColor: '#ffffff', borderRadius: 8, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  nomeAlunoConsulta: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  detalheCurso: { fontSize: 12, color: '#64748b', marginTop: 2 },
  topBar: { height: 50, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },

  formContainer: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  formHeader: { marginBottom: 15 },
  btnVoltarHeader: { paddingVertical: 6, marginBottom: 4 },
  txtVoltarHeader: { color: '#1e40af', fontWeight: '600', fontSize: 13 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4, marginTop: 10 },
  input: { height: 42, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  btnSalvar: { backgroundColor: '#0f172a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 30 },
  txtSalvar: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});
