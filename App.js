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

// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_PUBLIC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const INSTITUICAO_ID = 1;

// ==========================================
// 2. COMPONENTE: CADASTRO / EDIÇÃO DE PESSOAS
// ==========================================
function CadastroPessoas({ instituicaoId, membroParaEditar, onSucesso, onCancelar }) {
  const isEdicao = !!membroParaEditar;
  const [tipo, setTipo] = useState(membroParaEditar?.tipo || 'estudante');
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState(membroParaEditar?.nome_completo || '');
  const [dataNascimento, setDataNascimento] = useState(membroParaEditar?.data_nascimento || '');
  const [bilhete, setBilhete] = useState(membroParaEditar?.num_bilhete || '');
  const [foto, setFoto] = useState(null);
  const [fotoUrlExistente, setFotoUrlExistente] = useState(membroParaEditar?.foto_url || null);

  // Campos específicos de Estudante
  const [turma, setTurma] = useState(membroParaEditar?.turma || '');
  const [classe, setClasse] = useState(membroParaEditar?.classe_ou_ano || '');
  const [curso, setCurso] = useState(membroParaEditar?.curso || '');

  // Campos específicos de Professor
  const [formacao, setFormacao] = useState(membroParaEditar?.formacao_academica || '');
  const [disciplina, setDisciplina] = useState(membroParaEditar?.disciplina || '');

  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.');
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
  };

  const uploadFotoSupabase = async (uri) => {
    try {
      const ext = uri.split('.').pop();
      const fileName = `${tipo}_${Date.now()}.${ext}`;
      const filePath = `membros/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('fotos')
        .upload(filePath, blob, { contentType: `image/${ext}`, upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('fotos')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Erro no upload da foto:', err);
      return null;
    }
  };

  const handleSalvar = async () => {
    if (!nome.trim() || !bilhete.trim()) {
      Alert.alert('Atenção', 'Preencha o nome completo e o número do BI.');
      return;
    }

    setLoading(true);
    let fotoUrl = fotoUrlExistente;

    if (foto) {
      fotoUrl = await uploadFotoSupabase(foto.uri);
    }

    try {
      if (tipo === 'estudante') {
        const dadosEstudante = {
          instituicao_id: instituicaoId,
          nome_completo: nome,
          data_nascimento: dataNascimento || null,
          num_bilhete: bilhete,
          turma,
          classe_ou_ano: classe,
          curso,
          foto_url: fotoUrl
        };

        if (isEdicao) {
          const { error } = await supabase
            .from('estudantes')
            .update(dadosEstudante)
            .eq('id', membroParaEditar.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('estudantes').insert([dadosEstudante]);
          if (error) throw error;
        }
      } else {
        const dadosProfessor = {
          instituicao_id: instituicaoId,
          nome_completo: nome,
          data_nascimento: dataNascimento || null,
          num_bilhete: bilhete,
          formacao_academica: formacao,
          disciplina,
          foto_url: fotoUrl
        };

        if (isEdicao) {
          const { error } = await supabase
            .from('professores')
            .update(dadosProfessor)
            .eq('id', membroParaEditar.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('professores').insert([dadosProfessor]);
          if (error) throw error;
        }
      }

      Alert.alert(
        'Sucesso',
        `${tipo === 'estudante' ? 'Estudante' : 'Professor'} ${isEdicao ? 'atualizado' : 'cadastrado'} com sucesso!`
      );
      if (onSucesso) onSucesso();
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {isEdicao ? `Editar ${tipo === 'estudante' ? 'Estudante' : 'Professor'}` : 'Cadastrar Novo Membro'}
      </Text>

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

      {isEdicao && (
        <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
          <Text style={styles.txtCancelar}>Cancelar Edição</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ==========================================
// 3. COMPONENTE: PERFIL DA INSTITUIÇÃO (COM EDITAR E APAGAR)
// ==========================================
function PerfilInstituicao({ instituicaoId, onNavegarCadastro, onEditarMembro }) {
  const [instituicao, setInstituicao] = useState(null);
  const [estudantes, setEstudantes] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('geral');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosPerfil();
  }, [instituicaoId]);

  async function carregarDadosPerfil() {
    setLoading(true);
    try {
      const { data: dadosInst, error: errInst } = await supabase
        .from('instituicoes')
        .select('*')
        .eq('id', instituicaoId)
        .single();
      
      if (errInst && errInst.code !== 'PGRST116') throw errInst;
      
      setInstituicao(dadosInst || {
        nome: 'Instituto Politécnico Exemplo',
        categoria_primaria: 'Ensino Técnico',
        localizacao: 'Viana, Luanda',
        email: 'contacto@escola.ao',
        director: 'Prof. Manuel',
        estado_aprovacao: 'aprovado'
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
              const { error } = await supabase
                .from(tabela)
                .delete()
                .eq('id', id);

              if (error) throw error;

              Alert.alert('Sucesso', 'Registo eliminado com sucesso.');
              carregarDadosPerfil();
            } catch (err) {
              Alert.alert('Erro ao eliminar', err.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={{ marginTop: 10 }}>A carregar dados do perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.capaContainer}>
        <Image
          source={{ uri: instituicao?.foto_capa_url || 'https://via.placeholder.com/800x300/1877f2/ffffff?text=Capa+da+Instituicao' }}
          style={styles.capa}
        />
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: instituicao?.logo_url || 'https://via.placeholder.com/150/ffffff/1877f2?text=Logo' }}
            style={styles.logo}
          />
        </View>
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.nomeInstituicao}>{instituicao?.nome}</Text>
        <Text style={styles.categoria}>
          {instituicao?.categoria_primaria} • {instituicao?.localizacao || 'Luanda, Angola'}
        </Text>

        <TouchableOpacity style={styles.btnAdicionar} onPress={onNavegarCadastro}>
          <Text style={styles.txtBtnAdicionar}>+ Adicionar Estudante / Professor</Text>
        </TouchableOpacity>
      </View>

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
            Estudantes ({estudantes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'professores' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('professores')}
        >
          <Text style={[styles.txtAba, abaAtiva === 'professores' && styles.txtAbaAtiva]}>
            Professores ({professores.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.conteudo}>
        {abaAtiva === 'geral' && (
          <View style={styles.card}>
            <Text style={styles.tituloCard}>Corpo Diretivo</Text>
            <Text style={styles.textoItem}>• Diretor Geral: {instituicao?.director || 'Não informado'}</Text>
            <Text style={styles.textoItem}>• Vice-Diretor: {instituicao?.vice_director || 'Não informado'}</Text>
            <Text style={styles.textoItem}>• Secretário(a): {instituicao?.secretario || 'Não informado'}</Text>

            <Text style={[styles.tituloCard, { marginTop: 15 }]}>Contacto Institucional</Text>
            <Text style={styles.textoItem}>📧 Email: {instituicao?.email}</Text>
          </View>
        )}

        {abaAtiva === 'estudantes' && (
          <View>
            <Text style={styles.subTituloSecao}>Lista de Estudantes Cadastrados</Text>
            {estudantes.length === 0 ? (
              <Text style={styles.vazio}>Nenhum estudante registado até ao momento.</Text>
            ) : (
              estudantes.map((est) => (
                <View key={est.id} style={styles.listItem}>
                  <Image
                    source={{ uri: est.foto_url || 'https://via.placeholder.com/50' }}
                    style={styles.avatarList}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.listNome}>{est.nome_completo}</Text>
                    <Text style={styles.listDetalhe}>Curso: {est.curso || 'Geral'}</Text>
                    <Text style={styles.listDetalhe}>Classe: {est.classe_ou_ano || 'N/A'} | Turma: {est.turma || 'N/A'}</Text>
                  </View>
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
                </View>
              ))
            )}
          </View>
        )}

        {abaAtiva === 'professores' && (
          <View>
            <Text style={styles.subTituloSecao}>Corpo Docente</Text>
            {professores.length === 0 ? (
              <Text style={styles.vazio}>Nenhum professor registado até ao momento.</Text>
            ) : (
              professores.map((prof) => (
                <View key={prof.id} style={styles.listItem}>
                  <Image
                    source={{ uri: prof.foto_url || 'https://via.placeholder.com/50' }}
                    style={styles.avatarList}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.listNome}>{prof.nome_completo}</Text>
                    <Text style={styles.listDetalhe}>Disciplina: {prof.disciplina || 'Geral'}</Text>
                    <Text style={styles.listDetalhe}>Formação: {prof.formacao_academica || 'Não especificada'}</Text>
                  </View>
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
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ==========================================
// 4. COMPONENTE PRINCIPAL (Navegação Root)
// ==========================================
export default function App() {
  const [telaAtual, setTelaAtual] = useState('perfil');
  const [membroParaEditar, setMembroParaEditar] = useState(null);

  const iniciarCadastro = () => {
    setMembroParaEditar(null);
    setTelaAtual('cadastro');
  };

  const iniciarEdicao = (membro) => {
    setMembroParaEditar(membro);
    setTelaAtual('cadastro');
  };

  const concluirAcao = () => {
    setMembroParaEditar(null);
    setTelaAtual('perfil');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* BANNER SUPERIOR */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Portal Escola</Text>
        <TouchableOpacity 
          style={styles.btnNavegar} 
          onPress={() => {
            if (telaAtual === 'perfil') {
              iniciarCadastro();
            } else {
              concluirAcao();
            }
          }}
        >
          <Text style={styles.btnNavegarTexto}>
            {telaAtual === 'perfil' ? '+ Cadastrar Membro' : 'Ver Perfil FB'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTEÚDO DINÂMICO */}
      {telaAtual === 'perfil' ? (
        <PerfilInstituicao 
          instituicaoId={INSTITUICAO_ID} 
          onNavegarCadastro={iniciarCadastro}
          onEditarMembro={iniciarEdicao}
        />
      ) : (
        <CadastroPessoas 
          instituicaoId={INSTITUICAO_ID}
          membroParaEditar={membroParaEditar}
          onSucesso={concluirAcao}
          onCancelar={concluirAcao}
        />
      )}
    </SafeAreaView>
  );
}

// ==========================================
// 5. ESTILOS GERAIS
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  topBar: {
    height: 56,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
    elevation: 2,
  },
  topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#1877f2' },
  btnNavegar: { backgroundColor: '#1877f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnNavegarTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  
  // Perfil
  profileContainer: { flex: 1, backgroundColor: '#f0f2f5' },
  capaContainer: { height: 160, backgroundColor: '#ddd', position: 'relative', marginBottom: 45 },
  capa: { width: '100%', height: '100%' },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  logo: { width: 90, height: 90 },
  headerInfo: { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 15 },
  nomeInstituicao: { fontSize: 20, fontWeight: 'bold', color: '#050505' },
  categoria: { fontSize: 13, color: '#65676b', marginTop: 2 },
  btnAdicionar: { backgroundColor: '#e4e6eb', marginTop: 12, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  txtBtnAdicionar: { fontWeight: 'bold', color: '#050505' },
  abasContainer: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e4e6eb', marginTop: 8 },
  aba: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  abaAtiva: { borderBottomWidth: 3, borderBottomColor: '#1877f2' },
  txtAba: { fontWeight: '600', color: '#65676b', fontSize: 13 },
  txtAbaAtiva: { color: '#1877f2', fontWeight: 'bold' },
  conteudo: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8 },
  tituloCard: { fontSize: 15, fontWeight: 'bold', color: '#050505', marginBottom: 6 },
  textoItem: { fontSize: 13, color: '#333', marginBottom: 4 },
  subTituloSecao: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  listItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center', elevation: 1 },
  avatarList: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eee' },
  listNome: { fontSize: 14, fontWeight: 'bold', color: '#050505' },
  listDetalhe: { fontSize: 12, color: '#65676b', marginTop: 2 },
  vazio: { textAlign: 'center', color: '#65676b', marginTop: 20 },
  acoesContainer: { flexDirection: 'row', gap: 6 },
  btnAcaoEditar: { padding: 6, backgroundColor: '#e4e6eb', borderRadius: 6 },
  txtAcaoEditar: { fontSize: 14 },
  btnAcaoEliminar: { padding: 6, backgroundColor: '#ffebe9', borderRadius: 6 },
  txtAcaoEliminar: { fontSize: 14 },

  // Formulario
  formContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#050505', marginBottom: 15 },
  abaTipo: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  btnTipo: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1877f2', alignItems: 'center' },
  btnTipoAtivo: { backgroundColor: '#1877f2' },
  txtTipo: { color: '#1877f2', fontWeight: 'bold' },
  txtTipoAtivo: { color: '#fff' },
  fotoSection: { alignItems: 'center', marginBottom: 15 },
  fotoContainer: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden' },
  fotoPreview: { width: '100%', height: '100%' },
  fotoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#e4e6eb', justifyContent: 'center', alignItems: 'center' },
  fotoTxt: { fontSize: 11, color: '#65676b', textAlign: 'center' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#050505', marginBottom: 4, marginTop: 8 },
  input: { height: 42, borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f9f9f9', fontSize: 14 },
  btnSalvar: { backgroundColor: '#1877f2', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  txtSalvar: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnCancelar: { backgroundColor: '#e4e6eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
  txtCancelar: { color: '#050505', fontWeight: 'bold', fontSize: 15 }
});
