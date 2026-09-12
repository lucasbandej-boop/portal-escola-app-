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
  Alert,
  Platform
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

  // Modal Editar Instituição / Limite
  const [modalEditarInst, setModalEditarInst] = useState(false);
  const [limiteInput, setLimiteInput] = useState('10000');

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
    sala: '',
    encarregado: '',
    contacto: ''
  });

  // Modal Cadastrar Novo Aluno
  const [modalNovoAluno, setModalNovoAluno] = useState(false);
  const [novoAlunoForm, setNovoAlunoForm] = useState({
    nome: '',
    processo: '',
    curso: '',
    nivel: '',
    turma: '',
    sala: '',
    encarregado: '',
    contacto: ''
  });

  // Modal Comprovativo de Sucesso
  const [modalComprovativo, setModalComprovativo] = useState(false);
  const [dadosComprovativo, setDadosComprovativo] = useState(null);

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
      if (data) {
        setInstituicao(data);
        if (data.limite_estudantes) {
          setLimiteInput(String(data.limite_estudantes));
        }
      }

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

  const limiteMaximo = instituicao?.limite_estudantes || 10000;
  const totalAlunosInscritos = alunos.length;
  const temVagas = totalAlunosInscritos < limiteMaximo;

  const abrirCadastroAluno = () => {
    if (!temVagas) {
      Alert.alert(
        'Vagas Esgotadas! 🔴',
        `A instituição atingiu a capacidade máxima de ${limiteMaximo} estudantes.`
      );
      return;
    }
    setNovoAlunoForm({ 
      nome: '', 
      processo: '', 
      curso: '', 
      nivel: '', 
      turma: 'Turma A', 
      sala: 'Sala 01', 
      encarregado: '', 
      contacto: '' 
    });
    setModalNovoAluno(true);
  };

  const salvarNovoAluno = async () => {
    if (!novoAlunoForm.nome) {
      return Alert.alert('Erro', 'Por favor, insira o nome do estudante.');
    }

    const numProc = novoAlunoForm.processo || `PROC-${Math.floor(100000 + Math.random() * 900000)}`;

    const dadosAlunoSalvar = {
      nome: novoAlunoForm.nome,
      processo: numProc,
      curso: novoAlunoForm.curso || 'Geral',
      nivel: novoAlunoForm.nivel || 'Geral',
      turma: novoAlunoForm.turma || 'Turma A',
      sala: novoAlunoForm.sala || 'Sala 01',
      encarregado: novoAlunoForm.encarregado,
      contacto: novoAlunoForm.contacto
    };

    try {
      const { data, error } = await supabase.from('alunos').insert([dadosAlunoSalvar]).select().single();

      if (!error) {
        setModalNovoAluno(false);
        setDadosComprovativo(data || dadosAlunoSalvar);
        setModalComprovativo(true);
        carregarDados();
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar o aluno no banco de dados.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao conectar com o servidor.');
    }
  };

  const baixarComprovativo = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      Alert.alert('Comprovativo', 'A gerar impresso do comprovativo do aluno...');
    }
  };

  const solicitarTransferenciaComprovativo = () => {
    Alert.alert(
      'Solicitar Transferência',
      `Deseja iniciar o pedido de transferência para o estudante ${dadosComprovativo?.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar Transferência', 
          onPress: () => {
            Alert.alert('Sucesso', 'Pedido de transferência registado com sucesso!');
            setModalComprovativo(false);
          } 
        }
      ]
    );
  };

  const abrirPerfilAluno = (aluno) => {
    setAlunoSelecionado(aluno);
    setFormAluno({
      nome: aluno.nome || '',
      processo: aluno.processo || aluno.proc || '',
      curso: aluno.curso || '',
      nivel: aluno.nivel || '',
      classe: aluno.classe || '',
      sala: aluno.sala || 'Sala 01',
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
          sala: formAluno.sala,
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

  const salvarLimiteInstituicao = async () => {
    const num = parseInt(limiteInput, 10);
    if (isNaN(num) || num <= 0) {
      return Alert.alert('Erro', 'Insira um limite válido de estudantes.');
    }

    try {
      if (instituicao?.id) {
        await supabase
          .from('instituicoes')
          .update({ limite_estudantes: num })
          .eq('id', instituicao.id);
      }
      setInstituicao(prev => ({ ...prev, limite_estudantes: num }));
      Alert.alert('Sucesso', 'Limite de vagas atualizado!');
      setModalEditarInst(false);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível guardar as alterações.');
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
          <Text style={styles.nomeInstituicao}>{instituicao?.nome || 'Colégio Baú'}</Text>
          <Text style={styles.categoria}>🏫 Escola / Instituição de Ensino</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoTexto}>NIF: {instituicao?.nif || '0082506071LA40'}</Text>
            <Text style={styles.infoTexto}>📞 Contacto: {instituicao?.contacto || '+244 9XX XXX XXX'}</Text>
            <Text style={styles.infoTexto}>✉️ Email: {instituicao?.email || 'contacto@escola.ao'}</Text>
          </View>
        </View>

        {/* ESTATÍSTICAS E STATUS DE VAGAS */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValor}>{limiteMaximo}</Text>
            <Text style={styles.statRotulo}>Limite Estudantes</Text>
            
            <View style={[styles.badgeVagas, temVagas ? styles.badgeVerde : styles.badgeVermelho]}>
              <View style={[styles.pontoStatus, temVagas ? styles.pontoVerde : styles.pontoVermelho]} />
              <Text style={[styles.textoBadge, temVagas ? styles.textoVerde : styles.textoVermelho]}>
                {temVagas ? `${totalAlunosInscritos}/${limiteMaximo} Vagas` : 'Vagas Esgotadas'}
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValor}>{professores.length || 100}</Text>
            <Text style={styles.statRotulo}>Professores</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValor, { color: '#2563EB' }]}>Oficial</Text>
            <Text style={styles.statRotulo}>Verificado ✔</Text>
          </View>
        </View>

        {/* BOTÕES DE AÇÃO RÁPIDA */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaBotoes}>
          <TouchableOpacity 
            style={[styles.quadroBtn, temVagas ? styles.quadroAzul : styles.quadroVermelhoDisabled]} 
            onPress={abrirCadastroAluno}
          >
            <Text style={styles.textoBtnAzul}>
              {temVagas ? '+ Cadastrar Aluno' : '🚫 Vagas Esgotadas'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quadroBtn} onPress={() => Alert.alert('Professor', 'Cadastrar Professor')}>
            <Text style={styles.textoBtn}>+ Professor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quadroBtn} onPress={() => setModalEditarInst(true)}>
            <Text style={styles.textoBtn}>✏️ Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quadroBtn} onPress={() => setModalCurso(true)}>
            <Text style={styles.textoBtn}>🎓 + Curso</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* PUBLICIDADE BANNER */}
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
          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'alunos' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('alunos')}>
            <Text style={[styles.textoAba, abaAtiva === 'alunos' && styles.textoAbaAtiva]}>Alunos ({alunos.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'geral' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('geral')}>
            <Text style={[styles.textoAba, abaAtiva === 'geral' && styles.textoAbaAtiva]}>Geral</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'cursos' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('cursos')}>
            <Text style={[styles.textoAba, abaAtiva === 'cursos' && styles.textoAbaAtiva]}>Cursos ({cursos.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'professores' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('professores')}>
            <Text style={[styles.textoAba, abaAtiva === 'professores' && styles.textoAbaAtiva]}>Professores ({professores.length})</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* CONTEÚDO */}
        <View style={styles.conteudo}>
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
                    <View style={styles.avatarPlaceholder}>
                      <Text style={{ fontSize: 24 }}>🎒</Text>
                    </View>

                    <View style={styles.infoAlunoCard}>
                      <Text style={styles.nomeAlunoCard}>{item.nome}</Text>
                      <Text style={styles.detalheAlunoCard}>Proc: {item.processo || item.proc || 'PROC-000000'}</Text>
                      <Text style={styles.detalheAlunoCard}>Classe/Turma: {item.nivel || item.classe || '10ª'} - {item.turma || 'Turma A'}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {abaAtiva === 'geral' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Visão Geral</Text>
              <Text style={styles.descricao}>{instituicao?.descricao || 'Painel oficial de gestão da instituição.'}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL CADASTRAR ALUNO */}
      <Modal visible={modalNovoAluno} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalTitulo}>+ Cadastrar Novo Aluno</Text>
            
            <Text style={styles.labelInput}>Nome Completo:*</Text>
            <TextInput style={styles.input} placeholder="Ex: João Silva" value={novoAlunoForm.nome} onChangeText={(t) => setNovoAlunoForm({...novoAlunoForm, nome: t})} />

            <Text style={styles.labelInput}>Nº de Processo (Opcional):</Text>
            <TextInput style={styles.input} placeholder="Ex: PROC-585083" value={novoAlunoForm.processo} onChangeText={(t) => setNovoAlunoForm({...novoAlunoForm, processo: t})} />

            <Text style={styles.labelInput}>Curso / Classe:*</Text>
            <TextInput style={styles.input} placeholder="Ex: Informática / 10ª Classe" value={novoAlunoForm.nivel} onChangeText={(t) => setNovoAlunoForm({...novoAlunoForm, nivel: t})} />

            <Text style={styles.labelInput}>Turma:</Text>
            <TextInput style={styles.input} placeholder="Ex: Turma A" value={novoAlunoForm.turma} onChangeText={(t) => setNovoAlunoForm({...novoAlunoForm, turma: t})} />

            <Text style={styles.labelInput}>Sala:</Text>
            <TextInput style={styles.input} placeholder="Ex: Sala 04" value={novoAlunoForm.sala} onChangeText={(t) => setNovoAlunoForm({...novoAlunoForm, sala: t})} />

            <Text style={styles.labelInput}>Encarregado de Educação:</Text>
            <TextInput style={styles.input} placeholder="Nome do encarregado" value={novoAlunoForm.encarregado} onChangeText={(t) => setNovoAlunoForm({...novoAlunoForm, encarregado: t})} />

            <Text style={styles.labelInput}>Contacto do Encarregado:</Text>
            <TextInput style={styles.input} placeholder="9XXXXXXXX" keyboardType="phone-pad" value={novoAlunoForm.contacto} onChangeText={(t) => setNovoAlunoForm({...novoAlunoForm, contacto: t})} />

            <TouchableOpacity style={styles.btnSalvar} onPress={salvarNovoAluno}>
              <Text style={styles.btnTexto}>Confirmar Registo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalNovoAluno(false)}>
              <Text style={styles.btnTextoFechar}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL COMPROVATIVO DE CADASTRO SUCESSO */}
      <Modal visible={modalComprovativo} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={styles.cardComprovativo}>
            
            {/* CABEÇALHO SUCESSO */}
            <View style={styles.topoSucesso}>
              <Text style={{ fontSize: 32 }}>🎉</Text>
              <Text style={styles.tituloSucesso}>Aluno Cadastrado com Sucesso!</Text>
            </View>

            {/* FICHA DO ALUNO */}
            <View style={styles.corpoComprovativo}>
              <View style={styles.linhaComp}>
                <Text style={styles.labelComp}>👤 Nome:</Text>
                <Text style={styles.valorCompBold}>{dadosComprovativo?.nome}</Text>
              </View>

              <View style={styles.linhaComp}>
                <Text style={styles.labelComp}>🏫 Escola:</Text>
                <Text style={styles.valorComp}>{instituicao?.nome || 'Colégio Baú'}</Text>
              </View>

              <View style={styles.linhaComp}>
                <Text style={styles.labelComp}>🆔 Nº de Processo:</Text>
                <Text style={styles.valorCompDestaque}>{dadosComprovativo?.processo}</Text>
              </View>

              <View style={styles.linhaComp}>
                <Text style={styles.labelComp}>📚 Classe/Curso:</Text>
                <Text style={styles.valorComp}>{dadosComprovativo?.nivel || dadosComprovativo?.curso}</Text>
              </View>

              <View style={styles.linhaComp}>
                <Text style={styles.labelComp}>🚪 Turma / Sala:</Text>
                <Text style={styles.valorComp}>{dadosComprovativo?.turma || 'Turma A'} - {dadosComprovativo?.sala || 'Sala 01'}</Text>
              </View>
            </View>

            {/* BOTOES DE AÇÃO */}
            <TouchableOpacity style={styles.btnBaixarComp} onPress={baixarComprovativo}>
              <Text style={styles.textoBtnBaixar}>📥 Baixar / Imprimir Comprovativo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnTransferirComp} onPress={solicitarTransferenciaComprovativo}>
              <Text style={styles.textoBtnTransferir}>🔄 Solicitar Transferência</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnConcluirComp} onPress={() => setModalComprovativo(false)}>
              <Text style={styles.textoBtnConcluir}>Concluir</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* MODAL CONFIGURAÇÕES / LIMITE */}
      <Modal visible={modalEditarInst} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>⚙️ Configurações da Instituição</Text>
            
            <Text style={styles.labelInput}>Capacidade Máxima / Limite de Estudantes:</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="number-pad" 
              value={limiteInput} 
              onChangeText={setLimiteInput} 
            />

            <TouchableOpacity style={styles.btnSalvar} onPress={salvarLimiteInstituicao}>
              <Text style={styles.btnTexto}>Guardar Configurações</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalEditarInst(false)}>
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

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 5
  },
  statItem: { alignItems: 'center' },
  statValor: { fontSize: 18, fontWeight: 'bold', color: '#1D4ED8' },
  statRotulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  
  badgeVagas: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginTop: 4 },
  badgeVerde: { backgroundColor: '#DCFCE7' },
  badgeVermelho: { backgroundColor: '#FEE2E2' },
  pontoStatus: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  pontoVerde: { backgroundColor: '#16A34A' },
  pontoVermelho: { backgroundColor: '#DC2626' },
  textoBadge: { fontSize: 10, fontWeight: 'bold' },
  textoVerde: { color: '#15803D' },
  textoVermelho: { color: '#B91C1C' },

  areaBotoes: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 10, maxHeight: 75 },
  quadroBtn: { width: 105, height: 65, backgroundColor: '#E5E7EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10, padding: 5 },
  quadroAzul: { backgroundColor: '#1D4ED8' },
  quadroVermelhoDisabled: { backgroundColor: '#DC2626' },
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

  cardAluno: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  infoAlunoCard: { marginLeft: 12, flex: 1 },
  nomeAlunoCard: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  detalheAlunoCard: { fontSize: 12, color: '#6B7280', marginTop: 1 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalBody: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, width: '100%' },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 15, textAlign: 'center' },
  labelInput: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginTop: 8, marginBottom: 2 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, backgroundColor: '#F9FAFB', marginBottom: 6 },
  btnSalvar: { backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  btnTexto: { color: '#FFF', fontWeight: 'bold' },
  btnFechar: { padding: 12, alignItems: 'center', marginTop: 8 },
  btnTextoFechar: { color: '#DC2626', fontWeight: '600' },

  /* ESTILOS COMPROVATIVO */
  cardComprovativo: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '95%', maxWidth: 420, alignItems: 'center', elevation: 5 },
  topoSucesso: { alignItems: 'center', marginBottom: 15 },
  tituloSucesso: { fontSize: 18, fontWeight: 'bold', color: '#047857', marginTop: 5, textAlign: 'center' },
  corpoComprovativo: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 15 },
  linhaComp: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  labelComp: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  valorComp: { fontSize: 13, color: '#111827', fontWeight: '500' },
  valorCompBold: { fontSize: 14, color: '#111827', fontWeight: 'bold' },
  valorCompDestaque: { fontSize: 14, color: '#1D4ED8', fontWeight: 'bold' },
  btnBaixarComp: { width: '100%', backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  textoBtnBaixar: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  btnTransferirComp: { width: '100%', backgroundColor: '#D97706', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  textoBtnTransferir: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  btnConcluirComp: { paddingVertical: 8, paddingHorizontal: 20, marginTop: 4 },
  textoBtnConcluir: { color: '#6B7280', fontWeight: 'bold', fontSize: 14 }
});
