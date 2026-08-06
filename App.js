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
  Alert,
  ActivityIndicator,
  Modal,
  Linking
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as DocumentPicker from 'expo-document-picker';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- COMPONENTE DO QUADRO DE PUBLICIDADE ROTATIVO ---
function CarrosselPublicidades({ publicidadeLigar }) {
  const anuncios = [
    {
      id: 1,
      tag: '📢 Publicidade Patrocinada',
      titulo: 'Matérias a bom preço',
      corpo: '🇦🇴 Olá Angola, o regresso às aulas já é uma realidade, estamos a disponibilizar materiais de boa qualidade.\nLivros 📕 Cadernos 📓 Folha A4 Lápis',
      corFundo: '#1d4ed8'
    },
    {
      id: 2,
      tag: '👔 Confecção de Uniformes',
      titulo: 'Uniformes & Fardamentos',
      corpo: 'Produção de fardas escolares para colégios e institutos.\nBatas, camisas, calças e bordados personalizados com a melhor qualidade de Luanda.',
      corFundo: '#0f766e'
    },
    {
      id: 3,
      tag: '💻 Tecnologia Escolar',
      titulo: 'Softwares & Equipamentos',
      corpo: 'Computadores, impressoras e redes para instituições de ensino com assistência técnica garantida em Luanda.',
      corFundo: '#4338ca'
    }
  ];

  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % anuncios.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [anuncios.length]);

  const anuncioAtual = anuncios[indiceAtual];

  return (
    <View style={[styles.cardPublicidade, { backgroundColor: anuncioAtual.corFundo }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={styles.badgePatrocinado}>
          <Text style={styles.txtBadgePatrocinado}>{anuncioAtual.tag}</Text>
        </View>
        <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '600' }}>
          {indiceAtual + 1} / {anuncios.length}
        </Text>
      </View>

      <Text style={styles.tituloPublicidade}>{anuncioAtual.titulo}</Text>
      <Text style={styles.corpoPublicidade}>{anuncioAtual.corpo}</Text>

      <TouchableOpacity style={styles.btnLigarPub} onPress={publicidadeLigar}>
        <Text style={styles.rodapePublicidade}>
          Para mais informações ligue no número abaixo:{'\n'}
          <Text style={styles.telefonePublicidade}>📞 929500600 (Clique para Ligar)</Text>
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
        {anuncios.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setIndiceAtual(idx)}
            style={{
              width: idx === indiceAtual ? 18 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: idx === indiceAtual ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)',
              marginHorizontal: 3,
            }}
          />
        ))}
      </View>
    </View>
  );
}

