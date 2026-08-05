import React, { useState, useEffect, useRef } from 'react';
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

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- MODAL DE LOGIN E CONFIRMAÇÃO DE CÓDIGO (OTP) ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login'); // 'login', 'registro', 'verificar_codigo'
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

// --- FORMULÁRIO DE CADASTRAMENTO DE INSTITUIÇÃO ---
function FormCadastramentoInstituicao({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [numeroInst, setNumeroInst] = useState('');
  const [email, setEmail] = useState('');
  const [eventos, setEventos] = useState('');
  const [classes, setClasses] = useState('');
  const [pauta, setPauta] = useState('');
  const [convocatoria, setConvocatoria] = useState('');
  const [alunosDestaque, setAlunosDestaque] = useState('');
  const [guiaAluno, setGuiaAluno] = useState('');
  const [planoEstudo, setPlanoEstudo] = useState('');
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
    if (!nome.trim() || !numeroInst.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha o Nome da Instituição, Número e E-mail.');
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
        sobre: JSON.stringify({
          eventos: eventos.trim(),
          classes: classes.trim(),
          pauta: pauta.trim(),
          convocatoria: convocatoria.trim(),
          alunos_destaque: alunosDestaque.trim(),
          guia_aluno: guiaAluno.trim(),
          plano_estudo: planoEstudo.trim()
        })
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

      <View style={styles.fotoSection}>
        <TouchableOpacity onPress={escolherFoto} style={styles.fotoContainer}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.fotoPreview} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Text style={styles.fotoTxt}>📷 Imagem da Instituição</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.secaoFormHeader}>📌 Dados Principais</Text>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Instituto Politécnico de Viana" />

      <Text style={styles.label}>Número da Instituição *</Text>
      <TextInput style={styles.input} value={numeroInst} onChangeText={setNumeroInst} placeholder="Ex: 929500600 ou Nº NIF" keyboardType="numeric" />

      <Text style={styles.label}>Email *</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="contacto@escola.ao" keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Localização</Text>
      <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Viana, Luanda" />

      <Text style={styles.secaoFormHeader}>📚 Informações Académicas e Eventos</Text>

      <Text style={styles.label}>➡️ Classes</Text>
      <TextInput style={styles.input} value={classes} onChangeText={setClasses} placeholder="Ex: 7ª à 13ª Classe, Ensino Geral e Técnico" />

      <Text style={styles.label}>➡️ Plano de Estudo</Text>
      <TextInput style={styles.inputArea} value={planoEstudo} onChangeText={setPlanoEstudo} placeholder="Descreva a grelha curricular ou cursos oferecidos..." multiline />

      <Text style={styles.label}>➡️ Guia do Aluno</Text>
      <TextInput style={styles.inputArea} value={guiaAluno} onChangeText={setGuiaAluno} placeholder="Normas, regulamento interno e orientações..." multiline />

      <Text style={styles.label}>➡️ Pauta</Text>
      <TextInput style={styles.inputArea} value={pauta} onChangeText={setPauta} placeholder="Informações de publicação de notas e exames..." multiline />

      <Text style={styles.label}>➡️ Convocatória</Text>
      <TextInput style={styles.inputArea} value={convocatoria} onChangeText={setConvocatoria} placeholder="Reuniões de encarregados, comunicados gerais..." multiline />

      <Text style={styles.label}>➡️ Eventos</Text>
      <TextInput style={styles.inputArea} value={eventos} onChangeText={setEventos} placeholder="Feiras de ciências, eventos desportivos, palestras..." multiline />

      <Text style={styles.label}>➡️ Alunos em Destaque</Text>
      <TextInput style={styles.inputArea} value={alunosDestaque} onChangeText={setAlunosDestaque} placeholder="Nomes dos melhores estudantes, olimpíadas e méritos..." multiline />

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

// --- FORMULÁRIOS RESTANTES ---
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
  const scrollRef = useRef(null);

  const irParaPublicidade = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.headerRowHome}>
        <Text style={styles.homeTitleHeader}>Portal Escola</Text>
        <TouchableOpacity style={styles.btnHeaderPub} onPress={irParaPublicidade}>
          <Text style={styles.txtHeaderPub}>📢 Publicidade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={styles.homeContainer} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>
        <Text style={styles.secaoSubtitulo}>Selecione a opção desejada para navegar:</Text>

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

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoProf}>
          <Text style={styles.cardEmoji}>👨‍🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Professores</Text>
          <Text style={styles.cardMenuDesc}>
            Registe-se como docente independente na plataforma.
          </Text>
        </TouchableOpacity>

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
      </ScrollView>
    </SafeAreaView>
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

  cardPublicidade: { backgroundColor: '#1d4ed8', borderRadius: 20, padding: 18, marginTop: 10, marginBottom: 30, elevation: 4 },
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
  valorInfoHighlight: { fontSize: 13, color: '#1e40af', fontWeight: '600', marginTop: 4 },
  topBar: { height: 50, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },

  formContainer: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  formHeader: { marginBottom: 15 },
  btnVoltarHeader: { paddingVertical: 6, marginBottom: 4 },
  txtVoltarHeader: { color: '#1e40af', fontWeight: '600', fontSize: 13 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  secaoFormHeader: { fontSize: 15, fontWeight: 'bold', color: '#1e40af', marginTop: 18, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  fotoSection: { alignItems: 'center', marginVertical: 10 },
  fotoContainer: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden' },
  fotoPreview: { width: '100%', height: '100%' },
  fotoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', padding: 8 },
  fotoTxt: { fontSize: 11, color: '#64748b', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4, marginTop: 10 },
  input: { height: 42, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  inputArea: { height: 75, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 12, paddingTop: 8, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a', textAlignVertical: 'top' },
  btnSalvar: { backgroundColor: '#0f172a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 30 },
  txtSalvar: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});
