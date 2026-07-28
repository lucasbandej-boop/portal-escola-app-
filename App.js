import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './supabase';

const Stack = createNativeStackNavigator();

// -------------------------------------------------------------
// 1. TELA DE LOGIN
// -------------------------------------------------------------
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Erro', 'Insira o e-mail da instituição.');
      return;
    }

    setCarregando(true);
    // Procura a escola na base de dados pelo e-mail
    const { data: escola, error } = await supabase
      .from('escolas')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    setCarregando(false);

    if (error || !escola) {
      Alert.alert('Erro', 'Instituição não encontrada com este e-mail. Cadastre a sua instituição.');
      return;
    }

    if (!escola.aprovado) {
      navigation.replace('AguardandoAprovacao', { dadosEscola: escola });
    } else {
      navigation.replace('PainelEscola', { escola });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.tituloApp}>Portal Escolar</Text>
      <Text style={styles.subtitulo}>Acede à conta da tua instituição</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail Oficial da Escola"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={styles.botaoPrincipal} 
        onPress={handleLogin}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Entrar no Painel</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.botaoCriarEscola} 
        onPress={() => navigation.navigate('CadastroEscola')}
      >
        <Text style={styles.textoCriarEscola}>➕ Cadastrar Nova Instituição</Text>
      </TouchableOpacity>
    </View>
  );
}

