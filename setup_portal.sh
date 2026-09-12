#!/bin/bash

echo "🚀 Iniciando atualização automática do Portal Escolar..."

# 1. Isolar conexão com Supabase em supabase.js
cat << 'SUPABASE_EOF' > supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
SUPABASE_EOF

# 2. Criar a HomeScreen.js com Menu e Pesquisa
cat << 'HOME_EOF' > HomeScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Linking, Alert
} from 'react-native';
import { supabase } from './supabase';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [numProcPesquisa, setNumProcPesquisa] = useState('');
  const [resultadoPesquisa, setResultadoPesquisa] = useState(null);

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
    <ScrollView style={styles.container}>
      <Text style={styles.tituloMenu}>Menu Principal do Sistema</Text>
      <Text style={styles.subTituloMenu}>Selecione a opção desejada para navegar:</Text>

      {/* CARD 1: PÁGINA DA INSTITUIÇÃO */}
      <TouchableOpacity 
        style={styles.cardMenu} 
        onPress={() => navigation.navigate('PerfilInstituicao')}
      >
        <Text style={styles.iconCard}>🏫</Text>
        <View style={styles.textCardContainer}>
          <Text style={styles.tituloCard}>Página da Instituição (Estilo Facebook)</Text>
        </View>
      </TouchableOpacity>

      {/* CARD 2: CADASTRAMENTO DE PROFESSORES */}
      <TouchableOpacity 
        style={styles.cardMenu} 
        onPress={() => navigation.navigate('Professores')}
      >
        <Text style={styles.iconCard}>👨‍🏫</Text>
        <View style={styles.textCardContainer}>
          <Text style={styles.tituloCard}>Cadastramento de Professores</Text>
        </View>
      </TouchableOpacity>

      {/* BLANCO DE PESQUISA RÁPIDA */}
      <View style={styles.cardForm}>
        <Text style={styles.tituloCard}>🔍 Consultar Aluno</Text>
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

      {/* BANNER DE PUBLICIDADE */}
      <TouchableOpacity
        style={styles.bannerVerde}
        onPress={() => Linking.openURL('tel:929561442')}
      >
        <View style={styles.badgeVerde}>
          <Text style={styles.badgeText}>👕 Confecção de Uniformes</Text>
        </View>
        <Text style={styles.tituloPubVerde}>Uniformes & Fardamentos</Text>
        <Text style={styles.descPubVerde}>
          Produção de fardas escolares para colégios e institutos. Batas, camisas, calças e bordados personalizados.
        </Text>
        <View style={styles.btnLigarVerde}>
          <Text style={styles.btnLigarTexto}>📞 929561442 (Clique para Ligar)</Text>
        </View>
      </TouchableOpacity>

      {/* SUPORTE */}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F3F4F6' },
  tituloMenu: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 5 },
  subTituloMenu: { fontSize: 13, color: '#6B7280', marginBottom: 15 },
  cardMenu: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  iconCard: { fontSize: 28, marginRight: 15 },
  textCardContainer: { flex: 1 },
  tituloCard: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  bannerVerde: { backgroundColor: '#064E3B', borderRadius: 12, padding: 16, marginVertical: 15 },
  badgeVerde: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8 },
  badgeText: { color: '#A7F3D0', fontSize: 11, fontWeight: 'bold' },
  tituloPubVerde: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  descPubVerde: { color: '#D1FAE5', fontSize: 12, marginTop: 4, lineHeight: 18 },
  btnLigarVerde: { backgroundColor: '#022C22', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  btnLigarTexto: { color: '#6EE7B7', fontWeight: 'bold', fontSize: 12 },
  cardSuporte: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 25, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  tituloSuporte: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  subSuporte: { fontSize: 12, color: '#6B7280', marginVertical: 4, textAlign: 'center' },
  btnSuporte: { backgroundColor: '#059669', width: '100%', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnSuporteTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  cardForm: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginTop: 10, marginBottom: 12 },
  btnBuscar: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  resultBox: { marginTop: 15, padding: 12, backgroundColor: '#EFF6FF', borderRadius: 8 },
  resultName: { fontSize: 15, fontWeight: 'bold', color: '#1E3A8A' },
  resultInfo: { fontSize: 13, color: '#4B5563', marginTop: 2 }
});
HOME_EOF

# 3. Atualizar App.js com React Navigation
cat << 'APP_EOF' > App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './HomeScreen';
import PerfilInstituicao from './PerfilInstituicao';
import ProfessorScreen from './src/screens/ProfessorScreen';
import LoginEscola from './src/screens/LoginEscola';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#2563EB',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Portal Escola' }} 
        />
        <Stack.Screen 
          name="PerfilInstituicao" 
          component={PerfilInstituicao} 
          options={{ title: 'Página da Instituição' }} 
        />
        <Stack.Screen 
          name="Professores" 
          component={ProfessorScreen} 
          options={{ title: 'Cadastramento de Professores' }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginEscola} 
          options={{ title: 'Acesso Restrito' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
APP_EOF

echo "✅ Projeto atualizado com sucesso!"
