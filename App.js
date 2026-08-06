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
import * as DocumentPicker from 'expo-document-picker';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- COMPONENTE DO QUADRO DE PUBLICIDADE ---
function CarrosselPublicidades({ publicidadeLigar }) {
  return (
    <View style={{ backgroundColor: '#1d4ed8', padding: 20, borderRadius: 12, marginVertical: 10 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>📢 Quadro de Publicidade (Rodapé)</Text>
      <Text style={{ color: '#e0e7ff', marginTop: 5 }}>Materiais escolares, livros e cadernos disponíveis.</Text>
      <TouchableOpacity onPress={publicidadeLigar} style={{ marginTop: 10, padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6 }}>
        <Text style={{ color: '#fbbf24', fontWeight: 'bold' }}>📞 Ligar: 929500600</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- MENU PRINCIPAL (HOME) ---
function MenuPrincipalHome({ onNavegarCadastramentoInst, onNavegarConsultaAlunos, onNavegarQuadroPub, onNavegarLegalizacao, publicidadeLigar }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.headerRowHome}>
        <Text style={styles.homeTitleHeader}>Portal Escola</Text>
        <TouchableOpacity style={styles.btnHeaderPub} onPress={onNavegarQuadroPub}>
          <Text style={styles.txtHeaderPub}>📢 Publicidade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.homeContainer} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>
        <Text style={styles.secaoSubtitulo}>Selecione a opção desejada para navegar:</Text>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarLegalizacao}>
          <Text style={styles.cardEmoji}>📜</Text>
          <Text style={styles.cardMenuTitulo}>Legalização e Licenciamento</Text>
          <Text style={styles.cardMenuDesc}>Consulte os requisitos do Decreto 37/23.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.cardEmoji}>🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
          <Text style={styles.cardMenuDesc}>Registe a sua escola no sistema.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarConsultaAlunos}>
          <Text style={styles.cardEmoji}>🔍</Text>
          <Text style={styles.cardMenuTitulo}>Consulta de Alunos e Encarregados</Text>
          <Text style={styles.cardMenuDesc}>Consulte o estado de matrícula.</Text>
        </TouchableOpacity>

        {/* TESTE DIRETO NO RODAPÉ */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red', textAlign: 'center', marginVertical: 10 }}>--- FIM DA PÁGINA (RODAPÉ) ---</Text>
        <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <MenuPrincipalHome
        onNavegarCadastramentoInst={() => {}}
        onNavegarConsultaAlunos={() => {}}
        onNavegarQuadroPub={() => {}}
        onNavegarLegalizacao={() => {}}
        publicidadeLigar={() => Linking.openURL('tel:929500600')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRowHome: {
    height: 54,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  homeTitleHeader: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  btnHeaderPub: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe' },
  txtHeaderPub: { fontSize: 12, fontWeight: 'bold', color: '#1d4ed8' },
  secaoTitulo: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  secaoSubtitulo: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  cardMenuImageStyle: { backgroundColor: '#ffffff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardMenuTitulo: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  cardMenuDesc: { fontSize: 12, color: '#64748b', lineHeight: 17 }
});