// -------------------------------------------------------------
// 2. TELA DE CADASTRAMENTO DA INSTITUIÇÃO
// -------------------------------------------------------------
function CadastroEscolaScreen({ navigation }) {
  const [nomeEscola, setNomeEscola] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleCadastrar = async () => {
    if (!nomeEscola || !email || !nif) {
      Alert.alert('Erro', 'Preencha o Nome da Escola, NIF e E-mail Oficial.');
      return;
    }

    setCarregando(true);

    const { data, error } = await supabase
      .from('escolas')
      .insert([
        { 
          nome: nomeEscola, 
          nif: nif, 
          email: email.trim().toLowerCase(), 
          localizacao: localizacao,
          aprovado: true // Definido como true para poderes testar de imediato
        }
      ])
      .select()
      .single();

    setCarregando(false);

    if (error) {
      Alert.alert('Erro no Registo', error.message);
      return;
    }

    Alert.alert('Sucesso', 'Instituição registada com sucesso!');
    navigation.replace('PainelEscola', { escola: data });
  };

  return (
    <ScrollView contentContainerStyle={styles.containerScroll}>
      <Text style={styles.tituloForm}>Criar Página da Instituição</Text>
      <Text style={styles.subtituloForm}>Insira os dados oficiais da instituição.</Text>

      <Text style={styles.labelInput}>Nome da Escola *</Text>
      <TextInput style={styles.input} placeholder="Ex: Complexo Escolar..." value={nomeEscola} onChangeText={setNomeEscola} />

      <Text style={styles.labelInput}>NIF / Licença Oficial *</Text>
      <TextInput style={styles.input} placeholder="Ex: 5000123456" value={nif} onChangeText={setNif} />

      <Text style={styles.labelInput}>E-mail Oficial *</Text>
      <TextInput style={styles.input} placeholder="secretaria@escola.ao" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.labelInput}>Localização</Text>
      <TextInput style={styles.input} placeholder="Ex: Viana, Luanda" value={localizacao} onChangeText={setLocalizacao} />

      <TouchableOpacity style={styles.botaoPrincipal} onPress={handleCadastrar} disabled={carregando}>
        {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotao}>Registar na Nuvem</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// -------------------------------------------------------------
// 3. TELA DE AVALIAÇÃO
// -------------------------------------------------------------
function AguardandoAprovacaoScreen({ route, navigation }) {
  const { dadosEscola } = route.params || { dadosEscola: { nome: 'Instituição' } };

  return (
    <View style={styles.containerStatus}>
      <View style={styles.iconeStatusBox}>
        <Text style={{ fontSize: 40 }}>⏳</Text>
      </View>
      <Text style={styles.tituloStatus}>Em Processo de Avaliação</Text>
      <Text style={styles.textoStatus}>A submissão de <Text style={{fontWeight:'bold'}}>{dadosEscola.nome}</Text> está a ser analisada.</Text>
      
      <TouchableOpacity 
        style={[styles.botaoPrincipal, { backgroundColor: '#38a169', marginTop: 20 }]} 
        onPress={() => navigation.replace('PainelEscola', { escola: dadosEscola })}
      >
        <Text style={styles.textoBotao}>Entrar no Painel</Text>
      </TouchableOpacity>
    </View>
  );
}

// -------------------------------------------------------------
// 4. PAINEL DA INSTITUIÇÃO (COM SUPABASE REAL)
// -------------------------------------------------------------
function PainelEscolaScreen({ route, navigation }) {
  const { escola } = route.params;
  const [abaAtiva, setAbaAtiva] = useState('lista');
  const [estudantes, setEstudantes] = useState([]);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);

  const [novoNome, setNovoNome] = useState('');
  const [novoNum, setNovoNum] = useState('');
  const [novoCurso, setNovoCurso] = useState('');
  const [cadastrando, setCadastrando] = useState(false);

  // Carregar alunos reais da base de dados
  const buscarAlunos = async () => {
    setCarregandoAlunos(true);
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('escola_id', escola.id)
      .order('created_at', { ascending: false });

    setCarregandoAlunos(false);
    if (!error && data) {
      setEstudantes(data);
    }
  };

  useEffect(() => {
    buscarAlunos();
  }, []);

  const handleAdicionarAluno = async () => {
    if (!novoNome || !novoNum || !novoCurso) {
      Alert.alert('Erro', 'Preencha o Nome, Nº de Estudante e Curso.');
      return;
    }

    setCadastrando(true);
    const { error } = await supabase
      .from('alunos')
      .insert([
        {
          escola_id: escola.id,
          numero_processo: novoNum,
          nome: novoNome,
          curso: novoCurso,
          classe: '10ª Classe'
        }
      ]);

    setCadastrando(false);

    if (error) {
      Alert.alert('Erro ao guardar aluno', error.message);
      return;
    }

    setNovoNome('');
    setNovoNum('');
    setNovoCurso('');
    Alert.alert('Sucesso', 'Estudante guardado permanentemente na nuvem!');
    setAbaAtiva('lista');
    buscarAlunos();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7fafc' }}>
      <View style={styles.headerEscola}>
        <Text style={styles.tituloEscola}>{escola.nome}</Text>
        <Text style={styles.subtituloEscola}>Painel de Gestão Académica</Text>
      </View>

      <View style={styles.menuAbas}>
        <TouchableOpacity 
          style={[styles.abaItem, abaAtiva === 'lista' && styles.abaAtiva]} 
          onPress={() => { setAbaAtiva('lista'); buscarAlunos(); }}
        >
          <Text style={[styles.abaTexto, abaAtiva === 'lista' && styles.abaTextoAtivo]}>👥 Alunos ({estudantes.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.abaItem, abaAtiva === 'novoAluno' && styles.abaAtiva]} 
          onPress={() => setAbaAtiva('novoAluno')}
        >
          <Text style={[styles.abaTexto, abaAtiva === 'novoAluno' && styles.abaTextoAtivo]}>➕ Novo Aluno</Text>
        </TouchableOpacity>
      </View>

      {abaAtiva === 'lista' && (
        carregandoAlunos ? (
          <ActivityIndicator size="large" color="#3182ce" style={{ marginTop: 40 }} />
        ) : estudantes.length === 0 ? (
          <View style={styles.vazioContainer}>
            <Text style={{ fontSize: 30, marginBottom: 10 }}>📭</Text>
            <Text style={styles.vazioTitulo}>Nenhum estudante registado</Text>
            <Text style={styles.vazioSub}>Vá à aba "Novo Aluno" para cadastrar os alunos reais da instituição.</Text>
          </View>
        ) : (
          <FlatList
            data={estudantes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.cartaoEstudante}
                onPress={() => navigation.navigate('PerfilAlunoAdmin', { aluno: item })}
              >
                <View>
                  <Text style={styles.nomeAlunoText}>{item.nome}</Text>
                  <Text style={styles.detalheAlunoText}>Proc: {item.numero_processo} | Curso: {item.curso}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.badgeEstadoText}>{item.classe}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      )}

      {abaAtiva === 'novoAluno' && (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.labelInput}>Nome Completo do Estudante *</Text>
          <TextInput style={styles.input} placeholder="Ex: Nome real do estudante" value={novoNome} onChangeText={setNovoNome} />

          <Text style={styles.labelInput}>Nº de Processo *</Text>
          <TextInput style={styles.input} placeholder="Ex: 2026001" value={novoNum} onChangeText={setNovoNum} keyboardType="numeric" />

          <Text style={styles.labelInput}>Curso / Especialidade *</Text>
          <TextInput style={styles.input} placeholder="Ex: Informática, Contabilidade..." value={novoCurso} onChangeText={setNovoCurso} />

          <TouchableOpacity style={styles.botaoPrincipal} onPress={handleAdicionarAluno} disabled={cadastrando}>
            {cadastrando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotao}>Gravar na Nuvem</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// 5. PERFIL DO ESTUDANTE
// -------------------------------------------------------------
function PerfilAlunoAdminScreen({ route }) {
  const { aluno } = route.params;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f7fafc' }}>
      <View style={styles.cartaoPerfilTop}>
        <Text style={styles.nomeAlunoPerfil}>{aluno.nome}</Text>

        <View style={styles.linhaInfoPerfil}>
          <Text style={styles.infoPerfilLabel}>Nº Processo:</Text>
          <Text style={styles.infoPerfilValor}>{aluno.numero_processo}</Text>
        </View>

        <View style={styles.linhaInfoPerfil}>
          <Text style={styles.infoPerfilLabel}>Curso:</Text>
          <Text style={styles.infoPerfilValor}>{aluno.curso}</Text>
        </View>

        <View style={styles.linhaInfoPerfil}>
          <Text style={styles.infoPerfilLabel}>Classe:</Text>
          <Text style={styles.infoPerfilValor}>{aluno.classe}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// -------------------------------------------------------------
// NAVEGAÇÃO
// -------------------------------------------------------------
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroEscola" component={CadastroEscolaScreen} options={{ title: 'Registo Institucional' }} />
        <Stack.Screen name="AguardandoAprovacao" component={AguardandoAprovacaoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PainelEscola" component={PainelEscolaScreen} options={{ title: 'Painel da Secretaria' }} />
        <Stack.Screen name="PerfilAlunoAdmin" component={PerfilAlunoAdminScreen} options={{ title: 'Perfil do Aluno' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// -------------------------------------------------------------
// ESTILOS VISUAIS
// -------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', alignItems: 'center', justifyContent: 'center', padding: 24 },
  containerScroll: { padding: 20, backgroundColor: '#f7fafc' },
  containerStatus: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  tituloApp: { fontSize: 32, fontWeight: 'bold', color: '#2b6cb0', marginBottom: 6 },
  tituloForm: { fontSize: 24, fontWeight: 'bold', color: '#1a202c', marginBottom: 6 },
  subtituloForm: { fontSize: 14, color: '#718096', marginBottom: 20 },
  subtitulo: { fontSize: 15, color: '#718096', marginBottom: 20 },
  labelInput: { fontSize: 14, fontWeight: 'bold', color: '#4a5568', marginBottom: 6 },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, marginBottom: 16, borderWidth: 1, borderColor: '#cbd5e0', fontSize: 15 },
  botaoPrincipal: { width: '100%', height: 52, backgroundColor: '#3182ce', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botaoCriarEscola: { marginTop: 20, paddingVertical: 10 },
  textoCriarEscola: { color: '#2b6cb0', fontSize: 15, fontWeight: 'bold' },
  iconeStatusBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#feebc8', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  tituloStatus: { fontSize: 22, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 },
  textoStatus: { fontSize: 14, color: '#4a5568', textAlign: 'center', marginBottom: 20 },
  headerEscola: { backgroundColor: '#2b6cb0', padding: 20 },
  tituloEscola: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtituloEscola: { fontSize: 14, color: '#e2e8f0', marginTop: 2 },
  menuAbas: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  abaItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  abaAtiva: { borderBottomWidth: 3, borderColor: '#3182ce' },
  abaTexto: { fontSize: 14, fontWeight: 'bold', color: '#718096' },
  abaTextoAtivo: { color: '#3182ce' },
  vazioContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 30 },
  vazioTitulo: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 6 },
  vazioSub: { fontSize: 14, color: '#718096', textAlign: 'center' },
  cartaoEstudante: { backgroundColor: '#fff', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nomeAlunoText: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  detalheAlunoText: { fontSize: 13, color: '#718096', marginTop: 4 },
  badgeEstadoText: { fontSize: 13, fontWeight: 'bold', color: '#3182ce' },
  cartaoPerfilTop: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  nomeAlunoPerfil: { fontSize: 22, fontWeight: 'bold', color: '#2d3748', marginBottom: 12 },
  linhaInfoPerfil: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoPerfilLabel: { fontSize: 14, color: '#718096' },
  infoPerfilValor: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' }
});
