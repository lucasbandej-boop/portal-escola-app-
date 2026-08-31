import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, ActivityIndicator, Image, Linking
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Importação do componente atualizado do Perfil
import PerfilInstituicao from './PerfilInstituicao';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [tela, setTela] = useState('instituicao'); // Tela inicial virada para o Perfil
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [instituicao, setInstituicao] = useState(null);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      {tela === 'instituicao' ? (
        <PerfilInstituicao instituicao={instituicao} />
      ) : (
        <View style={styles.center}>
          <Text style={styles.text}>Portal Escola - Painel Principal</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' }
});
