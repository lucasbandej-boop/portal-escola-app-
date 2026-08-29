import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { supabase } from './supabase';

export default function PerfilInstituicao() {
  const [instituicao, setInstituicao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Estados dos Modais
  const [modalCurso, setModalCurso] = useState(false);
  const [modalEvento, setModalEvento] = useState(false);
  const [modalAluno, setModalAluno] = useState(false);

  // Estados dos Formulários
  const [nomeCurso, setNomeCurso] = useState('');
  const [duracaoCurso, setDuracaoCurso] = useState('');
  
  const [tituloEvento, setTituloEvento] = useState('');
  const [dataEvento, setDataEvento] = useState('');

  const [nomeAluno, setNomeAluno] = useState('');
  const [conquistaAluno, setConquistaAluno] = useState('');

  // Listas de dados
  const [cursos, setCursos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [alunosDestaque, setAlunosDestaque] = useState([]);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase.from('instituicoes').select('*').limit(1).single();
      if (data) setInstituicao(data);

      const resCursos = await supabase.from('cursos').select('*');
      if (resCursos.data) setCursos(resCursos.data);

      const resEventos = await supabase.from('eventos').select('*');
      if (resEventos.data) setEventos(resEventos.data);

      const resAlunos = await supabase.from('alunos_destaque').select('*');
      if (resAlunos.data) setAlunosDestaque(resAlunos.data);

    } catch (err) {
      console.log('Erro ao carregar dados:', err);
    } finally {
      setCarregando(false);
    }
  };

  const salvarCurso = async () => {
    if (!nomeCurso) return Alert.alert('Aviso', 'Preencha o nome do curso.');
    const { error } = await supabase.from('cursos').insert([{ nome: nomeCurso, duracao: duracaoCurso }]);
    if (!error) {
      Alert.alert('Sucesso', 'Curso adicionado!');
      setNomeCurso(''); setDuracaoCurso(''); setModalCurso(false);
      carregarPerfil();
    }
  };

  const salvarEvento = async () => {
    if (!tituloEvento) return Alert.alert('Aviso', 'Preencha o título do evento.');
    const { error } = await supabase.from('eventos').insert([{ titulo: tituloEvento, data_evento: dataEvento }]);
    if (!error) {
      Alert.alert('Sucesso', 'Evento adicionado!');
      setTituloEvento(''); setDataEvento(''); setModalEvento(false);
      carregarPerfil();
    }
  };

  const salvarAluno = async () => {
    if (!nomeAluno) return Alert.alert('Aviso', 'Preencha o nome do aluno.');
    const { error } = await supabase.from('alunos_destaque').insert([{ nome: nomeAluno, conquista: conquistaAluno }]);
    if (!error) {
      Alert.alert('Sucesso', 'Aluno em destaque adicionado!');
      setNomeAluno(''); setConquistaAluno(''); setModalAluno(false);
      carregarPerfil();
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
    <ScrollView style={styles.container}>
      {/* CABEÇALHO ATUALIZADO */}
      <View style={styles.header}>
        <Text style={styles.nomeInstituicao}>{instituicao?.nome || 'Colégio baú'}</Text>
        <Text style={styles.categoria}>🏫 Escola / Instituição de Ensino</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTexto}>NIF: {instituicao?.nif || '0082506071LA40'}</Text>
          <Text style={styles.infoTexto}>📞 Contacto: {instituicao?.telefone || instituicao?.contacto || '+244 9XX XXX XXX'}</Text>
          <Text style={styles.infoTexto}>✉️ Email: {instituicao?.email || 'contacto@escola.ao'}</Text>
        </View>
      </View>

      <View style={styles.divisor} />

      {/* PAINEL DE BOTÕES DE AÇÃO RÁPIDA */}
      <Text style={styles.secaoTitulo}>Gestão da Instituição</Text>
      <View style={styles.gridBotoes}>
        <TouchableOpacity style={[styles.cardBotao, { backgroundColor: '#2563EB' }]} onPress={() => setModalCurso(true)}>
          <Text style={styles.textoBotao}>+ Adicionar Curso</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.cardBotao, { backgroundColor: '#D97706' }]} onPress={() => setModalEvento(true)}>
          <Text style={styles.textoBotao}>+ Criar Evento</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.cardBotao, { backgroundColor: '#059669' }]} onPress={() => setModalAluno(true)}>
          <Text style={styles.textoBotao}>+ Aluno Destaque</Text>
        </TouchableOpacity>
      </View>

      {/* SECÇÕES */}
      <Text style={styles.secaoTitulo}>Cursos Disponíveis</Text>
      {cursos.length === 0 ? <Text style={styles.textoVazio}>Nenhum curso registado.</Text> : (
        cursos.map(item => (
          <View key={item.id} style={styles.cardItem}>
            <Text style={styles.itemTitulo}>{item.nome}</Text>
            {item.duracao ? <Text style={styles.itemSub}>Duração: {item.duracao}</Text> : null}
          </View>
        ))
      )}

      <Text style={styles.secaoTitulo}>Próximos Eventos</Text>
      {eventos.length === 0 ? <Text style={styles.textoVazio}>Nenhum evento agendado.</Text> : (
        eventos.map(item => (
          <View key={item.id} style={styles.cardItem}>
            <Text style={styles.itemTitulo}>{item.titulo}</Text>
            {item.data_evento ? <Text style={styles.itemSub}>Data: {item.data_evento}</Text> : null}
          </View>
        ))
      )}

      <Text style={styles.secaoTitulo}>Alunos em Destaque ⭐</Text>
      {alunosDestaque.length === 0 ? <Text style={styles.textoVazio}>Nenhum aluno destacado ainda.</Text> : (
        alunosDestaque.map(item => (
          <View key={item.id} style={[styles.cardItem, { borderColor: '#F59E0B' }]}>
            <Text style={styles.itemTitulo}>{item.nome}</Text>
            {item.conquista ? <Text style={styles.itemSub}>{item.conquista}</Text> : null}
          </View>
        ))
      )}

      {/* MODAIS */}
      <Modal visible={modalCurso} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>Adicionar Curso</Text>
            <TextInput style={styles.input} placeholder="Nome do Curso" value={nomeCurso} onChangeText={setNomeCurso} />
            <TextInput style={styles.input} placeholder="Duração (ex: 3 Anos / 6 Meses)" value={duracaoCurso} onChangeText={setDuracaoCurso} />
            <TouchableOpacity style={styles.btnSalvar} onPress={salvarCurso}><Text style={styles.btnTexto}>Salvar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalCurso(false)}><Text style={styles.btnTextoFechar}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalEvento} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>Criar Evento</Text>
            <TextInput style={styles.input} placeholder="Título do Evento" value={tituloEvento} onChangeText={setTituloEvento} />
            <TextInput style={styles.input} placeholder="Data (ex: 15 de Setembro)" value={dataEvento} onChangeText={setDataEvento} />
            <TouchableOpacity style={styles.btnSalvar} onPress={salvarEvento}><Text style={styles.btnTexto}>Salvar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalEvento(false)}><Text style={styles.btnTextoFechar}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalAluno} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>Aluno em Destaque</Text>
            <TextInput style={styles.input} placeholder="Nome do Aluno" value={nomeAluno} onChangeText={setNomeAluno} />
            <TextInput style={styles.input} placeholder="Conquista/Motivo do Destaque" value={conquistaAluno} onChangeText={setConquistaAluno} />
            <TouchableOpacity style={styles.btnSalvar} onPress={salvarAluno}><Text style={styles.btnTexto}>Salvar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalAluno(false)}><Text style={styles.btnTextoFechar}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
  nomeInstituicao: { fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center' },
  categoria: { fontSize: 15, color: '#555', marginTop: 4, textAlign: 'center' },
  infoBox: { marginTop: 8, alignItems: 'center' },
  infoTexto: { fontSize: 13, color: '#666', marginTop: 2, textAlign: 'center' },
  divisor: { height: 1, backgroundColor: '#E5E7EB', width: '100%', marginVertical: 10 },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginTop: 15, marginBottom: 10 },
  gridBotoes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardBotao: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 3 },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  cardItem: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8 },
  itemTitulo: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  itemSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  textoVazio: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 10 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBody: { backgroundColor: '#FFF', padding: 20, borderRadius: 10 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 12 },
  btnSalvar: { backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnTexto: { color: '#FFF', fontWeight: 'bold' },
  btnFechar: { padding: 10, alignItems: 'center', marginTop: 5 },
  btnTextoFechar: { color: '#DC2626', fontWeight: '600' }
});
