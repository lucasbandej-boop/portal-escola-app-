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

// --- MODAL DE AUTENTICAÇÃO ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmeter = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha o e-mail e a palavra-passe.');
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
          Alert.alert('Aviso', error.message || 'Falha ao autenticar.');
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
          Alert.alert('Atenção', error.message || 'Falha ao criar conta.');
        } else {
          Alert.alert('Sucesso', 'Conta criada com sucesso!');
          onLoginSucesso(data?.user || { email: email.trim() });
        }
      }
      onClose();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha na operação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visivel} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.abaAuthContainer}>
            <TouchableOpacity
              style={[styles.btnAbaAuth, modo === 'login' && styles.btnAbaAuthAtiva]}
              onPress={() => setModo('login')}
            >
              <Text style={[styles.txtAbaAuth, modo === 'login' && styles.txtAbaAuthAtiva]}>Já tenho conta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAbaAuth, modo === 'registro' && styles.btnAbaAuthAtiva]}
              onPress={() => setModo('registro')}
            >
              <Text style={[styles.txtAbaAuth, modo === 'registro' && styles.txtAbaAuthAtiva]}>Criar Conta</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            {modo === 'login'
              ? 'Insira o seu e-mail e palavra-passe para entrar.'
              : 'Preencha os dados abaixo para se cadastrar pela primeira vez.'}
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
                {modo === 'login' ? 'Entrar e Continuar' : 'Criar Conta e Continuar'}
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

