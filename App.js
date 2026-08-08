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
  ActivityIndicator,
  Modal,
  Linking
} from 'react-native';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

function CarrosselPublicidades({ publicidadeLigar }) {
  return (
    <View style={styles.cardPublicidade}>
      <Text style={styles.tituloPublicidade}>📢 Publicidade Patrocinada</Text>
      <Text style={styles.corpoPublicidade}>
        🇦🇴 Olá Angola, o regresso às aulas já é uma realidade, estamos a disponibilizar materiais de boa qualidade.{'\n'}
        Livros 📕 Cadernos 📓 Folha A4 Lápis
      </Text>
      <TouchableOpacity style={styles.btnLigarPub} onPress={publicidadeLigar}>
        <Text style={styles.telefonePublicidade}>📞 929500600 (Clique para Ligar)</Text>
      </TouchableOpacity>
    </View>
  );
}

function MenuPrincipalHome({ usuario, onNavegarCadastramentoInst, onNavegarCadastramentoProf, onNavegarPesquisa, onLogout, publicidadeLigar }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.headerRowHome}>
        <Text style={styles.homeTitleHeader}>Portal Escola 🎓</Text>
        {usuario && (
          <TouchableOpacity style={styles.btnHeaderLogout} onPress={onLogout}>
            <Text style={styles.txtHeaderLogout}>Sair</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.secaoTitulo}>Menu Principal</Text>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.cardEmoji}>🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarPesquisa}>
          <Text style={styles.cardEmoji}>🔍</Text>
          <Text style={styles.cardMenuTitulo}>Pesquisa de Alunos e Encarregados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarCadastramentoProf}>
          <Text style={styles.cardEmoji}>👨‍🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Professores</Text>
        </TouchableOpacity>

        <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState('home');
  const [usuario, setUsuario] = useState(null);

  const ligarParaSuporte = () => {
    Linking.openURL('tel:929500600');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="dark" />
      
      {telaAtual === 'home' && (
        <MenuPrincipalHome
          usuario={usuario}
          onLogout={() => setUsuario(null)}
          onNavegarCadastramentoInst={() => alert('Abrindo Instituições...')}
          onNavegarCadastramentoProf={() => alert('Abrindo Professores...')}
          onNavegarPesquisa={() => alert('Abrindo Pesquisa...')}
          publicidadeLigar={ligarParaSuporte}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRowHome: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 45, paddingBottom: 15, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  homeTitleHeader: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  btnHeaderLogout: { backgroundColor: '#fee2e2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  txtHeaderLogout: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  cardMenu: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity: 0.05, shadowRadius: 2 },
  cardEmoji: { fontSize: 24, marginBottom: 8 },
  cardMenuTitulo: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cardPublicidade: { backgroundColor: '#1d4ed8', borderRadius: 12, padding: 16, marginTop: 12 },
  tituloPublicidade: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' },
  corpoPublicidade: { color: '#f8fafc', fontSize: 13, marginTop: 4 },
  btnLigarPub: { marginTop: 10, backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 6 },
  telefonePublicidade: { color: '#fbbf24', fontWeight: 'bold' }
});
