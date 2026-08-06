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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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

// --- MODAL DE LOGIN E REGISTO COM OTP SEGURO ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [etapa, setEtapa] = useState('solicitar');
  const [email, setEmail] = useState('');
  const [codigoOtp, setCodigoOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const enviarCodigo = async () => {
    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo || !emailLimpo.includes('@')) {
      Alert.alert('E-mail Inválido', 'Por favor insira um endereço de e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: emailLimpo,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        console.error('Erro Supabase OTP:', error);
        Alert.alert('Atenção / Erro', error.message || 'Não foi possível enviar o código OTP.');
      } else {
        Alert.alert('Código Enviado 📩', `Verifique o seu e-mail (${emailLimpo}) e introduza o código de 6 dígitos.`);
        setEtapa('validar');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      Alert.alert('Erro no Servidor', err.message || 'Falha ao processar o pedido.');
    } finally {
      setLoading(false);
    }
  };

  const confirmarCodigo = async () => {
    const emailLimpo = email.trim().toLowerCase();
    const tokenLimpo = codigoOtp.trim();

    if (!tokenLimpo || tokenLimpo.length < 6) {
      Alert.alert('Código Incompleto', 'Insira o código de 6 dígitos enviado para o seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailLimpo,
        token: tokenLimpo,
        type: 'email',
      });

      if (error) {
        Alert.alert('Falha na Autenticação', error.message || 'Código incorreto ou expirado.');
      } else {
        Alert.alert('Autenticado 🎉', 'Sessão iniciada com sucesso!');
        onLoginSucesso(data?.user);
        onClose();
        setEtapa('solicitar');
        setCodigoOtp('');
      }
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao verificar código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visivel} animationType="fade" transparent={true}>
      <View style={styles.darkModalOverlay}>
        <View style={styles.darkModalCard}>
          <Text style={styles.darkModalTitle}>Portal Escola 🎓</Text>
          <Text style={styles.darkModalSubtitle}>
            {etapa === 'solicitar' ? 'Autenticação Segura via E-mail' : 'Introduza o Código de Verificação'}
          </Text>

          {etapa === 'solicitar' ? (
            <>
              <TextInput
                style={styles.darkInput}
                placeholder="Seu e-mail de acesso"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TouchableOpacity style={styles.btnEntrarDark} onPress={enviarCodigo} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.txtEntrarDark}>RECEBER CÓDIGO DE ACESSO 📩</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ color: '#38bdf8', textAlign: 'center', marginBottom: 12, fontSize: 13 }}>
                E-mail: {email}
              </Text>
              
              <TextInput
                style={[styles.darkInput, { textAlign: 'center', fontSize: 20, letterSpacing: 4 }]}
                placeholder="123456"
                placeholderTextColor="#9ca3af"
                value={codigoOtp}
                onChangeText={setCodigoOtp}
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity style={styles.btnEntrarDark} onPress={confirmarCodigo} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.txtEntrarDark}>VERIFICAR CÓDIGO E ENTRAR</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnLinkDark} onPress={() => setEtapa('solicitar')}>
                <Text style={styles.txtLinkDark}>Reenviar código ou alterar e-mail</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.btnFecharDark} onPress={onClose}>
            <Text style={styles.txtFecharDark}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- PERFIL ESTILO FACEBOOK ---
