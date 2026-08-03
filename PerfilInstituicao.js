import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { supabase } from './supabaseClient';

export default function PerfilInstituicao({ instituicaoId, onNavegarCadastro }) {
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
      // 1. Dados da Instituição
      const { data: dadosInst, error: errInst } = await supabase
        .from('instituicoes')
        .select('*')
        .eq('id', instituicaoId)
        .single();
      
      if (errInst) throw errInst;
      setInstituicao(dadosInst);

      // 2. Lista de Estudantes (Ordem alfabética)
      const { data: dadosEst } = await supabase
        .from('estudantes')
        .select('*')
        .eq('instituicao_id', instituicaoId)
        .order('nome_completo', { ascending: true });
      setEstudantes(dadosEst || []);

      // 3. Lista de Professores (Ordem alfabética)
      const { data: dadosProf } = await supabase
        .from('professores')
        .select('*')
        .eq('instituicao_id', instituicaoId)
        .order('nome_completo', { ascending: true });
      setProfessores(dadosProf || []);

    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={{ marginTop: 10 }}>A carregar perfil...</Text>
      </View>
    );
  }

  if (!instituicao) {
    return (
      <View style={styles.center}>
        <Text>Nenhuma instituição encontrada.</Text>
      </View>
    );
  }

  // Ecrã de bloqueio se estiver pendente de aprovação
  if (instituicao.estado_aprovacao === 'pendente') {
    return (
      <View style={styles.avisoContainer}>
        <Text style={styles.avisoTitulo}>⏳ Registo em Análise</Text>
        <Text style={styles.avisoTexto}>
          As informações da sua instituição foram enviadas com sucesso e aguardam confirmação da administração. Assim que forem aprovadas, o seu perfil ficará ativo.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* CAPA E FOTO DE PERFIL (ESTILO FACEBOOK) */}
      <View style={styles.capaContainer}>
        <Image
          source={{ uri: instituicao.foto_capa_url || 'https://via.placeholder.com/800x300' }}
          style={styles.capa}
        />
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: instituicao.logo_url || 'https://via.placeholder.com/150' }}
            style={styles.logo}
          />
        </View>
      </View>

      {/* CABEÇALHO COM INFORMAÇÕES */}
      <View style={styles.headerInfo}>
        <Text style={styles.nomeInstituicao}>{instituicao.nome}</Text>
        <Text style={styles.categoria}>
          {instituicao.categoria_primaria} • {instituicao.localizacao || 'Localização não definida'}
        </Text>

        {/* BOTÃO PARA ADICIONAR PESSOAS */}
        <TouchableOpacity style={styles.btnAdicionar} onPress={onNavegarCadastro}>
          <Text style={styles.txtBtnAdicionar}>+ Adicionar Aluno ou Professor</Text>
        </TouchableOpacity>
      </View>

      {/* ABAS DE NAVEGAÇÃO */}
      <View style={styles.abasContainer}>
        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'geral' && styles.abaAtiva]}
          onPageChange={() => setAbaAtiva('geral')}
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

      {/* CONTEÚDO DAS ABAS */}
      <View style={styles.conteudo}>
        {abaAtiva === 'geral' && (
          <View style={styles.card}>
            <Text style={styles.tituloCard}>Corpo Diretivo</Text>
            <Text style={styles.textoItem}>• Diretor: {instituicao.director || 'Não informado'}</Text>
            <Text style={styles.textoItem}>• Vice-Diretor: {instituicao.vice_director || 'Não informado'}</Text>
            <Text style={styles.textoItem}>• Secretário(a): {instituicao.secretario || 'Não informado'}</Text>

            <Text style={[styles.tituloCard, { marginTop: 15 }]}>Cursos Oferecidos</Text>
            <Text style={styles.textoItem}>
              {instituicao.cursos ? instituicao.cursos.join(', ') : 'Nenhum curso listado'}
            </Text>

            <Text style={[styles.tituloCard, { marginTop: 15 }]>Contacto Institucional</Text>
            <Text style={styles.textoItem}>📧 {instituicao.email}</Text>
          </View>
        )}

        {abaAtiva === 'estudantes' && (
          <View>
            <Text style={styles.subTituloSecao}>Lista Organizada de Estudantes</Text>
            {estudantes.length === 0 ? (
              <Text style={styles.vazio}>Nenhum estudante cadastrado ainda.</Text>
            ) : (
              estudantes.map((est) => (
                <View key={est.id} style={styles.listItem}>
                  <Image
                    source={{ uri: est.foto_url || 'https://via.placeholder.com/50' }}
                    style={styles.avatarList}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.listNome}>{est.nome_completo}</Text>
                    <Text style={styles.listDetalhe}>Curso: {est.curso || 'N/A'}</Text>
                    <Text style={styles.listDetalhe}>Classe: {est.classe_ou_ano} | Turma: {est.turma}</Text>
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
              <Text style={styles.vazio}>Nenhum professor cadastrado ainda.</Text>
            ) : (
              professores.map((prof) => (
                <View key={prof.id} style={styles.listItem}>
                  <Image
                    source={{ uri: prof.foto_url || 'https://via.placeholder.com/50' }}
                    style={styles.avatarList}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.listNome}>{prof.nome_completo}</Text>
                    <Text style={styles.listDetalhe}>Disciplina: {prof.disciplina || 'N/A'}</Text>
                    <Text style={styles.listDetalhe}>Formação: {prof.formacao_academica}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  capaContainer: { height: 180, backgroundColor: '#ddd', position: 'relative', marginBottom: 50 },
  capa: { width: '100%', height: '100%' },
  logoContainer: {
    position: 'absolute',
    bottom: -45,
    left: 20,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  logo: { width: 100, height: 100 },
  headerInfo: { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 15 },
  nomeInstituicao: { fontSize: 22, fontWeight: 'bold', color: '#050505' },
  categoria: { fontSize: 13, color: '#65676b', marginTop: 2 },
  btnAdicionar: {
    backgroundColor: '#e4e6eb',
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  txtBtnAdicionar: { fontWeight: 'bold', color: '#050505' },
  abasContainer: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e4e6eb', marginTop: 8 },
  aba: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  abaAtiva: { borderBottomWidth: 3, borderBottomColor: '#1877f2' },
  txtAba: { fontWeight: '600', color: '#65676b' },
  txtAbaAtiva: { color: '#1877f2', fontWeight: 'bold' },
  conteudo: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8 },
  tituloCard: { fontSize: 16, fontWeight: 'bold', color: '#050505', marginBottom: 6 },
  textoItem: { fontSize: 14, color: '#333', marginBottom: 4 },
  subTituloSecao: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 1
  },
  avatarList: { width: 50, height: 50, borderRadius: 25 },
  listNome: { fontSize: 15, fontWeight: 'bold', color: '#050505' },
  listDetalhe: { fontSize: 12, color: '#65676b', marginTop: 2 },
  vazio: { textAlign: 'center', color: '#65676b', marginTop: 20 },
  avisoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#fff' },
  avisoTitulo: { fontSize: 20, fontWeight: 'bold', color: '#e67e22', marginBottom: 12, textAlign: 'center' },
  avisoTexto: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22 }
});
