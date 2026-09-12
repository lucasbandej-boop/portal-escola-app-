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
  ActivityIndicator,
  Image
} from 'react-native';
import { supabase } from './supabase';

export default function PerfilInstituicao() {
  const [instituicao, setInstituicao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('geral');

  // Modais de Gestão do Perfil
  const [modalEditarPerfil, setModalEditarPerfil] = useState(false);
  const [modalCadastrarAluno, setModalCadastrarAluno] = useState(false);
  const [modalCadastrarProf, setModalCadastrarProf] = useState(false);
  const [modalCurso, setModalCurso] = useState(false);
  const [modalPauta, setModalPauta] = useState(false);

  // Formulário Perfil Instituição
  const [nomeInst, setNomeInst] = useState('');
  const [nifInst, setNifInst] = useState('');
  const [telefoneInst, setTelefoneInst] = useState('');
  const [emailInst, setEmailInst] = useState('');
  const [descricaoInst, setDescricaoInst] = useState('');
  const [fotoLogoBase64, setFotoLogoBase64] = useState('');

  // Form Aluno
  const [nomeAlunoCad, setNomeAlunoCad] = useState('');
  const [numProcessoCad, setNumProcessoCad] = useState('');
  const [nivelCad, setNivelCad] = useState('Geral');
  const [fotoAlunoBase64, setFotoAlunoBase64] = useState('');

  // Form Professor
  const [nomeProfCad, setNomeProfCad] = useState('');
  const [disciplinaCad, setDisciplinaCad] = useState('');
  const [telefoneProfCad, setTelefoneProfCad] = useState('');
  const [fotoProfBase64, setFotoProfBase64] = useState('');

  // Form Curso & Pauta
  const [nomeCurso, setNomeCurso] = useState('');
  const [duracaoCurso, setDuracaoCurso] = useState('');
  const [tituloPauta, setTituloPauta] = useState('');
  const [classePauta, setClassePauta] = useState('');

  // Listas
  const [cursos, setCursos] = useState([]);
  const [pautas, setPautas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    setCarregando(true);
    try {
      const { data } = await supabase.from('instituicoes').select('*').limit(1).single();
      if (data) {
        setInstituicao(data);
        setNomeInst(data.nome || 'Colégio baú');
        setNifInst(data.nif || '0082506071LA40');
        setTelefoneInst(data.telefone || data.contacto || '+244 9XX XXX XXX');
        setEmailInst(data.email || 'contacto@escola.ao');
        setDescricaoInst(data.descricao || '');
        setFotoLogoBase64(data.logo_url || '');
      }

      const resCursos = await supabase.from('cursos').select('*');
      if (resCursos.data) setCursos(resCursos.data);

      const resPautas = await supabase.from('pautas').select('*');
      if (resPautas.data) setPautas(resPautas.data);

      const resAlunos = await supabase.from('alunos').select('*');
      if (resAlunos.data) setAlunos(resAlunos.data);

      const resProfs = await supabase.from('professores').select('*');
      if (resProfs.data) setProfessores(resProfs.data);

    } catch (err) {
      console.log('Erro ao carregar:', err);
    } finally {
      setCarregando(false);
    }
  };

  // Função auxiliar para selecionar foto da galeria local (HTML File Reader)
  const selecionarFotoLocal = (e, setFotoState) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoState(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Ações de Salvar no Supabase
  const salvarPerfilInstituicao = async () => {
    const payload = { 
      nome: nomeInst, nif: nifInst, telefone: telefoneInst, 
      contacto: telefoneInst, email: emailInst, descricao: descricaoInst, logo_url: fotoLogoBase64 
    };
    if (instituicao?.id) {
      await supabase.from('instituicoes').update(payload).eq('id', instituicao.id);
    } else {
      await supabase.from('instituicoes').insert([payload]);
    }
    setModalEditarPerfil(false);
    carregarPerfil();
  };

  const salvarAluno = async () => {
    if (!nomeAlunoCad) return Alert.alert('Aviso', 'Preencha o nome do aluno.');
    await supabase.from('alunos').insert([{ 
      nome: nomeAlunoCad, numero_processo: numProcessoCad, curso_turma: nivelCad, foto_url: fotoAlunoBase64 
    }]);
    setNomeAlunoCad(''); setNumProcessoCad(''); setFotoAlunoBase64('');
    setModalCadastrarAluno(false);
    carregarPerfil();
  };

  const salvarProfessor = async () => {
    if (!nomeProfCad) return Alert.alert('Aviso', 'Preencha o nome do professor.');
    await supabase.from('professores').insert([{ 
      nome: nomeProfCad, disciplina: disciplinaCad, telefone: telefoneProfCad, foto_url: fotoProfBase64 
    }]);
    setNomeProfCad(''); setDisciplinaCad(''); setFotoProfBase64('');
    setModalCadastrarProf(false);
    carregarPerfil();
  };

  const salvarCurso = async () => {
    if (!nomeCurso) return Alert.alert('Aviso', 'Nome do curso obrigatório.');
    await supabase.from('cursos').insert([{ nome: nomeCurso, duracao: duracaoCurso }]);
    setNomeCurso(''); setDuracaoCurso(''); setModalCurso(false);
    carregarPerfil();
  };

  const salvarPauta = async () => {
    if (!tituloPauta) return Alert.alert('Aviso', 'Título da pauta obrigatório.');
    await supabase.from('pautas').insert([{ titulo: tituloPauta, classe: classePauta }]);
    setTituloPauta(''); setClassePauta(''); setModalPauta(false);
    carregarPerfil();
  };

  // Funções de Eliminar
  const deletarItem = async (tabela, id) => {
    await supabase.from(tabela).delete().eq('id', id);
    carregarPerfil();
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
          {instituicao?.logo_url ? (
            <Image source={{ uri: instituicao.logo_url }} style={styles.logoImg} />
          ) : null}
          <Text style={styles.nomeInstituicao}>{instituicao?.nome || 'Colégio baú'}</Text>
          <Text style={styles.categoria}>🏫 Escola / Instituição de Ensino</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTexto}>NIF: {instituicao?.nif || '0082506071LA40'}</Text>
            <Text style={styles.infoTexto}>📞 Contacto: {instituicao?.telefone || '+244 9XX XXX XXX'}</Text>
            <Text style={styles.infoTexto}>✉️ Email: {instituicao?.email || 'contacto@escola.ao'}</Text>
          </View>
        </View>

        {/* BOTOES DE AÇÃO */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaBotoes}>
          <TouchableOpacity style={[styles.quadroBtn, styles.quadroAzul]} onPress={() => setModalCadastrarAluno(true)}>
            <Text style={styles.textoBtnAzul}>+ Cadastrar Aluno</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quadroBtn} onPress={() => setModalCadastrarProf(true)}>
            <Text style={styles.textoBtn}>+ Professor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quadroBtn} onPress={() => setModalEditarPerfil(true)}>
            <Text style={styles.textoBtn}>✏️ Editar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* PUBLICIDADE BANNER */}
        <View style={styles.containerPublicidade}>
          <View style={styles.bannerPadrao}>
            <Text style={styles.tagPub}>📢 PUBLICIDADE</Text>
            <Text style={styles.tituloPub}>Informática & Tablets Educativos</Text>
            <Text style={styles.descPub}>Venda de computadores portáteis e tablets de estudo com suporte técnico.</Text>
          </View>
        </View>

        {/* NAVEGAÇÃO DE ABAS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuAbas}>
          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'geral' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('geral')}>
            <Text style={[styles.textoAba, abaAtiva === 'geral' && styles.textoAbaAtiva]}>Geral</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'cursos' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('cursos')}>
            <Text style={[styles.textoAba, abaAtiva === 'cursos' && styles.textoAbaAtiva]}>Cursos ({cursos.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'pautas' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('pautas')}>
            <Text style={[styles.textoAba, abaAtiva === 'pautas' && styles.textoAbaAtiva]}>📊 Pauta Trimestral ({pautas.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'alunos' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('alunos')}>
            <Text style={[styles.textoAba, abaAtiva === 'alunos' && styles.textoAbaAtiva]}>Alunos ({alunos.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'professores' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('professores')}>
            <Text style={[styles.textoAba, abaAtiva === 'professores' && styles.textoAbaAtiva]}>Professores ({professores.length})</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* CONTEÚDO DAS ABAS */}
        <View style={styles.conteudo}>
          {abaAtiva === 'geral' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Visão Geral</Text>
              <Text style={styles.descricao}>{instituicao?.descricao || 'Painel oficial do Portal Escola.'}</Text>
            </View>
          )}

          {abaAtiva === 'cursos' && (
            <View style={styles.boxConteudo}>
              <View style={styles.headerAbaRow}>
                <Text style={styles.subTitulo}>Cursos Disponíveis</Text>
                <TouchableOpacity style={styles.btnMiniAdd} onPress={() => setModalCurso(true)}>
                  <Text style={styles.btnMiniAddTexto}>+ Add Curso</Text>
                </TouchableOpacity>
              </View>
              {cursos.length === 0 ? <Text style={styles.textoVazio}>Nenhum curso registado.</Text> : (
                cursos.map(item => (
                  <View key={item.id} style={styles.cardItemFlex}>
                    <View>
                      <Text style={styles.itemTitulo}>{item.nome}</Text>
                      {item.duracao ? <Text style={styles.itemSub}>Duração: {item.duracao}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => deletarItem('cursos', item.id)}><Text style={styles.txtLixo}>🗑️</Text></TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {abaAtiva === 'pautas' && (
            <View style={styles.boxConteudo}>
              <View style={styles.headerAbaRow}>
                <Text style={styles.subTitulo}>Pautas Trimestrais</Text>
                <TouchableOpacity style={styles.btnMiniAdd} onPress={() => setModalPauta(true)}>
                  <Text style={styles.btnMiniAddTexto}>+ Nova Pauta</Text>
                </TouchableOpacity>
              </View>
              {pautas.length === 0 ? <Text style={styles.textoVazio}>Nenhuma pauta lançada.</Text> : (
                pautas.map(item => (
                  <View key={item.id} style={styles.cardItemFlex}>
                    <View>
                      <Text style={styles.itemTitulo}>📊 {item.titulo}</Text>
                      {item.classe ? <Text style={styles.itemSub}>Classe: {item.classe}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => deletarItem('pautas', item.id)}><Text style={styles.txtLixo}>🗑️</Text></TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {abaAtiva === 'alunos' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Lista de Alunos Registados</Text>
              {alunos.length === 0 ? (
                <View>
                  <View style={styles.cardAlunoSimples}>
                    <Text style={styles.iconMochila}>🎒</Text>
                    <View>
                      <Text style={styles.itemTitulo}>Proc: PROC-000000</Text>
                      <Text style={styles.itemSub}>Nível: Geral</Text>
                    </View>
                  </View>
                </View>
              ) : (
                alunos.map(item => (
                  <View key={item.id} style={styles.cardPessoaFlex}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {item.foto_url ? (
                        <Image source={{ uri: item.foto_url }} style={styles.fotoAvatar} />
                      ) : (
                        <Text style={styles.iconMochila}>🎒</Text>
                      )}
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.itemTitulo}>{item.nome}</Text>
                        <Text style={styles.itemSub}>Proc: {item.numero_processo || 'PROC-000000'}</Text>
                        <Text style={styles.itemSub}>Nível: {item.curso_turma || 'Geral'}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => deletarItem('alunos', item.id)}><Text style={styles.txtLixo}>🗑️</Text></TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {abaAtiva === 'professores' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Corpo Docente</Text>
              {professores.length === 0 ? <Text style={styles.textoVazio}>Nenhum professor cadastrado.</Text> : (
                professores.map(item => (
                  <View key={item.id} style={styles.cardPessoaFlex}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {item.foto_url ? (
                        <Image source={{ uri: item.foto_url }} style={styles.fotoAvatar} />
                      ) : (
                        <Text style={{ fontSize: 24, marginRight: 8 }}>👨‍🏫</Text>
                      )}
                      <View>
                        <Text style={styles.itemTitulo}>{item.nome}</Text>
                        <Text style={styles.itemSub}>{item.disciplina}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => deletarItem('professores', item.id)}><Text style={styles.txtLixo}>🗑️</Text></TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL 1: EDITAR INSTITUIÇÃO */}
      <Modal visible={modalEditarPerfil} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.modalTitulo}>✏️ Editar Perfil da Escola</Text>
            
            <TextInput style={styles.input} value={nomeInst} onChangeText={setNomeInst} placeholder="Nome da Escola" />
            <TextInput style={styles.input} value={nifInst} onChangeText={setNifInst} placeholder="NIF" />
            <TextInput style={styles.input} value={telefoneInst} onChangeText={setTelefoneInst} placeholder="Contacto" />
            <TextInput style={styles.input} value={emailInst} onChangeText={setEmailInst} placeholder="Email" />
            <TextInput style={[styles.input, { height: 60 }]} multiline value={descricaoInst} onChangeText={setDescricaoInst} placeholder="Descrição..." />

            <Text style={styles.labelInput}>📷 Escolher Logo da Galeria:</Text>
            <input type="file" accept="image/*" onChange={(e) => selecionarFotoLocal(e, setFotoLogoBase64)} style={{ marginBottom: 15 }} />

            {fotoLogoBase64 ? <Image source={{ uri: fotoLogoBase64 }} style={{ width: 60, height: 60, borderRadius: 30, alignSelf: 'center', marginBottom: 10 }} /> : null}

            <TouchableOpacity style={styles.btnSalvar} onPress={salvarPerfilInstituicao}>
              <Text style={styles.btnTexto}>Salvar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalEditarPerfil(false)}>
              <Text style={styles.btnTextoFechar}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL 2: CADASTRAR ALUNO */}
      <Modal visible={modalCadastrarAluno} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>🎓 Cadastrar Aluno</Text>
            
            <TextInput style={styles.input} placeholder="Nome do Aluno" value={nomeAlunoCad} onChangeText={setNomeAlunoCad} />
            <TextInput style={styles.input} placeholder="Nº de Processo (ex: PROC-000000)" value={numProcessoCad} onChangeText={setNumProcessoCad} />
            <TextInput style={styles.input} placeholder="Nível (ex: Geral)" value={nivelCad} onChangeText={setNivelCad} />

            <Text style={styles.labelInput}>📷 Escolher Foto do Aluno:</Text>
            <input type="file" accept="image/*" onChange={(e) => selecionarFotoLocal(e, setFotoAlunoBase64)} style={{ marginBottom: 15 }} />

            <TouchableOpacity style={styles.btnSalvar} onPress={salvarAluno}>
              <Text style={styles.btnTexto}>Salvar Aluno</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalCadastrarAluno(false)}>
              <Text style={styles.btnTextoFechar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: CADASTRAR PROFESSOR */}
      <Modal visible={modalCadastrarProf} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>👨‍🏫 Cadastrar Professor</Text>
            
            <TextInput style={styles.input} placeholder="Nome do Professor" value={nomeProfCad} onChangeText={setNomeProfCad} />
            <TextInput style={styles.input} placeholder="Disciplina / Cadeira" value={disciplinaCad} onChangeText={setDisciplinaCad} />

            <Text style={styles.labelInput}>📷 Escolher Foto do Professor:</Text>
            <input type="file" accept="image/*" onChange={(e) => selecionarFotoLocal(e, setFotoProfBase64)} style={{ marginBottom: 15 }} />

            <TouchableOpacity style={styles.btnSalvar} onPress={salvarProfessor}>
              <Text style={styles.btnTexto}>Salvar Professor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalCadastrarProf(false)}>
              <Text style={styles.btnTextoFechar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: ADICIONAR CURSO */}
      <Modal visible={modalCurso} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>🎓 Novo Curso</Text>
            <TextInput style={styles.input} placeholder="Nome do Curso" value={nomeCurso} onChangeText={setNomeCurso} />
            <TextInput style={styles.input} placeholder="Duração" value={duracaoCurso} onChangeText={setDuracaoCurso} />
            <TouchableOpacity style={styles.btnSalvar} onPress={salvarCurso}>
              <Text style={styles.btnTexto}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalCurso(false)}>
              <Text style={styles.btnTextoFechar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: ADICIONAR PAUTA */}
      <Modal visible={modalPauta} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitulo}>📊 Nova Pauta Trimestral</Text>
            <TextInput style={styles.input} placeholder="Título da Pauta (ex: 1º Trimestre - 2026)" value={tituloPauta} onChangeText={setTituloPauta} />
            <TextInput style={styles.input} placeholder="Classe / Ano" value={classePauta} onChangeText={setClassePauta} />
            <TouchableOpacity style={styles.btnSalvar} onPress={salvarPauta}>
              <Text style={styles.btnTexto}>Publicar Pauta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalPauta(false)}>
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
  logoImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  nomeInstituicao: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center' },
  categoria: { fontSize: 14, color: '#555', marginTop: 3, textAlign: 'center' },
  infoBox: { marginTop: 6, alignItems: 'center' },
  infoTexto: { fontSize: 13, color: '#666', marginTop: 2, textAlign: 'center' },

  areaBotoes: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 10, maxHeight: 75 },
  quadroBtn: { width: 105, height: 60, backgroundColor: '#E5E7EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10, padding: 5 },
  quadroAzul: { backgroundColor: '#1D4ED8' },
  textoBtn: { color: '#000', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  textoBtnAzul: { color: '#FFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },

  containerPublicidade: { marginHorizontal: 12, marginVertical: 8, borderRadius: 12, overflow: 'hidden' },
  bannerPadrao: { width: '100%', padding: 14, backgroundColor: '#EFF6FF', borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  tagPub: { fontSize: 10, fontWeight: 'bold', color: '#CA8A04', marginBottom: 2 },
  tituloPub: { fontSize: 15, fontWeight: 'bold', color: '#1E40AF' },
  descPub: { fontSize: 12, color: '#3B82F6', marginTop: 2 },

  menuAbas: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E5E7EB', maxHeight: 45, marginTop: 5 },
  btnAba: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  btnAbaAtiva: { borderBottomColor: '#2563EB' },
  textoAba: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  textoAbaAtiva: { color: '#2563EB', fontWeight: 'bold' },

  conteudo: { padding: 15 },
  boxConteudo: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  subTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A' },
  headerAbaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  btnMiniAdd: { backgroundColor: '#2563EB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  btnMiniAddTexto: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  descricao: { fontSize: 14, color: '#374151', lineHeight: 20 },
  textoVazio: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', marginTop: 5 },
  
  cardItemFlex: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8 },
  cardPessoaFlex: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8 },
  cardAlunoSimples: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8 },
  iconMochila: { fontSize: 24, marginRight: 12 },
  fotoAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  itemTitulo: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  itemSub: { fontSize: 12, color: '#6B7280' },
  txtLixo: { fontSize: 16 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBody: { backgroundColor: '#FFF', padding: 20, borderRadius: 12 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 15, textAlign: 'center' },
  labelInput: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, marginBottom: 12 },
  btnSalvar: { backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnTexto: { color: '#FFF', fontWeight: 'bold' },
  btnFechar: { padding: 10, alignItems: 'center', marginTop: 5 },
  btnTextoFechar: { color: '#DC2626', fontWeight: '600' }
});
