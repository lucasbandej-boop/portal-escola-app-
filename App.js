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
  Image,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const INSTITUICAO_ID = 1;

function ModalNotasFaltas({ visivel, estudante, modoAdmin, onClose }) {
  const [disciplina, setDisciplina] = useState('');
  const [trimestre, setTrimestre] = useState('1º Trimestre');
  const [nota, setNota] = useState('');
  const [faltas, setFaltas] = useState('0');
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notaEmEdicaoId, setNotaEmEdicaoId] = useState(null);

  useEffect(() => {
    if (estudante && visivel) {
      carregarNotas();
    }
  }, [estudante, visivel]);

  const carregarNotas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('estudante_id', estudante.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistorico(data || []);
    } catch (err) {
      console.error('Erro ao carregar notas:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarNota = async () => {
    if (!disciplina.trim() || !nota.trim()) {
      Alert.alert('Atenção', 'Preencha a disciplina e a nota.');
      return;
    }

    const numNota = parseFloat(nota.replace(',', '.'));
    if (isNaN(numNota) || numNota < 0 || numNota > 20) {
      Alert.alert('Nota inválida', 'A nota deve ser um número entre 0 e 20.');
      return;
    }

    try {
      if (notaEmEdicaoId) {
        const { error } = await supabase
          .from('avaliacoes')
          .update({
            disciplina: disciplina.trim(),
            trimestre,
            nota: numNota,
            faltas: parseInt(faltas) || 0,
          })
          .eq('id', notaEmEdicaoId);

        if (error) throw error;
        Alert.alert('Sucesso', 'Nota atualizada!');
      } else {
        const { error } = await supabase.from('avaliacoes').insert([
          {
            estudante_id: estudante.id,
            disciplina: disciplina.trim(),
            trimestre,
            nota: numNota,
            faltas: parseInt(faltas) || 0,
          },
        ]);

        if (error) throw error;
        Alert.alert('Sucesso', 'Nota registada!');
      }

      limparFormularioNota();
      carregarNotas();
    } catch (err) {
      Alert.alert('Erro no Supabase', err.message || JSON.stringify(err));
    }
  };

  const limparFormularioNota = () => {
    setDisciplina('');
    setNota('');
    setFaltas('0');
    setNotaEmEdicaoId(null);
  };

  const handleEditarNota = (item) => {
    setNotaEmEdicaoId(item.id);
    setDisciplina(item.disciplina);
    setTrimestre(item.trimestre);
    setNota(item.nota.toString());
    setFaltas(item.faltas.toString());
  };

  const handleEliminarNota = (id) => {
    Alert.alert('Eliminar Nota', 'Deseja apagar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('avaliacoes').delete().eq('id', id);
            if (error) throw error;
            carregarNotas();
          } catch (err) {
            Alert.alert('Erro ao eliminar', err.message);
          }
        },
      },
    ]);
  };

  const totalNotas = historico.reduce((acc, curr) => acc + Number(curr.nota || 0), 0);
  const totalFaltas = historico.reduce((acc, curr) => acc + Number(curr.faltas || 0), 0);
  const mediaGeral = historico.length > 0 ? (totalNotas / historico.length).toFixed(2) : 'N/A';

  let estadoAluno = 'Sem Notas';
  let corEstado = '#65676b';
  if (historico.length > 0) {
    if (mediaGeral >= 10) {
      estadoAluno = 'Aprovado';
      corEstado = '#28a745';
    } else if (mediaGeral >= 7) {
      estadoAluno = 'Em Recurso';
      corEstado = '#ffc107';
    } else {
      estadoAluno = 'Reprovado';
      corEstado = '#dc3545';
    }
  }

  if (!estudante) return null;

  return (
    <Modal visible={visivel} animationType="slide" transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Boletim Escolar</Text>
          <TouchableOpacity onPress={onClose} style={styles.btnFecharModal}>
            <Text style={styles.txtFecharModal}>✕ Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 15 }}>
          <View style={styles.fichaResumo}>
            <Text style={styles.nomeEstudanteBoletim}>{estudante.nome_completo}</Text>
            <Text style={styles.subFicha}>Curso: {estudante.curso || 'Geral'} | Turma: {estudante.turma || 'N/A'}</Text>
            <Text style={styles.subFicha}>BI: {estudante.num_bilhete}</Text>

            <View style={styles.caixaIndicadores}>
              <View style={styles.indicadorItem}>
                <Text style={styles.indicadorTitulo}>Média Geral</Text>
                <Text style={[styles.indicadorValor, { color: corEstado }]}>{mediaGeral}</Text>
              </View>
              <View style={styles.indicadorItem}>
                <Text style={styles.indicadorTitulo}>Estado</Text>
                <Text style={[styles.indicadorValor, { color: corEstado }]}>{estadoAluno}</Text>
              </View>
              <View style={styles.indicadorItem}>
                <Text style={styles.indicadorTitulo}>Total Faltas</Text>
                <Text style={styles.indicadorValor}>{totalFaltas}</Text>
              </View>
            </View>
          </View>

          {modoAdmin && (
            <View style={styles.cardFormNota}>
              <Text style={styles.subTituloSecao}>
                {notaEmEdicaoId ? '✏️ Alterar Nota' : '➕ Lançar Nova Nota'}
              </Text>

              <Text style={styles.label}>Disciplina</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Matemática"
                value={disciplina}
                onChangeText={setDisciplina}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Trimestre</Text>
                  <TextInput
                    style={styles.input}
                    value={trimestre}
                    onChangeText={setTrimestre}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nota (0-20)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="14"
                    keyboardType="numeric"
                    value={nota}
                    onChangeText={setNota}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Faltas</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={faltas}
                    onChangeText={setFaltas}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={[styles.btnSalvarNota, { flex: 1 }]} onPress={handleSalvarNota}>
                  <Text style={styles.txtSalvar}>
                    {notaEmEdicaoId ? 'Atualizar Nota' : '+ Lançar Nota'}
                  </Text>
                </TouchableOpacity>

                {notaEmEdicaoId && (
                  <TouchableOpacity style={styles.btnCancelarMini} onPress={limparFormularioNota}>
                    <Text style={styles.txtCancelarMini}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <Text style={[styles.subTituloSecao, { marginTop: 20 }]}>Histórico de Avaliações</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#1877f2" />
          ) : historico.length === 0 ? (
            <Text style={styles.vazio}>Nenhuma nota registada.</Text>
          ) : (
            historico.map((item) => (
              <View key={item.id} style={styles.itemNota}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{item.disciplina}</Text>
                  <Text style={{ fontSize: 12, color: '#65676b' }}>{item.trimestre}</Text>
                </View>

                <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                  <Text style={[styles.badgeNota, item.nota >= 10 ? styles.notaAprovado : styles.notaReprovado]}>
                    Nota: {item.nota}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#65676b', marginTop: 2 }}>
                    Faltas: {item.faltas}
                  </Text>
                </View>

                {modoAdmin && (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity style={styles.btnAcaoEditar} onPress={() => handleEditarNota(item)}>
                      <Text style={styles.txtAcaoEditar}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnAcaoEliminar} onPress={() => handleEliminarNota(item.id)}>
                      <Text style={styles.txtAcaoEliminar}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function CadastroPessoas({ instituicaoId, tipoInicial, membroParaEditar, onSucesso, onCancelar }) {
  const isEdicao = !!membroParaEditar;
  const [tipo, setTipo] = useState(membroParaEditar?.tipo || tipoInicial || 'estudante');
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState(membroParaEditar?.nome_completo || '');
  const [dataNascimento, setDataNascimento] = useState(membroParaEditar?.data_nascimento || membroParaEditar?.nascimento || '');
  const [bilhete, setBilhete] = useState(membroParaEditar?.num_bilhete || '');
  const [foto, setFoto] = useState(null);
  const [fotoUrlExistente, setFotoUrlExistente] = useState(membroParaEditar?.foto_url || null);

  const [turma, setTurma] = useState(membroParaEditar?.turma || '');
  const [classe, setClasse] = useState(membroParaEditar?.classe_ou_ano || '');
  const [curso, setCurso] = useState(membroParaEditar?.curso || '');

  const [formacao, setFormacao] = useState(membroParaEditar?.formacao_academica || '');
  const [disciplina, setDisciplina] = useState(membroParaEditar?.disciplina || '');

  const escolherFoto = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) {
        alert('Acesso à galeria é necessário para escolher foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setFoto(result.assets[0]);
      }
    } catch (e) {
      console.log('Erro imagem:', e);
    }
  };

  const handleSalvar = async () => {
    if (!nome.trim() || !bilhete.trim()) {
      alert('Atenção: Preencha o nome completo e o número do BI.');
      return;
    }

    setLoading(true);
    let fotoUrl = foto ? foto.uri : fotoUrlExistente;

    try {
      if (tipo === 'estudante') {
        const dadosEstudante = {
          instituicao_id: instituicaoId,
          nome_completo: nome,
          data_nascimento: dataNascimento || null,
          nascimento: dataNascimento || null,
          num_bilhete: bilhete,
          turma: turma || null,
          classe_ou_ano: classe || null,
          curso: curso || null,
          foto_url: fotoUrl || null
        };

        let res;
        if (isEdicao) {
          res = await supabase
            .from('estudantes')
            .update(dadosEstudante)
            .eq('id', membroParaEditar.id);
        } else {
          res = await supabase.from('estudantes').insert([dadosEstudante]);
        }

        if (res.error) {
          alert('Erro no Supabase (Estudante): ' + res.error.message);
          return;
        }
      } else {
        const dadosProfessor = {
          instituicao_id: instituicaoId,
          nome_completo: nome,
          data_nascimento: dataNascimento || null,
          nascimento: dataNascimento || null,
          num_bilhete: bilhete,
          formacao_academica: formacao || null,
          disciplina: disciplina || null,
          foto_url: fotoUrl || null
        };

        let res;
        if (isEdicao) {
          res = await supabase
            .from('professores')
            .update(dadosProfessor)
            .eq('id', membroParaEditar.id);
        } else {
          res = await supabase.from('professores').insert([dadosProfessor]);
        }

        if (res.error) {
          alert('Erro no Supabase (Professor): ' + res.error.message);
          return;
        }
      }

      alert(`Sucesso! ${tipo === 'estudante' ? 'Estudante' : 'Professor'} ${isEdicao ? 'atualizado' : 'cadastrado'}.`);
      if (onSucesso) onSucesso();
    } catch (err) {
      alert('Erro inesperado: ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>
          {isEdicao ? `Editar ${tipo === 'estudante' ? 'Estudante' : 'Professor'}` : `Cadastrar ${tipo === 'estudante' ? 'Estudante' : 'Professor'}`}
        </Text>
      </View>

      {!isEdicao && (
        <View style={styles.abaTipo}>
          <TouchableOpacity 
            style={[styles.btnTipo, tipo === 'estudante' && styles.btnTipoAtivo]}
            onPress={() => setTipo('estudante')}
          >
            <Text style={[styles.txtTipo, tipo === 'estudante' && styles.txtTipoAtivo]}>+ Estudante</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnTipo, tipo === 'professor' && styles.btnTipoAtivo]}
            onPress={() => setTipo('professor')}
          >
            <Text style={[styles.txtTipo, tipo === 'professor' && styles.txtTipoAtivo]}>+ Professor</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.fotoSection}>
        <TouchableOpacity onPress={escolherFoto} style={styles.fotoContainer}>
          {foto ? (
            <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
          ) : fotoUrlExistente ? (
            <Image source={{ uri: fotoUrlExistente }} style={styles.fotoPreview} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Text style={styles.fotoTxt}>📷 Selecionar Foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Manuel dos Santos" />

      <Text style={styles.label}>Número do BI *</Text>
      <TextInput style={styles.input} value={bilhete} onChangeText={setBilhete} placeholder="000000000LA000" />

      <Text style={styles.label}>Data de Nascimento</Text>
      <TextInput style={styles.input} value={dataNascimento} onChangeText={setDataNascimento} placeholder="AAAA-MM-DD" />

      {tipo === 'estudante' ? (
        <>
          <Text style={styles.label}>Curso</Text>
          <TextInput style={styles.input} value={curso} onChangeText={setCurso} placeholder="Ex: Informática" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Classe / Ano</Text>
              <TextInput style={styles.input} value={classe} onChangeText={setClasse} placeholder="Ex: 10ª Classe" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Turma</Text>
              <TextInput style={styles.input} value={turma} onChangeText={setTurma} placeholder="Ex: A" />
            </View>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>Formação Académica</Text>
          <TextInput style={styles.input} value={formacao} onChangeText={setFormacao} placeholder="Ex: Licenciado em Engenharia" />
          <Text style={styles.label}>Disciplina que Leciona</Text>
          <TextInput style={styles.input} value={disciplina} onChangeText={setDisciplina} placeholder="Ex: Matemática" />
        </>
      )}

      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.txtSalvar}>
            {isEdicao ? 'Atualizar Dados' : `Guardar ${tipo === 'estudante' ? 'Estudante' : 'Professor'}`}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.txtCancelar}>Cancelar e Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PerfilInstituicao({ instituicaoId, modoAdmin, onToggleAdmin, onNavegarCadastro, onEditarMembro }) {
  const [instituicao, setInstituicao] = useState(null);
  const [estudantes, setEstudantes] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('geral');
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [estudanteNota, setEstudanteNota] = useState(null);

  useEffect(() => {
    carregarDadosPerfil();
  }, [instituicaoId]);

  async function carregarDadosPerfil() {
    setLoading(true);
    try {
      const { data: dadosInst } = await supabase
        .from('instituicoes')
        .select('*')
        .eq('id', instituicaoId)
        .single();
      
      setInstituicao(dadosInst || {
        nome: 'Instituto Politécnico Exemplo',
        categoria_primaria: 'Ensino Técnico',
        localizacao: 'Viana, Luanda',
        email: 'contacto@escola.ao',
        director: 'Prof. Manuel',
      });

      const { data: dadosEst } = await supabase
        .from('estudantes')
        .select('*')
        .eq('instituicao_id', instituicaoId)
        .order('nome_completo', { ascending: true });
      setEstudantes(dadosEst || []);

      const { data: dadosProf } = await supabase
        .from('professores')
        .select('*')
        .eq('instituicao_id', instituicaoId)
        .order('nome_completo', { ascending: true });
      setProfessores(dadosProf || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleEliminar = (id, nome, tabela) => {
    Alert.alert(
      'Confirmar Eliminação',
      `Tem a certeza de que deseja eliminar "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from(tabela).delete().eq('id', id);
              if (error) throw error;
              alert('Registo eliminado.');
              carregarDadosPerfil();
            } catch (err) {
              alert('Erro ao eliminar: ' + err.message);
            }
          }
        }
      ]
    );
  };

  const estudantesFiltrados = estudantes.filter((est) =>
    est.nome_completo.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (est.curso && est.curso.toLowerCase().includes(termoBusca.toLowerCase())) ||
    (est.turma && est.turma.toLowerCase().includes(termoBusca.toLowerCase()))
  );

  const professoresFiltrados = professores.filter((prof) =>
    prof.nome_completo.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (prof.disciplina && prof.disciplina.toLowerCase().includes(termoBusca.toLowerCase()))
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={{ marginTop: 10 }}>A carregar dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.profileContainer}>
      <ModalNotasFaltas
        visivel={!!estudanteNota}
        estudante={estudanteNota}
        modoAdmin={modoAdmin}
        onClose={() => setEstudanteNota(null)}
      />

      {/* Topo exatamente como na imagem do usuário */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Portal Escola</Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity 
            style={styles.btnAdminState}
            onPress={onToggleAdmin}
          >
            <Text style={styles.btnAdminStateText}>
              👑 {modoAdmin ? 'Admin ON' : 'Modo Leitor'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnCadastrarTop}
            onPress={onNavegarCadastro}
          >
            <Text style={styles.btnCadastrarTopText}>+ Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Capa e Perfil */}
      <View style={styles.capaContainer}>
        <Image
          source={{ uri: instituicao?.foto_capa_url || 'https://via.placeholder.com/800x300/e0e0e0/ffffff' }}
          style={styles.capa}
        />
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: instituicao?.logo_url || 'https://via.placeholder.com/150/ffffff/ffffff' }}
            style={styles.logo}
          />
        </View>
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.nomeInstituicao}>{instituicao?.nome}</Text>
        <Text style={styles.categoria}>
          {instituicao?.categoria_primaria} • {instituicao?.localizacao || 'Viana, Luanda'}
        </Text>

        <TouchableOpacity style={styles.btnIrCadastramento} onPress={onNavegarCadastro}>
          <Text style={styles.txtIrCadastramento}>+ Ir para Cadastramento</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.inputSearch}
          placeholder="🔍 Pesquisar por nome, curso, turma ou disciplina..."
          value={termoBusca}
          onChangeText={setTermoBusca}
        />
      </View>

      {/* Abas */}
      <View style={styles.abasContainer}>
        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'geral' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('geral')}
        >
          <Text style={[styles.txtAba, abaAtiva === 'geral' && styles.txtAbaAtiva]}>Geral</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'estudantes' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('estudantes')}
        >
          <Text style={[styles.txtAba, abaAtiva === 'estudantes' && styles.txtAbaAtiva]}>
            Estudantes ({estudantesFiltrados.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'professores' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('professores')}
        >
          <Text style={[styles.txtAba, abaAtiva === 'professores' && styles.txtAbaAtiva]}>
            Professores ({professoresFiltrados.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo das Abas */}
      <View style={styles.conteudo}>
        {abaAtiva === 'geral' && (
          <View style={styles.card}>
            <Text style={styles.tituloCard}>Corpo Diretivo</Text>
            <Text style={styles.textoItem}>• Diretor Geral: {instituicao?.director || 'Prof. Manuel'}</Text>

            <Text style={[styles.tituloCard, { marginTop: 15 }]}>Contacto Institucional</Text>
            <Text style={styles.textoItem}>📧 Email: {instituicao?.email || 'contacto@escola.ao'}</Text>
          </View>
        )}

        {abaAtiva === 'estudantes' && (
          <View>
            {estudantesFiltrados.length === 0 ? (
              <Text style={styles.vazio}>Nenhum estudante encontrado.</Text>
            ) : (
              estudantesFiltrados.map((est) => (
                <View key={est.id} style={styles.listItem}>
                  <Image
                    source={{ uri: est.foto_url || 'https://via.placeholder.com/50' }}
                    style={styles.avatarList}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.listNome}>{est.nome_completo}</Text>
                    <Text style={styles.listDetalhe}>Curso: {est.curso || 'Geral'}</Text>
                    <Text style={styles.listDetalhe}>
                      Classe: {est.classe_ou_ano || 'N/A'} | Turma: {est.turma || 'N/A'}
                    </Text>
                    <TouchableOpacity
                      style={styles.btnVerBoletim}
                      onPress={() => setEstudanteNota(est)}
                    >
                      <Text style={styles.txtVerBoletim}>📊 Abrir Boletim Académico</Text>
                    </TouchableOpacity>
                  </View>

                  {modoAdmin && (
                    <View style={styles.acoesContainer}>
                      <TouchableOpacity
                        style={styles.btnAcaoEditar}
                        onPress={() => onEditarMembro({ ...est, tipo: 'estudante' })}
                      >
                        <Text style={styles.txtAcaoEditar}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.btnAcaoEliminar}
                        onPress={() => handleEliminar(est.id, est.nome_completo, 'estudantes')}
                      >
                        <Text style={styles.txtAcaoEliminar}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {abaAtiva === 'professores' && (
          <View>
            {professoresFiltrados.length === 0 ? (
              <Text style={styles.vazio}>Nenhum professor encontrado.</Text>
            ) : (
              professoresFiltrados.map((prof) => (
                <View key={prof.id} style={styles.listItem}>
                  <Image
                    source={{ uri: prof.foto_url || 'https://via.placeholder.com/50' }}
                    style={styles.avatarList}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.listNome}>{prof.nome_completo}</Text>
                    <Text style={styles.listDetalhe}>Disciplina: {prof.disciplina || 'Geral'}</Text>
                    <Text style={styles.listDetalhe}>
                      Formação: {prof.formacao_academica || 'Não especificada'}
                    </Text>
                  </View>

                  {modoAdmin && (
                    <View style={styles.acoesContainer}>
                      <TouchableOpacity
                        style={styles.btnAcaoEditar}
                        onPress={() => onEditarMembro({ ...prof, tipo: 'professor' })}
                      >
                        <Text style={styles.txtAcaoEditar}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.btnAcaoEliminar}
                        onPress={() => handleEliminar(prof.id, prof.nome_completo, 'professores')}
                      >
                        <Text style={styles.txtAcaoEliminar}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState('perfil');
  const [membroParaEditar, setMembroParaEditar] = useState(null);
  const [modoAdmin, setModoAdmin] = useState(true);

  const irParaCadastro = () => {
    setMembroParaEditar(null);
    setTelaAtual('cadastro');
  };

  const irParaEdicao = (membro) => {
    setMembroParaEditar(membro);
    setTelaAtual('cadastro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {telaAtual === 'perfil' && (
        <PerfilInstituicao 
          instituicaoId={INSTITUICAO_ID} 
          modoAdmin={modoAdmin}
          onToggleAdmin={() => setModoAdmin(!modoAdmin)}
          onNavegarCadastro={irParaCadastro}
          onEditarMembro={irParaEdicao}
        />
      )}

      {telaAtual === 'cadastro' && (
        <CadastroPessoas 
          instituicaoId={INSTITUICAO_ID}
          tipoInicial="estudante"
          membroParaEditar={membroParaEditar}
          onSucesso={() => setTelaAtual('perfil')}
          onCancelar={() => setTelaAtual('perfil')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  topBar: {
    height: 56,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#1877f2' },
  btnAdminState: { backgroundColor: '#28a745', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnAdminStateText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  btnCadastrarTop: { backgroundColor: '#1877f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnCadastrarTopText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },

  profileContainer: { flex: 1, backgroundColor: '#f0f2f5' },
  capaContainer: { height: 140, backgroundColor: '#e0e0e0', position: 'relative', marginBottom: 40 },
  capa: { width: '100%', height: '100%' },
  logoContainer: {
    position: 'absolute',
    bottom: -35,
    left: 20,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    overflow: 'hidden'
  },
  logo: { width: 80, height: 80 },
  headerInfo: { backgroundColor: '#ffffff', paddingHorizontal: 20, paddingBottom: 15 },
  nomeInstituicao: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  categoria: { fontSize: 13, color: '#65676b', marginTop: 2 },
  btnIrCadastramento: { backgroundColor: '#e4e6eb', marginTop: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  txtIrCadastramento: { fontWeight: 'bold', color: '#050505', fontSize: 14 },

  searchBarContainer: { paddingHorizontal: 15, paddingTop: 10, backgroundColor: '#ffffff' },
  inputSearch: { backgroundColor: '#f0f2f5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, fontSize: 13 },

  abasContainer: { flexDirection: 'row', backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#e4e6eb', marginTop: 10 },
  aba: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  abaAtiva: { borderBottomWidth: 3, borderBottomColor: '#1877f2' },
  txtAba: { fontWeight: '600', color: '#65676b', fontSize: 13 },
  txtAbaAtiva: { color: '#1877f2', fontWeight: 'bold' },

  conteudo: { padding: 15 },
  card: { backgroundColor: '#ffffff', padding: 15, borderRadius: 8 },
  tituloCard: { fontSize: 15, fontWeight: 'bold', color: '#050505', marginBottom: 6 },
  textoItem: { fontSize: 13, color: '#333', marginBottom: 4 },
  listItem: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center', elevation: 1 },
  avatarList: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eee' },
  listNome: { fontSize: 14, fontWeight: 'bold', color: '#050505' },
  listDetalhe: { fontSize: 12, color: '#65676b', marginTop: 2 },
  btnVerBoletim: { marginTop: 6, backgroundColor: '#e7f3ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  txtVerBoletim: { color: '#1877f2', fontSize: 11, fontWeight: 'bold' },
  vazio: { textAlign: 'center', color: '#65676b', marginTop: 30, fontSize: 14 },
  acoesContainer: { flexDirection: 'row', gap: 6 },
  btnAcaoEditar: { padding: 6, backgroundColor: '#e4e6eb', borderRadius: 6 },
  txtAcaoEditar: { fontSize: 14 },
  btnAcaoEliminar: { padding: 6, backgroundColor: '#ffebe9', borderRadius: 6 },
  txtAcaoEliminar: { fontSize: 14 },

  formContainer: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  formHeader: { marginBottom: 15 },
  btnVoltarHeader: { paddingVertical: 6, marginBottom: 8 },
  txtVoltarHeader: { color: '#1877f2', fontWeight: 'bold', fontSize: 13 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#050505' },
  abaTipo: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  btnTipo: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1877f2', alignItems: 'center' },
  btnTipoAtivo: { backgroundColor: '#1877f2' },
  txtTipo: { color: '#1877f2', fontWeight: 'bold' },
  txtTipoAtivo: { color: '#ffffff' },
  fotoSection: { alignItems: 'center', marginBottom: 15 },
  fotoContainer: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden' },
  fotoPreview: { width: '100%', height: '100%' },
  fotoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#e4e6eb', justifyContent: 'center', alignItems: 'center' },
  fotoTxt: { fontSize: 11, color: '#65676b', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#050505', marginBottom: 4, marginTop: 8 },
  input: { height: 42, borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f9f9f9', fontSize: 14 },
  btnSalvar: { backgroundColor: '#1877f2', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  txtSalvar: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  btnCancelar: { backgroundColor: '#e4e6eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
  txtCancelar: { color: '#050505', fontWeight: 'bold', fontSize: 15 },

  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#050505' },
  btnFecharModal: { padding: 5 },
  txtFecharModal: { color: '#e41e3f', fontWeight: 'bold' },
  fichaResumo: { backgroundColor: '#e7f3ff', padding: 14, borderRadius: 8, marginBottom: 12 },
  nomeEstudanteBoletim: { fontSize: 16, fontWeight: 'bold', color: '#050505' },
  subFicha: { fontSize: 12, color: '#444', marginTop: 2 },
  caixaIndicadores: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#cce5ff' },
  indicadorItem: { alignItems: 'center', flex: 1 },
  indicadorTitulo: { fontSize: 11, color: '#65676b', fontWeight: 'bold' },
  indicadorValor: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  cardFormNota: { backgroundColor: '#f7f8fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e4e6eb' },
  subTituloSecao: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  btnSalvarNota: { backgroundColor: '#28a745', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  btnCancelarMini: { backgroundColor: '#e4e6eb', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, justifyContent: 'center' },
  txtCancelarMini: { color: '#333', fontWeight: 'bold', fontSize: 12 },
  itemNota: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 6 },
  badgeNota: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontWeight: 'bold', fontSize: 12 },
  notaAprovado: { backgroundColor: '#d4edda', color: '#155724' },
  notaReprovado: { backgroundColor: '#f8d7da', color: '#721c24' }
});
