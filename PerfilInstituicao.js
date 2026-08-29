import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { supabase } from './supabase';

export default function PerfilInstituicao() {
  const [abaAtiva, setAbaAtiva] = useState('geral'); // 'geral', 'pauta', 'alunos', 'professores', 'classes', 'eventos', 'destaque'
  const [instituicao, setInstituicao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Estados de Listas
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [classes, setClasses] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [alunosDestaque, setAlunosDestaque] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const { data } = await supabase.from('instituicoes').select('*').limit(1).single();
      if (data) setInstituicao(data);

      const resAlunos = await supabase.from('alunos').select('*');
      if (resAlunos.data) setAlunos(resAlunos.data);

      const resProf = await supabase.from('professores').select('*');
      if (resProf.data) setProfessores(resProf.data);

      const resClasses = await supabase.from('classes').select('*');
      if (resClasses.data) setClasses(resClasses.data);

      const resEventos = await supabase.from('eventos').select('*');
      if (resEventos.data) setEventos(resEventos.data);

      const resDestaques = await supabase.from('alunos_destaque').select('*');
      if (resDestaques.data) setAlunosDestaque(resDestaques.data);

    } catch (err) {
      console.log('Erro ao carregar:', err);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* CABEÇALHO DA INSTITUIÇÃO */}
      <View style={styles.header}>
        <Text style={styles.nomeInstituicao}>{instituicao?.nome || 'Colégio baú'}</Text>
        <Text style={styles.categoria}>🏫 Escola / Instituição de Ensino</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTexto}>NIF: {instituicao?.nif || '0082506071LA40'}</Text>
          <Text style={styles.infoTexto}>📞 Contacto: {instituicao?.contacto || '+244 9XX XXX XXX'}</Text>
          <Text style={styles.infoTexto}>✉️ Email: {instituicao?.email || 'contacto@escola.ao'}</Text>
        </View>
      </View>

      {/* BARRA DE ABAS DE NAVEGAÇÃO SUPERIOR */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuAbas}>
        <TouchableOpacity 
          style={[styles.btnAba, abaAtiva === 'geral' && styles.btnAbaAtiva]} 
          onPress={() => setAbaAtiva('geral')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'geral' && styles.textoAbaAtiva]}>Geral</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnAba, abaAtiva === 'pauta' && styles.btnAbaAtiva]} 
          onPress={() => setAbaAtiva('pauta')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'pauta' && styles.textoAbaAtiva]}>📊 Pauta Trimestral</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnAba, abaAtiva === 'alunos' && styles.btnAbaAtiva]} 
          onPress={() => setAbaAtiva('alunos')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'alunos' && styles.textoAbaAtiva]}>Alunos ({alunos.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnAba, abaAtiva === 'professores' && styles.btnAbaAtiva]} 
          onPress={() => setAbaAtiva('professores')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'professores' && styles.textoAbaAtiva]}>Professores ({professores.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnAba, abaAtiva === 'classes' && styles.btnAbaAtiva]} 
          onPress={() => setAbaAtiva('classes')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'classes' && styles.textoAbaAtiva]}>📚 Classes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnAba, abaAtiva === 'eventos' && styles.btnAbaAtiva]} 
          onPress={() => setAbaAtiva('eventos')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'eventos' && styles.textoAbaAtiva]}>📅 Eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnAba, abaAtiva === 'destaque' && styles.btnAbaAtiva]} 
          onPress={() => setAbaAtiva('destaque')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'destaque' && styles.textoAbaAtiva]}>⭐ Alunos em Destaque</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CONTEÚDO DAS ABAS */}
      <ScrollView style={styles.conteudo}>
        {abaAtiva === 'geral' && (
          <View style={styles.boxConteudo}>
            <Text style={styles.subTitulo}>Visão Geral da Instituição</Text>
            <Text style={styles.descricao}>{instituicao?.descricao || 'Bem-vindo ao painel geral da instituição de ensino.'}</Text>
          </View>
        )}

        {abaAtiva === 'pauta' && (
          <View style={styles.boxConteudo}>
            <Text style={styles.subTitulo}>Pauta Trimestral</Text>
            <Text style={styles.textoVazio}>Nenhuma pauta lançada para este trimestre.</Text>
          </View>
        )}

        {abaAtiva === 'alunos' && (
          <View style={styles.boxConteudo}>
            <Text style={styles.subTitulo}>Lista de Alunos</Text>
            {alunos.length === 0 ? <Text style={styles.textoVazio}>Nenhum aluno registado.</Text> : (
              alunos.map(item => <Text key={item.id} style={styles.itemLista}>• {item.nome}</Text>)
            )}
          </View>
        )}

        {abaAtiva === 'professores' && (
          <View style={styles.boxConteudo}>
            <Text style={styles.subTitulo}>Corpo Docente</Text>
            {professores.length === 0 ? <Text style={styles.textoVazio}>Nenhum professor registado.</Text> : (
              professores.map(item => <Text key={item.id} style={styles.itemLista}>• {item.nome}</Text>)
            )}
          </View>
        )}

        {abaAtiva === 'classes' && (
          <View style={styles.boxConteudo}>
            <Text style={styles.subTitulo}>Classes / Turmas</Text>
            {classes.length === 0 ? <Text style={styles.textoVazio}>Nenhuma classe criada.</Text> : (
              classes.map(item => <Text key={item.id} style={styles.itemLista}>• {item.nome}</Text>)
            )}
          </View>
        )}

        {abaAtiva === 'eventos' && (
          <View style={styles.boxConteudo}>
            <Text style={styles.subTitulo}>Próximos Eventos</Text>
            {eventos.length === 0 ? <Text style={styles.textoVazio}>Nenhum evento agendado.</Text> : (
              eventos.map(item => <Text key={item.id} style={styles.itemLista}>📅 {item.titulo} ({item.data_evento})</Text>)
            )}
          </View>
        )}

        {abaAtiva === 'destaque' && (
          <View style={styles.boxConteudo}>
            <Text style={styles.subTitulo}>Alunos em Destaque ⭐</Text>
            {alunosDestaque.length === 0 ? <Text style={styles.textoVazio}>Nenhum aluno em destaque registado.</Text> : (
              alunosDestaque.map(item => <Text key={item.id} style={styles.itemLista}>⭐ {item.nome} - {item.conquista}</Text>)
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingTop: 15, paddingHorizontal: 15, paddingBottom: 10 },
  nomeInstituicao: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center' },
  categoria: { fontSize: 14, color: '#555', marginTop: 3, textAlign: 'center' },
  infoBox: { marginTop: 6, alignItems: 'center' },
  infoTexto: { fontSize: 13, color: '#666', marginTop: 2, textAlign: 'center' },
  menuAbas: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E5E7EB', maxHeight: 50 },
  btnAba: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  btnAbaAtiva: { borderBottomColor: '#2563EB' },
  textoAba: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  textoAbaAtiva: { color: '#2563EB', fontWeight: 'bold' },
  conteudo: { flex: 1, padding: 15 },
  boxConteudo: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  subTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10 },
  descricao: { fontSize: 14, color: '#374151', lineHeight: 20 },
  textoVazio: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  itemLista: { fontSize: 14, color: '#1F2937', marginVertical: 4 }
});