function PerfilEstiloFacebook({ dados, tipo, onAtualizarDados, onVoltarHome }) {
  const [modalEditVisivel, setModalEditVisivel] = useState(false);
  const [modalCadAlunoVisivel, setModalCadAlunoVisivel] = useState(false);
  
  const [nome, setNome] = useState(dados.nome || '');
  const [subCampo, setSubCampo] = useState(tipo === 'escola' ? (dados.nif || '') : (dados.disciplina || ''));
  const [telefone, setTelefone] = useState(dados.telefone || '');
  const [loading, setLoading] = useState(false);

  const [nomeAluno, setNomeAluno] = useState('');
  const [biAluno, setBiAluno] = useState('');
  const [nomeEncarregado, setNomeEncarregado] = useState('');
  const [telEncarregado, setTelEncarregado] = useState('');
  const [loadingAluno, setLoadingAluno] = useState(false);

  const salvarEdicao = async () => {
    setLoading(true);
    try {
      let novosDados = { ...dados, nome, telefone };

      if (tipo === 'escola') {
        novosDados.nif = subCampo;
        const { error } = await supabase
          .from('instituicoes')
          .update({ nome, nif: subCampo })
          .eq('email', dados.email);

        if (error) throw error;
      } else {
        novosDados.disciplina = subCampo;
        const { error } = await supabase
          .from('professores')
          .update({ nome_completo: nome, disciplina: subCampo, telefone })
          .eq('email', dados.email);

        if (error) throw error;
      }

      onAtualizarDados(novosDados);
      Alert.alert('Sucesso 🎉', 'Perfil atualizado com sucesso!');
      setModalEditVisivel(false);
    } catch (err) {
      Alert.alert('Erro ao Atualizar', err.message || 'Não foi possível guardar.');
    } finally {
      setLoading(false);
    }
  };

  const cadastrarAlunoNaEscola = async () => {
    if (!nomeAluno.trim() || !biAluno.trim() || !nomeEncarregado.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do aluno, BI e encarregado.');
      return;
    }

    setLoadingAluno(true);
    try {
      const { error } = await supabase.from('estudantes').insert([
        {
          nome_completo: nomeAluno.trim(),
          num_bilhete: biAluno.trim(),
          encarregado_nome: nomeEncarregado.trim(),
          encarregado_telefone: telEncarregado.trim(),
          escola_id: dados.id || null
        }
      ]);

      if (error) throw error;

      Alert.alert('Aluno Registado 🎉', `O aluno ${nomeAluno} foi inscrito com sucesso!`);
      setNomeAluno('');
      setBiAluno('');
      setNomeEncarregado('');
      setTelEncarregado('');
      setModalCadAlunoVisivel(false);
    } catch (err) {
      Alert.alert('Erro ao Registar Aluno', err.message || 'Falha ao guardar os dados do aluno.');
    } finally {
      setLoadingAluno(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.fbCover}>
        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>
          {tipo === 'escola' ? '🏛️ PERFIL INSTITUCIONAL' : '👨‍🏫 PERFIL DOCENTE'}
        </Text>
      </View>

      <View style={styles.fbHeaderCard}>
        <View style={styles.fbAvatar}>
          <Text style={{ fontSize: 32 }}>{tipo === 'escola' ? '🏫' : '👨‍🏫'}</Text>
        </View>
        <Text style={styles.fbName}>{dados.nome}</Text>
        <Text style={styles.fbSub}>{tipo === 'escola' ? `NIF: ${dados.nif}` : `Disciplina: ${dados.disciplina}`}</Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <TouchableOpacity style={styles.btnEditarPerfil} onPress={() => setModalEditVisivel(true)}>
            <Text style={styles.txtEditarPerfil}>✏️ Editar Perfil</Text>
          </TouchableOpacity>

          {tipo === 'escola' && (
            <TouchableOpacity style={styles.btnCadAlunoPerfil} onPress={() => setModalCadAlunoVisivel(true)}>
              <Text style={styles.txtCadAlunoPerfil}>➕ Inscrever Aluno</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.badgePendenteContainer}>
          <Text style={styles.badgePendenteTxt}>⏳ Pendente de Aprovação pelo Administrador</Text>
        </View>
      </View>

      <View style={styles.fbInfoCard}>
        <Text style={styles.fbSectionTitle}>📌 Informações Gerais</Text>
        <Text style={styles.fbInfoRow}>📧 Email: {dados.email}</Text>
        <Text style={styles.fbInfoRow}>📞 Telefone: {dados.telefone || dados.nif}</Text>
        {tipo === 'escola' && (
          <Text style={styles.fbInfoRow}>📜 Documentação Decreto 37/23: Submetida em PDF</Text>
        )}
      </View>

      <View style={styles.fbNoticeCard}>
        <Text style={styles.fbNoticeTitle}>ℹ️ Estado da Conta</Text>
        <Text style={styles.fbNoticeBody}>
          O seu perfil foi registado e está em fase de verificação documental. O administrador irá analisar os ficheiros para validar a ativação pública na plataforma.
        </Text>
      </View>

      <TouchableOpacity style={styles.btnVoltarFb} onPress={onVoltarHome}>
        <Text style={styles.txtVoltarFb}>Voltar ao Menu Principal</Text>
      </TouchableOpacity>

      <Modal visible={modalEditVisivel} animationType="slide" transparent={true}>
        <View style={styles.darkModalOverlay}>
          <View style={styles.darkModalCard}>
            <Text style={styles.darkModalTitle}>Editar Perfil ✏️</Text>
            <Text style={styles.darkModalSubtitle}>Atualize as informações do seu registo</Text>

            <Text style={styles.labelModalEdit}>Nome / Titulação</Text>
            <TextInput style={styles.darkInput} value={nome} onChangeText={setNome} placeholder="Nome" placeholderTextColor="#9ca3af" />

            <Text style={styles.labelModalEdit}>{tipo === 'escola' ? 'NIF' : 'Disciplina'}</Text>
            <TextInput style={styles.darkInput} value={subCampo} onChangeText={setSubCampo} placeholder={tipo === 'escola' ? 'NIF' : 'Disciplina'} placeholderTextColor="#9ca3af" />

            <Text style={styles.labelModalEdit}>Telefone de Contacto</Text>
            <TextInput style={styles.darkInput} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="Telefone" placeholderTextColor="#9ca3af" />

            <TouchableOpacity style={styles.btnEntrarDark} onPress={salvarEdicao} disabled={loading}>
              {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.txtEntrarDark}>GUARDAR ALTERAÇÕES</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnFecharDark} onPress={() => setModalEditVisivel(false)}>
              <Text style={styles.txtFecharDark}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalCadAlunoVisivel} animationType="slide" transparent={true}>
        <View style={styles.darkModalOverlay}>
          <View style={styles.darkModalCard}>
            <Text style={styles.darkModalTitle}>Inscrever Aluno 👨‍🎓</Text>
            <Text style={styles.darkModalSubtitle}>Cadastre o aluno e os dados do encarregado</Text>

            <Text style={styles.labelModalEdit}>Nome Completo do Aluno *</Text>
            <TextInput style={styles.darkInput} value={nomeAluno} onChangeText={setNomeAluno} placeholder="Ex: Manuel António" placeholderTextColor="#9ca3af" />

            <Text style={styles.labelModalEdit}>Nº do Bilhete de Identidade (BI) *</Text>
            <TextInput style={styles.darkInput} value={biAluno} onChangeText={setBiAluno} placeholder="Ex: 009281721LA042" placeholderTextColor="#9ca3af" />

            <Text style={styles.labelModalEdit}>Nome do Encarregado de Educação *</Text>
            <TextInput style={styles.darkInput} value={nomeEncarregado} onChangeText={setNomeEncarregado} placeholder="Ex: João António" placeholderTextColor="#9ca3af" />

            <Text style={styles.labelModalEdit}>Telefone do Encarregado</Text>
            <TextInput style={styles.darkInput} value={telEncarregado} onChangeText={setTelEncarregado} keyboardType="phone-pad" placeholder="Ex: 923112233" placeholderTextColor="#9ca3af" />

            <TouchableOpacity style={styles.btnEntrarDark} onPress={cadastrarAlunoNaEscola} disabled={loadingAluno}>
              {loadingAluno ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.txtEntrarDark}>INSCREVER ALUNO</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnFecharDark} onPress={() => setModalCadAlunoVisivel(false)}>
              <Text style={styles.txtFecharDark}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// --- FORMULÁRIO DE INSTITUIÇÃO ---
function FormCadastramentoInstituicao({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [numeroInst, setNumeroInst] = useState('');
  const [email, setEmail] = useState(usuario?.email || '');
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
      Alert.alert('Erro', 'Não foi possível selecionar o PDF.');
    }
  };

  const handleCadastrar = async () => {
    if (!nome.trim() || !numeroInst.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const dadosCad = {
        nome: nome.trim(),
        nif: numeroInst.trim(),
        email: email.trim(),
        status: 'Pendente',
        sobre: JSON.stringify({
          status_legalizacao: 'Em Análise pelo Admin',
          ficheiro_nome: ficheiroPdf ? ficheiroPdf.name : 'Nenhum PDF'
        })
      };

      const { data, error } = await supabase.from('instituicoes').insert([dadosCad]).select();
      if (error) throw error;

      onConcluir(data && data.length > 0 ? data[0] : dadosCad);
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
        <Text style={styles.formTitle}>Legalização de Instituição</Text>
      </View>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Colégio Futuro do Saber" />

      <Text style={styles.label}>Número / NIF *</Text>
      <TextInput style={styles.input} value={numeroInst} onChangeText={setNumeroInst} placeholder="NIF ou Telefone" />

      <Text style={styles.label}>Email da Instituição *</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="contacto@escola.ao" />

      <View style={styles.cardNotaLegal}>
        <Text style={styles.tituloNotaLegal}>📜 Requisitos do Decreto Presidencial 37/23</Text>
        <Text style={styles.corpoNotaLegal}>
          Anexe a Certidão de Registo, Estatutos e Projeto Pedagógico num único PDF para análise do administrador.
        </Text>

        <TouchableOpacity style={styles.btnSelecionarPdf} onPress={selecionarPdf}>
          <Text style={styles.txtSelecionarPdf}>
            {ficheiroPdf ? `📄 ${ficheiroPdf.name}` : '📎 Anexar Documentação em PDF'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Criar Perfil e Submeter</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- FORMULÁRIO DE PROFESSOR ---
function FormCadastramentoProfessor({ usuario, onConcluir, onCancelar }) {
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
      const dadosProf = {
        nome_completo: nome.trim(),
        disciplina: disciplina.trim(),
        telefone: telefone.trim(),
        num_bilhete: bi.trim(),
        status: 'Pendente',
        email: usuario?.email || ''
      };

      const { data, error } = await supabase.from('professores').insert([dadosProf]).select();
      if (error) throw error;

      onConcluir({
        id: data && data.length > 0 ? data[0].id : null,
        nome: nome.trim(),
        disciplina: disciplina.trim(),
        telefone: telefone.trim(),
        email: usuario?.email || 'Registo Interno'
      });
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
        <Text style={styles.formTitle}>Inscrição de Professor</Text>
      </View>

      <Text style={styles.label}>Nome Completo do Professor *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Prof. António Silva" />

      <Text style={styles.label}>Disciplina / Especialidade *</Text>
      <TextInput style={styles.input} value={disciplina} onChangeText={setDisciplina} placeholder="Ex: Matemática / Física" />

      <Text style={styles.label}>Telefone de Contacto *</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="Ex: 923000000" />

      <Text style={styles.label}>Nº do Bilhete de Identidade (BI)</Text>
      <TextInput style={styles.input} value={bi} onChangeText={setBi} placeholder="Ex: 004928172LA048" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrarProf} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Criar Perfil Docente</Text>}
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
  usuario,
  onNavegarCadastramentoInst, 
  onNavegarPesquisaAlunosEncarregados, 
  onNavegarCadastramentoProf,
  onNavegarQuadroPub, 
  onLogout,
  publicidadeLigar 
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.headerRowHome}>
        <Text style={styles.homeTitleHeader}>Portal Escola</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {usuario && (
            <TouchableOpacity style={styles.btnHeaderLogout} onPress={onLogout}>
              <Text style={styles.txtHeaderLogout}>Sair ({usuario.email.split('@')[0]})</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.btnHeaderPub} onPress={onNavegarQuadroPub}>
            <Text style={styles.txtHeaderPub}>📢 Publicidade</Text>
          </TouchableOpacity>
        </View>
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

        <CarrosselPublicidades publicidadeLigar={publicidadeLigar} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  const [telaAtual, setTelaAtual] = useState('home');
  const [modalLoginVisivel, setModalLoginVisivel] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [dadosPerfilCriado, setDadosPerfilCriado] = useState(null);
  const [tipoPerfil, setTipoPerfil] = useState('escola');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ligarParaSuporte = () => {
    Linking.openURL('tel:929500600');
  };

  const solicitarAutenticacao = (destino) => {
    if (!usuario) {
      setAcaoPendente(destino);
      setModalLoginVisivel(true);
    } else {
      setTelaAtual(destino);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    Alert.alert('Sessão Encerrada', 'Saiu da sua conta com sucesso.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="dark" />

      {telaAtual === 'home' && (
        <MenuPrincipalHome
          usuario={usuario}
          onLogout={handleLogout}
          onNavegarCadastramentoInst={() => solicitarAutenticacao('cadastramento')}
          onNavegarPesquisaAlunosEncarregados={() => setTelaAtual('pesquisa_alunos_encarregados')}
          onNavegarCadastramentoProf={() => solicitarAutenticacao('cadastramento_prof')}
          onNavegarQuadroPub={() => setTelaAtual('quadro_pub')}
          publicidadeLigar={ligarParaSuporte}
        />
      )}

      {telaAtual === 'cadastramento' && (
        <FormCadastramentoInstituicao
          usuario={usuario}
          onConcluir={(dados) => {
            setDadosPerfilCriado(dados);
            setTipoPerfil('escola');
            setTelaAtual('perfil_facebook');
          }}
          onCancelar={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'cadastramento_prof' && (
        <FormCadastramentoProfessor
          usuario={usuario}
          onConcluir={(dados) => {
            setDadosPerfilCriado(dados);
            setTipoPerfil('professor');
            setTelaAtual('perfil_facebook');
          }}
          onCancelar={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'perfil_facebook' && dadosPerfilCriado && (
        <PerfilEstiloFacebook
          dados={dadosPerfilCriado}
          tipo={tipoPerfil}
          onAtualizarDados={(novosDados) => setDadosPerfilCriado(novosDados)}
          onVoltarHome={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'pesquisa_alunos_encarregados' && (
        <TelaPesquisaAlunosEncarregados
          onVoltarHome={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'quadro_pub' && (
        <TelaQuadroPublicidades
          onVoltarHome={() => setTelaAtual('home')}
          publicidadeLigar={ligarParaSuporte}
        />
      )}

      <ModalLogin
        visivel={modalLoginVisivel}
        onClose={() => setModalLoginVisivel(false)}
        onLoginSucesso={(usr) => {
          setUsuario(usr);
          if (acaoPendente) {
            setTelaAtual(acaoPendente);
            setAcaoPendente(null);
          }
        }}
      />
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
  btnHeaderLogout: { backgroundColor: '#fee2e2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  txtHeaderLogout: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
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
  detalheCurso: { fontSize: 12, color: '#64748b', marginTop: 2 },
  darkModalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  darkModalCard: { backgroundColor: '#1e293b', width: '100%', borderRadius: 16, padding: 20, alignItems: 'stretch' },
  darkModalTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  darkModalSubtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  darkInput: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 12, color: '#ffffff', marginBottom: 12 },
  btnEntrarDark: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  txtEntrarDark: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  btnLinkDark: { marginTop: 14, alignItems: 'center' },
  txtLinkDark: { color: '#38bdf8', fontSize: 13 },
  btnFecharDark: { marginTop: 16, alignItems: 'center' },
  txtFecharDark: { color: '#64748b', fontSize: 13 },
  fbCover: { height: 120, backgroundColor: '#1877f2', justifyContent: 'flex-end', padding: 12 },
  fbHeaderCard: { backgroundColor: '#ffffff', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#dddfe2' },
  fbAvatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#e4e6eb', justifyContent: 'center', alignItems: 'center', marginTop: -40, borderWidth: 3, borderColor: '#ffffff' },
  fbName: { fontSize: 20, fontWeight: 'bold', color: '#050505', marginTop: 8 },
  fbSub: { fontSize: 14, color: '#65676b', marginTop: 2 },
  btnEditarPerfil: { backgroundColor: '#e4e6eb', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  txtEditarPerfil: { color: '#050505', fontWeight: 'bold', fontSize: 13 },
  btnCadAlunoPerfil: { backgroundColor: '#16a34a', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  txtCadAlunoPerfil: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  badgePendenteContainer: { marginTop: 10, backgroundColor: '#fef3c7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#fde047' },
  badgePendenteTxt: { color: '#b45309', fontSize: 12, fontWeight: 'bold' },
  fbInfoCard: { backgroundColor: '#ffffff', padding: 16, marginTop: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#dddfe2' },
  fbSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#050505', marginBottom: 8 },
  fbInfoRow: { fontSize: 13, color: '#334155', marginBottom: 6 },
  fbNoticeCard: { backgroundColor: '#eff6ff', padding: 16, margin: 16, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  fbNoticeTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e40af', marginBottom: 4 },
  fbNoticeBody: { fontSize: 12, color: '#1e3a8a', lineHeight: 16 },
  btnVoltarFb: { backgroundColor: '#1877f2', padding: 14, marginHorizontal: 16, marginBottom: 30, borderRadius: 8, alignItems: 'center' },
  txtVoltarFb: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  labelModalEdit: { color: '#94a3b8', fontSize: 12, marginBottom: 4, marginTop: 6 }
});
