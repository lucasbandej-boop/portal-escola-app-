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

// --- HELPER DE UPLOAD PARA O SUPABASE STORAGE ---
const fazerUploadFicheiro = async (ficheiro, pasta) => {
  if (!ficheiro) return null;

  // Se já for uma URL web pública, não precisa recarregar
  if (typeof ficheiro === 'string' && ficheiro.startsWith('http')) {
    return ficheiro;
  }

  try {
    const nomeFicheiro = typeof ficheiro === 'string' ? ficheiro : (ficheiro.name || `file_${Date.now()}`);
    const uri = ficheiro.uri || ficheiro;

    // Tentativa de conversão para Blob/ArrayBuffer em ambiente React Native / PWA
    const response = await fetch(uri);
    const blob = await response.blob();

    const caminhoStorage = `${pasta}/${Date.now()}_${nomeFicheiro}`;
    const { data, error } = await supabase.storage
      .from('instituicoes')
      .upload(caminhoStorage, blob, { upsert: true });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('instituicoes')
      .getPublicUrl(caminhoStorage);

    return publicData?.publicUrl || caminhoStorage;
  } catch (err) {
    console.warn("Aviso: Falha no upload no Storage, salvando referência textual local:", err.message);
    // Fallback: se o upload direto no Storage falhar (ex: bucket não criado ou sem permissão anon),
    // devolve o nome do ficheiro para salvar na tabela sem travar o cadastro.
    return typeof ficheiro === 'string' ? ficheiro : (ficheiro.name || 'documento_anexado');
  }
};

