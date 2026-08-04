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

const INSTITUICAO_ID_PADRAO = 1;

// --- MODAL DE LOGIN ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      alert('Preencha o e-mail e a palavra-passe.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) throw error;
      alert('Login efetuado com sucesso!');
      onLoginSucesso(data.user);
      onClose();
    } catch (err) {
      alert('Erro no Login: ' + (err.message || 'Credenciais inválidas.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visivel} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeaderTitle}>🔑 Entrar no Sistema</Text>
          <Text style={styles.modalSubtitle}>Aceda com as suas credenciais de Administrador/Gestor</Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu.email@escola.ao"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Palavra-passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.btnSalvar} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Entrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
            <Text style={styles.txtCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- MODAL / TELA DE CADASTRO DE INSTITUIÇÃO ---
function FormInstituicao({ instituicaoExistente, onSucesso, onCancelar }) {
  const [nome, setNome] = useState(instituicaoExistente?.nome || '');
  const [categoria, setCategoria] = useState(instituicaoExistente?.categoria_primaria || 'Ensino Técnico');
  const [localizacao, setLocalizacao] = useState(instituicaoExistente?.localizacao || 'Viana, Luanda');
  const [email, setEmail] = useState(instituicaoExistente?.email || '');
  const [director, setDirector] = useState(instituicaoExistente?.director || '');
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      alert('Digite o nome da instituição.');
      return;
    }
    setLoading(true);
    try {
      const dados = {
        nome: nome.trim(),
        categoria_primaria: categoria.trim(),
        localizacao: localizacao.trim(),
        email: email.trim(),
        director: director.trim(),
      };

      if (instituicaoExistente?.id) {
        const { error } = await supabase.from('instituicoes').update(dados).eq('id', instituicaoExistente.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('instituicoes').insert([dados]);
        if (error) throw error;
      }

      alert('Instituição gravada com sucesso!');
      onSucesso();
    } catch (err) {
      alert('Erro ao guardar instituição: ' + err.message);
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
        <Text style={styles.formTitle}>🏫 Cadastramento de Instituição</Text>
      </View>

      <Text style={styles.label}>Nome da Escola / Instituto *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Instituto Politécnico de Viana" />

      <Text style={styles.label}>Categoria / Nível</Text>
      <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} placeholder="Ex: Ensino Técnico / Secundário" />

      <Text style={styles.label}>Localização / Endereço</Text>
      <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Viana, Luanda" />

      <Text style={styles.label}>E-mail de Contacto</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="contacto@escola.ao" keyboardType="email-address" />

      <Text style={styles.label}>Diretor Geral / Responsável</Text>
      <TextInput style={styles.input} value={director} onChangeText={setDirector} placeholder="Ex: Prof. Manuel dos Santos" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Guardar Instituição</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.txtCancelar}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- TELA PRINCIPAL (HOME) ---
function MenuPrincipalHome({ onNavegar, onAbrirLogin, usuarioLogado }) {
  const LIGAR_PUBLICIDADE = () => {
    Linking.openURL('tel:929500600');
  };

  return (
    <ScrollView style={styles.homeContainer}>
      <View style={styles.homeHeader}>
        <Text style={styles.homeHeaderTitle}>Portal Escolar 🎓</Text>
        <TouchableOpacity style={styles.btnLoginTop} onPress={onAbrirLogin}>
          <Text style={styles.txtLoginTop}>
            {usuarioLogado ? `👤 ${usuarioLogado.email.split('@')[0]}` : '🔑 Entrar / Login'}
          </Text>
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
          <TouchableOpacity onPress={LIGAR_PUBLICIDADE} style={styles.btnLigarPub}>
            <Text style={styles.rodapePublicidade}>
              Para mais informações ligue no número abaixo:{'\n'}
              <Text style={styles.telefonePublicidade}>📞 929500600 (Clique para Ligar)</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* MENU PRINCIPAL */}
        <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>
        <Text style={styles.secaoSubtitulo}>Selecione a opção desejada para navegar:</Text>

        {/* OPÇÃO 1: Cadastramento de Instituições */}
        <TouchableOpacity style={styles.cardMenu} onPress={() => onNavegar('cadastro_inst')}>
          <Text style={styles.emojiCard}>🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
          <Text style={styles.cardMenuDesc}>
            Registe a sua escola para gerir turmas, alunos e professores.
          </Text>
        </TouchableOpacity>

        {/* OPÇÃO 2: Consulta de Alunos e Encarregados */}
        <TouchableOpacity style={styles.cardMenu} onPress={() => onNavegar('perfil', 'estudantes')}>
          <Text style={styles.emojiCard}>🔍</Text>
          <Text style={styles.cardMenuTitulo}>Consulta de Alunos e Encarregados</Text>
          <Text style={styles.cardMenuDesc}>
            Consulte o estado de matrícula, encarregados e dados de estudantes.
          </Text>
        </TouchableOpacity>

        {/* OPÇÃO 3: Cadastramento de Professores */}
        <TouchableOpacity style={styles.cardMenu} onPress={() => onNavegar('cadastro_prof')}>
          <Text style={styles.emojiCard}>👨‍🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Professores</Text>
          <Text style={styles.cardMenuDesc}>
            Registe-se como docente ou adicione professores à plataforma.
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- MODAL BOLETIM ---
function ModalNotasFaltas({ visivel, estudante, modoAdmin, onClose }) {
  const [disciplina, setDisciplina] = useState('');
  const [trimestre, setTrimestre] = useState('1º Trimestre');
  const [nota, setNota] = useState('');
  const [faltas, setFaltas] = useState('0');
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (estudante && visivel) carregarNotas();
  }, [estudante, visivel]);

  const carregarNotas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('estudante_id', estudante.id);

      if (error) throw error;
      setHistorico(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarNota = async () => {
    if (!disciplina.trim() || !nota.trim()) {
      alert('Preencha a disciplina e a nota.');
      return;
    }
    const numNota = parseFloat(nota.replace(',', '.'));
    try {
      const { error } = await supabase.from('avaliacoes').insert([
        {
          estudante_id: estudante.id,
          disciplina: disciplina.trim(),
          trimestre,
          nota: numNota,
          faltas: parseInt(faltas) || 0,
        },
      ]);
      if (error) throw error;
      setDisciplina('');
      setNota('');
      carregarNotas();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  if (!estudante) return null;

  return (
    <Modal visible={visivel} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Boletim Escolar</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: 'red', fontWeight: 'bold' }}>✕ Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 15 }}>
          <View style={styles.fichaResumo}>
            <Text style={styles.nomeEstudanteBoletim}>{estudante.nome_completo}</Text>
            <Text style={styles.subFicha}>BI: {estudante.num_bilhete} | Encarregado: {estudante.encarregado_nome || 'Não registado'}</Text>
          </View>

          {modoAdmin && (
            <View style={styles.cardFormNota}>
              <Text style={styles.subTituloSecao}>➕ Lançar Nota</Text>
              <TextInput style={styles.input} placeholder="Disciplina" value={disciplina} onChangeText={setDisciplina} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Nota (0-20)" keyboardType="numeric" value={nota} onChangeText={setNota} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Faltas" keyboardType="numeric" value={faltas} onChangeText={setFaltas} />
              </View>
              <TouchableOpacity style={styles.btnSalvarNota} onPress={handleSalvarNota}>
                <Text style={styles.txtSalvar}>Guardar Nota</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.subTituloSecao, { marginTop: 15 }]}>Notas Registadas</Text>
          {loading ? (
            <ActivityIndicator />
          ) : (
            historico.map((item) => (
              <View key={item.id} style={styles.itemNota}>
                <Text style={{ fontWeight: 'bold' }}>{item.disciplina} ({item.trimestre})</Text>
                <Text style={{ color: item.nota >= 10 ? 'green' : 'red', fontWeight: 'bold' }}>Nota: {item.nota}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// --- CADASTRO DE ALUNOS & PROFESSORES ---
function CadastroPessoas({ tipoInicial, onSucesso, onCancelar }) {
  const [tipo, setTipo] = useState(tipoInicial || 'estudante');
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [bilhete, setBilhete] = useState('');
  const [encarregado, setEncarregado] = useState('');
  const [telefoneEncarregado, setTelefoneEncarregado] = useState('');
  const [turma, setTurma] = useState('');
  const [curso, setCurso] = useState('');
  const [disciplina, setDisciplina] = useState('');

  const handleSalvar = async () => {
    if (!nome.trim() || !bilhete.trim()) {
      alert('Preencha o nome e o BI.');
      return;
    }

    setLoading(true);
    try {
      if (tipo === 'estudante') {
        const { error } = await supabase.from('estudantes').insert([
          {
            instituicao_id: INSTITUICAO_ID_PADRAO,
            nome_completo: nome,
            num_bilhete: bilhete,
            encarregado_nome: encarregado,
            encarregado_telefone: telefoneEncarregado,
            turma,
            curso,
          },
        ]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('professores').insert([
          {
            instituicao_id: INSTITUICAO_ID_PADRAO,
            nome_completo: nome,
            num_bilhete: bilhete,
            disciplina,
          },
        ]);
        if (error) throw error;
      }

      alert(`${tipo === 'estudante' ? 'Aluno' : 'Professor'} registado com sucesso!`);
      onSucesso();
    } catch (err) {
      alert('Erro: ' + err.message);
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
        <Text style={styles.formTitle}>Registar {tipo === 'estudante' ? 'Aluno / Encarregado' : 'Professor'}</Text>
      </View>

      <View style={styles.abaTipo}>
        <TouchableOpacity style={[styles.btnTipo, tipo === 'estudante' && styles.btnTipoAtivo]} onPress={() => setTipo('estudante')}>
          <Text style={[styles.txtTipo, tipo === 'estudante' && styles.txtTipoAtivo]}>Aluno</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnTipo, tipo === 'professor' && styles.btnTipoAtivo]} onPress={() => setTipo('professor')}>
          <Text style={[styles.txtTipo, tipo === 'professor' && styles.txtTipoAtivo]}>Professor</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome do registado" />

      <Text style={styles.label}>Número do BI *</Text>
      <TextInput style={styles.input} value={bilhete} onChangeText={setBilhete} placeholder="000000000LA000" />

      {tipo === 'estudante' ? (
        <>
          <Text style={styles.label}>Nome do Encarregado de Educação</Text>
          <TextInput style={styles.input} value={encarregado} onChangeText={setEncarregado} placeholder="Nome do Pai/Mãe/Tutor" />

          <Text style={styles.label}>Telefone do Encarregado</Text>
          <TextInput style={styles.input} value={telefoneEncarregado} onChangeText={setTelefoneEncarregado} placeholder="9XX XXX XXX" keyboardType="phone-pad" />

          <Text style={styles.label}>Curso</Text>
          <TextInput style={styles.input} value={curso} onChangeText={setCurso} placeholder="Ex: Informática" />

          <Text style={styles.label}>Turma</Text>
          <TextInput style={styles.input} value={turma} onChangeText={setTurma} placeholder="Ex: A" />
        </>
      ) : (
        <>
          <Text style={styles.label}>Disciplina que Leciona</Text>
          <TextInput style={styles.input} value={disciplina} onChangeText={setDisciplina} placeholder="Ex: Matemática" />
        </>
      )}

      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Guardar Registo</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.txtCancelar}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- PERFIL DA INSTITUIÇÃO E LISTAS ---
function PerfilInstituicao({ abaInicial, onVoltarHome, onNavegarCadastro }) {
  const [estudantes, setEstudantes] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState(abaInicial || 'estudantes');
  const [loading, setLoading] = useState(true);
  const [estudanteNota, setEstudanteNota] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    try {
      const { data: est } = await supabase.from('estudantes').select('*');
      const { data: prof } = await supabase.from('professores').select('*');
      setEstudantes(est || []);
      setProfessores(prof || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.profileContainer}>
      <ModalNotasFaltas visivel={!!estudanteNota} estudante={estudanteNota} modoAdmin={true} onClose={() => setEstudanteNota(null)} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={onVoltarHome}>
          <Text style={{ color: '#1877f2', fontWeight: 'bold' }}>← Menu Principal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnCadastrarTop} onPress={onNavegarCadastro}>
          <Text style={styles.btnCadastrarTopText}>+ Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.abasContainer}>
        <TouchableOpacity style={[styles.aba, abaAtiva === 'estudantes' && styles.abaAtiva]} onPress={() => setAbaAtiva('estudantes')}>
          <Text style={[styles.txtAba, abaAtiva === 'estudantes' && styles.txtAbaAtiva]}>Estudantes & Encarregados ({estudantes.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.aba, abaAtiva === 'professores' && styles.abaAtiva]} onPress={() => setAbaAtiva('professores')}>
          <Text style={[styles.txtAba, abaAtiva === 'professores' && styles.txtAbaAtiva]}>Professores ({professores.length})</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.conteudo}>
        {loading ? (
          <ActivityIndicator color="#1877f2" />
        ) : abaAtiva === 'estudantes' ? (
          estudantes.map((est) => (
            <View key={est.id} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listNome}>{est.nome_completo}</Text>
                <Text style={styles.listDetalhe}>Curso: {est.curso || 'Geral'} | Turma: {est.turma || 'N/A'}</Text>
                <Text style={styles.listDetalhe}>👨‍👦 Encarregado: {est.encarregado_nome || 'Não informado'} ({est.encarregado_telefone || 'S/Tel'})</Text>
                <TouchableOpacity style={styles.btnVerBoletim} onPress={() => setEstudanteNota(est)}>
                  <Text style={styles.txtVerBoletim}>📊 Abrir Boletim</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          professores.map((prof) => (
            <View key={prof.id} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listNome}>{prof.nome_completo}</Text>
                <Text style={styles.listDetalhe}>Disciplina: {prof.disciplina || 'Geral'}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  const [tela, setTela] = useState('home');
  const [modalLoginVisivel, setModalLoginVisivel] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [tipoCadastro, setTipoCadastro] = useState('estudante');

  const navegar = (destino, subAba = 'estudantes') => {
    if (destino === 'cadastro_inst') setTela('cadastro_inst');
    else if (destino === 'cadastro_prof') {
      setTipoCadastro('professor');
      setTela('cadastro_pessoas');
    } else if (destino === 'perfil') setTela('perfil');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ModalLogin
        visivel={modalLoginVisivel}
        onClose={() => setModalLoginVisivel(false)}
        onLoginSucesso={(user) => setUsuarioLogado(user)}
      />

      {tela === 'home' && (
        <MenuPrincipalHome
          onNavegar={navegar}
          onAbrirLogin={() => setModalLoginVisivel(true)}
          usuarioLogado={usuarioLogado}
        />
      )}

      {tela === 'cadastro_inst' && (
        <FormInstituicao
          onSucesso={() => setTela('home')}
          onCancelar={() => setTela('home')}
        />
      )}

      {tela === 'cadastro_pessoas' && (
        <CadastroPessoas
          tipoInicial={tipoCadastro}
          onSucesso={() => setTela('perfil')}
          onCancelar={() => setTela('home')}
        />
      )}

      {tela === 'perfil' && (
        <PerfilInstituicao
          onVoltarHome={() => setTela('home')}
          onNavegarCadastro={() => setTela('cadastro_pessoas')}
        />
      )}
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  homeContainer: { flex: 1 },
  homeHeader: { height: 60, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#edf2f7' },
  homeHeaderTitle: { fontSize: 18, fontWeight: 'bold' },
  btnLoginTop: { backgroundColor: '#ebf8ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  txtLoginTop: { color: '#2b6cb0', fontWeight: 'bold', fontSize: 12 },
  cardPublicidade: { backgroundColor: '#1d4ed8', borderRadius: 16, padding: 16, marginBottom: 20 },
  badgePatrocinado: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  txtBadgePatrocinado: { color: '#fff', fontSize: 11, fontWeight: '600' },
  tituloPublicidade: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  corpoPublicidade: { fontSize: 13, color: '#e0e7ff', lineHeight: 18, marginBottom: 12 },
  btnLigarPub: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 8 },
  rodapePublicidade: { fontSize: 12, color: '#c7d2fe' },
  telefonePublicidade: { fontSize: 14, fontWeight: 'bold', color: '#fbbf24' },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  secaoSubtitulo: { fontSize: 13, color: '#64748b', marginBottom: 14 },
  cardMenu: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  emojiCard: { fontSize: 28, marginBottom: 8 },
  cardMenuTitulo: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cardMenuDesc: { fontSize: 12, color: '#64748b', marginTop: 4 },
  formContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
  formHeader: { marginBottom: 15 },
  btnVoltarHeader: { paddingVertical: 6 },
  txtVoltarHeader: { color: '#1877f2', fontWeight: 'bold' },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#050505', marginTop: 10, marginBottom: 4 },
  input: { height: 42, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f9f9f9' },
  btnSalvar: { backgroundColor: '#1877f2', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  txtSalvar: { color: '#fff', fontWeight: 'bold' },
  btnCancelar: { backgroundColor: '#e4e6eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  txtCancelar: { color: '#050505', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalHeaderTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: '#666', marginBottom: 15 },
  abaTipo: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  btnTipo: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1877f2', alignItems: 'center' },
  btnTipoAtivo: { backgroundColor: '#1877f2' },
  txtTipo: { color: '#1877f2', fontWeight: 'bold' },
  txtTipoAtivo: { color: '#fff' },
  profileContainer: { flex: 1, backgroundColor: '#f0f2f5' },
  topBar: { height: 50, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderColor: '#ddd' },
  btnCadastrarTop: { backgroundColor: '#1877f2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnCadastrarTopText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  abasContainer: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  aba: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  abaAtiva: { borderBottomWidth: 3, borderBottomColor: '#1877f2' },
  txtAba: { fontWeight: '600', color: '#666', fontSize: 12 },
  txtAbaAtiva: { color: '#1877f2', fontWeight: 'bold' },
  conteudo: { padding: 15 },
  listItem: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  listNome: { fontSize: 14, fontWeight: 'bold' },
  listDetalhe: { fontSize: 12, color: '#666', marginTop: 2 },
  btnVerBoletim: { marginTop: 6, backgroundColor: '#e7f3ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  txtVerBoletim: { color: '#1877f2', fontSize: 11, fontWeight: 'bold' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  fichaResumo: { backgroundColor: '#e7f3ff', padding: 12, borderRadius: 8, marginBottom: 10 },
  nomeEstudanteBoletim: { fontSize: 15, fontWeight: 'bold' },
  subFicha: { fontSize: 12, color: '#444' },
  cardFormNota: { backgroundColor: '#f7f8fa', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  subTituloSecao: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  btnSalvarNota: { backgroundColor: '#28a745', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  itemNota: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 10, borderRadius: 6, marginBottom: 4, borderBottomWidth: 1, borderColor: '#eee' }
});