// --- TELA DE CONSULTA DE ALUNOS ---
function TelaConsultaAlunos({ onVoltarHome, onNavegarNovoEstudante }) {
  const [busca, setBusca] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  useEffect(() => {
    carregarEstudantes();
  }, []);

  const carregarEstudantes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estudantes')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setAlunos(data || []);
    } catch (err) {
      console.log('Erro ao carregar estudantes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const alunosFiltrados = alunos.filter(item =>
    (item.nome_completo && item.nome_completo.toLowerCase().includes(busca.toLowerCase())) ||
    (item.num_bilhete && item.num_bilhete.toLowerCase().includes(busca.toLowerCase())) ||
    (item.encarregado_nome && item.encarregado_nome.toLowerCase().includes(busca.toLowerCase()))
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
          placeholder="Pesquisar por aluno, BI ou encarregado..."
          placeholderTextColor="#94a3b8"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#0f172a" style={{ marginTop: 20 }} />
        ) : alunosFiltrados.length > 0 ? (
          alunosFiltrados.map((aluno) => (
            <TouchableOpacity
              key={aluno.id}
              style={styles.cardConsulta}
              onPress={() => setAlunoSelecionado(aluno)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.nomeAlunoConsulta}>{aluno.nome_completo}</Text>
                <View style={styles.badgeClasse}>
                  <Text style={styles.txtBadgeClasse}>{aluno.classe_ou_ano || 'Geral'}</Text>
                </View>
              </View>

              <Text style={styles.detalheCurso}>
                Turma: {aluno.turma || 'N/A'} • {aluno.curso || 'Ensino Geral'}
              </Text>

              <View style={styles.divisorCard} />

              <View style={styles.linhaInfo}>
                <Text style={styles.rotuloInfo}>Nº do BI:</Text>
                <Text style={styles.valorInfo}>{aluno.num_bilhete || 'Não informado'}</Text>
              </View>

              <View style={styles.linhaInfo}>
                <Text style={styles.rotuloInfo}>Encarregado:</Text>
                <Text style={styles.valorInfoHighlight}>
                  {aluno.encarregado_nome || 'Não informado'} {aluno.parentesco ? `(${aluno.parentesco})` : ''}
                </Text>
              </View>

              <View style={styles.linhaInfo}>
                <Text style={styles.rotuloInfo}>Contacto:</Text>
                <Text style={styles.valorContacto}>{aluno.encarregado_telefone || 'Não informado'}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#64748b', fontSize: 14 }}>Nenhum estudante registado na base de dados.</Text>
          </View>
        )}
      </ScrollView>

      {/* MODAL FICHA COMPLETA */}
      <Modal visible={alunoSelecionado !== null} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <Text style={{ fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: '#0f172a' }}>
              Ficha do Estudante
            </Text>

            {alunoSelecionado && (
              <ScrollView style={{ paddingVertical: 5 }}>
                <View style={{ alignItems: 'center', marginBottom: 15 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>{alunoSelecionado.nome_completo}</Text>
                  <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 2 }}>Situação: {alunoSelecionado.status || 'Matriculado'}</Text>
                </View>

                <View style={styles.cardInfoModal}>
                  <Text style={styles.tituloSecaoModal}>Dados Académicos</Text>
                  <Text style={styles.itemModal}>Classe: {alunoSelecionado.classe_ou_ano || 'N/A'}</Text>
                  <Text style={styles.itemModal}>Turma: {alunoSelecionado.turma || 'N/A'}</Text>
                  <Text style={styles.itemModal}>Curso: {alunoSelecionado.curso || 'Geral'}</Text>
                  <Text style={styles.itemModal}>Nº BI: {alunoSelecionado.num_bilhete || 'N/A'}</Text>
                </View>

                <View style={[styles.cardInfoModal, { marginTop: 12 }]}>
                  <Text style={styles.tituloSecaoModal}>Encarregado de Educação</Text>
                  <Text style={styles.itemModal}>Nome: {alunoSelecionado.encarregado_nome || 'N/A'}</Text>
                  <Text style={styles.itemModal}>Parentesco: {alunoSelecionado.parentesco || 'N/A'}</Text>
                  <Text style={styles.itemModal}>Contacto: {alunoSelecionado.encarregado_telefone || 'N/A'}</Text>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.btnSalvar} onPress={() => setAlunoSelecionado(null)}>
              <Text style={styles.txtSalvar}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- FORMULÁRIO DE CADASTRAMENTO DE ESTUDANTE ---
function FormCadastramentoEstudante({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [bilhete, setBilhete] = useState('');
  const [classe, setClasse] = useState('');
  const [turma, setTurma] = useState('');
  const [curso, setCurso] = useState('');
  const [encarregadoNome, setEncarregadoNome] = useState('');
  const [encarregadoTel, setEncarregadoTel] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !bilhete.trim() || !classe.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha o Nome, Nº do BI e a Classe.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.from('estudantes').insert([
        {
          nome_completo: nome.trim(),
          num_bilhete: bilhete.trim(),
          classe_ou_ano: classe.trim(),
          turma: turma.trim() || 'A',
          curso: curso.trim() || 'Ensino Geral',
          encarregado_nome: encarregadoNome.trim() || 'Não informado',
          encarregado_telefone: encarregadoTel.trim() || 'Não informado',
          parentesco: parentesco.trim() || 'Encarregado',
          status: 'Matriculado'
        }
      ]);

      if (error) {
        Alert.alert('Erro no Supabase', error.message || 'Erro desconhecido ao salvar');
      } else {
        Alert.alert('Sucesso', 'Estudante cadastrado com sucesso!');
        onConcluir();
      }
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message || 'Falha na requisição.');
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
        <Text style={styles.formTitle}>Cadastramento de Estudante</Text>
      </View>

      <Text style={styles.label}>Nome Completo do Estudante *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: António Manuel Neto" />

      <Text style={styles.label}>Número do BI *</Text>
      <TextInput style={styles.input} value={bilhete} onChangeText={setBilhete} placeholder="000000000LA000" />

      <Text style={styles.label}>Classe / Ano Lectivo *</Text>
      <TextInput style={styles.input} value={classe} onChangeText={setClasse} placeholder="Ex: 10ª Classe" />

      <Text style={styles.label}>Turma</Text>
      <TextInput style={styles.input} value={turma} onChangeText={setTurma} placeholder="Ex: Turma A" />

      <Text style={styles.label}>Curso</Text>
      <TextInput style={styles.input} value={curso} onChangeText={setCurso} placeholder="Ex: Informática de Gestão" />

      <Text style={styles.label}>Nome do Encarregado de Educação</Text>
      <TextInput style={styles.input} value={encarregadoNome} onChangeText={setEncarregadoNome} placeholder="Ex: Manuel NETO" />

      <Text style={styles.label}>Contacto do Encarregado</Text>
      <TextInput style={styles.input} value={encarregadoTel} onChangeText={setEncarregadoTel} placeholder="+244 9XX XXX XXX" keyboardType="phone-pad" />

      <Text style={styles.label}>Grau de Parentesco</Text>
      <TextInput style={styles.input} value={parentesco} onChangeText={setParentesco} placeholder="Ex: Pai, Mãe, Tio" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Estudante</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.txtCancelar}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- FORMULÁRIO DE CADASTRAMENTO DE INSTITUIÇÕES ---
function FormCadastramentoInstituicao({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [diretor, setDiretor] = useState('');
  const [viceDiretor, setViceDiretor] = useState('');
  const [nif, setNif] = useState('');
  const [contacto, setContacto] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !nif.trim() || !contacto.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha o Nome, NIF e Contacto.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.from('instituicoes').insert([
        {
          nome: nome.trim(),
          director: diretor.trim() || 'Direção Geral',
          vice_director: viceDiretor.trim() || 'N/A',
          nif: nif.trim(),
          email: contacto.trim(),
          localizacao: localizacao.trim() || 'Luanda, Angola',
        }
      ]);

      if (error) {
        Alert.alert('Erro no Supabase', error.message || 'Erro ao salvar instituição');
      } else {
        Alert.alert('Sucesso', 'Instituição cadastrada com sucesso!');
        onConcluir();
      }
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message || 'Falha na requisição.');
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
        <Text style={styles.formTitle}>Cadastramento de Instituição</Text>
      </View>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Instituto Politécnico de Viana" />

      <Text style={styles.label}>Diretor *</Text>
      <TextInput style={styles.input} value={diretor} onChangeText={setDiretor} placeholder="Nome do Diretor Geral" />

      <Text style={styles.label}>Vice-Diretor</Text>
      <TextInput style={styles.input} value={viceDiretor} onChangeText={setViceDiretor} placeholder="Nome do Vice-Diretor" />

      <Text style={styles.label}>NIF *</Text>
      <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="000000000XX000" />

      <Text style={styles.label}>Contacto / E-mail *</Text>
      <TextInput style={styles.input} value={contacto} onChangeText={setContacto} placeholder="+244 9XX XXX XXX" />

      <Text style={styles.label}>Localização / Província</Text>
      <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Luanda, Viana" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Instituição</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.txtCancelar}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- FORMULÁRIO DE CADASTRAMENTO DE PROFESSOR ---
function FormCadastramentoProfessor({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [bilhete, setBilhete] = useState('');
  const [areaFormacao, setAreaFormacao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !bilhete.trim() || !areaFormacao.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.from('professores').insert([
        {
          nome_completo: nome.trim(),
          num_bilhete: bilhete.trim(),
          area_formacao: areaFormacao.trim(),
        }
      ]);

      if (error) {
        Alert.alert('Erro no Supabase', error.message || 'Erro ao salvar professor');
      } else {
        Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
        onConcluir();
      }
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message || 'Falha na requisição.');
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
        <Text style={styles.formTitle}>Cadastramento de Professor</Text>
      </View>

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Manuel dos Santos" />

      <Text style={styles.label}>Número do Bilhete *</Text>
      <TextInput style={styles.input} value={bilhete} onChangeText={setBilhete} placeholder="000000000LA000" />

      <Text style={styles.label}>Área de Formação *</Text>
      <TextInput style={styles.input} value={areaFormacao} onChangeText={setAreaFormacao} placeholder="Ex: Licenciado em Matemática" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Professor</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.txtCancelar}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- TELA INICIAL (HOME) ---
function MenuPrincipalHome({ onNavegarCadastramentoInst, onNavegarCadastramentoProf, onNavegarConsultaAlunos, publicidadeLigar }) {
  return (
    <ScrollView style={styles.homeContainer}>
      <View style={styles.homeHeader}>
        <Text style={styles.homeHeaderTitle}>Portal Escolar</Text>
        <TouchableOpacity style={styles.btnLoginTop} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.txtLoginTop}>Área Restrita</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16 }}>
        {/* QUADRO DE PUBLICIDADE PATROCINADA */}
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

        {/* MENU PRINCIPAL CORPORATIVO */}
        <Text style={styles.secaoTitulo}>Painel Geral</Text>
        <Text style={styles.secaoSubtitulo}>Selecione o serviço pretendido:</Text>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarConsultaAlunos} activeOpacity={0.8}>
          <Text style={styles.cardMenuTitulo}>Consulta de Alunos e Encarregados</Text>
          <Text style={styles.cardMenuDesc}>Consulte matrículas, turmas e contactos dos encarregados em tempo real.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarCadastramentoInst} activeOpacity={0.8}>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
          <Text style={styles.cardMenuDesc}>Registo e gestão de instituições de ensino na base de dados.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarCadastramentoProf} activeOpacity={0.8}>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Professores</Text>
          <Text style={styles.cardMenuDesc}>Registo do corpo docente e áreas de lecionação.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- COMPONENTE PRINCIPAL ---
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

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

// --- ESTILOS LIMPOS E DESIGN CORPORATIVO ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  homeContainer: { flex: 1, backgroundColor: '#f8fafc' },
  homeHeader: {
    height: 56,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  homeHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  btnLoginTop: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  txtLoginTop: { color: '#334155', fontWeight: '600', fontSize: 13 },

  cardPublicidade: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  badgePatrocinado: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  txtBadgePatrocinado: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  tituloPublicidade: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  corpoPublicidade: { fontSize: 13, color: '#e0e7ff', lineHeight: 18, marginBottom: 12 },
  btnLigarPub: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 8 },
  rodapePublicidade: { fontSize: 12, color: '#c7d2fe' },
  telefonePublicidade: { fontSize: 14, fontWeight: 'bold', color: '#fbbf24' },

  secaoTitulo: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  secaoSubtitulo: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  
  cardMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  cardMenuTitulo: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  cardMenuDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },

  inputBusca: { height: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 14, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  
  cardConsulta: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  nomeAlunoConsulta: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  badgeClasse: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  txtBadgeClasse: { fontSize: 11, color: '#1d4ed8', fontWeight: '600' },
  detalheCurso: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  divisorCard: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rotuloInfo: { fontSize: 12, color: '#64748b', width: 90, fontWeight: '500' },
  valorInfo: { fontSize: 13, color: '#334155', fontWeight: '600' },
  valorInfoHighlight: { fontSize: 13, color: '#1e40af', fontWeight: '600' },
  valorContacto: { fontSize: 13, color: '#0f766e', fontWeight: '600' },

  cardInfoModal: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  tituloSecaoModal: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  itemModal: { fontSize: 13, color: '#334155', marginBottom: 4 },

  topBar: { height: 50, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 10, padding: 20 },
  abaAuthContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 6, padding: 3, marginBottom: 12 },
  btnAbaAuth: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 4 },
  btnAbaAuthAtiva: { backgroundColor: '#ffffff' },
  txtAbaAuth: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  txtAbaAuthAtiva: { color: '#0f172a' },
  modalSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 15, textAlign: 'center' },

  formContainer: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  formHeader: { marginBottom: 15 },
  btnVoltarHeader: { paddingVertical: 6, marginBottom: 4 },
  txtVoltarHeader: { color: '#1e40af', fontWeight: '600', fontSize: 13 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4, marginTop: 10 },
  input: { height: 42, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 12, backgroundColor: '#ffffff', fontSize: 14, color: '#0f172a' },
  btnSalvar: { backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 20 },
  txtSalvar: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  btnCancelar: { backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  txtCancelar: { color: '#475569', fontWeight: '600', fontSize: 14 },
});
