import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../supabase';

export default function PainelPublicidade() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [anuncios, setAnuncios] = useState([]);

  // Pedir permissão e selecionar imagem da galeria
  const selecionarImagem = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'É preciso permitir o acesso à galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Formato retangular ideal para banners de publicidade
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagem(result.assets[0]);
    }
  };

  // Enviar a foto e criar o anúncio no Supabase
  const publicarAnuncio = async () => {
    if (!titulo || !imagem) {
      Alert.alert('Aviso', 'Preencha o título e selecione uma foto para a publicidade.');
      return;
    }

    setCarregando(true);

    try {
      // 1. Preparar a foto para Upload
      const fileName = `banner_${Date.now()}.jpg`;
      const response = await fetch(imagem.uri);
      const blob = await response.blob();

      // 2. Enviar a imagem para o bucket do Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('publicidades')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (storageError) throw storageError;

      // 3. Pegar a URL pública da foto
      const { data: publicUrlData } = supabase.storage
        .from('publicidades')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // 4. Salvar na tabela 'publicidades'
      const { error: dbError } = await supabase
        .from('publicidades')
        .insert([
          {
            titulo,
            descricao,
            imagem_url: imageUrl,
          },
        ]);

      if (dbError) throw dbError;

      Alert.alert('Sucesso', 'Anúncio publicado com sucesso!');
      setTitulo('');
      setDescricao('');
      setImagem(null);
      carregarAnuncios();

    } catch (error) {
      Alert.alert('Erro ao publicar', error.message);
    } finally {
      setCarregando(false);
    }
  };

  // Buscar anúncios existentes
  const carregarAnuncios = async () => {
    const { data, error } = await supabase.from('publicidades').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setAnuncios(data);
    }
  };

  useEffect(() => {
    carregarAnuncios();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Painel de Publicidade</Text>

      {/* FORMULÁRIO DE NOVA PUBLICIDADE */}
      <View style={styles.cardForm}>
        <Text style={styles.label}>Título da Publicidade *</Text>
        <TextInput 
          style={styles.input} 
          value={titulo} 
          onChangeText={setTitulo} 
          placeholder="Ex: Matrículas Abertas 2026" 
        />

        <Text style={styles.label}>Descrição (Opcional)</Text>
        <TextInput 
          style={[styles.input, { height: 70 }]} 
          value={descricao} 
          onChangeText={setDescricao} 
          placeholder="Detalhes ou informações de contacto..." 
          multiline 
        />

        {/* ÁREA DA FOTO */}
        <Text style={styles.label}>Foto do Banner *</Text>
        <TouchableOpacity style={styles.btnFoto} onPress={selecionarImagem}>
          <Text style={styles.btnFotoTexto}>
            {imagem ? 'Trocar Foto Selecionada' : 'Escolher Foto da Galeria'}
          </Text>
        </TouchableOpacity>

        {/* PRÉ-VISUALIZAÇÃO DA FOTO */}
        {imagem && (
          <Image source={{ uri: imagem.uri }} style={styles.previewImagem} />
        )}

        <TouchableOpacity 
          style={styles.btnPublicar} 
          onPress={publicarAnuncio}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnTexto}>Publicar Anúncio</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* LISTA DE PUBLICIDADES PUBLICADAS */}
      <Text style={styles.subtitulo}>Anúncios Ativos</Text>
      {anuncios.map((item) => (
        <View key={item.id} style={styles.cardAnuncio}>
          {item.imagem_url && (
            <Image source={{ uri: item.imagem_url }} style={styles.bannerAnuncio} />
          )}
          <Text style={styles.tituloAnuncio}>{item.titulo}</Text>
          {item.descricao ? <Text style={styles.descAnuncio}>{item.descricao}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 15 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 15, textAlign: 'center' },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginVertical: 15 },
  cardForm: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 15 },
  btnFoto: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnFotoTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  previewImagem: { width: '100%', height: 180, borderRadius: 8, marginBottom: 15, resizeMode: 'cover' },
  btnPublicar: { backgroundColor: '#059669', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cardAnuncio: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  bannerAnuncio: { width: '100%', height: 160, borderRadius: 8, marginBottom: 10, resizeMode: 'cover' },
  tituloAnuncio: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  descAnuncio: { fontSize: 13, color: '#6B7280', marginTop: 4 }
});
