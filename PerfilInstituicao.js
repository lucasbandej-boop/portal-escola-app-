import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { supabase } from './supabase';

const { width } = Dimensions.get('window');

export default function PerfilInstituicao() {
  const [abaAtiva, setAbaAtiva] = useState('geral');
  const [instituicao, setInstituicao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Modal
  const [modalCurso, setModalCurso] = useState(false);
  const [nomeCurso, setNomeCurso] = useState('');
  const [duracaoCurso, setDuracaoCurso] = useState('');

  // Listas de Dados
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [classes, setClasses] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [alunosDestaque, setAlunosDestaque] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [publicidades, setPublicidades] = useState([]);

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

      const resCursos = await supabase.from('cursos').select('*');
      if (resCursos.data) setCursos(resCursos.data);

      // Carregar Publicidades ativas
      const resPub = await supabase.from('publicidades').select('*').eq('ativo', true);
      if (resPub.data) setPublicidades(resPub.data);

    } catch (err) {
      console.log('Erro ao carregar:', err);
    } finally {
      setCarregando(false);
    }
  };

  const salvarCurso = async () => {
    if (!nomeCurso) return Alert.alert('Aviso', 'Escreva o nome do curso.');
    const { error } = await supabase.from('cursos').insert([{ nome: nomeCurso, duracao: duracaoCurso }]);
    if (!error) {
      Alert.alert('Sucesso', 'Curso adicionado!');
      setNomeCurso('');
      setDuracaoCurso('');
      setModalCurso(false);
      carregarDados();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar o curso.');
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
      <ScrollView style={{ flex: 1 }}>
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

        {/* QUADROS / BOTÕES DE AÇÃO RÁPIDA */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaBotoes}>
          <TouchableOpacity style={[styles.quadroBtn, styles.quadroAzul]} onPress={() => Alert.alert('Aluno', 'Cadastrar Aluno')}>
            <Text style={styles.textoBtnAzul}>+ Cadastrar Aluno</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quadroBtn} onPress={() => Alert.alert('Professor', 'Cadastrar Professor')}>
            <Text style={styles.textoBtn}>+ Professor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quadroBtn} onPress={() => Alert.alert('Editar', 'Editar Perfil')}>
            <Text style={styles.textoBtn}>✏️ Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quadroBtn} onPress={() => setModalCurso(true)}>
            <Text style={styles.textoBtn}>🎓 + Curso</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* QUADRO / CARROSSEL DE PUBLICIDADE (SUBSTITUINDO A TRANSFERÊNCIA) */}
        <View style={styles.containerPublicidade}>
          {publicidades.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {publicidades.map((pub) => (
                <TouchableOpacity key={pub.id} style={styles.bannerPub} activeOpacity={0.9}>
                  {pub.imagem_url ? (
                    <Image source={{ uri: pub.imagem_url }} style={styles.imagemBanner} resizeMode="cover" />
                  ) : (
                    <View style={styles.bannerTextoContainer}>
                      <Text style={styles.tagPub}>📢 PUBLICIDADE</Text>
                      <Text style={styles.tituloPub}>{pub.titulo || 'Anuncie Aqui'}</Text>
                      <Text style={styles.descPub}>{pub.descricao || 'Alcance milhares de alunos e professores na nossa plataforma.'}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.bannerPadrao}>
              <Text style={styles.tagPub}>📢 PUBLICIDADE</Text>
              <Text style={styles.tituloPub}>Espaço Publicitário</Text>
              <Text style={styles.descPub}>Promova os seus serviços e cursos em todos os perfis de instituições do Portal Escola.</Text>
            </View>
          )}
        </View>

        {/* BARRA DE ABAS SUPERIOR */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuAbas}>
          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'geral' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('geral')}>
            <Text style={[styles.textoAba, abaAtiva === 'geral' && styles.textoAbaAtiva]}>Geral</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'cursos' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('cursos')}>
            <Text style={[styles.textoAba, abaAtiva === 'cursos' && styles.textoAbaAtiva]}>Cursos ({cursos.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'pauta' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('pauta')}>
            <Text style={[styles.textoAba, abaAtiva === 'pauta' && styles.textoAbaAtiva]}>📊 Pauta Trimestral</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'alunos' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('alunos')}>
            <Text style={[styles.textoAba, abaAtiva === 'alunos' && styles.textoAbaAtiva]}>Alunos ({alunos.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'professores' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('professores')}>
            <Text style={[styles.textoAba, abaAtiva === 'professores' && styles.textoAbaAtiva]}>Professores ({professores.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'classes' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('classes')}>
            <Text style={[styles.textoAba, abaAtiva === 'classes' && styles.textoAbaAtiva]}>📚 Classes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'eventos' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('eventos')}>
            <Text style={[styles.textoAba, abaAtiva === 'eventos' && styles.textoAbaAtiva]}>📅 Eventos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'destaque' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('destaque')}>
            <Text style={[styles.textoAba, abaAtiva === 'destaque' && styles.textoAbaAtiva]}>⭐ Alunos em Destaque</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* CONTEÚDO DAS ABAS */}
        <View style={styles.conteudo}>
          {abaAtiva === 'geral' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Visão Geral da Instituição</Text>
              <Text style={styles.descricao}>{instituicao?.descricao || 'Bem-vindo ao painel geral da instituição de ensino.'}</Text>
            </View>
          )}

          {abaAtiva === 'cursos' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Cursos Lecionados</Text>
              {cursos.length === 0 ? <Text style={styles.textoVazio}>Nenhum curso registado.</Text> : (
                cursos.map(item => (
                  <View key={item.id} style={styles.cardItem}>
                    <Text style={styles.itemTitulo}>• {item.nome}</Text>
                    {item.duracao ? <Text style={styles.itemSub}>Duração: {item.duracao}</Text> : null}
                  </View>
                ))
              )}
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
        </View>
      </ScrollView>

      {/* MODAL: ADICIONAR CURSO */}
      <Modal visible={modalCurso} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>Adicionar Novo Curso</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nome do Curso (ex: Informática)" 
              value={nomeCurso} 
              onChangeText={setNomeCurso} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Duração (ex: 3 Anos)" 
              value={duracaoCurso} 
              onChangeText={setDuracaoCurso} 
            />
            <TouchableOpacity style={styles.btnSalvar} onPress={salvarCurso}>
              <Text style={styles.btnTexto}>Salvar Curso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalCurso(false)}>
              <Text style={styles.btnTextoFechar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

  // BOTÕES EM QUADRO
  areaBotoes: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 10, maxHeight: 75 },
  quadroBtn: { 
    width: 105, 
    height: 65, 
    backgroundColor: '#E5E7EB', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10,
    padding: 5
  },
  quadroAzul: { backgroundColor: '#1D4ED8' },
  textoBtn: { color: '#000', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  textoBtnAzul: { color: '#FFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },

  // QUADRO DE PUBLICIDADE
  containerPublicidade: { marginHorizontal: 12, marginVertical: 8, borderRadius: 12, overflow: 'hidden' },
  bannerPub: { width: width - 24, height: 110, borderRadius: 12, backgroundColor: '#EFF6FF', overflow: 'hidden' },
  imagemBanner: { width: '100%', height: '100%', borderRadius: 12 },
  bannerTextoContainer: { padding: 12, justifyContent: 'center', height: '100%' },
  bannerPadrao: { width: '100%', height: 110, backgroundColor: '#1E40AF', padding: 14, borderRadius: 12, justifyContent: 'center' },
  tagPub: { fontSize: 10, fontWeight: 'bold', color: '#FDE047', marginBottom: 2 },
  tituloPub: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  descPub: { fontSize: 12, color: '#E0E7FF', marginTop: 4 },

  // BARRA DE ABAS
  menuAbas: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E5E7EB', maxHeight: 45, marginTop: 5 },
  btnAba: { paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  btnAbaAtiva: { borderBottomColor: '#2563EB' },
  textoAba: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  textoAbaAtiva: { color: '#2563EB', fontWeight: 'bold' },

  // CONTEÚDO
  conteudo: { padding: 15 },
  boxConteudo: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  subTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10 },
  descricao: { fontSize: 14, color: '#374151', lineHeight: 20 },
  textoVazio: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  itemLista: { fontSize: 14, color: '#1F2937', marginVertical: 4 },
  cardItem: { marginBottom: 8 },
  itemTitulo: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  itemSub: { fontSize: 12, color: '#6B7280', marginLeft: 12 },

  // MODAL
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBody: { backgroundColor: '#FFF', padding: 20, borderRadius: 10 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 12 },
  btnSalvar: { backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnTexto: { color: '#FFF', fontWeight: 'bold' },
  btnFechar: { padding: 10, alignItems: 'center', marginTop: 5 },
  btnTextoFechar: { color: '#DC2626', fontWeight: '600' }
});
