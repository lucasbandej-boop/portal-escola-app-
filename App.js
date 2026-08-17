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
          <Text style={styles.telefonePublicidade}>📞 929561442 (Clique para Ligar)</Text>
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

// --- MODAL DE LOGIN E REGISTO ---
function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmeter = async () => {
    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      Alert.alert('Atenção', 'Preencha o e-mail e a palavra-passe.');
      return;
    }

    if (senhaLimpa.length < 6) {
      Alert.alert('Palavra-passe curta', 'A palavra-passe deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (modo === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailLimpo,
          password: senhaLimpa,
        });

        if (error) {
          Alert.alert('Erro de Acesso', error.message || 'Credenciais inválidas.');
        } else if (data?.user) {
          Alert.alert('Sucesso 🎉', 'Sessão iniciada com sucesso!');
          onLoginSucesso(data.user);
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: emailLimpo,
          password: senhaLimpa,
        });

        if (error) {
          Alert.alert('Erro no Registo', error.message || 'Não foi possível criar a conta.');
        } else if (data?.user) {
          if (!data.session) {
            const loginRes = await supabase.auth.signInWithPassword({
              email: emailLimpo,
              password: senhaLimpa,
            });

            if (!loginRes.error && loginRes.data?.user) {
              Alert.alert('Sucesso 🎉', 'Conta criada e sessão iniciada!');
              onLoginSucesso(loginRes.data.user);
              onClose();
              return;
            }
          }
          Alert.alert('Conta Criada 🎉', 'A sua conta foi registada com sucesso!');
          onLoginSucesso(data.user);
          onClose();
        } else {
          Alert.alert('Aviso', 'Registo enviado. Tente fazer login.');
          setModo('login');
        }
      }
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao ligar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visivel} animationType="fade" transparent={true}>
      <View style={styles.darkModalOverlay}>
        <View style={styles.darkModalCard}>
          <Text style={styles.darkModalTitle}>Portal Escola 🎓</Text>
          <Text style={styles.darkModalSubtitle}>Sistema Integrado de Gestão Escolar</Text>

          <TextInput
            style={styles.darkInput}
            placeholder="E-mail de acesso"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.darkInput}
            placeholder="Palavra-passe"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.btnEntrarDark} onPress={handleSubmeter} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.txtEntrarDark}>{modo === 'login' ? 'ENTRAR' : 'REGISTAR E ENTRAR'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnLinkDark}
            onPress={() => setModo(modo === 'login' ? 'registro' : 'login')}
          >
            <Text style={styles.txtLinkDark}>
              {modo === 'login' ? 'Cadastrar Nova Instituição' : 'Já tem conta? Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnFecharDark} onPress={onClose}>
            <Text style={styles.txtFecharDark}>Fechar</Text>
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

  let detalhesExtra = {};
  try {
    detalhesExtra = typeof dados.sobre === 'string' ? JSON.parse(dados.sobre) : (dados.sobre || {});
  } catch (e) {
    detalhesExtra = {};
  }

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
      Alert.alert('Sucesso 🎉', 'Dados do perfil atualizados com sucesso!');
      setModalEditVisivel(false);
    } catch (err) {
      Alert.alert('Erro ao Atualizar', err.message || 'Não foi possível guardar as alterações.');
    } finally {
      setLoading(false);
    }
  };

  const cadastrarAlunoNaEscola = async () => {
    if (!nomeAluno.trim() || !biAluno.trim() || !nomeEncarregado.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do aluno, BI e o nome do encarregado.');
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

      Alert.alert('Aluno Registado 🎉', `O aluno ${nomeAluno} foi inscrito na instituição!`);
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
        <Text style={styles.fbInfoRow}>📞 Contacto: {dados.telefone || dados.nif}</Text>
        {tipo === 'escola' ? (
          <>
            <Text style={styles.fbInfoRow}>👨‍💼 Director: {detalhesExtra.director || 'N/A'}</Text>
            <Text style={styles.fbInfoRow}>👨‍💼 Vice-Director: {detalhesExtra.vice_director || 'N/A'}</Text>
            <Text style={styles.fbInfoRow}>👨‍🏫 Nº Professores: {detalhesExtra.num_professores || '0'}</Text>
            <Text style={styles.fbInfoRow}>👨‍🎓 Nº Estudantes: {detalhesExtra.num_estudantes || '0'}</Text>
            <Text style={styles.fbInfoRow}>📍 Localização: {detalhesExtra.localizacao || 'N/A'}</Text>
          </>
        ) : (
          <Text style={styles.fbInfoRow}>📷 Fotografia: {detalhesExtra.foto_nome || 'Foto Padrão'}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.btnVoltarFb} onPress={onVoltarHome}>
        <Text style={styles.txtVoltarFb}>Voltar ao Menu Principal</Text>
      </TouchableOpacity>

      {/* MODAL EDITAR PERFIL */}
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

      {/* MODAL INSCREVER ALUNO */}
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
  const [nome, setNome] = useState('Melhor saber');
  const [numeroInst, setNumeroInst] = useState('002233445566');
  const [email, setEmail] = useState('josuemizalakevp@gmail.com');
  const [logotipo, setLogotipo] = useState({ name: '1000076977.jpg' });
  const [ficheiroPdf, setFicheiroPdf] = useState({ name: 'Certf Afonso.pdf' });

  const [director, setDirector] = useState('Luís Silva');
  const [viceDirector, setViceDirector] = useState('Maria dembo');
  const [numProfessores, setNumProfessores] = useState('10');
  const [numEstudantes, setNumEstudantes] = useState('25');
  const [classes, setClasses] = useState('Iniciação até 13 classe');
  const [localizacao, setLocalizacao] = useState('Luanda camama');

  const [loading, setLoading] = useState(false);

  const selecionarLogotipo = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setLogotipo(res.assets[0]);
        Alert.alert('Imagem Selecionada', `Fotografia/Logotipo: ${res.assets[0].name}`);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

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

  const submeter = async () => {
    if (!nome.trim() || !numeroInst.trim() || !email.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha o Nome, NIF/Nº de Licença e E-mail.');
      return;
    }

    setLoading(true);
    try {
      const dadosSobre = {
        director: director.trim(),
        vice_director: viceDirector.trim(),
        num_professores: numProfessores.trim(),
        num_estudantes: numEstudantes.trim(),
        classes: classes.trim(),
        localizacao: localizacao.trim(),
        logo_nome: logotipo ? logotipo.name : null,
        pdf_nome: ficheiroPdf ? ficheiroPdf.name : null,
      };

      const payload = {
        nome: nome.trim(),
        nif: numeroInst.trim(),
        email: email.trim().toLowerCase(),
        sobre: JSON.stringify(dadosSobre),
      };

      if (usuario?.id) {
        payload.user_id = usuario.id;
      }

      console.log('Enviando para Supabase:', payload);

      const { data, error } = await supabase
        .from('instituicoes')
        .insert([payload])
        .select();

      if (error) {
        console.error('Erro detalhado Supabase:', error);
        Alert.alert('Erro Supabase', `${error.message}\nCódigo: ${error.code || 'N/A'}`);
        return;
      }

      Alert.alert('Sucesso 🎉', 'Instituição cadastrada e salva com sucesso!');
      onConcluir({
        nome: nome.trim(),
        nif: numeroInst.trim(),
        email: email.trim().toLowerCase(),
        sobre: dadosSobre,
        id: data && data[0] ? data[0].id : null
      });
    } catch (err) {
      console.error('Erro de captura:', err);
      Alert.alert('Erro de Execução', err.message || 'Falha geral ao tentar salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Cadastramento de Instituição 🏫</Text>
      <Text style={styles.formSubtitle}>Registe os dados oficiais da sua escola no portal</Text>

      <Text style={styles.label}>Nome Oficial da Instituição *</Text>
      <TextInput style={styles.input} placeholder="Ex: Colégio Saber e Arte" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>NIF ou Nº de Licença *</Text>
      <TextInput style={styles.input} placeholder="Ex: 5000123490" value={numeroInst} onChangeText={setNumeroInst} />

      <Text style={styles.label}>E-mail Institucional *</Text>
      <TextInput style={styles.input} placeholder="Ex: geral@colegiosaber.ao" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

      <Text style={styles.label}>Nome do Director Geral</Text>
      <TextInput style={styles.input} placeholder="Ex: Dr. António Manuel" value={director} onChangeText={setDirector} />

      <Text style={styles.label}>Nome do Vice-Director Pedagógico</Text>
      <TextInput style={styles.input} placeholder="Ex: Lic. Maria Silva" value={viceDirector} onChangeText={setViceDirector} />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Nº Professores</Text>
          <TextInput style={styles.input} placeholder="Ex: 25" value={numProfessores} onChangeText={setNumProfessores} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Nº Estudantes</Text>
          <TextInput style={styles.input} placeholder="Ex: 450" value={numEstudantes} onChangeText={setNumEstudantes} keyboardType="numeric" />
        </View>
      </View>

      <Text style={styles.label}>Localização / Endereço</Text>
      <TextInput style={styles.input} placeholder="Ex: Luanda, Viana, Bairro Cazenga" value={localizacao} onChangeText={setLocalizacao} />

      <Text style={styles.label}>Classes / Cursos Lecionados</Text>
      <TextInput style={styles.input} placeholder="Ex: Iniciação à 12ª Classe" value={classes} onChangeText={setClasses} />

      <Text style={styles.label}>Logotipo / Imagem da Instituição</Text>
      <TouchableOpacity style={styles.btnAnexo} onPress={selecionarLogotipo}>
        <Text style={styles.txtAnexo}>{logotipo ? `📷 ${logotipo.name}` : '📁 Selecionar Fotografia/Logotipo'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Documento Oficial (PDF)</Text>
      <TouchableOpacity style={styles.btnAnexo} onPress={selecionarPdf}>
        <Text style={styles.txtAnexo}>{ficheiroPdf ? `📄 ${ficheiroPdf.name}` : '📎 Anexar PDF da Licença'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSubmit} onPress={submeter} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSubmitTxt}>CONCLUIR E SALVAR CADASTRAMENTO</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancel} onPress={onCancelar}>
        <Text style={styles.btnCancelTxt}>Cancelar e Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- FORMULÁRIO DE PROFESSOR ---
function FormCadastramentoProfessor({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState(usuario?.email || '');
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const selecionarFoto = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setFoto(res.assets[0]);
        Alert.alert('Foto Selecionada', res.assets[0].name);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const submeter = async () => {
    if (!nome.trim() || !disciplina.trim() || !email.trim()) {
      Alert.alert('Campos Obrigatórios', 'Preencha o Nome, Disciplina e E-mail.');
      return;
    }

    setLoading(true);
    try {
      const dadosSobre = {
        foto_nome: foto ? foto.name : null,
      };

      const { data, error } = await supabase.from('professores').insert([
        {
          nome_completo: nome.trim(),
          disciplina: disciplina.trim(),
          telefone: telefone.trim(),
          email: email.trim().toLowerCase(),
          sobre: JSON.stringify(dadosSobre)
        }
      ]).select();

      if (error) throw error;

      Alert.alert('Sucesso 🎉', 'Docente registado com sucesso!');
      onConcluir({
        nome: nome.trim(),
        disciplina: disciplina.trim(),
        telefone: telefone.trim(),
        email: email.trim().toLowerCase(),
        sobre: dadosSobre,
        id: data && data[0] ? data[0].id : null
      });
    } catch (err) {
      Alert.alert('Erro no Cadastramento', err.message || 'Falha ao guardar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Cadastramento de Professor 👨‍🏫</Text>
      <Text style={styles.formSubtitle}>Registe os seus dados pedagógicos e lectivos</Text>

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} placeholder="Ex: Prof. João Gabriel" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Disciplina / Área de Especialidade *</Text>
      <TextInput style={styles.input} placeholder="Ex: Matemática e Física" value={disciplina} onChangeText={setDisciplina} />

      <Text style={styles.label}>Telefone / WhatsApp</Text>
      <TextInput style={styles.input} placeholder="Ex: 923000111" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

      <Text style={styles.label}>E-mail de Contacto *</Text>
      <TextInput style={styles.input} placeholder="Ex: joao.prof@gmail.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

      <Text style={styles.label}>Fotografia de Perfil</Text>
      <TouchableOpacity style={styles.btnAnexo} onPress={selecionarFoto}>
        <Text style={styles.txtAnexo}>{foto ? `📷 ${foto.name}` : '📁 Selecionar Fotografia'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSubmit} onPress={submeter} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSubmitTxt}>CONCLUIR CADASTRAMENTO</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancel} onPress={onCancelar}>
        <Text style={styles.btnCancelTxt}>Cancelar e Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- PESQUISA DE ALUNOS ---
function PesquisaAlunos({ onVoltar }) {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const pesquisar = async () => {
    if (!busca.trim()) {
      Alert.alert('Atenção', 'Digite o nome ou número do BI do aluno para pesquisar.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estudantes')
        .select('*')
        .or(`nome_completo.ilike.%${busca.trim()}%,num_bilhete.ilike.%${busca.trim()}%`);

      if (error) throw error;
      setResultados(data || []);
      if (data.length === 0) {
        Alert.alert('Sem Resultados', 'Nenhum estudante encontrado com este critério.');
      }
    } catch (err) {
      Alert.alert('Erro na Pesquisa', err.message || 'Falha ao pesquisar registos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Pesquisa de Alunos e Encarregados 🔍</Text>
      <Text style={styles.formSubtitle}>Consulte os dados dos estudantes na base nacional</Text>

      <Text style={styles.label}>Nome do Aluno ou Nº do BI</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Manuel António ou 009281721LA042"
        value={busca}
        onChangeText={setBusca}
      />

      <TouchableOpacity style={styles.btnSubmit} onPress={pesquisar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSubmitTxt}>PESQUISAR AGORA</Text>}
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 20 }}>
        {resultados.map((item) => (
          <View key={item.id} style={styles.itemResultado}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b' }}>👨‍🎓 {item.nome_completo}</Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>BI: {item.num_bilhete}</Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>👨‍👩‍👦 Encarregado: {item.encarregado_nome}</Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>📞 Contacto: {item.encarregado_telefone || 'N/A'}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.btnCancel} onPress={onVoltar}>
        <Text style={styles.btnCancelTxt}>Voltar ao Menu Principal</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- COMPONENTE PRINCIPAL (APP) ---
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [modalLoginVisivel, setModalLoginVisivel] = useState(false);
  const [telaAtiva, setTelaAtiva] = useState('menu');
  const [dadosPerfil, setDadosPerfil] = useState(null);
  const [tipoPerfil, setTipoPerfil] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUsuario(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsuario(session.user);
      } else {
        setUsuario(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const ligarSuporte = () => {
    Linking.openURL('tel:929561442');
  };

  const abrirFormEscola = () => {
    setTelaAtiva('form_escola');
  };

  const abrirFormProfessor = () => {
    setTelaAtiva('form_professor');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {telaAtiva === 'menu' && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Cabeçalho */}
          <View style={styles.headerTop}>
            <Text style={styles.mainTitle}>Portal Escola</Text>
            <TouchableOpacity
              style={styles.btnAuthTop}
              onPress={() => {
                if (usuario) {
                  supabase.auth.signOut();
                  setDadosPerfil(null);
                  Alert.alert('Sessão Terminada', 'A sua conta foi desconectada com sucesso.');
                } else {
                  setModalLoginVisivel(true);
                }
              }}
            >
              <Text style={styles.txtAuthTop}>{usuario ? 'Sair' : 'Entrar'}</Text>
            </TouchableOpacity>
          </View>

          {/* Subtítulo */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>
              Menu Principal do Sistema
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>
              Selecione a opção desejada para navegar:
            </Text>
          </View>

          {/* Opções Principais do Menu */}
          <View style={{ gap: 14, marginBottom: 20 }}>
            <TouchableOpacity style={styles.menuOptionCard} onPress={abrirFormEscola}>
              <Text style={{ fontSize: 28 }}>🏫</Text>
              <Text style={styles.menuOptionTxt}>Cadastramento de Instituições</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuOptionCard} onPress={() => setTelaAtiva('pesquisa_alunos')}>
              <Text style={{ fontSize: 28 }}>🔍</Text>
              <Text style={styles.menuOptionTxt}>Pesquisa de Alunos e Encarregados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuOptionCard} onPress={abrirFormProfessor}>
              <Text style={{ fontSize: 28 }}>👨‍🏫</Text>
              <Text style={styles.menuOptionTxt}>Cadastramento de Professores</Text>
            </TouchableOpacity>
          </View>

          {/* Quadro Rotativo de Publicidades */}
          <CarrosselPublicidades publicidadeLigar={ligarSuporte} />

          {/* QUADRO DE APOIO AO CLIENTE E SUPORTE TÉCNICO */}
          <View style={styles.cardApoio}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <Text style={{ fontSize: 18 }}>🎧</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b' }}>
                Apoio ao Cliente & Suporte
              </Text>
            </View>

            <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 12 }}>
              Dúvidas ou problemas no portal? Fale conosco:
            </Text>

            <TouchableOpacity style={styles.btnApoioLigar} onPress={ligarSuporte}>
              <Text style={styles.txtApoioLigar}>📞 Ligar para o Suporte: 929561442</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {telaAtiva === 'form_escola' && (
        <FormCadastramentoInstituicao
          usuario={usuario}
          onConcluir={(dados) => {
            setDadosPerfil(dados);
            setTipoPerfil('escola');
            setTelaAtiva('perfil');
          }}
          onCancelar={() => setTelaAtiva('menu')}
        />
      )}

      {telaAtiva === 'form_professor' && (
        <FormCadastramentoProfessor
          usuario={usuario}
          onConcluir={(dados) => {
            setDadosPerfil(dados);
            setTipoPerfil('professor');
            setTelaAtiva('perfil');
          }}
          onCancelar={() => setTelaAtiva('menu')}
        />
      )}

      {telaAtiva === 'pesquisa_alunos' && (
        <PesquisaAlunos onVoltar={() => setTelaAtiva('menu')} />
      )}

      {telaAtiva === 'perfil' && dadosPerfil && (
        <PerfilEstiloFacebook
          dados={dadosPerfil}
          tipo={tipoPerfil}
          onAtualizarDados={(novos) => setDadosPerfil(novos)}
          onVoltarHome={() => setTelaAtiva('menu')}
        />
      )}

      {/* Modal de Autenticação */}
      <ModalLogin
        visivel={modalLoginVisivel}
        onClose={() => setModalLoginVisivel(false)}
        onLoginSucesso={(usr) => setUsuario(usr)}
      />
    </SafeAreaView>
  );
}

// --- ESTILOS VISUAIS ---
const styles = StyleSheet.create({
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  btnAuthTop: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  txtAuthTop: {
    color: '#4338ca',
    fontWeight: 'bold',
    fontSize: 13,
  },
  menuOptionCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  menuOptionTxt: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  cardPublicidade: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  badgePatrocinado: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  txtBadgePatrocinado: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tituloPublicidade: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
  },
  corpoPublicidade: {
    fontSize: 12,
    color: '#f8fafc',
    marginTop: 6,
    lineHeight: 18,
  },
  btnLigarPub: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  rodapePublicidade: {
    fontSize: 11,
    color: '#e2e8f0',
    textAlign: 'center',
  },
  telefonePublicidade: {
    fontWeight: 'bold',
    color: '#fbbf24',
    fontSize: 13,
  },
  cardApoio: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 1,
    marginBottom: 20,
  },
  btnApoioLigar: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  txtApoioLigar: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  formContainer: {
    flex: 1,
    padding: 18,
    backgroundColor: '#ffffff',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  btnAnexo: {
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    alignItems: 'center',
  },
  txtAnexo: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },
  btnSubmit: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 22,
  },
  btnSubmitTxt: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnCancel: {
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  btnCancelTxt: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 13,
  },
  itemResultado: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  darkModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  darkModalCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    padding: 22,
    borderRadius: 20,
    elevation: 5,
  },
  darkModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  darkModalSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 18,
  },
  darkInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 12,
  },
  labelModalEdit: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  btnEntrarDark: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  txtEntrarDark: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnLinkDark: {
    alignItems: 'center',
    marginTop: 14,
  },
  txtLinkDark: {
    color: '#60a5fa',
    fontSize: 13,
  },
  btnFecharDark: {
    alignItems: 'center',
    marginTop: 12,
  },
  txtFecharDark: {
    color: '#9ca3af',
    fontSize: 13,
  },
  fbCover: {
    height: 90,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fbHeaderCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  fbAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  fbName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 8,
  },
  fbSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  btnEditarPerfil: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  txtEditarPerfil: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 12,
  },
  btnCadAlunoPerfil: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  txtCadAlunoPerfil: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  badgePendenteContainer: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  badgePendenteTxt: {
    color: '#d97706',
    fontSize: 11,
    fontWeight: '600',
  },
  fbInfoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    elevation: 1,
  },
  fbSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  fbInfoRow: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 8,
  },
  btnVoltarFb: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  txtVoltarFb: {
    color: '#475569',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
