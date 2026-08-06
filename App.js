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
  Linking,
  Image
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- COMPONENTE DE QUADRO DE PUBLICIDADE DEDICADO E ROTATIVO (CARROSSEL) ---
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

// --- MODAL DE LOGIN E CONFIRMAÇÃO DE CÓDIGO (OTP) ---
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
            `Enviamos um código de confirmação de 6 dígitos para ${emailOuLicenca.trim()}. Por favor, verifique a sua caixa de entrada.`
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
      Alert.alert('Atenção', 'Insira o código de 6 dígitos enviado para o seu e-mail.');
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
        Alert.alert('Código Inválido', error.message || 'O código digitado está incorreto ou expirou.');
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

// --- TELA DE LEGALIZAÇÃO E ENVIO DE DOCUMENTOS (PDF) ---
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
      Alert.alert('Ficheiro Ausente', 'Por favor, anexe o ficheiro PDF com toda a documentação reunida.');
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

      Alert.alert(
        'Processo Submetido! 🎉',
        'A sua documentação foi enviada com sucesso para análise técnica da Direção da Educação.'
      );
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
            Para abrir e legalizar uma escola privada ou público-privada em Angola, o processo é regulado pelo{' '}
            <Text style={{ fontWeight: 'bold' }}>Decreto Presidencial n.º 37/23</Text> (Regime Jurídico das Instituições Privadas de Educação).
          </Text>
        </View>

        <Text style={styles.secaoFormHeader}>1. Documentos Jurídicos da Entidade Promotora</Text>
        <View style={styles.boxRequisitos}>
          <Text style={styles.itemRequisito}>• Certidão de Registo Comercial ou Pacto Social da empresa promotora.</Text>
          <Text style={styles.itemRequisito}>• Certificado de Admissibilidade emitido pelo Guiché Único da Empresa (GUE).</Text>
          <Text style={styles.itemRequisito}>• Número de Identificação Fiscal (NIF) da pessoa coletiva.</Text>
          <Text style={styles.itemRequisito}>• Cópia do Bilhete de Identidade (B.I.) dos promotores ou investidores.</Text>
          <Text style={styles.itemRequisito}>• Registo Criminal atualizado dos promotores.</Text>
        </View>

        <Text style={styles.secaoFormHeader}>2. Documentação Pedagógica e Administrativa</Text>
        <View style={styles.boxRequisitos}>
          <Text style={styles.itemRequisito}>• Requerimento dirigido à entidade licenciadora (Administrador Municipal ou Governador Provincial).</Text>
          <Text style={styles.itemRequisito}>• Projeto Educativo da Instituição (visão, metas e objetivos pedagógicos).</Text>
          <Text style={styles.itemRequisito}>• Regulamento Interno da escola.</Text>
          <Text style={styles.itemRequisito}>• Planos de Estudos e Programas Curriculares em conformidade com o MED.</Text>
          <Text style={styles.itemRequisito}>• Mapa de pessoal docente/administrativo, horários e certificados dos professores.</Text>
          <Text style={styles.itemRequisito}>• Proposta do Preçário (tabela de propinas e comparticipações familiares).</Text>
        </View>

        <Text style={styles.secaoFormHeader}>3. Documentos Técnicos da Infraestrutura</Text>
        <View style={styles.boxRequisitos}>
          <Text style={styles.itemRequisito}>• Título de propriedade do imóvel ou Contrato de Arrendamento Comercial.</Text>
          <Text style={styles.itemRequisito}>• Planta de arquitetura aprovada pela Administração Municipal.</Text>
          <Text style={styles.itemRequisito}>• Parecer das Autoridades de Saúde (condições de higiene e habitabilidade).</Text>
          <Text style={styles.itemRequisito}>• Licença de Utilização / Alvará de Habitabilidade.</Text>
          <Text style={styles.itemRequisito}>• Certificado do Serviço de Proteção Civil e Bombeiros (segurança contra incêndios).</Text>
        </View>

        <View style={styles.boxEnvioPdf}>
          <Text style={styles.tituloBoxEnvio}>📤 Submeter Processo de Legalização</Text>
          <Text style={styles.descBoxEnvio}>
            Reúna todos os documentos listados acima num único ficheiro PDF e faça o envio para análise:
          </Text>

          <Text style={styles.label}>Nome da Escola / Instituição *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Colégio Futuro do Saber"
            value={nomeEscola}
            onChangeText={setNomeEscola}
          />

          <Text style={styles.label}>Número de Telefone para Contacto *</Text>
          <TextInput
            style={styles.input}
            placeholder="+244 9XX XXX XXX"
            keyboardType="phone-pad"
            value={contacto}
            onChangeText={setContacto}
          />

          <TouchableOpacity style={styles.btnSelecionarPdf} onPress={selecionarPdf}>
            <Text style={styles.txtSelecionarPdf}>
              {ficheiroPdf ? `📄 Ficheiro: ${ficheiroPdf.name}` : '📎 Selecionar Ficheiro PDF com Documentos'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnEnviarProcesso} onPress={enviarProcesso} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.txtEnviarProcesso}>SUBMETER PROCESSO COMPLETO</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// --- TELA DEDICADA: QUADRO DE PUBLICIDADES ---
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