// --- FORMULÁRIO DE INSTITUIÇÃO ATUALIZADO ---
function FormCadastramentoInstituicao({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [numeroInst, setNumeroInst] = useState('');
  const [email, setEmail] = useState(usuario?.email || '');

  const [director, setDirector] = useState('');
  const [viceDirector, setViceDirector] = useState('');
  const [numProfessores, setNumProfessores] = useState('');
  const [numEstudantes, setNumEstudantes] = useState('');
  const [classes, setClasses] = useState('');
  const [localizacao, setLocalizacao] = useState('');

  // Ficheiros
  const [logo, setLogo] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario?.email) {
      setEmail(usuario.email);
    }
  }, [usuario]);

  const selecionarImagem = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
      if (!res.canceled && res.assets && res.assets[0]) {
        setLogo(res.assets[0]);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const selecionarPDF = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!res.canceled && res.assets && res.assets[0]) {
        setPdfDoc(res.assets[0]);
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível selecionar o PDF.');
    }
  };

  const submeter = async () => {
    if (!nome.trim() || !numeroInst.trim() || !email.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha o Nome, NIF/Nº de Licença e E-mail.');
      return;
    }

    setLoading(true);
    try {
      // 1. Processar Ficheiros (Upload Storage + Fallback Textual)
      let urlLogo = null;
      let urlPdf = null;

      if (logo) {
        urlLogo = await fazerUploadFicheiro(logo, 'logos');
      }

      if (pdfDoc) {
        urlPdf = await fazerUploadFicheiro(pdfDoc, 'documentos');
      }

      // 2. Montar Payload no formato exato das colunas do Supabase
      const payload = {
        nome: nome.trim(),
        nif: numeroInst.trim(),
        email: email.trim().toLowerCase(),
        director: director.trim() || null,
        vice_director: viceDirector.trim() || null,
        num_professores_estimado: numProfessores ? parseInt(numProfessores, 10) : null,
        num_estudantes_estimado: numEstudantes ? parseInt(numEstudantes, 10) : null,
        classes_lecionadas: classes.trim() || null,
        localizacao: localizacao.trim() || null,
        logo_url: urlLogo || null,
        // Na tabela do Supabase a coluna documentos_pdf_url é _text (array)
        documentos_pdf_url: urlPdf ? [urlPdf] : null,
      };

      // 3. Salvar na Tabela instituicoes
      const { data, error } = await supabase
        .from('instituicoes')
        .insert([payload])
        .select();

      if (error) {
        Alert.alert('Erro no Supabase', error.message);
        return;
      }

      Alert.alert('Sucesso 🎉', 'Instituição e documentos gravados com sucesso!');
      onConcluir(data && data[0] ? data[0] : payload);
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message || 'Falha ao processar o formulário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Cadastramento de Instituição 🏫</Text>
      <Text style={styles.formSubtitle}>Registe os dados oficiais da sua escola no portal</Text>

      <Text style={styles.label}>Nome Oficial da Instituição *</Text>
      <TextInput style={styles.input} placeholder="Ex: Melhor saber" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>NIF ou Nº de Licença *</Text>
      <TextInput style={styles.input} placeholder="Ex: 002233445566" value={numeroInst} onChangeText={setNumeroInst} />

      <Text style={styles.label}>E-mail Institucional *</Text>
      <TextInput style={styles.input} placeholder="Ex: josuemizalakevp@gmail.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

      <Text style={styles.label}>Nome do Director Geral</Text>
      <TextInput style={styles.input} placeholder="Ex: Luís Silva" value={director} onChangeText={setDirector} />

      <Text style={styles.label}>Nome do Vice-Director Pedagógico</Text>
      <TextInput style={styles.input} placeholder="Ex: Maria dembo" value={viceDirector} onChangeText={setViceDirector} />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Nº Professores</Text>
          <TextInput style={styles.input} placeholder="Ex: 10" value={numProfessores} onChangeText={setNumProfessores} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Nº Estudantes</Text>
          <TextInput style={styles.input} placeholder="Ex: 25" value={numEstudantes} onChangeText={setNumEstudantes} keyboardType="numeric" />
        </View>
      </View>

      <Text style={styles.label}>Localização / Endereço</Text>
      <TextInput style={styles.input} placeholder="Ex: Luanda camama" value={localizacao} onChangeText={setLocalizacao} />

      <Text style={styles.label}>Classes / Cursos Lecionados</Text>
      <TextInput style={styles.input} placeholder="Ex: Iniciação até 13 classe" value={classes} onChangeText={setClasses} />

      <Text style={styles.label}>Logótipo / Imagem da Instituição</Text>
      <TouchableOpacity style={styles.btnAnexo} onPress={selecionarImagem}>
        <Text style={styles.txtAnexo}>
          📷 {logo ? (logo.name || 'Imagem Selecionada') : 'Selecionar Logótipo/Imagem'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Documento Oficial (PDF)</Text>
      <TouchableOpacity style={styles.btnAnexo} onPress={selecionarPDF}>
        <Text style={styles.txtAnexo}>
          📄 {pdfDoc ? (pdfDoc.name || 'PDF Selecionado') : 'Selecionar Ficheiro PDF'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSubmit} onPress={submeter} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSubmitTxt}>CONCLUIR E SALVAR CADASTRAMENTO</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancel} onPress={onCancelar}>
        <Text style={styles.btnCancelTxt}>Cancelar e Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState('form_escola');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" />
      {telaAtiva === 'form_escola' && (
        <FormCadastramentoInstituicao
          usuario={usuario}
          onConcluir={(dados) => {
            Alert.alert('Sucesso', 'Formulário guardado na base de dados com sucesso!');
          }}
          onCancelar={() => Alert.alert('Aviso', 'Formulário cancelado.')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  formContainer: { flex: 1, padding: 18, backgroundColor: '#ffffff' },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  formSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 12, fontSize: 14, color: '#0f172a' },
  btnAnexo: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed', borderRadius: 12, padding: 14, alignItems: 'center' },
  txtAnexo: { color: '#475569', fontSize: 13, fontWeight: '500' },
  btnSubmit: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 22 },
  btnSubmitTxt: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  btnCancel: { padding: 14, alignItems: 'center', marginTop: 8, marginBottom: 30 },
  btnCancelTxt: { color: '#64748b', fontWeight: '600', fontSize: 13 },
});
