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

// --- COMPONENTE DO QUADRO DE PUBLICIDADE ROTATIVO (COM APOIO AO APP) ---
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

      {/* BLOCO DE APOIO AO APLICATIVO */}
      <View style={{ marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => Linking.openURL('tel:952709579')}>
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold' }}>
            🛠️ Apoio ao App: 952709579
          </Text>
        </TouchableOpacity>
      </View>

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

// --- MODAL DE LOGIN ---
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
          Alert.alert('Aviso de Acesso', error.message || 'Credenciais inválidas.');
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
          Alert.alert('Erro no Cadastro', error.message || 'Não foi possível criar a conta.');
        } else if (data?.user) {
          if (!data.session) {
            const resLogin = await supabase.auth.signInWithPassword({
              email: emailLimpo,
              password: senhaLimpa,
            });
            if (!resLogin.error && resLogin.data?.user) {
              Alert.alert('Conta Criada 🎉', 'Conta registada com sucesso!');
              onLoginSucesso(resLogin.data.user);
              onClose();
              return;
            }
          }
          Alert.alert('Conta Criada 🎉', 'A sua conta foi registada com sucesso!');
          onLoginSucesso(data.user);
          onClose();
        } else {
          Alert.alert('Aviso', 'Registo submetido. Tente fazer login.');
          setModo('login');
        }
      }
    } catch (err) {
      Alert.alert('Erro no Servidor', err.message || 'Falha na operação.');
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

// --- PERFIL DA INSTITUIÇÃO ESTILO FACEBOOK (EDITÁVEL) ---
function PerfilEstiloFacebook({ dados, tipo, onAtualizarDados, onVoltarHome }) {
  const [modalEditVisivel, setModalEditVisivel] = useState(false);
  const [modalCadAlunoVisivel, setModalCadAlunoVisivel] = useState(false);
  const [modalCadProfVisivel, setModalCadProfVisivel] = useState(false);
  const [modalPautaVisivel, setModalPautaVisivel] = useState(false);

  const [nome, setNome] = useState(dados.nome || '');
  const [subCampo, setSubCampo] = useState(tipo === 'escola' ? (dados.nif || '') : (dados.disciplina || ''));
  const [telefone, setTelefone] = useState(dados.telefone || '');
  const [fotoPerfilUri, setFotoPerfilUri] = useState(dados.foto_url || null);
  const [loading, setLoading] = useState(false);

  const [nomeAluno, setNomeAluno] = useState('');
  const [biAluno, setBiAluno] = useState('');
  const [nomeEncarregado, setNomeEncarregado] = useState('');
  const [telEncarregado, setTelEncarregado] = useState('');
  const [loadingAluno, setLoadingAluno] = useState(false);

  const [nomeProf, setNomeProf] = useState('');
  const [discProf, setDiscProf] = useState('');
  const [telProf, setTelProf] = useState('');
  const [loadingProf, setLoadingProf] = useState(false);

  const alterarFotoPerfil = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setFotoPerfilUri(res.assets[0].uri);
        Alert.alert('Foto Atualizada 📸', 'Clique em "Editar Perfil" e guarde para confirmar.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível alterar a imagem.');
    }
  };

  const salvarEdicao = async () => {
    setLoading(true);
    try {
      let novosDados = { ...dados, nome, telefone, foto_url: fotoPerfilUri };

      if (tipo === 'escola') {
        novosDados.nif = subCampo;
        const { error } = await supabase
          .from('instituicoes')
          .update({ nome, nif: subCampo, telefone })
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
      Alert.alert('Erro ao Guardar', err.message || 'Falha ao atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const cadastrarAluno = async () => {
    if (!nomeAluno.trim() || !biAluno.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do aluno e o BI.');
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

      Alert.alert('Aluno Criado 🎉', `O aluno ${nomeAluno} foi cadastrado com sucesso!`);
      setNomeAluno('');
      setBiAluno('');
      setNomeEncarregado('');
      setTelEncarregado('');
      setModalCadAlunoVisivel(false);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao cadastrar aluno.');
    } finally {
      setLoadingAluno(false);
    }
  };

  const cadastrarProfessor = async () => {
    if (!nomeProf.trim() || !discProf.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do professor e a disciplina.');
      return;
    }

    setLoadingProf(true);
    try {
      const { error } = await supabase.from('professores').insert([
        {
          nome_completo: nomeProf.trim(),
          disciplina: discProf.trim(),
          telefone: telProf.trim(),
          escola_id: dados.id || null
        }
      ]);

      if (error) throw error;

      Alert.alert('Professor Criado 🎉', `O docente ${nomeProf} foi associado à escola!`);
      setNomeProf('');
      setDiscProf('');
      setTelProf('');
      setModalCadProfVisivel(false);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao cadastrar professor.');
    } finally {
      setLoadingProf(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.fbCover}>
        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>
          {tipo === 'escola' ? '🏛️ PAINEL DA INSTITUIÇÃO' : '👨‍🏫 PERFIL DOCENTE'}
        </Text>
      </View>

      <View style={styles.fbHeaderCard}>
        <TouchableOpacity style={styles.fbAvatar} onPress={alterarFotoPerfil}>
          <Text style={{ fontSize: 32 }}>{fotoPerfilUri ? '📸' : (tipo === 'escola' ? '🏫' : '👨‍🏫')}</Text>
        </TouchableOpacity>
        
        <Text style={styles.fbName}>{dados.nome}</Text>
        <Text style={styles.fbSub}>{tipo === 'escola' ? `NIF: ${dados.nif}` : `Disciplina: ${dados.disciplina}`}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.btnAcaoFb} onPress={() => setModalEditVisivel(true)}>
              <Text style={styles.txtAcaoFb}>✏️ Editar Perfil</Text>
            </TouchableOpacity>

            {tipo === 'escola' && (
              <>
                <TouchableOpacity style={styles.btnAcaoFb} onPress={() => setModalCadAlunoVisivel(true)}>
                  <Text style={styles.txtAcaoFb}>👨‍🎓 + Perfil Aluno</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnAcaoFb} onPress={() => setModalCadProfVisivel(true)}>
                  <Text style={styles.txtAcaoFb}>👨‍🏫 + Perfil Professor</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnAcaoFb} onPress={() => setModalPautaVisivel(true)}>
                  <Text style={styles.txtAcaoFb}>📑 Pautas & Notas</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.badgePendenteContainer}>
          <Text style={styles.badgePendenteTxt}>🟢 Instituição Ativa no Portal</Text>
        </View>
      </View>

      <View style={styles.fbInfoCard}>
        <Text style={styles.fbSectionTitle}>📌 Informações da Instituição</Text>
        <Text style={styles.fbInfoRow}>📧 Email: {dados.email}</Text>
        <Text style={styles.fbInfoRow}>📞 Telefone: {dados.telefone || 'Não informado'}</Text>
        <Text style={styles.fbInfoRow}>📄 Documentação Decreto 37/23: Submetida</Text>
      </View>

      <TouchableOpacity style={styles.btnVoltarFb} onPress={onVoltarHome}>
        <Text style={styles.txtVoltarFb}>Voltar ao Menu Principal</Text>
      </TouchableOpacity>

      <Modal visible={modalEditVisivel} animationType="slide" transparent={true}>
        <View style={styles.darkModalOverlay}>
          <View style={styles.darkModalCard}>
            <Text style={styles.darkModalTitle}>Editar Perfil ✏️</Text>
            
            <Text style={styles.labelModalEdit}>Nome da Instituição</Text>
            <TextInput style={styles.darkInput} value={nome} onChangeText={setNome} />

            <Text style={styles.labelModalEdit}>NIF / Identificação</Text>
            <TextInput style={styles.darkInput} value={subCampo} onChangeText={setSubCampo} />

            <Text style={styles.labelModalEdit}>Telefone de Contacto</Text>
            <TextInput style={styles.darkInput} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

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
            <Text style={styles.darkModalTitle}>Criar Perfil de Estudante 👨‍🎓</Text>
            
            <TextInput style={styles.darkInput} placeholder="Nome Completo do Aluno" placeholderTextColor="#9ca3af" value={nomeAluno} onChangeText={setNomeAluno} />
            <TextInput style={styles.darkInput} placeholder="Nº do Bilhete de Identidade (BI)" placeholderTextColor="#9ca3af" value={biAluno} onChangeText={setBiAluno} />
            <TextInput style={styles.darkInput} placeholder="Nome do Encarregado" placeholderTextColor="#9ca3af" value={nomeEncarregado} onChangeText={setNomeEncarregado} />
            <TextInput style={styles.darkInput} placeholder="Telefone do Encarregado" placeholderTextColor="#9ca3af" keyboardType="phone-pad" value={telEncarregado} onChangeText={setTelEncarregado} />

            <TouchableOpacity style={styles.btnEntrarDark} onPress={cadastrarAluno} disabled={loadingAluno}>
              {loadingAluno ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.txtEntrarDark}>CRIAR ALUNO</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnFecharDark} onPress={() => setModalCadAlunoVisivel(false)}>
              <Text style={styles.txtFecharDark}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalCadProfVisivel} animationType="slide" transparent={true}>
        <View style={styles.darkModalOverlay}>
          <View style={styles.darkModalCard}>
            <Text style={styles.darkModalTitle}>Criar Perfil de Professor 👨‍🏫</Text>

            <TextInput style={styles.darkInput} placeholder="Nome Completo do Docente" placeholderTextColor="#9ca3af" value={nomeProf} onChangeText={setNomeProf} />
            <TextInput style={styles.darkInput} placeholder="Disciplina / Cadeira" placeholderTextColor="#9ca3af" value={discProf} onChangeText={setDiscProf} />
            <TextInput style={styles.darkInput} placeholder="Telefone do Professor" placeholderTextColor="#9ca3af" keyboardType="phone-pad" value={telProf} onChangeText={setTelProf} />

            <TouchableOpacity style={styles.btnEntrarDark} onPress={cadastrarProfessor} disabled={loadingProf}>
              {loadingProf ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.txtEntrarDark}>CRIAR PROFESSOR</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnFecharDark} onPress={() => setModalCadProfVisivel(false)}>
              <Text style={styles.txtFecharDark}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalPautaVisivel} animationType="slide" transparent={true}>
        <View style={styles.darkModalOverlay}>
          <View style={styles.darkModalCard}>
            <Text style={styles.darkModalTitle}>Gestão de Pautas 📑</Text>
            <Text style={{ color: '#d1d5db', textAlign: 'center', marginVertical: 15 }}>
              Módulo de Gestão e Publicação de Pautas Trimestrais dos Alunos.
            </Text>

            <TouchableOpacity style={styles.btnEntrarDark} onPress={() => {
              Alert.alert('Pautas', 'Funcionalidade de Pautas Ativada!');
              setModalPautaVisivel(false);
            }}>
              <Text style={styles.txtEntrarDark}>CARREGAR NOVA PAUTA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnFecharDark} onPress={() => setModalPautaVisivel(false)}>
              <Text style={styles.txtFecharDark}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// --- FORMULÁRIO DE INSTITUIÇÃO (COM UPLOAD DE FOTO DE PERFIL) ---
