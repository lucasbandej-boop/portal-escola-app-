import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Linking, StatusBar,
} from 'react-native';

const TELEFONE = '929561442';

const ANUNCIOS = [
  {
    tag: '👕 Confecção de Uniformes',
    titulo: 'Uniformes & Fardamentos',
    texto:
      'Produção de fardas escolares para colégios e institutos. Batas, camisas, calças e bordados personalizados com a melhor qualidade de Luanda.',
    telefone: TELEFONE,
  },
  {
    tag: '📚 Anúncio 2',
    titulo: 'Título do anúncio',
    texto: 'Texto do segundo anúncio.',
    telefone: TELEFONE,
  },
  {
    tag: '📚 Anúncio 3',
    titulo: 'Título do anúncio',
    texto: 'Texto do terceiro anúncio.',
    telefone: TELEFONE,
  },
];

const OPCOES = [
  { icone: '🏫', titulo: 'Página da Instituição (Estilo Facebook)', rota: 'PaginaInstituicao' },
  { icone: '🔍', titulo: 'Pesquisa de Alunos e Encarregados', rota: 'PesquisaAlunos' },
  { icone: '👨‍🏫', titulo: 'Cadastramento de Professores', rota: 'CadastroProfessores' },
];

const ligar = (numero) => Linking.openURL(`tel:${numero}`);

export default function MenuPrincipal({ navigation }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndice((i) => (i + 1) % ANUNCIOS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const anuncio = ANUNCIOS[indice];

  const abrir = (rota) => {
    if (navigation) navigation.navigate(rota);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={s.header}>
        <Text style={s.logo}>Portal Escola</Text>
      </View>

      <ScrollView contentContainerStyle={s.conteudo}>
        <Text style={s.titulo}>Menu Principal do Sistema</Text>
        <Text style={s.subtitulo}>Selecione a opção desejada para navegar.</Text>

        {OPCOES.map((o) => (
          <TouchableOpacity
            key={o.rota}
            style={s.card}
            activeOpacity={0.7}
            onPress={() => abrir(o.rota)}
          >
            <Text style={s.icone}>{o.icone}</Text>
            <Text style={s.cardTexto}>{o.titulo}</Text>
          </TouchableOpacity>
        ))}

        <View style={s.anuncio}>
          <View style={s.tag}>
            <Text style={s.tagTexto}>
              {anuncio.tag} ({indice + 1} / {ANUNCIOS.length})
            </Text>
          </View>
          <Text style={s.anuncioTitulo}>{anuncio.titulo}</Text>
          <Text style={s.anuncioTexto}>{anuncio.texto}</Text>
          <TouchableOpacity
            style={s.anuncioBotao}
            onPress={() => ligar(anuncio.telefone)}
          >
            <Text style={s.anuncioBotaoTexto}>
              📞 {anuncio.telefone} (Clique para Ligar)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.suporte}>
          <Text style={s.suporteTitulo}>🎧 Apoio ao Cliente & Suporte</Text>
          <Text style={s.suporteSub}>
            Dúvidas ou problemas no portal? Fale conosco:
          </Text>
          <TouchableOpacity style={s.suporteBotao} onPress={() => ligar(TELEFONE)}>
            <Text style={s.suporteBotaoTexto}>
              📞 Ligar para o Suporte: {TELEFONE}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f3f5' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#2563eb' },
  conteudo: { padding: 16, paddingBottom: 40 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 15, color: '#6b7280', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icone: { fontSize: 36, marginRight: 16 },
  cardTexto: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#111827' },
  anuncio: {
    backgroundColor: '#065f46',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  tagTexto: { color: '#a7f3d0', fontSize: 14, fontWeight: '600' },
  anuncioTitulo: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  anuncioTexto: { color: '#d1fae5', fontSize: 16, lineHeight: 24, marginBottom: 14 },
  anuncioBotao: {
    backgroundColor: '#022c22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  anuncioBotaoTexto: { color: '#6ee7b7', fontSize: 17, fontWeight: 'bold' },
  suporte: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    alignItems: 'center',
  },
  suporteTitulo: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  suporteSub: { fontSize: 15, color: '#6b7280', marginVertical: 8, textAlign: 'center' },
  suporteBotao: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  suporteBotaoTexto: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
