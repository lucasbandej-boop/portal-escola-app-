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
  Alert,
  ActivityIndicator,
  Modal,
  Linking
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default function App() {
  const [nome, setNome] = useState('');
  const [numeroInst, setNumeroInst] = useState('');
  const [email, setEmail] = useState('');
  const [director, setDirector] = useState('');
  const [viceDirector, setViceDirector] = useState('');
  const [numProfessores, setNumProfessores] = useState('');
  const [numEstudantes, setNumEstudantes] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [classes, setClasses] = useState('');
  const [loading, setLoading] = useState(false);

  const submeter = async () => {
    if (!nome.trim() || !numeroInst.trim() || !email.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha o Nome, NIF e E-mail.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: nome.trim(),
        nif: numeroInst.trim(),
        email: email.trim().toLowerCase(),
        director: director.trim(),
        vice_director: viceDirector.trim(),
        num_professores: numProfessores.trim(),
        num_estudantes: numEstudantes.trim(),
        localizacao: localizacao.trim(),
        classes: classes.trim()
      };

      const { data, error } = await supabase
        .from('instituicoes')
        .insert([payload]);

      if (error) {
        Alert.alert('Erro no Supabase', `${error.message}\nDetalhes: ${error.details || 'Sem detalhes'}`);
        console.error('Erro detalhado:', error);
      } else {
        Alert.alert('Sucesso 🎉', 'Instituição salva na base de dados!');
      }
    } catch (err) {
      Alert.alert('Erro de Conexão', err.message || 'Falha geral de rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={{ padding: 18 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Cadastramento de Instituição 🏫</Text>

        <Text style={styles.label}>Nome Oficial da Instituição *</Text>
        <TextInput style={styles.input} placeholder="Ex: Colégio Saber" value={nome} onChangeText={setNome} />

        <Text style={styles.label}>NIF ou Nº de Licença *</Text>
        <TextInput style={styles.input} placeholder="Ex: 5000123490" value={numeroInst} onChangeText={setNumeroInst} />

        <Text style={styles.label}>E-mail Institucional *</Text>
        <TextInput style={styles.input} placeholder="Ex: geral@escola.ao" value={email} onChangeText={setEmail} autoCapitalize="none" />

        <Text style={styles.label}>Director Geral</Text>
        <TextInput style={styles.input} placeholder="Ex: Dr. António Manuel" value={director} onChangeText={setDirector} />

        <Text style={styles.label}>Vice-Director Pedagógico</Text>
        <TextInput style={styles.input} placeholder="Ex: Lic. Maria Silva" value={viceDirector} onChangeText={setViceDirector} />

        <Text style={styles.label}>Nº Professores</Text>
        <TextInput style={styles.input} placeholder="Ex: 25" value={numProfessores} onChangeText={setNumProfessores} keyboardType="numeric" />

        <Text style={styles.label}>Nº Estudantes</Text>
        <TextInput style={styles.input} placeholder="Ex: 450" value={numEstudantes} onChangeText={setNumEstudantes} keyboardType="numeric" />

        <Text style={styles.label}>Localização / Endereço</Text>
        <TextInput style={styles.input} placeholder="Ex: Luanda, Viana" value={localizacao} onChangeText={setLocalizacao} />

        <Text style={styles.label}>Classes / Cursos Lecionados</Text>
        <TextInput style={styles.input} placeholder="Ex: Iniciação à 12ª Classe" value={classes} onChangeText={setClasses} />

        <TouchableOpacity style={styles.btnSubmit} onPress={submeter} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSubmitTxt}>CONCLUIR E SALVAR CADASTRAMENTO</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 14 },
  btnSubmit: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  btnSubmitTxt: { color: '#ffffff', fontWeight: 'bold' }
});
