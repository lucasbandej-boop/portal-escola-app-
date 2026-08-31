import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, ActivityIndicator, Image, Linking, Alert
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Importa o perfil atualizado
import PerfilInstituicao from './PerfilInstituicao';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [tela, setTela] = useState('menu');
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

      {/* CABEÇALHO FIXO DO PORTAL */}
      <View style={styles.headerSimples}>
        <Text style={styles.topLogo}>Portal Escola</Text>
        {tela !== 'menu' && (
          <TouchableOpacity style={styles.btnVoltar} onPress={() => setTela('menu')}>
            <Text style={styles.btnVoltarTexto}>⬅️ Voltar ao Menu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MENU PRINCIPAL (IGUAL AO PRINT) */}
      {tela === 'menu' && (
        <ScrollView style={styles.container}>
          <Text style={styles.tituloMenu}>Menu Principal do Sistema</Text>
          <Text style={styles.subTituloMenu}>Selecione a opção desejada para navegar:</Text>

          {/* CARD 1: PÁGINA DA INSTITUIÇÃO */}
          <TouchableOpacity style={styles.cardMenu} onPress={() => setTela('instituicao')}>
            <Text style={styles.iconCard}>🏫</Text>
            <View style={styles.textCardContainer}>
              <Text style={styles.tituloCard}>Página da Instituição (Estilo Facebook)</Text>
            </View>
          </TouchableOpacity>

          {/* CARD 2: PESQUISA DE ALUNOS */}
          <TouchableOpacity style={styles.cardMenu} onPress={() => setTela('pesquisa')}>
            <Text style={styles.iconCard}>🔍</Text>
            <View style={styles.textCardContainer}>
              <Text style={styles.tituloCard}>Pesquisa de Alunos e Encarregados</Text>
            </View>
          </TouchableOpacity>

          {/* CARD 3: CADASTRAMENTO DE PROFESSORES */}
          <TouchableOpacity style={styles.cardMenu} onPress={() => Alert.alert('Aviso', 'Ecrã de cadastramento')}>
            <Text style={styles.iconCard}>👨‍🏫</Text>
            <View style={styles.textCardContainer}>
              <Text style={styles.tituloCard}>Cadastramento de Professores</Text>
            </View>
          </TouchableOpacity>

          {/* BANNER DE PUBLICIDADE VERDE */}
          <TouchableOpacity 
            style={styles.bannerVerde} 
            onPress={() => Linking.openURL('tel:929561442')}
          >
            <View style={styles.badgeVerde}>
              <Text style={styles.badgeText}>👕 Confecção de Uniformes (2 / 3)</Text>
            </View>
            <Text style={styles.tituloPubVerde}>Uniformes & Fardamentos</Text>
            <Text style={styles.descPubVerde}>
              Produção de fardas escolares para colégios e institutos. Batas, camisas, calças e bordados personalizados com a melhor qualidade de Luanda.
            </Text>
            <View style={styles.btnLigarVerde}>
              <Text style={styles.btnLigarTexto}>📞 929561442 (Clique para Ligar)</Text>
            </View>
          </TouchableOpacity>

          {/* CARD DE SUPORTE */}
          <View style={styles.cardSuporte}>
            <Text style={styles.tituloSuporte}>🎧 Apoio ao Cliente & Suporte</Text>
            <Text style={styles.subSuporte}>Dúvidas ou problemas no portal? Fale conosco:</Text>
            <TouchableOpacity 
              style={styles.btnSuporte} 
              onPress={() => Linking.openURL('tel:929561442')}
            >
              <Text style={styles.btnSuporteTexto}>📞 Ligar para o Suporte: 929561442</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* TELA DO PERFIL */}
      {tela === 'instituicao' && (
        <PerfilInstituicao />
      )}

      {/* TELA DE PESQUISA */}
      {tela === 'pesquisa' && (
        <ScrollView style={styles.container}>
          <View style={styles.cardForm}>
            <Text style={styles.tituloCard}>Consultar Aluno</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o Nº de Processo"
              value={numProcPesquisa}
              onChangeText={setNumProcPesquisa}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.btnBuscar} onPress={pesquisarAluno}>
              <Text style={styles.btnText}>Pesquisar</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 15 }} />}

            {resultadoPesquisa && (
              <View style={styles.resultBox}>
                <Text style={styles.resultName}>{resultadoPesquisa.nome}</Text>
                <Text style={styles.resultInfo}>Processo: {resultadoPesquisa.numero_processo}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerSimples: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  topLogo: { color: '#2563EB', fontSize: 22, fontWeight: 'bold' },
  btnVoltar: { backgroundColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  btnVoltarTexto: { fontSize: 12, color: '#1F2937', fontWeight: 'bold' },

  container: { flex: 1, padding: 16, backgroundColor: '#F3F4F6' },
  tituloMenu: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 5 },
  subTituloMenu: { fontSize: 13, color: '#6B7280', marginBottom: 15 },

  cardMenu: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  iconCard: { fontSize: 28, marginRight: 15 },
  textCardContainer: { flex: 1 },
  tituloCard: { fontSize: 15, fontWeight: 'bold', color: '#111827' },

  // BANNER VERDE
  bannerVerde: { backgroundColor: '#064E3B', borderRadius: 12, padding: 16, marginBottom: 15 },
  badgeVerde: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8 },
  badgeText: { color: '#A7F3D0', fontSize: 11, fontWeight: 'bold' },
  tituloPubVerde: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  descPubVerde: { color: '#D1FAE5', fontSize: 12, marginTop: 4, lineHeight: 18 },
  btnLigarVerde: { backgroundColor: '#022C22', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  btnLigarTexto: { color: '#6EE7B7', fontWeight: 'bold', fontSize: 12 },

  // SUPORTE
  cardSuporte: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 25, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  tituloSuporte: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  subSuporte: { fontSize: 12, color: '#6B7280', marginVertical: 4, textAlign: 'center' },
  btnSuporte: { backgroundColor: '#059669', width: '100%', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnSuporteTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  cardForm: { backgroundColor: '#FFF', padding: 16, borderRadius: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginTop: 10, marginBottom: 12 },
  btnBuscar: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  resultBox: { marginTop: 15, padding: 12, backgroundColor: '#EFF6FF', borderRadius: 8 },
  resultName: { fontSize: 15, fontWeight: 'bold', color: '#1E3A8A' },
  resultInfo: { fontSize: 13, color: '#374151', marginTop: 2 }
});
