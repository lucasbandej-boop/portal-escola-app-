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
  const [abaAtiva, setAbaAtiva] = useState('alunos');
  const [instituicao, setInstituicao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Modal Curso
  const [modalCurso, setModalCurso] = useState(false);
  const [nomeCurso, setNomeCurso] = useState('');
  const [duracaoCurso, setDuracaoCurso] = useState('');

  // Modal Perfil do Aluno & Edição
  const [modalAluno, setModalAluno] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [modoEdicaoAluno, setModoEdicaoAluno] = useState(false);
  const [formAluno, setFormAluno] = useState({
    nome: '',
    processo: '',
    curso: '',
    nivel: '',
    classe: '',
    encarregado: '',
    contacto: ''
  });

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

      const resPub = await supabase.from('publicidades').select('*').eq('ativo', true);
      if (resPub.data) setPublicidades(resPub.data);

    } catch (err) {
      console.log('Erro ao carregar:', err);
    } finally {
      setCarregando(false);
    }
  };

  const abrirPerfilAluno = (aluno) => {
    setAlunoSelecionado(aluno);
    setFormAluno({
      nome: aluno.nome || '',
      processo: aluno.processo || aluno.proc || '',
      curso: aluno.curso || '',
      nivel: aluno.nivel || '',
      classe: aluno.classe || '',
      encarregado: aluno.encarregado || '',
      contacto: aluno.contacto || ''
    });
    setModoEdicaoAluno(false);
    setModalAluno(true);
  };

  const salvarEdicaoAluno = async () => {
    if (!alunoSelecionado) return;
    
    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          nome: formAluno.nome,
          processo: formAluno.processo,
          curso: formAluno.curso,
          nivel: formAluno.nivel,
          classe: formAluno.classe,
          encarregado: formAluno.encarregado,
          contacto: formAluno.contacto
        })
        .eq('id', alunoSelecionado.id);

      if (!error) {
        Alert.alert('Sucesso', 'Dados do aluno atualizados!');
        setModoEdicaoAluno(false);
        setModalAluno(false);
        carregarDados();
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar os dados.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Ocorreu uma falha ao salvar.');
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
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <Text style={styles.nomeInstituicao}>{instituicao?.nome || 'Colégio baú'}</Text>
          <Text style={styles.categoria}>🏫 Escola / Instituição de Ensino</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoTexto}>NIF: {instituicao?.nif || '0082506071LA40'}</Text>
            <Text style={styles.infoTexto}>📞 Contacto: {instituicao?.contacto || '+244 9XX XXX XXX'}</Text>
            <Text style={styles.infoTexto}>✉️ Email: {instituicao?.email || 'contacto@escola.ao'}</Text>
          </View>
        </View>

        {/* BOTOES DE AÇÃO */}
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

        {/* BANNER PUBLICIDADE */}
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
                      <Text style={styles.descPub}>{pub.descricao || 'Alcance milhares de alunos no Portal Escola.'}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.bannerPadrao}>
              <Text style={styles.tagPub}>📢 PUBLICIDADE</Text>
              <Text style={styles.tituloPub}>Espaço Publicitário</Text>
              <Text style={styles.descPub}>Promova os seus serviços e cursos em todos os perfis de instituições.</Text>
            </View>
          )}
        </View>

        {/* MENU DE ABAS */}
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

        {/* CONTEÚDO */}
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

          {abaAtiva === 'alunos' && (
            <View>
              {alunos.length === 0 ? (
                <Text style={styles.textoVazio}>Nenhum aluno registado.</Text>
              ) : (
                alunos.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.cardAluno} 
                    activeOpacity={0.7}
                    onPress={() => abrirPerfilAluno(item)}
                  >
                    {item.foto_url ? (
                      <Image source={{ uri: item.foto_url }} style={styles.fotoAluno} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={{ fontSize: 24 }}>🎒</Text>
                      </View>
                    )}

                    <View style={styles.infoAlunoCard}>
                      <Text style={styles.nomeAlunoCard}>{item.nome}</Text>
                      <Text style={styles.detalheAlunoCard}>Proc: {item.processo || item.proc || 'PROC-000000'}</Text>
                      {item.curso ? (
                        <Text style={styles.detalheAlunoCard}>Curso: {item.curso}</Text>
                      ) : (
                        <Text style={styles.detalheAlunoCard}>Nível: {item.nivel || item.classe || 'Geral'}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
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

      {/* MODAL PERFIL DO ESTUDANTE (COM EDIÇÃO) */}
      <Modal visible={modalAluno} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modalPerfilBody}>
            <Text style={styles.modalTitulo}>
              {modoEdicaoAluno ? '✏️ Editar Dados do Aluno' : '👤 Perfil do Estudante'}
            </Text>

            {/* FOTO DO ALUNO */}
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              {alunoSelecionado?.foto_url ? (
                <Image source={{ uri: alunoSelecionado.foto_url }} style={styles.fotoPerfilGrande} />
              ) : (
                <View style={styles.avatarPlaceholderGrande}>
                  <Text style={{ fontSize: 40 }}>👤</Text>
                </View>
              )}
            </View>

            {modoEdicaoAluno ? (
              /* FORMULÁRIO DE EDIÇÃO */
              <View style={{ width: '100%' }}>
                <Text style={styles.labelInput}>Nome Completo:</Text>
                <TextInput style={styles.input} value={formAluno.nome} onChangeText={(t) => setFormAluno({...formAluno, nome: t})} />

                <Text style={styles.labelInput}>Nº de Processo:</Text>
                <TextInput style={styles.input} value={formAluno.processo} onChangeText={(t) => setFormAluno({...formAluno, processo: t})} />

                <Text style={styles.labelInput}>Curso:</Text>
                <TextInput style={styles.input} value={formAluno.curso} onChangeText={(t) => setFormAluno({...formAluno, curso: t})} />

                <Text style={styles.labelInput}>Classe / Nível:</Text>
                <TextInput style={styles.input} value={formAluno.nivel} onChangeText={(t) => setFormAluno({...formAluno, nivel: t})} />

                <Text style={styles.labelInput}>Encarregado de Educação:</Text>
                <TextInput style={styles.input} value={formAluno.encarregado} onChangeText={(t) => setFormAluno({...formAluno, encarregado: t})} />

                <Text style={styles.labelInput}>Contacto do Encarregado:</Text>
                <TextInput style={styles.input} value={formAluno.contacto} keyboardType="phone-pad" onChangeText={(t) => setFormAluno({...formAluno, contacto: t})} />

                <TouchableOpacity style={styles.btnSalvar} onPress={salvarEdicaoAluno}>
                  <Text style={styles.btnTexto}>💾 Guardar Alterações</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnCancelar} onPress={() => setModoEdicaoAluno(false)}>
                  <Text style={{ color: '#4B5563', fontWeight: 'bold' }}>Cancelar Edição</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* VISUALIZAÇÃO DOS DADOS DO ALUNO */
              <View style={{ width: '100%' }}>
                <View style={styles.infoLinha}><Text style={styles.infoLabel}>Nome:</Text><Text style={styles.infoValor}>{alunoSelecionado?.nome}</Text></View>
                <View style={styles.infoLinha}><Text style={styles.infoLabel}>Processo:</Text><Text style={styles.infoValor}>{alunoSelecionado?.processo || alunoSelecionado?.proc || 'N/A'}</Text></View>
                <View style={styles.infoLinha}><Text style={styles.infoLabel}>Curso:</Text><Text style={styles.infoValor}>{alunoSelecionado?.curso || 'N/A'}</Text></View>
                <View style={styles.infoLinha}><Text style={styles.infoLabel}>Nível / Classe:</Text><Text style={styles.infoValor}>{alunoSelecionado?.nivel || alunoSelecionado?.classe || 'N/A'}</Text></View>
                <View style={styles.infoLinha}><Text style={styles.infoLabel}>Encarregado:</Text><Text style={styles.infoValor}>{alunoSelecionado?.encarregado || 'Não Registado'}</Text></View>
                <View style={styles.infoLinha}><Text style={styles.infoLabel}>Contacto:</Text><Text style={styles.infoValor}>{alunoSelecionado?.contacto || 'Não Registado'}</Text></View>

                <TouchableOpacity style={styles.btnEditarPerfil} onPress={() => setModoEdicaoAluno(true)}>
                  <Text style={styles.btnTexto}>✏️ Editar Dados do Estudante</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalAluno(false)}>
              <Text style={styles.btnTextoFechar}>Fechar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL CURSO */}
      <Modal visible={modalCurso} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>Adicionar Novo Curso</Text>
            <TextInput style={styles.input} placeholder="Nome do Curso (ex: Informática)" value={nomeCurso} onChangeText={setNomeCurso} />
            <TextInput style={styles.input} placeholder="Duração (ex: 3 Anos)" value={duracaoCurso} onChangeText={setDuracaoCurso} />
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
  mainContainer: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingTop: 15, paddingHorizontal: 15, paddingBottom: 10, backgroundColor: '#FFF' },
  nomeInstituicao: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center' },
  categoria: { fontSize: 14, color: '#555', marginTop: 3, textAlign: 'center' },
  infoBox: { marginTop: 6, alignItems: 'center' },
  infoTexto: { fontSize: 13, color: '#666', marginTop: 2, textAlign: 'center' },

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

  containerPublicidade: { marginHorizontal: 12, marginVertical: 8, borderRadius: 12, overflow: 'hidden' },
  bannerPub: { width: width - 24, height: 110, borderRadius: 12, backgroundColor: '#EFF6FF', overflow: 'hidden' },
  imagemBanner: { width: '100%', height: '100%', borderRadius: 12 },
  bannerTextoContainer: { padding: 12, justifyContent: 'center', height: '100%' },
  bannerPadrao: { width: '100%', height: 110, backgroundColor: '#1E40AF', padding: 14, borderRadius: 12, justifyContent: 'center' },
  tagPub: { fontSize: 10, fontWeight: 'bold', color: '#FDE047', marginBottom: 2 },
  tituloPub: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  descPub: { fontSize: 12, color: '#E0E7FF', marginTop: 4 },

  menuAbas: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', maxHeight: 45 },
  btnAba: { paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  btnAbaAtiva: { borderBottomColor: '#2563EB' },
  textoAba: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  textoAbaAtiva: { color: '#2563EB', fontWeight: 'bold' },

  conteudo: { padding: 12 },
  boxConteudo: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  subTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10 },
  descricao: { fontSize: 14, color: '#374151', lineHeight: 20 },
  textoVazio: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
  itemLista: { fontSize: 14, color: '#1F2937', marginVertical: 4 },

  // CARD DE CADA ALUNO DA LISTA
  cardAluno: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  fotoAluno: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  infoAlunoCard: { marginLeft: 12, flex: 1 },
  nomeAlunoCard: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  detalheAlunoCard: { fontSize: 13, color: '#6B7280', marginTop: 1 },

  // MODAL DE PERFIL DO ALUNO
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBody: { backgroundColor: '#FFF', padding: 20, borderRadius: 10 },
  modalPerfilBody: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, maxHeight: '85%' },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 15, textAlign: 'center' },
  fotoPerfilGrande: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholderGrande: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  infoLinha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontWeight: 'bold', color: '#4B5563', fontSize: 14 },
  infoValor: { color: '#111827', fontSize: 14, maxWidth: '60%', textAlign: 'right' },
  
  labelInput: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginTop: 8, marginBottom: 2 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, backgroundColor: '#F9FAFB' },
  
  btnEditarPerfil: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnSalvar: { backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  btnCancelar: { padding: 10, alignItems: 'center', marginTop: 5 },
  btnTexto: { color: '#FFF', fontWeight: 'bold' },
  btnFechar: { padding: 12, alignItems: 'center', marginTop: 10 },
  btnTextoFechar: { color: '#DC2626', fontWeight: '600' }
});
