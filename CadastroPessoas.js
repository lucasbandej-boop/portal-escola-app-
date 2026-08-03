import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabaseClient';

export default function CadastroPessoas({ instituicaoId, onSucesso }) {
  const [tipo, setTipo] = useState('estudante');
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [bilhete, setBilhete] = useState('');
  const [foto, setFoto] = useState(null);

  const [turma, setTurma] = useState('');
  const [classe, setClasse] = useState('');
  const [curso, setCurso] = useState('');

  const [formacao, setFormacao] = useState('');
  const [disciplina, setDisciplina] = useState('');

  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFoto(result.assets[0]);
    }
  };

  const uploadFotoSupabase = async (uri) => {
    try {
      const ext = uri.split('.').pop();
      const fileName = `${tipo}_${Date.now()}.${ext}`;
      const filePath = `membros/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('fotos')
        .upload(filePath, blob, { contentType: `image/${ext}`, upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('fotos')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Erro upload:', err);
      return null;
    }
  };

  const handleSalvar = async () => {
    if (!nome || !bilhete) {
      Alert.alert('Atenção', 'Preencha o nome completo e o BI.');
      return;
    }

    setLoading(true);
    let fotoUrl = null;

    if (foto) {
      fotoUrl = await uploadFotoSupabase(foto.uri);
    }

    try {
      if (tipo === 'estudante') {
        const { error } = await supabase.from('estudantes').insert([
          {
            instituicao_id: instituicaoId,
            nome_completo: nome,
            data_nascimento: dataNascimento || null,
            num_bilhete: bilhete,
            turma,
            classe_ou_ano: classe,
            curso,
            foto_url: fotoUrl
          }
        ]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('professores').insert([
          {
            instituicao_id: instituicaoId,
            nome_completo: nome,
            data_nascimento: dataNascimento || null,
            num_bilhete: bilhete,
            formacao_academica: formacao,
            disciplina,
            foto_url: fotoUrl
          }
        ]);
        if (error) throw error;
      }

      Alert.alert('Sucesso', `${tipo === 'estudante' ? 'Estudante' : 'Professor'} cadastrado com sucesso!`);
      setNome('');
      setBilhete('');
      setDataNascimento('');
      setFoto(null);
      if (onSucesso) onSucesso();
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.abaTipo}>
        <TouchableOpacity 
          style={[styles.btnTipo, tipo === 'estudante' && styles.btnTipoAtivo]}
          onPress={() => setTipo('estudante')}
        >
          <Text style={[styles.txtTipo, tipo === 'estudante' && styles.txtTipoAtivo]}>+ Estudante</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnTipo, tipo === 'professor' && styles.btnTipoAtivo]}
          onPress={() => setTipo('professor')}
        >
          <Text style={[styles.txtTipo, tipo === 'professor' && styles.txtTipoAtivo]}>+ Professor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fotoSection}>
        <TouchableOpacity onPress={escolherFoto} style={styles.fotoContainer}>
          {foto ? (
            <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Text style={styles.fotoTxt}>📷 Adicionar Foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Manuel dos Santos" />

      <Text style={styles.label}>Número do BI *</Text>
      <TextInput style={styles.input} value={bilhete} onChangeText={setBilhete} placeholder="000000000LA000" />

      <Text style={styles.label}>Data de Nascimento</Text>
      <TextInput style={styles.input} value={dataNascimento} onChangeText={setDataNascimento} placeholder="AAAA-MM-DD" />

      {tipo === 'estudante' ? (
        <>
          <Text style={styles.label}>Curso</Text>
          <TextInput style={styles.input} value={curso} onChangeText={setCurso} placeholder="Ex: Informática" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Classe / Ano</Text>
              <TextInput style={styles.input} value={classe} onChangeText={setClasse} placeholder="Ex: 10ª Classe" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Turma</Text>
              <TextInput style={styles.input} value={turma} onChangeText={setTurma} placeholder="Ex: A" />
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>Formação Académica</Text>
          <TextInput style={styles.input} value={formacao} onChangeText={setFormacao} placeholder="Ex: Licenciado em Engenharia" />
          <Text style={styles.label}>Disciplina que Leciona</Text>
          <TextInput style={styles.input} value={disciplina} onChangeText={setDisciplina} placeholder="Ex: Matemática" />
        </>
      )}

      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.txtSalvar}>Guardar {tipo === 'estudante' ? 'Estudante' : 'Professor'}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  abaTipo: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  btnTipo: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1877f2', alignItems: 'center' },
  btnTipoAtivo: { backgroundColor: '#1877f2' },
  txtTipo: { color: '#1877f2', fontWeight: 'bold' },
  txtTipoAtivo: { color: '#fff' },
  fotoSection: { alignItems: 'center', marginBottom: 20 },
  fotoContainer: { width: 110, height: 110, borderRadius: 55, overflow: 'hidden' },
  fotoPreview: { width: '100%', height: '100%' },
  fotoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#e4e6eb', justifyContent: 'center', alignItems: 'center' },
  fotoTxt: { fontSize: 12, color: '#65676b', textAlign: 'center' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#050505', marginBottom: 4, marginTop: 10 },
  input: { height: 45, borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f9f9f9' },
  btnSalvar: { backgroundColor: '#1877f2', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 25, marginBottom: 40 },
  txtSalvar: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