function FormCadastramentoInstituicao({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [numeroInst, setNumeroInst] = useState('');
  const [email, setEmail] = useState(usuario?.email || '');
  const [telefone, setTelefone] = useState('');
  const [ficheiroPdf, setFicheiroPdf] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [loading, setLoading] = useState(false);

  const selecionarPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setFicheiroPdf(res.assets[0]);
        Alert.alert('Documento Anexado 📄', `Selecionado: ${res.assets[0].name}`);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar o ficheiro PDF.');
    }
  };

  const selecionarFotoPerfil = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setFotoPerfil(res.assets[0]);
        Alert.alert('Foto Selecionada 📸', `Imagem: ${res.assets[0].name}`);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem de perfil.');
    }
  };

  const handleCadastrar = async () => {
    if (!nome.trim() || !numeroInst.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha o nome da instituição, NIF e e-mail.');
      return;
    }

    setLoading(true);
    try {
      const dadosCad = {
        nome: nome.trim(),
        nif: numeroInst.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        status: 'Pendente',
        sobre: JSON.stringify({
          status_legalizacao: 'Em Análise pelo Admin',
          ficheiro_nome: ficheiroPdf ? ficheiroPdf.name : 'Nenhum PDF',
          foto_url: fotoPerfil ? fotoPerfil.uri : null
        })
      };

      const { data, error } = await supabase.from('instituicoes').insert([dadosCad]).select();
      if (error) throw error;

      Alert.alert('Sucesso 🎉', 'Instituição cadastrada com sucesso! Perfil gerado.');
      onConcluir(data && data.length > 0 ? data[0] : dadosCad);
    } catch (err) {
      Alert.alert('Erro ao Guardar', err.message || 'Falha ao registar a instituição.');
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
        <Text style={styles.formTitle}>Registo de Instituição</Text>
      </View>

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Colégio Futuro do Saber"
      />

      <Text style={styles.label}>Número / NIF *</Text>
      <TextInput
        style={styles.input}
        value={numeroInst}
        onChangeText={setNumeroInst}
        placeholder="NIF da Instituição"
      />

      <Text style={styles.label}>Email da Instituição *</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="contacto@escola.ao"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Telefone de Contacto</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="Ex: 923000000"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Logótipo / Foto do Perfil</Text>
      <TouchableOpacity style={styles.btnAnexoImg} onPress={selecionarFotoPerfil}>
        <Text style={styles.txtAnexoImg}>
          {fotoPerfil ? `📷 Foto: ${fotoPerfil.name}` : '📸 Carregar Logótipo / Imagem'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Documentação Decreto 37/23 (PDF)</Text>
      <TouchableOpacity style={styles.btnAnexoPdf} onPress={selecionarPdf}>
        <Text style={styles.txtAnexoPdf}>
          {ficheiroPdf ? `📄 PDF: ${ficheiroPdf.name}` : '📎 Anexar Documento PDF'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSubmeter} onPress={handleCadastrar} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.txtSubmeter}>CRIAR PERFIL DA INSTITUIÇÃO</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- COMPONENTE PRINCIPAL APP ---
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [modalLoginVisivel, setModalLoginVisivel] = useState(false);
  const [telaAtual, setTelaAtual] = useState('home'); // 'home', 'form_escola', 'perfil_escola'
  const [dadosPerfil, setDadosPerfil] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const ligarSuporte = () => {
    Linking.openURL('tel:929500600');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* TELA PRINCIPAL (HOME) */}
      {telaAtual === 'home' && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.topNavbar}>
            <View>
              <Text style={styles.appLogoText}>Portal Escola 🎓</Text>
              <Text style={styles.appSubLogoText}>Sistema Integrado de Gestão</Text>
            </View>

            {usuario ? (
              <TouchableOpacity
                style={styles.userBadgeBtn}
                onPress={() => {
                  if (dadosPerfil) setTelaAtual('perfil_escola');
                  else Alert.alert('Perfil', `Sessão ativa: ${usuario.email}`);
                }}
              >
                <Text style={styles.userBadgeTxt}>👤 {usuario.email.split('@')[0]}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnLoginNav} onPress={() => setModalLoginVisivel(true)}>
                <Text style={styles.txtLoginNav}>Entrar 🔑</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* PUBLICIDADE ROTATIVA */}
          <CarrosselPublicidades publicidadeLigar={ligarSuporte} />

          {/* BOTÕES DO MENU */}
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={styles.btnMenuCard}
              onPress={() => setTelaAtual('form_escola')}
            >
              <Text style={{ fontSize: 24 }}>🏛️</Text>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.txtMenuCardTitle}>Inscrição de Instituição</Text>
                <Text style={styles.txtMenuCardSub}>Cadastrar escola e criar perfil público</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* TELA FORMULÁRIO */}
      {telaAtual === 'form_escola' && (
        <FormCadastramentoInstituicao
          usuario={usuario}
          onConcluir={(dados) => {
            setDadosPerfil(dados);
            setTelaAtual('perfil_escola');
          }}
          onCancelar={() => setTelaAtual('home')}
        />
      )}

      {/* TELA PERFIL ESTILO FACEBOOK */}
      {telaAtual === 'perfil_escola' && dadosPerfil && (
        <PerfilEstiloFacebook
          dados={dadosPerfil}
          tipo="escola"
          onAtualizarDados={(novosDados) => setDadosPerfil(novosDados)}
          onVoltarHome={() => setTelaAtual('home')}
        />
      )}

      <ModalLogin
        visivel={modalLoginVisivel}
        onClose={() => setModalLoginVisivel(false)}
        onLoginSucesso={(user) => setUsuario(user)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  appLogoText: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  appSubLogoText: { fontSize: 11, color: '#64748b' },
  btnLoginNav: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  txtLoginNav: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  userBadgeBtn: { backgroundColor: '#e0e7ff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  userBadgeTxt: { color: '#4338ca', fontWeight: '600', fontSize: 12 },
  cardPublicidade: { padding: 16, borderRadius: 12, marginBottom: 10 },
  badgePatrocinado: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  txtBadgePatrocinado: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  tituloPublicidade: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  corpoPublicidade: { color: '#f3f4f6', fontSize: 13, marginTop: 6, lineHeight: 18 },
  btnLigarPub: { marginTop: 12, backgroundColor: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 },
  rodapePublicidade: { color: '#ffffff', fontSize: 11, textAlign: 'center' },
  telefonePublicidade: { fontWeight: 'bold', color: '#fbbf24' },
  btnMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
    elevation: 2,
  },
  txtMenuCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  txtMenuCardSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  formContainer: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  btnVoltarHeader: { paddingRight: 15 },
  txtVoltarHeader: { color: '#2563eb', fontWeight: 'bold', fontSize: 14 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 14, backgroundColor: '#f9fafb' },
  btnAnexoImg: { backgroundColor: '#e0e7ff', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 8, borderWidth: 1, borderColor: '#6366f1' },
  txtAnexoImg: { color: '#4338ca', fontWeight: 'bold' },
  btnAnexoPdf: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 8, borderWidth: 1, borderColor: '#d1d5db' },
  txtAnexoPdf: { color: '#374151', fontWeight: '600' },
  btnSubmeter: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  txtSubmeter: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  fbCover: { height: 100, backgroundColor: '#1e3a8a', justifyContent: 'center', alignItems: 'center' },
  fbHeaderCard: { backgroundColor: '#ffffff', padding: 16, alignItems: 'center', marginTop: -30, marginHorizontal: 16, borderRadius: 12, elevation: 3 },
  fbAvatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ffffff' },
  fbName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 8 },
  fbSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  btnAcaoFb: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 6 },
  txtAcaoFb: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  badgePendenteContainer: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 12 },
  badgePendenteTxt: { color: '#15803d', fontSize: 11, fontWeight: 'bold' },
  fbInfoCard: { backgroundColor: '#ffffff', margin: 16, padding: 16, borderRadius: 12, elevation: 1 },
  fbSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  fbInfoRow: { fontSize: 13, color: '#475569', marginBottom: 6 },
  btnVoltarFb: { backgroundColor: '#e2e8f0', padding: 12, borderRadius: 8, marginHorizontal: 16, marginBottom: 30, alignItems: 'center' },
  txtVoltarFb: { color: '#334155', fontWeight: 'bold' },
  darkModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  darkModalCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12 },
  darkModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  darkModalSubtitle: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 15 },
  darkInput: { backgroundColor: '#334155', color: '#ffffff', borderRadius: 8, padding: 12, marginBottom: 10 },
  btnEntrarDark: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  txtEntrarDark: { color: '#ffffff', fontWeight: 'bold' },
  btnLinkDark: { marginTop: 12, alignItems: 'center' },
  txtLinkDark: { color: '#60a5fa', fontSize: 12 },
  btnFecharDark: { marginTop: 10, padding: 10, alignItems: 'center' },
  txtFecharDark: { color: '#9ca3af', fontSize: 12 },
  labelModalEdit: { color: '#d1d5db', fontSize: 12, marginBottom: 4 }
});