// --- FORMULÁRIO DE CADASTRAMENTO DE INSTITUIÇÃO ---
function FormCadastramentoInstituicao({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [localizacao, setLocalizacao] = useState('');
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
      {
        nome: nome.trim(),
        logo_url: fotoUrl || '',
        localizacao: localizacao.trim(),
        nif: numeroInst.trim(),
        email: email.trim(),
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
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Cadastramento de Instituição</Text>
      </View>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Instituto Politécnico" />

      <Text style={styles.label}>Número da Instituição *</Text>
      <TextInput style={styles.input} value={numeroInst} onChangeText={setNumeroInst} placeholder="Ex: 929500600" />

      <Text style={styles.label}>Email *</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="contacto@escola.ao" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Instituição</Text>}
      </TouchableOpacity>
    </ScrollView>
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

      <ScrollView style={styles.homeContainer} contentContainerStyle={{ padding: 16 }}>
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

        {/* CARROSSEL DE PUBLICIDADE NO FINAL DA HOME */}
        <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
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
  descBoxEnvio: { fontSize: 13, color: '#64748b', marginBottom: 14 },
  btnSelecionarPdf: { backgroundColor: '#f1f5f9', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', marginVertical: 12 },
  txtSelecionarPdf: { color: '#1e293b', fontWeight: '600', fontSize: 13 },
  btnEnviarProcesso: { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  txtEnviarProcesso: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },

  cardPublicidade: { borderRadius: 20, padding: 18, marginTop: 12, marginBottom: 24, elevation: 3 },
  badgePatrocinado: { backgroundColor: 'rgba(255, 255, 255, 0.25)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, marginBottom: 12 },
  txtBadgePatrocinado: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  tituloPublicidade: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  corpoPublicidade: { fontSize: 14, color: '#e0e7ff', lineHeight: 22, marginBottom: 14 },
  btnLigarPub: { backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 12, borderRadius: 12 },
  rodapePublicidade: { fontSize: 13, color: '#c7d2fe', lineHeight: 18 },
  telefonePublicidade: { fontSize: 15, fontWeight: 'bold', color: '#fbbf24' },

  secaoTitulo: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  secaoSubtitulo: { fontSize: 14, color: '#64748b', marginBottom: 18 },

  cardMenuImageStyle: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardEmoji: { fontSize: 32, marginBottom: 10 },
  cardMenuTitulo: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  cardMenuDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },

  inputBusca: { height: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 14, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  cardConsulta: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  nomeAlunoConsulta: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  detalheCurso: { fontSize: 13, color: '#64748b', marginTop: 2 },
  topBar: { height: 50, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },

  formContainer: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  formHeader: { marginBottom: 15 },
  btnVoltarHeader: { paddingVertical: 6, marginBottom: 4 },
  txtVoltarHeader: { color: '#1e40af', fontWeight: '600', fontSize: 13 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  secaoFormHeader: { fontSize: 15, fontWeight: 'bold', color: '#1e40af', marginTop: 18, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4, marginTop: 10 },
  input: { height: 42, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  btnSalvar: { backgroundColor: '#0f172a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 30 },
  txtSalvar: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});
