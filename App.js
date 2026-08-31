import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, ActivityIndicator, Image, Linking, Alert
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Componente do Perfil da Instituição
import PerfilInstituicao from './PerfilInstituicao';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [tela, setTela] = useState('menu'); // Inicia no MENU PRINCIPAL
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [instituicao, setInstituicao] = useState(null);

  // Pesquisa
  const [numProcPesquisa, setNumProcPesquisa] = useState('');
  const [resultadoPesquisa, setResultadoPesquisa] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) carregarPerfilInstituicao(session.user.id);
    });
  }, []);

  const carregarPerfilInstituicao = async (userId) => {
    setLoading(true);
    const { data } = await supabase.from('instituicoes').select('*').eq('user_id', userId).single();
    if (data) setInstituicao(data);
    setLoading(false);
  };

  const pesquisarAluno = async () => {
    if (!numProcPesquisa.trim()) {
      Alert.alert('Aviso', 'Digite o número de processo.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('numero_processo', numProcPesquisa)
      .single();

    if (error || !data) {
      Alert.alert('Não encontrado', 'Nenhum aluno encontrado com este processo.');
      setResultadoPesquisa(null);
    } else {
      setResultadoPesquisa(data);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <StatusBar barStyle="dark-content" />

      {/* CABEÇALHO GLOBAL COM MENU DE NAVEGAÇÃO */}
      <View style={styles.topBar}>
        <Text style={styles.topLogo}>🎓 Portal Escola</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navMenu}>
          <TouchableOpacity 
            style={[styles.navBtn, tela === 'menu' && styles.navBtnActive]} 
            onPress={() => setTela('menu')}
          >
            <Text style={[styles.navText, tela === 'menu' && styles.navTextActive]}>🏠 Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navBtn, tela === 'instituicao' && styles.navBtnActive]} 
            onPress={() => setTela('instituicao')}
          >
            <Text style={[styles.navText, tela === 'instituicao' && styles.navTextActive]}>🏫 Perfil Escola</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navBtn, tela === 'pesquisa' && styles.navBtnActive]} 
            onPress={() => setTela('pesquisa')}
          >
            <Text style={[styles.navText, tela === 'pesquisa' && styles.navTextActive]}>🔍 Pesquisar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* CONTEÚDO DINÂMICO DEPENDENDO DA TELA */}
      {tela === 'menu' && (
        <ScrollView style={styles.container}>
          <View style={styles.cardHeader}>
            <Text style={styles.welcomeTitle}>Painel de Gestão Escolar</Text>
            <Text style={styles.welcomeSub}>Selecione uma opção no menu superior ou utilize os atalhos abaixo:</Text>
          </View>

          <View style={styles.gridMenu}>
            <TouchableOpacity style={styles.gridItem} onPress={() => setTela('instituicao')}>
              <Text style={styles.gridIcon}>🏫</Text>
              <Text style={styles.gridTitle}>Perfil da Instituição</Text>
              <Text style={styles.gridDesc}>Ver cursos, pauta trimestral e alunos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => setTela('pesquisa')}>
              <Text style={styles.gridIcon}>🔍</Text>
              <Text style={styles.gridTitle}>Pesquisar Aluno</Text>
              <Text style={styles.gridDesc}>Buscar por Nº de Processo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {tela === 'instituicao' && (
        <PerfilInstituicao instituicao={instituicao} />
      )}

      {tela === 'pesquisa' && (
        <ScrollView style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Consultar Aluno</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o Nº de Processo"
              value={numProcPesquisa}
              onChangeText={setNumProcPesquisa}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={pesquisarAluno}>
              <Text style={styles.btnText}>Pesquisar</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 15 }} />}

            {resultadoPesquisa && (
              <View style={styles.resultBox}>
                <Text style={styles.resultName}>{resultadoPesquisa.nome}</Text>
                <Text style={styles.resultInfo}>Processo: {resultadoPesquisa.numero_processo}</Text>
                <Text style={styles.resultInfo}>Turma/Curso: {resultadoPesquisa.curso_turma || 'N/A'}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { backgroundColor: '#1E3A8A', paddingTop: 10, paddingBottom: 8, paddingHorizontal: 12 },
  topLogo: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  navMenu: { flexDirection: 'row' },
  navBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 8 },
  navBtnActive: { backgroundColor: '#FFF' },
  navText: { color: '#E0E7FF', fontWeight: '600', fontSize: 13 },
  navTextActive: { color: '#1E3A8A', fontWeight: 'bold' },

  container: { flex: 1, padding: 15 },
  cardHeader: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 15 },
  welcomeTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' },
  welcomeSub: { fontSize: 13, color: '#4B5563', marginTop: 4 },

  gridMenu: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  gridItem: { backgroundColor: '#FFF', width: '48%', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  gridIcon: { fontSize: 28, marginBottom: 8 },
  gridTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  gridDesc: { fontSize: 11, color: '#6B7280', marginTop: 4 },

  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 12 },
  btnPrimary: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  resultBox: { marginTop: 15, padding: 12, backgroundColor: '#EFF6FF', borderRadius: 8 },
  resultName: { fontSize: 15, fontWeight: 'bold', color: '#1E3A8A' },
  resultInfo: { fontSize: 13, color: '#374151', marginTop: 2 }
});
