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

  // Modal Principal de Editar Tudo
  const [modalEditarGeral, setModalEditarGeral] = useState(false);
  const [abaEditar, setAbaEditar] = useState('instituicao'); // instituicao | cursos | classes | pautas | eventos | destaques | alunos | professores

  // Modais de Cadastro Rápido
  const [modalCadastrarAluno, setModalCadastrarAluno] = useState(false);
  const [modalCadastrarProf, setModalCadastrarProf] = useState(false);

  // Estados dos Dados da Instituição
  const [nomeInst, setNomeInst] = useState('');
  const [nifInst, setNifInst] = useState('');
  const [telefoneInst, setTelefoneInst] = useState('');
  const [emailInst, setEmailInst] = useState('');
  const [descricaoInst, setDescricaoInst] = useState('');
  const [fotoLogoBase64, setFotoLogoBase64] = useState('');

  // Formulários de Edição / Adição Geral
  const [novoCurso, setNovoCurso] = useState('');
  const [novaClasse, setNovaClasse] = useState('');
  const [novaPauta, setNovaPauta] = useState('');
  const [novoEvento, setNovoEvento] = useState('');
  const [novoDestaque, setNovoDestaque] = useState('');

  // Formulários Aluno / Professor com Foto
  const [nomeAlunoCad, setNomeAlunoCad] = useState('');
  const [numProcessoCad, setNumProcessoCad] = useState('');
  const [fotoAlunoBase64, setFotoAlunoBase64] = useState('');

  const [nomeProfCad, setNomeProfCad] = useState('');
  const [disciplinaCad, setDisciplinaCad] = useState('');
  const [fotoProfBase64, setFotoProfBase64] = useState('');

  // Listas de Dados
  const [cursos, setCursos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [pautas, setPautas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [destaques, setDestaques] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
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

      const resClasses = await supabase.from('classes').select('*');
      if (resClasses.data) setClasses(resClasses.data);

      const resPautas = await supabase.from('pautas').select('*');
      if (resPautas.data) setPautas(resPautas.data);

      const resEventos = await supabase.from('eventos').select('*');
      if (resEventos.data) setEventos(resEventos.data);

      const resDestaques = await supabase.from('alunos_destaque').select('*');
      if (resDestaques.data) setDestaques(resDestaques.data);

      const resAlunos = await supabase.from('alunos').select('*');
      if (resAlunos.data) setAlunos(resAlunos.data);

      const resProfs = await supabase.from('professores').select('*');
      if (resProfs.data) setProfessores(resProfs.data);

    } catch (err) {
      console.log('Erro ao carregar dados:', err);
    } finally {
      setCarregando(false);
    }
  };

  // Upload fácil de foto local da galeria
  const selecionarFotoLocal = (e, setFotoState) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFotoState(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Salvar Instituição
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
    Alert.alert('Sucesso', 'Perfil da Instituição Atualizado!');
    carregarTudo();
  };

  // Ações de Adição Genérica
  const adicionarItem = async (tabela, objeto, limparFn) => {
    await supabase.from(tabela).insert([objeto]);
    limparFn();
    carregarTudo();
  };

  const deletarItem = async (tabela, id) => {
    await supabase.from(tabela).delete().eq('id', id);
    carregarTudo();
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

          {/* BOTÃO EDITAR COMPLETO */}
          <TouchableOpacity style={styles.quadroBtn} onPress={() => setModalEditarGeral(true)}>
            <Text style={styles.textoBtn}>✏️ Editar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* PUBLICIDADE */}
        <View style={styles.containerPublicidade}>
          <View style={styles.bannerPadrao}>
            <Text style={styles.tagPub}>📢 PUBLICIDADE</Text>
            <Text style={styles.tituloPub}>Informática & Tablets Educativos</Text>
            <Text style={styles.descPub}>Venda de computadores portáteis e tablets com suporte técnico.</Text>
          </View>
        </View>

        {/* ABAS DO PERFIL */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuAbas}>
          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'geral' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('geral')}>
            <Text style={[styles.textoAba, abaAtiva === 'geral' && styles.textoAbaAtiva]}>Geral</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'cursos' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('cursos')}>
            <Text style={[styles.textoAba, abaAtiva === 'cursos' && styles.textoAbaAtiva]}>Cursos ({cursos.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'classes' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('classes')}>
            <Text style={[styles.textoAba, abaAtiva === 'classes' && styles.textoAbaAtiva]}>Classes ({classes.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'pautas' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('pautas')}>
            <Text style={[styles.textoAba, abaAtiva === 'pautas' && styles.textoAbaAtiva]}>📊 Pauta Trimestral ({pautas.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'eventos' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('eventos')}>
            <Text style={[styles.textoAba, abaAtiva === 'eventos' && styles.textoAbaAtiva]}>📅 Eventos ({eventos.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAba, abaAtiva === 'destaques' && styles.btnAbaAtiva]} onPress={() => setAbaAtiva('destaques')}>
            <Text style={[styles.textoAba, abaAtiva === 'destaques' && styles.textoAbaAtiva]}>⭐ Destaques ({destaques.length})</Text>
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
              <Text style={styles.subTitulo}>Cursos Lecionados</Text>
              {cursos.map(item => <Text key={item.id} style={styles.itemLista}>• {item.nome}</Text>)}
            </View>
          )}

          {abaAtiva === 'classes' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Classes Disponíveis</Text>
              {classes.map(item => <Text key={item.id} style={styles.itemLista}>🏫 {item.nome}</Text>)}
            </View>
          )}

          {abaAtiva === 'pautas' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Pautas Trimestrais</Text>
              {pautas.map(item => <Text key={item.id} style={styles.itemLista}>📊 {item.titulo}</Text>)}
            </View>
          )}

          {abaAtiva === 'eventos' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Próximos Eventos</Text>
              {eventos.length === 0 ? <Text style={styles.textoVazio}>Nenhum evento agendado.</Text> : (
                eventos.map(item => <Text key={item.id} style={styles.itemLista}>📅 {item.titulo}</Text>)
              )}
            </View>
          )}

          {abaAtiva === 'destaques' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Alunos em Destaque</Text>
              {destaques.map(item => <Text key={item.id} style={styles.itemLista}>⭐ {item.nome}</Text>)}
            </View>
          )}

          {abaAtiva === 'alunos' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Alunos</Text>
              {alunos.map(item => (
                <View key={item.id} style={styles.cardPessoaRow}>
                  {item.foto_url ? <Image source={{ uri: item.foto_url }} style={styles.fotoAvatar} /> : <Text style={{fontSize: 20}}>🎒</Text>}
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.itemTitulo}>{item.nome}</Text>
                    <Text style={styles.itemSub}>Proc: {item.numero_processo || 'PROC-000000'}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {abaAtiva === 'professores' && (
            <View style={styles.boxConteudo}>
              <Text style={styles.subTitulo}>Professores</Text>
              {professores.map(item => (
                <View key={item.id} style={styles.cardPessoaRow}>
                  {item.foto_url ? <Image source={{ uri: item.foto_url }} style={styles.fotoAvatar} /> : <Text style={{fontSize: 20}}>👨‍🏫</Text>}
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.itemTitulo}>{item.nome}</Text>
                    <Text style={styles.itemSub}>{item.disciplina}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL SUPREMO DE EDIÇÃO COMPLETA */}
      <Modal visible={modalEditarGeral} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBodyGeral}>
            <Text style={styles.modalTitulo}>⚙️ Central de Edição do Perfil</Text>

            {/* SELETOR INTERNO DO MODAL DE EDIÇÃO */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuModalTabs}>
              <TouchableOpacity onPress={() => setAbaEditar('instituicao')} style={[styles.tabModalItem, abaEditar === 'instituicao' && styles.tabModalItemAtiva]}>
                <Text style={styles.tabModalTexto}>Escola & Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAbaEditar('cursos')} style={[styles.tabModalItem, abaEditar === 'cursos' && styles.tabModalItemAtiva]}>
                <Text style={styles.tabModalTexto}>Cursos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAbaEditar('classes')} style={[styles.tabModalItem, abaEditar === 'classes' && styles.tabModalItemAtiva]}>
                <Text style={styles.tabModalTexto}>Classes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAbaEditar('pautas')} style={[styles.tabModalItem, abaEditar === 'pautas' && styles.tabModalItemAtiva]}>
                <Text style={styles.tabModalTexto}>Pautas</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAbaEditar('eventos')} style={[styles.tabModalItem, abaEditar === 'eventos' && styles.tabModalItemAtiva]}>
                <Text style={styles.tabModalTexto}>Eventos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAbaEditar('destaques')} style={[styles.tabModalItem, abaEditar === 'destaques' && styles.tabModalItemAtiva]}>
                <Text style={styles.tabModalTexto}>Destaques</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAbaEditar('alunos')} style={[styles.tabModalItem, abaEditar === 'alunos' && styles.tabModalItemAtiva]}>
                <Text style={styles.tabModalTexto}>Alunos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAbaEditar('professores')} style={[styles.tabModalItem, abaEditar === 'professores' && styles.tabModalItemAtiva]}>
                <Text style={styles.tabModalTexto}>Professores</Text>
              </TouchableOpacity>
            </ScrollView>

            <ScrollView style={{ maxHeight: 350, marginTop: 10 }}>
              {/* 1. EDITAR ESCOLA */}
              {abaEditar === 'instituicao' && (
                <View>
                  <TextInput style={styles.input} value={nomeInst} onChangeText={setNomeInst} placeholder="Nome da Escola" />
                  <TextInput style={styles.input} value={nifInst} onChangeText={setNifInst} placeholder="NIF" />
                  <TextInput style={styles.input} value={telefoneInst} onChangeText={setTelefoneInst} placeholder="Contacto" />
                  <TextInput style={styles.input} value={emailInst} onChangeText={setEmailInst} placeholder="Email" />
                  <TextInput style={[styles.input, { height: 50 }]} multiline value={descricaoInst} onChangeText={setDescricaoInst} placeholder="Descrição..." />
                  
                  <Text style={styles.labelInput}>📷 Foto / Logo da Escola (Galeria):</Text>
                  <input type="file" accept="image/*" onChange={(e) => selecionarFotoLocal(e, setFotoLogoBase64)} style={{ marginBottom: 10 }} />

                  <TouchableOpacity style={styles.btnSalvar} onPress={salvarPerfilInstituicao}>
                    <Text style={styles.btnTexto}>Salvar Informações</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 2. EDITAR CURSOS */}
              {abaEditar === 'cursos' && (
                <View>
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <TextInput style={[styles.input, {flex: 1}]} placeholder="Novo Curso" value={novoCurso} onChangeText={setNovoCurso} />
                    <TouchableOpacity style={styles.btnMiniAdd} onPress={() => adicionarItem('cursos', { nome: novoCurso }, () => setNovoCurso(''))}>
                      <Text style={styles.btnMiniAddTexto}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                  {cursos.map(item => (
                    <View key={item.id} style={styles.itemRowEdit}>
                      <Text style={{fontWeight: 'bold'}}>{item.nome}</Text>
                      <TouchableOpacity onPress={() => deletarItem('cursos', item.id)}><Text>🗑️</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* 3. EDITAR CLASSES */}
              {abaEditar === 'classes' && (
                <View>
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <TextInput style={[styles.input, {flex: 1}]} placeholder="Nova Classe (ex: 10ª Classe)" value={novaClasse} onChangeText={setNovaClasse} />
                    <TouchableOpacity style={styles.btnMiniAdd} onPress={() => adicionarItem('classes', { nome: novaClasse }, () => setNovaClasse(''))}>
                      <Text style={styles.btnMiniAddTexto}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                  {classes.map(item => (
                    <View key={item.id} style={styles.itemRowEdit}>
                      <Text style={{fontWeight: 'bold'}}>{item.nome}</Text>
                      <TouchableOpacity onPress={() => deletarItem('classes', item.id)}><Text>🗑️</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* 4. EDITAR PAUTAS */}
              {abaEditar === 'pautas' && (
                <View>
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <TextInput style={[styles.input, {flex: 1}]} placeholder="Título da Pauta" value={novaPauta} onChangeText={setNovaPauta} />
                    <TouchableOpacity style={styles.btnMiniAdd} onPress={() => adicionarItem('pautas', { titulo: novaPauta }, () => setNovaPauta(''))}>
                      <Text style={styles.btnMiniAddTexto}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                  {pautas.map(item => (
                    <View key={item.id} style={styles.itemRowEdit}>
                      <Text style={{fontWeight: 'bold'}}>{item.titulo}</Text>
                      <TouchableOpacity onPress={() => deletarItem('pautas', item.id)}><Text>🗑️</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* 5. EDITAR EVENTOS */}
              {abaEditar === 'eventos' && (
                <View>
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <TextInput style={[styles.input, {flex: 1}]} placeholder="Nome do Evento" value={novoEvento} onChangeText={setNovoEvento} />
                    <TouchableOpacity style={styles.btnMiniAdd} onPress={() => adicionarItem('eventos', { titulo: novoEvento }, () => setNovoEvento(''))}>
                      <Text style={styles.btnMiniAddTexto}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                  {eventos.map(item => (
                    <View key={item.id} style={styles.itemRowEdit}>
                      <Text style={{fontWeight: 'bold'}}>{item.titulo}</Text>
                      <TouchableOpacity onPress={() => deletarItem('eventos', item.id)}><Text>🗑️</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* 6. EDITAR DESTAQUES */}
              {abaEditar === 'destaques' && (
                <View>
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <TextInput style={[styles.input, {flex: 1}]} placeholder="Aluno em Destaque" value={novoDestaque} onChangeText={setNovoDestaque} />
                    <TouchableOpacity style={styles.btnMiniAdd} onPress={() => adicionarItem('alunos_destaque', { nome: novoDestaque }, () => setNovoDestaque(''))}>
                      <Text style={styles.btnMiniAddTexto}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                  {destaques.map(item => (
                    <View key={item.id} style={styles.itemRowEdit}>
                      <Text style={{fontWeight: 'bold'}}>{item.nome}</Text>
                      <TouchableOpacity onPress={() => deletarItem('alunos_destaque', item.id)}><Text>🗑️</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* 7. EDITAR ALUNOS E FOTOS */}
              {abaEditar === 'alunos' && (
                <View>
                  {alunos.map(item => (
                    <View key={item.id} style={styles.itemRowEdit}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {item.foto_url ? <Image source={{uri: item.foto_url}} style={{width: 30, height: 30, borderRadius: 15, marginRight: 5}} /> : null}
                        <Text style={{fontWeight: 'bold'}}>{item.nome}</Text>
                      </View>
                      <TouchableOpacity onPress={() => deletarItem('alunos', item.id)}><Text>🗑️ Reduzir/Excluir</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* 8. EDITAR PROFESSORES E FOTOS */}
              {abaEditar === 'professores' && (
                <View>
                  {professores.map(item => (
                    <View key={item.id} style={styles.itemRowEdit}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {item.foto_url ? <Image source={{uri: item.foto_url}} style={{width: 30, height: 30, borderRadius: 15, marginRight: 5}} /> : null}
                        <Text style={{fontWeight: 'bold'}}>{item.nome}</Text>
                      </View>
                      <TouchableOpacity onPress={() => deletarItem('professores', item.id)}><Text>🗑️ Reduzir/Excluir</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalEditarGeral(false)}>
              <Text style={styles.btnTextoFechar}>Fechar Central de Edição</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL CADASTRAR ALUNO RAPIDO */}
      <Modal visible={modalCadastrarAluno} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBodyGeral}>
            <Text style={styles.modalTitulo}>🎓 Cadastrar Aluno</Text>
            <TextInput style={styles.input} placeholder="Nome do Aluno" value={nomeAlunoCad} onChangeText={setNomeAlunoCad} />
            <TextInput style={styles.input} placeholder="Nº de Processo" value={numProcessoCad} onChangeText={setNumProcessoCad} />
            
            <Text style={styles.labelInput}>📷 Foto do Aluno (Galeria):</Text>
            <input type="file" accept="image/*" onChange={(e) => selecionarFotoLocal(e, setFotoAlunoBase64)} style={{ marginBottom: 15 }} />

            <TouchableOpacity style={styles.btnSalvar} onPress={() => {
              adicionarItem('alunos', { nome: nomeAlunoCad, numero_processo: numProcessoCad, foto_url: fotoAlunoBase64 }, () => {
                setNomeAlunoCad(''); setNumProcessoCad(''); setFotoAlunoBase64(''); setModalCadastrarAluno(false);
              });
            }}>
              <Text style={styles.btnTexto}>Cadastrar Aluno</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalCadastrarAluno(false)}>
              <Text style={styles.btnTextoFechar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL CADASTRAR PROFESSOR RAPIDO */}
      <Modal visible={modalCadastrarProf} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBodyGeral}>
            <Text style={styles.modalTitulo}>👨‍🏫 Cadastrar Professor</Text>
            <TextInput style={styles.input} placeholder="Nome do Professor" value={nomeProfCad} onChangeText={setNomeProfCad} />
            <TextInput style={styles.input} placeholder="Disciplina" value={disciplinaCad} onChangeText={setDisciplinaCad} />
            
            <Text style={styles.labelInput}>📷 Foto do Professor (Galeria):</Text>
            <input type="file" accept="image/*" onChange={(e) => selecionarFotoLocal(e, setFotoProfBase64)} style={{ marginBottom: 15 }} />

            <TouchableOpacity style={styles.btnSalvar} onPress={() => {
              adicionarItem('professores', { nome: nomeProfCad, disciplina: disciplinaCad, foto_url: fotoProfBase64 }, () => {
                setNomeProfCad(''); setDisciplinaCad(''); setFotoProfBase64(''); setModalCadastrarProf(false);
              });
            }}>
              <Text style={styles.btnTexto}>Cadastrar Professor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFechar} onPress={() => setModalCadastrarProf(false)}>
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
  subTitulo: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 8 },
  descricao: { fontSize: 14, color: '#374151', lineHeight: 20 },
  textoVazio: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  itemLista: { fontSize: 14, color: '#1F2937', marginBottom: 6 },
  cardPessoaRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 8, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  fotoAvatar: { width: 40, height: 40, borderRadius: 20 },
  itemTitulo: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  itemSub: { fontSize: 12, color: '#6B7280' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 15 },
  modalBodyGeral: { backgroundColor: '#FFF', padding: 18, borderRadius: 12 },
  modalTitulo: { fontSize: 17, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 10, textAlign: 'center' },
  menuModalTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#DDD', paddingBottom: 5 },
  tabModalItem: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 5, backgroundColor: '#F3F4F6' },
  tabModalItemAtiva: { backgroundColor: '#2563EB' },
  tabModalTexto: { fontSize: 12, color: '#1F2937', fontWeight: 'bold' },

  labelInput: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginTop: 5, marginBottom: 3 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 8, marginBottom: 8, fontSize: 13 },
  itemRowEdit: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 8, borderRadius: 6, marginBottom: 6 },
  btnMiniAdd: { backgroundColor: '#2563EB', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 6, height: 38 },
  btnMiniAddTexto: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  btnSalvar: { backgroundColor: '#059669', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnTexto: { color: '#FFF', fontWeight: 'bold' },
  btnFechar: { padding: 8, alignItems: 'center', marginTop: 8 },
  btnTextoFechar: { color: '#DC2626', fontWeight: '600' }
});
