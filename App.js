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

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- COMPONENTE DO QUADRO DE PUBLICIDADE ROTATIVO (CARROSSEL) ---
function CarrosselPublicidades({ publicidadeLigar }) {
  const anuncios = [
    {
      id: 1,
      tag: '📢 Publicidade Patrocinada',
      titulo: 'Matérias a bom preço',
      corpo: '🇦🇴 Olá Angola, o regresso às aulas já é uma realidade, estamos a disponibilizar materiais de boa qualidade.\nLivros 📕 Cadernos 📓 Folha A4 Lápis',
      corFundo: '#1d4ed8'
    },
    {
      id: 2,
      tag: '👔 Confecção de Uniformes',
      titulo: 'Uniformes & Fardamentos',
      corpo: 'Produção de fardas escolares para colégios e institutos.\nBatas, camisas, calças e bordados personalizados com a melhor qualidade de Luanda.',
      corFundo: '#0f766e'
    },
    {
      id: 3,
      tag: '💻 Tecnologia Escolar',
      titulo: 'Softwares & Equipamentos',
      corpo: 'Computadores, impressoras e redes para instituições de ensino com assistência técnica garantida em Luanda.',
      corFundo: '#4338ca'
    }
  ];

  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % anuncios.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [anuncios.length]);

  const anuncioAtual = anuncios[indiceAtual];

  return (
    <View style={[styles.cardPublicidade, { backgroundColor: anuncioAtual.corFundo }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={styles.badgePatrocinado}>
          <Text style={styles.txtBadgePatrocinado}>{anuncioAtual.tag}</Text>
        </View>
        <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '600' }}>
          {indiceAtual + 1} / {anuncios.length}
        </Text>
      </View>

      <Text style={styles.tituloPublicidade}>{anuncioAtual.titulo}</Text>
      <Text style={styles.corpoPublicidade}>{anuncioAtual.corpo}</Text>

      <TouchableOpacity style={styles.btnLigarPub} onPress={publicidadeLigar}>
        <Text style={styles.rodapePublicidade}>
          Para mais informações ligue no número abaixo:{'\n'}
          <Text style={styles.telefonePublicidade}>📞 929500600 (Clique para Ligar)</Text>
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
        {anuncios.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setIndiceAtual(idx)}
            style={{
              width: idx === indiceAtual ? 18 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: idx === indiceAtual ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)',
              marginHorizontal: 3,
            }}
          />
        ))}
      </View>
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

      <ScrollView style={styles.homeContainer} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>
        <Text style={styles.secaoSubtitulo}>Selecione a opção desejada para navegar:</Text>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarLegalizacao}>
          <Text style={styles.cardEmoji}>📜</Text>
          <Text style={styles.cardMenuTitulo}>Legalização e Licenciamento</Text>
          <Text style={styles.cardMenuDesc}>
            Consulte os requisitos do Decreto 37/23 e submeta os documentos em PDF.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.cardEmoji}>🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
          <Text style={styles.cardMenuDesc}>
            Registe a sua escola para gerir turmas, alunos e professores.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarConsultaAlunos}>
          <Text style={styles.cardEmoji}>🔍</Text>
          <Text style={styles.cardMenuTitulo}>Consulta de Alunos e Encarregados</Text>
          <Text style={styles.cardMenuDesc}>
            Consulte o estado de matrícula e dados de estudantes.
          </Text>
        </TouchableOpacity>

        {/* QUADRO DE PUBLICIDADE FIXADO NO FUNDO */}
        <View style={{ marginTop: 16 }}>
          <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [tela, setTela] = useState('home');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      {tela === 'home' && (
        <MenuPrincipalHome
          onNavegarCadastramentoInst={() => {}}
          onNavegarConsultaAlunos={() => {}}
          onNavegarQuadroPub={() => {}}
          onNavegarLegalizacao={() => {}}
          publicidadeLigar={() => Linking.openURL('tel:929500600')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  homeContainer: { flex: 1, backgroundColor: '#f8fafc' },

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

  cardPublicidade: { borderRadius: 16, padding: 16, marginTop: 10, marginBottom: 20, elevation: 3 },
  badgePatrocinado: { backgroundColor: 'rgba(255, 255, 255, 0.25)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
  txtBadgePatrocinado: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  tituloPublicidade: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  corpoPublicidade: { fontSize: 13, color: '#e0e7ff', lineHeight: 20, marginBottom: 12 },
  btnLigarPub: { backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 10, borderRadius: 10 },
  rodapePublicidade: { fontSize: 12, color: '#c7d2fe', lineHeight: 16 },
  telefonePublicidade: { fontSize: 14, fontWeight: 'bold', color: '#fbbf24' },

  secaoTitulo: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  secaoSubtitulo: { fontSize: 14, color: '#64748b', marginBottom: 16 },

  cardMenuImageStyle: { backgroundColor: '#ffffff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardMenuTitulo: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  cardMenuDesc: { fontSize: 12, color: '#64748b', lineHeight: 17 },
});
