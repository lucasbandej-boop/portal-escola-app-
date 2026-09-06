import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from './lib/supabase';

export default function PerfilInstituicao({ onVoltar }) {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('register'); // 'register' (Criar Conta) ou 'login' (Entrar)
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Campos do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeEscola, setNomeEscola] = useState('');
  const [nif, setNif] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingSession(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCheckingSession(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async () => {
    if (!email || !password || !nomeEscola) {
      Alert.alert('Atenção', 'Preencha o nome da escola, email e palavra-passe.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_escola: nomeEscola,
          nif: nif,
        },
      },
    });

    setLoading(false);
    if (error) {
      Alert.alert('Erro ao Criar Conta', error.message);
    } else {
      Alert.alert('Sucesso!', 'Conta criada com sucesso! Já pode aceder.');
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha o email e a palavra-passe.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      Alert.alert('Erro ao Entrar', error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (checkingSession) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#1d5bd8" />
      </View>
    );
  }

  // CASO NÃO HOUVER SESSÃO ATIVA (MOSTRA FORMULÁRIO COM OPÇÕES DE CRIAR CONTA E LOGIN)
  if (!session) {
    return (
      <ScrollView contentContainerStyle={styles.authContainer}>
        {onVoltar && (
          <TouchableOpacity style={styles.backBtnTop} onPress={onVoltar}>
            <Text style={styles.backBtnText}>⬅ Voltar ao Menu</Text>
          </TouchableOpacity>
        )}

        <View style={styles.authBox}>
          <Text style={styles.authLogo}>🏫 Portal Escolar</Text>
          <Text style={styles.authSubtitle}>Área da Instituição / Escola</Text>

          {/* Abas para alternar entre Criar Conta e Entrar */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[styles.tabBtn, authMode === 'register' && styles.tabBtnActive]}
              onPress={() => setAuthMode('register')}
            >
              <Text style={[styles.tabBtnText, authMode === 'register' && styles.tabBtnTextActive]}>
                Criar Conta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, authMode === 'login' && styles.tabBtnActive]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.tabBtnText, authMode === 'login' && styles.tabBtnTextActive]}>
                Já tenho conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* CAMPOS DO FORMULÁRIO */}
          {authMode === 'register' && (
            <>
              <Text style={styles.label}>Nome da Escola / Instituição (*):</Text>
              <TextInput
                style={styles.input}
                value={nomeEscola}
                onChangeText={setNomeEscola}
                placeholder="Ex: Colégio Baú"
              />

              <Text style={styles.label}>NIF da Instituição:</Text>
              <TextInput
                style={styles.input}
                value={nif}
                onChangeText={setNif}
                placeholder="Ex: 0082506071LA40"
              />
            </>
          )}

          <Text style={styles.label}>E-mail Institucional (*):</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="escola@exemplo.com"
          />

          <Text style={styles.label}>Palavra-passe (*):</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          {loading ? (
            <ActivityIndicator size="large" color="#1d5bd8" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity
              style={styles.authPrimaryBtn}
              onPress={authMode === 'register' ? handleSignUp : handleSignIn}
            >
              <Text style={styles.authPrimaryBtnText}>
                {authMode === 'register' ? 'Criar Conta da Escola' : 'Entrar no Sistema'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  // CASO JÁ TENHA SESSÃO ATIVA
  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        {onVoltar && (
          <TouchableOpacity style={styles.backBtn} onPress={onVoltar}>
            <Text style={styles.backBtnText}>⬅ Menu</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Text style={styles.logoutBtnText}>Sair da Conta 🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.schoolName}>Página da Instituição</Text>
        <Text style={styles.schoolCategory}>Sessão iniciada como:</Text>
        <Text style={styles.userEmailText}>{session.user.email}</Text>
      </View>

      <View style={styles.contentArea}>
        <TouchableOpacity style={styles.logoutBigBtn} onPress={handleSignOut}>
          <Text style={styles.logoutBigBtnText}>🔒 Clique aqui para Fazer Logout e testar com outra conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 10 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f1f5f9' },
  authBox: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  authLogo: { fontSize: 22, fontWeight: 'bold', color: '#1d5bd8', textAlign: 'center' },
  authSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 15 },
  
  tabSelector: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 4, marginBottom: 15 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabBtnActive: { backgroundColor: '#1d5bd8' },
  tabBtnText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
  tabBtnTextActive: { color: '#fff' },

  label: { fontSize: 12, color: '#475569', marginTop: 10, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: '#fff' },
  authPrimaryBtn: { backgroundColor: '#1d5bd8', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  authPrimaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  
  backBtnTop: { alignSelf: 'flex-start', marginBottom: 15 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  userEmailText: { fontSize: 14, color: '#1d5bd8', fontWeight: 'bold', marginTop: 4 },
  logoutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  logoutBtnText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  backBtn: { backgroundColor: '#e2e8f0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  backBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 12 },
  header: { alignItems: 'center', marginBottom: 15, paddingHorizontal: 16 },
  schoolName: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  schoolCategory: { fontSize: 13, color: '#64748b', marginTop: 4 },
  contentArea: { padding: 16 },
  logoutBigBtn: { backgroundColor: '#ef4444', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  logoutBigBtnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
