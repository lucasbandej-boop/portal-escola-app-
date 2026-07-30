import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { supabase } from '../supabase';

export default function RegistroEscola({ navigation }) {
  const [nome, setNome] = useState('');
  const [licenca, setLicenca] = useState('');
  const [numEstudantes, setNumEstudantes] = useState('');
  const [numProfessores, setNumProfessores] = useState('');
  const [cursos, setCursos] = useState('');
  const [nivelEnsino, setNivelEnsino] = useState('Médio');
  const [director, setDirector] = useState('');
  const [viceDirector, setViceDirector] = useState('');
  const [tipoInstituicao, setTipoInstituicao] = useState('Privada');
  const [localizacao, setLocalizacao] = useState('');
  const [senha, setSenha] = useState('');

  const [loading, setLoading] = useState(false);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSalvarEscola = async () => {
    if (!nome.trim() || !licenca.trim() || !director.trim() || !localizacao.trim() || !senha.trim()) {
      showAlert('Atenção', 'Por favor, preencha os campos obrigatórios (Nome, Licença, Director, Localização e Senha).');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('escolas')
        .insert([
          {
            nome,
            numero_licenca: licenca,
            num_estudantes: parseInt(numEstudantes) || 0,
            num_professores: parseInt(numProfessores) || 0,
            cursos_disponiveis: cursos,
            nivel_ensino: nivelEnsino,
            director,
            vice_director: viceDirector,
            tipo_instituicao: tipoInstituicao,
            localizacao,
            senha_acesso: senha,
          },
        ])
        .select();

      if (error) throw error;

      showAlert('Sucesso', 'Instituição cadastrada com sucesso! Já pode realizar o login da Secretaria.');
      
      setNome(''); setLicenca(''); setNumEstudantes(''); setNumProfessores('');
      setCursos(''); setDirector(''); setViceDirector(''); setLocalizacao(''); setSenha('');

      if (navigation && navigation.navigate) {
        navigation.navigate('LoginEscola');
      }
    } catch (err) {
      console.error('Erro ao cadastrar:', err.message);
      showAlert('Erro no Cadastro', err.message || 'Não foi possível salvar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Cadastrar Instituição</Text>
        <Text style={styles.subtitle}>Fase 1: Dados Gerais da Escola</Text>

        <Text style={styles.label}>Nome da Escola *</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Colégio Puniv Viana" placeholderTextColor="#999" />

        <Text style={styles.label}>Número de Licença *</Text>
        <TextInput style={styles.input} value={licenca} onChangeText={setLicenca} placeholder="Nº do Ministério da Educação" placeholderTextColor="#999" />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.label}>Nº Estudantes</Text>
            <TextInput style={styles.input} value={numEstudantes} onChangeText={setNumEstudantes} keyboardType="numeric" placeholder="Ex: 500" placeholderTextColor="#999" />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={styles.label}>Nº Professores</Text>
            <TextInput style={styles.input} value={numProfessores} onChangeText={setNumProfessores} keyboardType="numeric" placeholder="Ex: 35" placeholderTextColor="#999" />
          </View>
        </View>

        <Text style={styles.label}>Cursos Disponíveis</Text>
        <TextInput style={styles.input} value={cursos} onChangeText={setCursos} placeholder="Ex: Ciências Físicas, Puniv..." placeholderTextColor="#999" />

        <Text style={styles.label}>Nível de Ensino</Text>
        <View style={styles.rowSelector}>
          {['Primário', 'Médio', 'Superior'].map((item) => (
            <TouchableOpacity key={item} style={[styles.selectBtn, nivelEnsino === item && styles.selectBtnActive]} onPress={() => setNivelEnsino(item)}>
              <Text style={[styles.selectText, nivelEnsino === item && styles.selectTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Tipo de Instituição</Text>
        <View style={styles.rowSelector}>
          {['Privada', 'Estatal'].map((item) => (
            <TouchableOpacity key={item} style={[styles.selectBtn, tipoInstituicao === item && styles.selectBtnActive]} onPress={() => setTipoInstituicao(item)}>
              <Text style={[styles.selectText, tipoInstituicao === item && styles.selectTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Director(a) Geral *</Text>
        <TextInput style={styles.input} value={director} onChangeText={setDirector} placeholder="Nome do Director" placeholderTextColor="#999" />

        <Text style={styles.label}>Vice-Director(a)</Text>
        <TextInput style={styles.input} value={viceDirector} onChangeText={setViceDirector} placeholder="Nome do Vice-Director" placeholderTextColor="#999" />

        <Text style={styles.label}>Localização da Escola *</Text>
        <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Luanda, Viana, Km 12" placeholderTextColor="#999" />

        <Text style={styles.label}>Senha para Login da Secretaria *</Text>
        <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry placeholder="Crie uma senha de acesso" placeholderTextColor="#999" />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSalvarEscola} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Salvar Instituição</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#E2E8F0', flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, maxWidth: 500, width: '100%', alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, fontSize: 14, color: '#0F172A' },
  row: { flexDirection: 'row' },
  rowSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  selectBtn: { flex: 1, paddingVertical: 8, marginHorizontal: 2, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, alignItems: 'center', backgroundColor: '#F8FAFC' },
  selectBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  selectText: { fontSize: 12, color: '#334155', fontWeight: '500' },
  selectTextActive: { color: '#FFF', fontWeight: 'bold' },
  button: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { backgroundColor: '#A7F3D0' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
