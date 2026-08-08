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

// [COMPONENTES CarrosselPublicidades, ModalLogin, PerfilEstiloFacebook, FormCadastramentoInstituicao permanecem iguais]
// --- CarrosselPublicidades ---
function CarrosselPublicidades({ publicidadeLigar }) {
  const anuncios = [{ id: 1, tag: '📢 Publicidade', titulo: 'Matérias a bom preço', corpo: 'Livros e Cadernos.', corFundo: '#1d4ed8' }];
  return (
    <View style={[styles.cardPublicidade, { backgroundColor: anuncios[0].corFundo }]}>
      <Text style={styles.tituloPublicidade}>{anuncios[0].titulo}</Text>
      <TouchableOpacity style={styles.btnLigarPub} onPress={publicidadeLigar}>
        <Text style={styles.telefonePublicidade}>📞 929500600 (Ligar)</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- FORMS (Atualizado para Debug) ---
function FormCadastramentoProfessor({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bi, setBi] = useState('');
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCadastrarProf = async () => {
    if (!nome.trim() || !disciplina.trim() || !telefone.trim()) {
      Alert.alert('Atenção', 'Preencha o nome, disciplina e telefone.');
      return;
    }

    setLoading(true);
    try {
      const dadosProf = {
        nome_completo: nome.trim(),
        disciplina: disciplina.trim(),
        telefone: telefone.trim(),
        num_bilhete: bi.trim(),
        status: 'Pendente',
        email: usuario?.email || 'anonimo@escola.ao'
      };

      console.log('Tentando inserir dados:', dadosProf);

      const { data, error } = await supabase
        .from('professores')
        .insert([dadosProf])
        .select();

      if (error) {
        console.error('Erro Supabase:', error);
        Alert.alert('Erro ao Salvar', `Supabase Error: ${error.message} (Código: ${error.code})`);
        return;
      }

      console.log('Sucesso:', data);
      onConcluir({
        id: data && data.length > 0 ? data[0].id : null,
        nome: nome.trim(),
        disciplina: disciplina.trim(),
        telefone: telefone.trim(),
        email: usuario?.email || 'Registo Interno',
        sobre: JSON.stringify({ foto_nome: foto ? foto.name : 'Sem foto' })
      });
    } catch (err) {
      console.error('Erro geral:', err);
      Alert.alert('Erro Inesperado', err.message || 'Falha ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <TouchableOpacity onPress={onCancelar}><Text>← Voltar</Text></TouchableOpacity>
      <Text style={styles.formTitle}>Inscrição de Professor</Text>
      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Disciplina" value={disciplina} onChangeText={setDisciplina} />
      <TextInput style={styles.input} placeholder="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="BI" value={bi} onChangeText={setBi} />
      
      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrarProf} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Criar Perfil Docente</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ... [Manter as outras funções inalteradas] ...
// [Incluir a função principal App conforme a estrutura anterior]
