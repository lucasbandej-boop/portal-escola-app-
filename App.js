import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { supabase } from './supabase';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function App() {
  // --- ESTADOS DE SESSÃO E NAVEGAÇÃO ---
  const [tela, setTela] = useState('login'); // 'login', 'dashboard', 'turmas', 'notas'
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // --- ESTADOS DE FORMULÁRIOS ---
  const [loginInput, setLoginInput] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  
  // Dados simulados / carregados
  const [turmas, setTurmas] = useState([]);
  const [novaTurma, setNovaTurma] = useState('');
  const [anoLectivo, setAnoLectivo] = useState('2026');

  // Lançamento de notas
  const [alunoNome, setAlunoNome] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [mac, setMac] = useState('');
  const [npp, setNpp] = useState('');
  const [npt, setNpt] = useState('');
  const [notasLista, setNotasLista] = useState([]);

  const showAlert = (titulo, msg) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`${titulo}: ${msg}`);
    } else {
      Alert.alert(titulo, msg);
    }
  };

  // --- 1. AUTENTICAÇÃO E PERMISSÕES ---
  const handleLogin = async () => {
    if (!loginInput.trim() || !loginSenha.trim()) {
      showAlert('Atenção', 'Preencha todos os campos de acesso.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .or(`numero_licenca.eq.${loginInput.trim()},nome.ilike.%${loginInput.trim()}%`)
        .eq('senha_acesso', loginSenha.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        showAlert('Erro', 'Credenciais inválidas.');
      } else {
        // Define o usuário e perfil por padrão (ex: ADMIN)
        setUsuario({ ...data, funcao: data.funcao || 'ADMIN' });
        setTela('dashboard');
        carregarDados();
      }
    } catch (err) {
      showAlert('Erro no Login', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setTela('login');
  };

  // --- 2. GESTÃO DE DADOS (TURMAS E NOTAS) ---
  const carregarDados = async () => {
    fetchTurmas();
    fetchNotas();
  };

  const fetchTurmas = async () => {
    const { data } = await supabase.from('turmas').select('*').order('created_at', { ascending: false });
    if (data) setTurmas(data);
  };

  const fetchNotas = async () => {
    const { data } = await supabase.from('notas').select('*').order('created_at', { ascending: false });
    if (data) setNotasLista(data);
  };

  const handleCriarTurma = async () => {
    if (!novaTurma.trim()) return;
    const { error } = await supabase.from('turmas').insert([{ nome: novaTurma, ano_lectivo: anoLectivo }]);
    if (error) {
      showAlert('Erro', error.message);
    } else {
      showAlert('Sucesso', 'Turma cadastrada!');
      setNovaTurma('');
      fetchTurmas();
    }
  };

  const handleSalvarNota = async () => {
    if (!alunoNome || !disciplina) {
      showAlert('Atenção', 'Preencha o nome do aluno e a disciplina.');
      return;
    }
    const nMac = parseFloat(mac) || 0;
    const nNpp = parseFloat(npp) || 0;
    const nNpt = parseFloat(npt) || 0;

    const { error } = await supabase.from('notas').insert([
      { aluno_nome: alunoNome, disciplina, mac: nMac, npp: nNpp, npt: nNpt }
    ]);

    if (error) {
      showAlert('Erro', error.message);
    } else {
      showAlert('Sucesso', 'Nota registrada na pauta!');
      setAlunoNome('');
      setMac(''); setNpp(''); setNpt('');
      fetchNotas();
    }
  };

  // --- RENDERIZAÇÃO DE TELA DE LOGIN ---
  if (tela === 'login') {
    return (
      <SafeAreaView style={styles.containerLogin}>
        <StatusBar barStyle="light-content" />
        <View style={styles.cardLogin}>
          <Text style={styles.logoTitle}>Portal Escola 🎓</Text>
          <Text style={styles.subTitle}>Sistema Integrado de Gestão Escolar</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome da Escola ou Nº Licença"
            placeholderTextColor="#999"
            value={loginInput}
            onChangeText={setLoginInput}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha de Acesso"
            placeholderTextColor="#999"
            secureTextEntry
            value={loginSenha}
            onChangeText={setLoginSenha}
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>ENTRAR NO PORTAL</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDERIZAÇÃO DO DASHBOARD E MÓDULOS ---
  return (
    <SafeAreaView style={styles.containerApp}>
      <StatusBar barStyle="dark-content" />

      {/* 4. UI/LAYOUT: Topbar Responsiva */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.topbarTitle}>{usuario?.nome || 'Escola'}</Text>
          <Text style={styles.topbarRole}>Acesso: {usuario?.funcao || 'Administrador'}</Text>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.btnLogoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Menu de Navegação */}
      <View style={styles.navMenu}>
        <TouchableOpacity 
          style={[styles.navItem, tela === 'dashboard' && styles.navItemActive]} 
          onPress={() => setTela('dashboard')}
        >
          <Text style={[styles.navText, tela === 'dashboard' && styles.navTextActive]}>Painel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, tela === 'turmas' && styles.navItemActive]} 
          onPress={() => setTela('turmas')}
        >
          <Text style={[styles.navText, tela === 'turmas' && styles.navTextActive]}>Turmas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, tela === 'notas' && styles.navItemActive]} 
          onPress={() => setTela('notas')}
        >
          <Text style={[styles.navText, tela === 'notas' && styles.navTextActive]}>Pautas & Notas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentScroll}>
        {/* MODULO 1: DASHBOARD PRINCIPAL */}
        {tela === 'dashboard' && (
          <View>
            <Text style={styles.sectionTitle}>Visão Geral</Text>
            <View style={styles.gridStats}>
              <View style={styles.cardStat}>
                <Text style={styles.statNum}>{turmas.length}</Text>
                <Text style={styles.statLabel}>Turmas Ativas</Text>
              </View>
              <View style={styles.cardStat}>
                <Text style={styles.statNum}>{notasLista.length}</Text>
                <Text style={styles.statLabel}>Pautas Lançadas</Text>
              </View>
            </View>
          </View>
        )}

        {/* MODULO 2: GESTÃO DE TURMAS */}
        {tela === 'turmas' && (
          <View>
            <Text style={styles.sectionTitle}>Cadastrar Nova Turma</Text>
            <View style={styles.cardForm}>
              <TextInput
                style={styles.inputForm}
                placeholder="Nome da Turma (Ex: 10ª Classe - Turma A)"
                value={novaTurma}
                onChangeText={setNovaTurma}
              />
              <TouchableOpacity style={styles.btnSuccess} onPress={handleCriarTurma}>
                <Text style={styles.btnText}>Adicionar Turma</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Turmas Existentes</Text>
            {turmas.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <Text style={styles.itemTitle}>{item.nome}</Text>
                <Text style={styles.itemSub}>Ano Lectivo: {item.ano_lectivo}</Text>
              </View>
            ))}
          </View>
        )}

        {/* MODULO 3: PAUTAS E NOTAS */}
        {tela === 'notas' && (
          <View>
            <Text style={styles.sectionTitle}>Lançar Notas do Aluno</Text>
            <View style={styles.cardForm}>
              <TextInput
                style={styles.inputForm}
                placeholder="Nome do Aluno"
                value={alunoNome}
                onChangeText={setAlunoNome}
              />
              <TextInput
                style={styles.inputForm}
                placeholder="Disciplina (Ex: Matemática)"
                value={disciplina}
                onChangeText={setDisciplina}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput style={[styles.inputForm, { flex: 1 }]} placeholder="MAC" keyboardType="numeric" value={mac} onChangeText={setMac} />
                <TextInput style={[styles.inputForm, { flex: 1 }]} placeholder="NPP" keyboardType="numeric" value={npp} onChangeText={setNpp} />
                <TextInput style={[styles.inputForm, { flex: 1 }]} placeholder="NPT" keyboardType="numeric" value={npt} onChangeText={setNpt} />
              </View>

              <TouchableOpacity style={styles.btnSuccess} onPress={handleSalvarNota}>
                <Text style={styles.btnText}>Salvar Nota</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Pauta Recente</Text>
            {notasLista.map((n) => (
              <View key={n.id} style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{n.aluno_nome}</Text>
                  <Text style={styles.itemSub}>{n.disciplina} | MAC: {n.mac} | NPP: {n.npp} | NPT: {n.npt}</Text>
                </View>
                <View style={[styles.badgeMedia, { backgroundColor: (n.media || 0) >= 10 ? '#10B981' : '#EF4444' }]}>
                  <Text style={styles.badgeText}>{n.media ? Number(n.media).toFixed(1) : '0.0'}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS RESPONSIVOS E MODERNOS (UI/UX) ---
const styles = StyleSheet.create({
  containerLogin: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  cardLogin: { width: '100%', maxWidth: 400, backgroundColor: '#1E293B', borderRadius: 12, padding: 24, elevation: 5 },
  logoTitle: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 6 },
  subTitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#334155', color: '#FFF', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  btnPrimary: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnSuccess: { backgroundColor: '#10B981', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  containerApp: { flex: 1, backgroundColor: '#F8FAFC' },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  topbarTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  topbarRole: { fontSize: 12, color: '#64748B' },
  btnLogout: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnLogoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 13 },

  navMenu: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  navItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  navItemActive: { borderBottomWidth: 3, borderBottomColor: '#2563EB' },
  navText: { color: '#64748B', fontWeight: '500', fontSize: 14 },
  navTextActive: { color: '#2563EB', fontWeight: 'bold' },

  contentScroll: { padding: 16, maxWidth: 900, width: '100%', alignSelf: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  gridStats: { flexDirection: 'row', gap: 12 },
  cardStat: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statNum: { fontSize: 32, fontWeight: 'bold', color: '#2563EB' },
  statLabel: { color: '#64748B', fontSize: 14, marginTop: 4 },

  cardForm: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  inputForm: { backgroundColor: '#F1F5F9', color: '#0F172A', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 15 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  itemSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  badgeMedia: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