// --- CADASTRAMENTO DE INSTITUIÇÕES (COM LEGALIZAÇÃO EMBUTIDA) ---
function FormCadastramentoInstituicao({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [numeroInst, setNumeroInst] = useState('');
  const [email, setEmail] = useState('');
  const [ficheiroPdf, setFicheiroPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const selecionarPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setFicheiroPdf(res.assets[0]);
        Alert.alert('Ficheiro Anexado', `Documento selecionado: ${res.assets[0].name}`);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar o ficheiro PDF.');
    }
  };

  const handleCadastrar = async () => {
    if (!nome.trim() || !numeroInst.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios da instituição.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: nome.trim(),
        nif: numeroInst.trim(),
        email: email.trim(),
      };

      if (ficheiroPdf) {
        payload.sobre = JSON.stringify({
          status_legalizacao: 'Em Análise',
          ficheiro_nome: ficheiroPdf.name,
          tamanho_bytes: ficheiroPdf.size
        });
      }

      const { error } = await supabase.from('instituicoes').insert([payload]);

      if (error) throw error;

      Alert.alert('Sucesso', 'Instituição e processo cadastrados com sucesso!');
      onConcluir();
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message || 'Falha ao guardar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Cadastramento de Instituição</Text>
      </View>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Colégio Futuro do Saber" />

      <Text style={styles.label}>Número / NIF *</Text>
      <TextInput style={styles.input} value={numeroInst} onChangeText={setNumeroInst} placeholder="NIF ou Telefone" />

      <Text style={styles.label}>Email *</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="contacto@escola.ao" />

      <View style={styles.cardNotaLegal}>
        <Text style={styles.tituloNotaLegal}>📜 Legalização e Licenciamento (Decreto 37/23)</Text>
        <Text style={styles.corpoNotaLegal}>
          Para legalizar a instituição, anexe a documentação completa (Certidão, Projeto Pedagógico e Vistoria).
        </Text>

        <TouchableOpacity style={styles.btnSelecionarPdf} onPress={selecionarPdf}>
          <Text style={styles.txtSelecionarPdf}>
            {ficheiroPdf ? `📄 ${ficheiroPdf.name}` : '📎 Anexar Processo em PDF (Opcional)'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Instituição</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- CADASTRAMENTO DE PROFESSOR ---
function FormCadastramentoProfessor({ onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bi, setBi] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrarProf = async () => {
    if (!nome.trim() || !disciplina.trim() || !telefone.trim()) {
      Alert.alert('Atenção', 'Preencha o nome, disciplina e telefone do professor.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('professores').insert([
        { nome_completo: nome.trim(), disciplina: disciplina.trim(), telefone: telefone.trim(), num_bilhete: bi.trim() }
      ]);

      if (error) throw error;

      Alert.alert('Sucesso 🎉', 'Professor cadastrado com sucesso!');
      onConcluir();
    } catch (err) {
      Alert.alert('Erro ao Salvar', err.message || 'Falha ao guardar dados do professor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Cadastramento de Professor</Text>
      </View>

      <Text style={styles.label}>Nome Completo do Professor *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Prof. António Silva" />

      <Text style={styles.label}>Disciplina / Cadeira *</Text>
      <TextInput style={styles.input} value={disciplina} onChangeText={setDisciplina} placeholder="Ex: Matemática / Física" />

      <Text style={styles.label}>Telefone de Contacto *</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="Ex: 923000000" />

      <Text style={styles.label}>Nº do Bilhete de Identidade (BI)</Text>
      <TextInput style={styles.input} value={bi} onChangeText={setBi} placeholder="Ex: 004928172LA048" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrarProf} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Salvar Cadastramento</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- PESQUISA DE ALUNOS E ENCARREGADOS ---
function TelaPesquisaAlunosEncarregados({ onVoltarHome }) {
  const [busca, setBusca] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstudantes();
  }, []);

  const carregarEstudantes = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('estudantes').select('*').order('id', { ascending: false });
      setAlunos(data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const alunosFiltrados = alunos.filter(a => 
    (a.nome_completo && a.nome_completo.toLowerCase().includes(busca.toLowerCase())) ||
    (a.encarregado_nome && a.encarregado_nome.toLowerCase().includes(busca.toLowerCase())) ||
    (a.num_bilhete && a.num_bilhete.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onVoltarHome}>
          <Text style={{ fontSize: 13, color: '#1e40af', fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>Pesquisa Alunos & Encarregados</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ padding: 16 }}>
        <TextInput 
          style={styles.inputBusca} 
          placeholder="Pesquise por aluno, encarregado ou BI..." 
          value={busca} 
          onChangeText={setBusca} 
        />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#0f172a" style={{ marginTop: 20 }} />
        ) : alunosFiltrados.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 30 }}>Nenhum registo encontrado.</Text>
        ) : (
          alunosFiltrados.map((aluno) => (
            <View key={aluno.id} style={styles.cardConsulta}>
              <Text style={styles.nomeAlunoConsulta}>👨‍🎓 Aluno: {aluno.nome_completo}</Text>

              {/* DADOS DO ENCARREGADO */}
              <View style={styles.boxEncarregadoCard}>
                <Text style={styles.txtEncarregadoTitulo}>👨‍👩‍👦 Encarregado de Educação:</Text>
                <Text style={styles.txtEncarregadoNome}>{aluno.encarregado_nome || 'Não Registado'}</Text>
                <Text style={styles.txtEncarregadoTel}>📞 Contacto: {aluno.encarregado_telefone || aluno.telefone || 'Sem contacto'}</Text>
              </View>

              <Text style={styles.detalheCurso}>BI: {aluno.num_bilhete || 'N/A'}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// --- TELA DEDICADA DE PUBLICIDADES ---
function TelaQuadroPublicidades({ onVoltarHome, publicidadeLigar }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onVoltarHome}>
          <Text style={{ fontSize: 13, color: '#1e40af', fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>Quadro de Publicidades</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
      </ScrollView>
    </View>
  );
}

// --- MENU PRINCIPAL (HOME) ---
function MenuPrincipalHome({ 
  onNavegarCadastramentoInst, 
  onNavegarPesquisaAlunosEncarregados, 
  onNavegarCadastramentoProf,
  onNavegarQuadroPub, 
  publicidadeLigar 
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.headerRowHome}>
        <Text style={styles.homeTitleHeader}>Portal Escola</Text>
        <TouchableOpacity style={styles.btnHeaderPub} onPress={onNavegarQuadroPub}>
          <Text style={styles.txtHeaderPub}>📢 Publicidade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.homeContainer} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>
        <Text style={styles.secaoSubtitulo}>Selecione a opção desejada para navegar:</Text>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.cardEmoji}>🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
          <Text style={styles.cardMenuDesc}>
            Registe a sua instituição de ensino e anexe os documentos de legalização.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarPesquisaAlunosEncarregados}>
          <Text style={styles.cardEmoji}>🔎</Text>
          <Text style={styles.cardMenuTitulo}>Pesquisa de Alunos e Encarregados</Text>
          <Text style={styles.cardMenuDesc}>
            Pesquise alunos registados, os seus bilhetes e contactos dos encarregados de educação.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenuImageStyle} onPress={onNavegarCadastramentoProf}>
          <Text style={styles.cardEmoji}>👨‍🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Professor</Text>
          <Text style={styles.cardMenuDesc}>
            Registe o corpo docente, disciplinas atribuídas e contactos dos professores.
          </Text>
        </TouchableOpacity>

        {/* QUADRO DE PUBLICIDADE ROTATIVO NO RODAPÉ */}
        <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  const [telaAtual, setTelaAtual] = useState('home');

  const ligarParaSuporte = () => {
    Linking.openURL('tel:929500600');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="dark" />

      {telaAtual === 'home' && (
        <MenuPrincipalHome
          onNavegarCadastramentoInst={() => setTelaAtual('cadastramento')}
          onNavegarPesquisaAlunosEncarregados={() => setTelaAtual('pesquisa_alunos_encarregados')}
          onNavegarCadastramentoProf={() => setTelaAtual('cadastramento_prof')}
          onNavegarQuadroPub={() => setTelaAtual('quadro_pub')}
          publicidadeLigar={ligarParaSuporte}
        />
      )}

      {telaAtual === 'cadastramento' && (
        <FormCadastramentoInstituicao
          onConcluir={() => setTelaAtual('home')}
          onCancelar={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'pesquisa_alunos_encarregados' && (
        <TelaPesquisaAlunosEncarregados
          onVoltarHome={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'cadastramento_prof' && (
        <FormCadastramentoProfessor
          onConcluir={() => setTelaAtual('home')}
          onCancelar={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'quadro_pub' && (
        <TelaQuadroPublicidades
          onVoltarHome={() => setTelaAtual('home')}
          publicidadeLigar={ligarParaSuporte}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRowHome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  homeTitleHeader: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  btnHeaderPub: { backgroundColor: '#f1f5f9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  txtHeaderPub: { color: '#1e40af', fontSize: 13, fontWeight: '600' },
  homeContainer: { flex: 1 },
  secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  secaoSubtitulo: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  cardMenuImageStyle: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  cardEmoji: { fontSize: 24, marginBottom: 8 },
  cardMenuTitulo: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  cardMenuDesc: { fontSize: 13, color: '#64748b' },
  cardPublicidade: { borderRadius: 12, padding: 16, marginTop: 12, marginBottom: 20 },
  badgePatrocinado: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 12 },
  txtBadgePatrocinado: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  tituloPublicidade: { color: '#ffffff', fontSize: 17, fontWeight: 'bold', marginTop: 10, marginBottom: 6 },
  corpoPublicidade: { color: '#f8fafc', fontSize: 13, lineHeight: 18 },
  btnLigarPub: { marginTop: 14, backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: 10, borderRadius: 8 },
  rodapePublicidade: { color: '#ffffff', fontSize: 12, textAlign: 'center' },
  telefonePublicidade: { fontWeight: 'bold', color: '#fbbf24', fontSize: 13 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  formContainer: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  formHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  btnVoltarHeader: { marginRight: 15 },
  txtVoltarHeader: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 14, color: '#0f172a' },
  btnSalvar: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  txtSalvar: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  cardNotaLegal: { backgroundColor: '#eff6ff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#bfdbfe', marginTop: 16 },
  tituloNotaLegal: { fontSize: 14, fontWeight: 'bold', color: '#1e40af', marginBottom: 6 },
  corpoNotaLegal: { fontSize: 12, color: '#1e3a8a', lineHeight: 16, marginBottom: 10 },
  btnSelecionarPdf: { backgroundColor: '#2563eb', padding: 10, borderRadius: 6, alignItems: 'center' },
  txtSelecionarPdf: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  inputBusca: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 14 },
  cardConsulta: { backgroundColor: '#ffffff', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  nomeAlunoConsulta: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  boxEncarregadoCard: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 6, marginTop: 8, marginBottom: 6 },
  txtEncarregadoTitulo: { fontSize: 11, color: '#475569', fontWeight: 'bold' },
  txtEncarregadoNome: { fontSize: 13, color: '#0f172a', fontWeight: '600', marginTop: 2 },
  txtEncarregadoTel: { fontSize: 12, color: '#2563eb', marginTop: 2 },
  detalheCurso: { fontSize: 12, color: '#64748b', marginTop: 2 }
});
