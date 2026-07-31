import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { supabase } from './supabaseClient';

export default function App() {
  const [tela, setTela] = useState('login'); // 'login', 'registro', 'painel'
  const [escolaLogada, setEscolaLogada] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados do Login
  const [loginInput, setLoginInput] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Estados do Registo
  const [form, setForm] = useState({
    nome: '',
    numero_licenca: '',
    num_estudantes: '',
    num_professores: '',
    cursos_disponiveis: '',
    nivel_ensino: '',
    director: '',
    vice_director: '',
    tipo_instituicao: '',
    localizacao: '',
    nif: '',
    senha_acesso: '',
  });

  const showAlert = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const handleLogin = async () => {
    if (!loginInput.trim() || !loginSenha.trim()) {
      showAlert('Atenção', 'Preencha a Licença/Nome e a Senha.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .or(`numero_licenca.eq.${loginInput.trim()},nome.ilike.%${loginInput.trim()%}`)
        .eq('senha_acesso', loginSenha.trim())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        showAlert('Erro', 'Credenciais inválidas.');
        setLoading(false);
        return;
      }

      setEscolaLogada(data);
      setTela('painel');
    } catch (err) {
      showAlert('Erro', err.message || 'Falha no login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async () => {
    if (!form.nome || !form.numero_licenca || !form.senha_acesso) {
      showAlert('Atenção', 'Preencha pelo menos o Nome, Nº de Licença e a Senha.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('escolas').insert([{
        nome: form.nome,
        numero_licenca: form.numero_licenca,
        num_estudantes: form.num_estudantes ? parseInt(form.num_estudantes) : 0,
        num_professores: form.num_professores ? parseInt(form.num_professores) : 0,
        cursos_disponiveis: form.cursos_disponiveis,
        nivel_ensino: form.nivel_ensino,
        director: form.director,
        vice_director: form.vice_director,
        tipo_instituicao: form.tipo_instituicao,
        localizacao: form.localizacao,
        nif: form.nif,
        senha_acesso: form.senha_acesso,
      }]);

      if (error) throw error;
      showAlert('Sucesso', 'Instituição cadastrada com sucesso! Faça login.');
      setTela('login');
    } catch (err) {
      showAlert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* TELA DE LOGIN */}
      {tela === 'login' && (
        <View style={styles.centerContainer}>
          <View style={styles.card}>
            <Text style={styles.titulo}>Portal Escola</Text>
            <Text style={styles.subtitulo}>Acesso à Secretaria Virtual</Text>

            <Text style={styles.label}>Nº de Licença ou Nome da Escola</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: LIC-2026-001"
              value={loginInput}
              onChangeText={setLoginInput}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha de Acesso</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a senha"
              value={loginSenha}
              onChangeText={setLoginSenha}
              secureTextEntry
            />

            <TouchableOpacity style={styles.botaoPrincipal} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoBotao}>Entrar na Plataforma</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkContainer} onPress={() => setTela('registro')}>
              <Text style={styles.textoLink}>Não tem conta? Cadastrar Instituição</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TELA DE REGISTO */}
      {tela === 'registro' && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.cardWide}>
            <Text style={styles.titulo}>Cadastrar Instituição</Text>
            <Text style={styles.subtitulo}>Registe a sua escola no Portal</Text>

            <Text style={styles.label}>Nome da Escola *</Text>
            <TextInput style={styles.input} placeholder="Ex: Colégio Luanda" value={form.nome} onChangeText={(v) => setForm({...form, nome: v})} />

            <Text style={styles.label}>Número de Licenca *</Text>
            <TextInput style={styles.input} placeholder="Ex: LIC-2026-001" value={form.numero_licenca} onChangeText={(v) => setForm({...form, numero_licenca: v})} />

            <Text style={styles.label}>Senha de Acesso *</Text>
            <TextInput style={styles.input} placeholder="Senha segura" secureTextEntry value={form.senha_acesso} onChangeText={(v) => setForm({...form, senha_acesso: v})} />

            <Text style={styles.label}>Diretor(a)</Text>
            <TextInput style={styles.input} placeholder="Nome do Diretor" value={form.director} onChangeText={(v) => setForm({...form, director: v})} />

            <Text style={styles.label}>Localização</Text>
            <TextInput style={styles.input} placeholder="Ex: Luanda, Talatona" value={form.localizacao} onChangeText={(v) => setForm({...form, localizacao: v})} />

            <TouchableOpacity style={styles.botaoPrincipal} onPress={handleRegistro} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoBotao}>Salvar Instituição</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkContainer} onPress={() => setTela('login')}>
              <Text style={styles.textoLink}>← Já tenho conta? Ir para Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* PAINEL TEMPORÁRIO */}
      {tela === 'painel' && (
        <View style={styles.centerContainer}>
          <View style={styles.card}>
            <Text style={styles.titulo}>🎉 Painel da Escola</Text>
            <Text style={styles.nomeEscola}>{escolaLogada?.nome}</Text>
            <Text style={styles.infoEscola}>Licença: {escolaLogada?.numero_licenca}</Text>
            <Text style={styles.infoEscola}>Diretor: {escolaLogada?.director || 'Não definido'}</Text>

            <TouchableOpacity style={styles.botaoSair} onPress={() => { setEscolaLogada(null); setTela('login'); }}>
              <Text style={styles.textoBotaoSair}>Terminar Sessão</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scrollContainer: { padding: 20, alignItems: 'center' },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#FFF', borderRadius: 16, padding: 24, elevation: 4 },
  cardWide: { width: '100%', maxWidth: 500, backgroundColor: '#FFF', borderRadius: 16, padding: 24, elevation: 4 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  subtitulo: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 14 },
  botaoPrincipal: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  linkContainer: { marginTop: 16, alignItems: 'center' },
  textoLink: { color: '#2563EB', fontSize: 13, fontWeight: '600' },
  nomeEscola: { fontSize: 18, fontWeight: '600', color: '#2563EB', textAlign: 'center', marginTop: 10 },
  infoEscola: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 6 },
  botaoSair: { backgroundColor: '#EF4444', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  textoBotaoSair: { color: '#FFF', fontWeight: 'bold' },
});
