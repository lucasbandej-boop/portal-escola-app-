import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  TextInput, 
  Alert,
  Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const ADS = [
  { id: '1', title: 'Propaganda Escolar 1', desc: 'Matrículas Abertas 2026', bg: '#1e293b' },
  { id: '2', title: 'Anúncio de Cursos', desc: 'Capacitação e Formação Técnica', bg: '#0f172a' },
  { id: '3', title: 'Espaço Publicitário', desc: 'Anuncie a sua instituição aqui', bg: '#1e1b4b' },
];

export default function App() {
  const [telaAtual, setTelaAtual] = useState('home'); 
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Estados do Cadastramento
  const [nomeEscola, setNomeEscola] = useState('');
  const [provincia, setProvincia] = useState('');
  const [nif, setNif] = useState('');
  const [documentoLegal, setDocumentoLegal] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ADS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAnexarPDF = () => {
    // Simulação de anexo de documento PDF
    setDocumentoLegal('processo_legalizacao.pdf');
    Alert.alert('Sucesso', 'Documento de legalização anexado com sucesso!');
  };

  const handleCadastrar = () => {
    if (!nomeEscola) {
      Alert.alert('Erro', 'Preencha o nome da instituição.');
      return;
    }
    Alert.alert('Sucesso', 'Instituição e processo de legalização submetidos para análise!');
    setTelaAtual('home');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Topo */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portal Escola</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {telaAtual === 'home' && (
          <View style={styles.cardSection}>
            <Text style={styles.welcomeText}>Gestão de Instituições de Ensino</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setTelaAtual('cadastramento')}
            >
              <Text style={styles.actionButtonText}>Cadastrar Instituição</Text>
            </TouchableOpacity>
          </View>
        )}

        {telaAtual === 'cadastramento' && (
          <View style={styles.cardSection}>
            <TouchableOpacity onPress={() => setTelaAtual('home')}>
              <Text style={styles.backLink}>← Voltar</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Cadastramento de Instituição</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Nome da Instituição" 
              placeholderTextColor="#94a3b8"
              value={nomeEscola}
              onChangeText={setNomeEscola}
            />
            <TextInput 
              style={styles.input} 
              placeholder="Província / Município" 
              placeholderTextColor="#94a3b8"
              value={provincia}
              onChangeText={setProvincia}
            />
            <TextInput 
              style={styles.input} 
              placeholder="NIF da Instituição" 
              placeholderTextColor="#94a3b8"
              value={nif}
              onChangeText={setNif}
            />

            {/* SEÇÃO DE LEGALIZAÇÃO E LICENCIAMENTO DENTRO DO CADASTRAMENTO */}
            <View style={styles.legalBox}>
              <Text style={styles.legalTitle}>Legalização e Licenciamento</Text>

              <TouchableOpacity style={styles.uploadButton} onPress={handleAnexarPDF}>
                <Text style={styles.uploadButtonText}>
                  {documentoLegal ? ` Anexado: ${documentoLegal}` : ' Anexar Processo em PDF'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleCadastrar}>
              <Text style={styles.actionButtonText}>Concluir Cadastramento</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quadro de Publicidades Rotativo no Rodapé */}
        <View style={[styles.adCard, { backgroundColor: ADS[currentAdIndex].bg }]}>
          <Text style={styles.adTag}>PUBLICIDADE</Text>
          <Text style={styles.adTitle}>{ADS[currentAdIndex].title}</Text>
          <Text style={styles.adDesc}>{ADS[currentAdIndex].desc}</Text>
          <TouchableOpacity style={styles.adCallButton} onPress={() => Linking.openURL('tel:929500600')}>
            <Text style={styles.adCallText}>Ligar 929 500 600</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e3a8a', paddingTop: 50, paddingBottom: 16, alignItems: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  cardSection: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2 },
  welcomeText: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  backLink: { color: '#2563eb', marginBottom: 12, fontWeight: '500' },
  actionButton: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  legalBox: { marginTop: 15, padding: 12, backgroundColor: '#eff6ff', borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  legalTitle: { fontWeight: 'bold', color: '#1e40af', fontSize: 15, marginBottom: 8 },
  uploadButton: { backgroundColor: '#2563eb', padding: 10, borderRadius: 6, alignItems: 'center' },
  uploadButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '500' },
  submitButton: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  adCard: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  adTag: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  adTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  adDesc: { color: '#cbd5e1', fontSize: 13, marginBottom: 12 },
  adCallButton: { backgroundColor: '#16a34a', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  adCallText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 }
});
