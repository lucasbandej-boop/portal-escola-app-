import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { supabase } from './lib/supabase';
import PerfilInstituicao from './PerfilInstituicao';

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu' ou 'perfil'
  const [session, setSession] = useState(null);

  // Monitora a sessão ativa no Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleOpenInstituicao = () => {
    setCurrentScreen('perfil');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    Alert.alert('Sessão Encerrada', 'Fizeste logout com sucesso.');
  };

  if (currentScreen === 'perfil') {
    return <PerfilInstituicao onVoltar={() => setCurrentScreen('menu')} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logoTitle}>Portal Escola</Text>
          {session && (
            <TouchableOpacity style={styles.logoutHeaderBtn} onPress={handleSignOut}>
              <Text style={styles.logoutHeaderBtnText}>Sair 🚪</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Menu Principal */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Menu Principal do Sistema</Text>
        <Text style={styles.sectionSubtitle}>Selecione a opção desejada para navegar:</Text>

        {/* Opção Destacada: Página da Instituição */}
        <TouchableOpacity style={styles.menuCard} onPress={handleOpenInstituicao}>
          <Text style={styles.cardIcon}>🏫</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Página da Instituição (Estilo Facebook)</Text>
            <Text style={styles.cardSubtext}>
              {session ? `Conectado como: ${session.user.email}` : 'Entrar ou criar conta da escola'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Outras opções */}
        <TouchableOpacity style={styles.menuCard} onPress={() => Alert.alert('Em breve')}>
          <Text style={styles.cardIcon}>🔍</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Pesquisa de Alunos e Encarregados</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => Alert.alert('Em breve')}>
          <Text style={styles.cardIcon}>👨‍🏫</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Cadastramento de Professores</Text>
          </View>
        </TouchableOpacity>

        {/* Banner de Uniformes */}
        <View style={styles.bannerDark}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>👕 Confecção de Uniformes (2 / 3)</Text>
          </View>
          <Text style={styles.bannerTitle}>Uniformes & Fardamentos</Text>
          <Text style={styles.bannerDescription}>
            Produção de fardas escolares para colégios e institutos. Batas, camisas, calças e bordados personalizados com a melhor qualidade de Luanda.
          </Text>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => Linking.openURL('tel:929561442')}
          >
            <Text style={styles.bannerButtonText}>📞 929561442 (Clique para Ligar)</Text>
          </TouchableOpacity>
        </View>

        {/* Suporte */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>🎧 Apoio ao Cliente & Suporte</Text>
          <Text style={styles.supportSubtitle}>Dúvidas ou problemas no portal? Fale conosco:</Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Linking.openURL('tel:929561442')}
          >
            <Text style={styles.supportButtonText}>📞 Ligar para o Suporte: 929561442</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 10, backgroundColor: '#fff' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoTitle: { fontSize: 24, fontWeight: 'bold', color: '#1d5bd8' },
  logoutHeaderBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  logoutHeaderBtnText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  sectionSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 15 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardIcon: { fontSize: 24, marginRight: 12 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  cardSubtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
  bannerDark: {
    backgroundColor: '#064e3b',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#047857',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  bannerDescription: { fontSize: 12, color: '#a7f3d0', lineHeight: 18, marginBottom: 12 },
  bannerButton: {
    backgroundColor: '#022c22',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bannerButtonText: { color: '#a7f3d0', fontWeight: 'bold', fontSize: 13 },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  supportTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  supportSubtitle: { fontSize: 12, color: '#64748b', marginVertical: 4 },
  supportButton: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  supportButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
