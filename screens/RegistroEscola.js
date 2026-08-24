import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Modal, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../supabase';

export default function RegistroEscola({ navigation }) {
  const [modalVisivel, setModalVisivel] = useState(true);
  const [aceitouRequisitos, setAceitouRequisitos] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [documentoPDF, setDocumentoPDF] = useState(null);

  // Selecionar o documento PDF do telemóvel
  const selecionarPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocumentoPDF(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar o ficheiro.');
    }
  };

  // Enviar os dados para o Supabase
  const handleRegistro = async () => {
    if (!nome || !nif || !localizacao) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (!documentoPDF) {
      Alert.alert('Aviso', 'É obrigatório anexar o documento PDF do processo.');
      return;
    }

    setCarregando(true);

    try {
      // 1. Preparar o ficheiro para Upload
      const fileName = `doc_${Date.now()}_${documentoPDF.name.replace(/\s+/g, '_')}`;
      const response = await fetch(documentoPDF.uri);
      const blob = await response.blob();

      // 2. Upload para o Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documentos-instituicoes')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
        });

      if (storageError) throw storageError;

      // 3. Pegar a URL pública
      const { data: publicUrlData } = supabase.storage
        .from('documentos-instituicoes')
        .getPublicUrl(fileName);

      const pdfUrl = publicUrlData.publicUrl;

      // 4. Salvar na tabela 'instituicoes'
      const { error: dbError } = await supabase
        .from('instituicoes')
        .insert([
          {
            nome,
            nif,
            provincias_municipios: localizacao,
            documentacao_url: pdfUrl,
          },
        ]);

      if (dbError) throw dbError;

      Alert.alert('Sucesso', 'Instituição e documentação registadas com sucesso!');
      if (navigation && navigation.goBack) navigation.goBack();

    } catch (error) {
      Alert.alert('Erro ao registar', error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* MODAL COM OS REQUISITOS DO DECRETO PRESIENCIAL N.º 37/23 */}
      <Modal visible={modalVisivel} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitulo}>Requisitos de Licenciamento</Text>
          <Text style={styles.modalSubtitulo}>
            Decreto Presidencial n.º 37/23 (Regime Jurídico das Instituições Privadas de Educação em Angola)
          </Text>

          <ScrollView style={styles.modalScroll}>
            <Text style={styles.secaoTitulo}>➡️ Documentos Jurídicos da Entidade Promotora:</Text>
            <Text style={styles.itemTexto}>• Certidão de Registo Comercial ou Pacto Social</Text>
            <Text style={styles.itemTexto}>• Certificado de Admissibilidade (GUE)</Text>
            <Text style={styles.itemTexto}>• Número de Identificação Fiscal (NIF)</Text>
            <Text style={styles.itemTexto}>• Cópia do B.I. e Registo Criminal dos promotores</Text>

            <Text style={styles.secaoTitulo}>➡️ Documentação Pedagógica e Administrativa:</Text>
            <Text style={styles.itemTexto}>• Requerimento dirigido à entidade licenciadora</Text>
            <Text style={styles.itemTexto}>• Projeto Educativo e Regulamento Interno</Text>
            <Text style={styles.itemTexto}>• Planos de Estudos e Programas Curriculares (MED)</Text>
            <Text style={styles.itemTexto}>• Mapa de pessoal docente/administrativo e certificados</Text>
            <Text style={styles.itemTexto}>• Proposta do Preçário (propinas/comparticipações)</Text>

            <Text style={styles.secaoTitulo}>➡️ Documentos Técnicos da Infraestrutura:</Text>
            <Text style={styles.itemTexto}>• Título de propriedade ou Contrato de Arrendamento</Text>
            <Text style={styles.itemTexto}>• Planta de arquitetura aprovada pela Administração</Text>
            <Text style={styles.itemTexto}>• Parecer da Saúde, Alvará e Certificado dos Bombeiros</Text>
          </ScrollView>

          <TouchableOpacity 
            style={styles.btnContinuar}
            onPress={() => {
              setAceitouRequisitos(true);
              setModalVisivel(false);
            }}
          >
            <Text style={styles.btnTexto}>Compreendo os Requisitos — Prosseguir</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* FORMULÁRIO DE REGISTO */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.tituloForm}>Inscrição da Instituição</Text>

        <Text style={styles.label}>Nome da Instituição *</Text>
        <TextInput 
          style={styles.input} 
          value={nome} 
          onChangeText={setNome} 
          placeholder="Ex: Colégio A" 
        />

        <Text style={styles.label}>NIF *</Text>
        <TextInput 
          style={styles.input} 
          value={nif} 
          onChangeText={setNif} 
          placeholder="Número de Identificação Fiscal" 
        />

        <Text style={styles.label}>Localização (Província, Município) *</Text>
        <TextInput 
          style={styles.input} 
          value={localizacao} 
          onChangeText={setLocalizacao} 
          placeholder="Ex: Benguela, Lobito" 
        />

        {/* CAMPO DE SELEÇÃO DE PDF */}
        <View style={styles.pdfContainer}>
          <Text style={styles.labelPdf}>Documentação Completa (PDF) *</Text>
          <TouchableOpacity style={styles.btnPdf} onPress={selecionarPDF}>
            <Text style={styles.btnPdfTexto}>
              {documentoPDF ? `Ficheiro: ${documentoPDF.name}` : 'Selecionar Documento PDF'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.btnSubmeter} 
          onPress={handleRegistro}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnTexto}>Submeter Inscrição</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#FFF', justifyContent: 'space-between' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A', marginTop: 20 },
  modalSubtitulo: { fontSize: 12, color: '#D97706', marginBottom: 15, marginTop: 5 },
  modalScroll: { flex: 1, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, marginBottom: 15 },
  secaoTitulo: { fontWeight: 'bold', fontSize: 14, color: '#1F2937', marginTop: 10, marginBottom: 5 },
  itemTexto: { fontSize: 12, color: '#4B5563', marginLeft: 10, marginBottom: 3 },
  btnContinuar: { backgroundColor: '#2563EB', padding: 15, borderRadius: 8, alignItems: 'center' },
  formContainer: { padding: 20 },
  tituloForm: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 15 },
  pdfContainer: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', padding: 15, borderRadius: 8, marginBottom: 20 },
  labelPdf: { fontSize: 14, fontWeight: 'bold', color: '#1E40AF', marginBottom: 8 },
  btnPdf: { backgroundColor: '#2563EB', padding: 10, borderRadius: 6, alignItems: 'center' },
  btnPdfTexto: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  btnSubmeter: { backgroundColor: '#059669', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
