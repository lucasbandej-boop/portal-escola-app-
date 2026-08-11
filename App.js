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
  ActivityIndicator,
  Modal,
  Linking,
  Image
} from 'react-native';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

const LISTA_PUBLICIDADES = [
  {
    id: '1',
    categoria: '📚 Material Escolar',
    titulo: 'Venda de Livros e Materiais',
    descricao: '🇦🇴 Olá Angola, o regresso às aulas já é uma realidade! Temos livros, cadernos, folhas A4, lápis e todo o material escolar com entregas em Luanda.',
    telefone: '929500600'
  },
  {
    id: '2',
    categoria: '💻 Tecnologia Escolar',
    titulo: 'Softwares & Equipamentos',
    descricao: 'Computadores, impressoras e redes para instituições de ensino com assistência técnica garantida e manutenção preventiva.',
    telefone: '929500600'
  },
  {
    id: '3',
    categoria: '👔 Uniformes Escolares',
    titulo: 'Confecção de Batas e Uniformes',
    descricao: 'Uniformes escolares para todos os níveis de ensino com tecidos de alta durabilidade e personalização de logótipos.',
    telefone: '929500600'
  }
];

const buscarCadastroExistente = async (email) => {
  try {
    const resInst = await fetch(
      `${SUPABASE_URL}/rest/v1/instituicoes?email=eq.${encodeURIComponent(email)}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const dadosInst = await resInst.json();
    if (resInst.ok && dadosInst.length > 0) {
      return { tipo: 'escola', dados: dadosInst[0] };
    }

    const resProf = await fetch(
      `${SUPABASE_URL}/rest/v1/professores?email=eq.${encodeURIComponent(email)}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const dadosProf = await resProf.json();
    if (resProf.ok && dadosProf.length > 0) {
      return { tipo: 'professor', dados: dadosProf[0] };
    }
  } catch (err) {
    console.error('Erro ao consultar cadastro:', err);
  }
  return null;
};

function CarrosselPublicidades({ publicidadeLigar, onVerTodas }) {
  return (
    <View style={styles.cardPublicidade}>
      <View style={styles.pubBadgeRow}>
        <Text style={styles.badgeCategoria}>💻 Tecnologia Escolar</Text>
        <TouchableOpacity onPress={onVerTodas}>
          <Text style={styles.contadorPub}>Ver Todas →</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.tituloPublicidade}>Softwares & Equipamentos</Text>
      <Text style={styles.corpoPublicidade}>
        Computadores, impressoras e redes para instituições de ensino com assistência técnica garantida em Luanda.
      </Text>

      <Text style={styles.subCallPub}>Para mais informações ligue no número abaixo:</Text>
      <TouchableOpacity style={styles.btnLigarPub} onPress={publicidadeLigar}>
        <Text style={styles.telefonePublicidade}>📞 929500600 (Clique para Ligar)</Text>
      </TouchableOpacity>
    </View>
  );
}

function TelaTodasPublicidades({ onVoltar, publicidadeLigar }) {
  return (
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onVoltar}>
          <Text style={styles.txtVoltarHeader}>← Voltar ao Menu</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Mural de Publicidades 📢</Text>
      </View>

      <Text style={styles.secaoSubtitulo}>Confira todas as ofertas e serviços patrocinados para a comunidade escolar:</Text>

      {LISTA_PUBLICIDADES.map((pub) => (
        <View key={pub.id} style={styles.cardPublicidadeGeral}>
          <Text style={styles.badgeCategoriaGeral}>{pub.categoria}</Text>
          <Text style={styles.tituloPublicidadeGeral}>{pub.titulo}</Text>
          <Text style={styles.corpoPublicidadeGeral}>{pub.descricao}</Text>

          <TouchableOpacity style={styles.btnLigarPubGeral} onPress={publicidadeLigar}>
            <Text style={styles.telefonePublicidade}>📞 Ligar: {pub.telefone}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

function ModalLogin({ visivel, onClose, onLoginSucesso }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgErro, setMsgErro] = useState('');

  const handleSubmeter = async () => {
    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      setMsgErro('Preencha o e-mail e a palavra-passe.');
      return;
    }

    setLoading(true);
    setMsgErro('');

    try {
      const endpoint = modo === 'login' ? 'token?grant_type=password' : 'signup';
      const response = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailLimpo, password: senhaLimpa })
      });

      const data = await response.json();

      if (!response.ok) {
        setMsgErro(data.error_description || data.msg || 'Erro na autenticação.');
      } else {
        const user = data.user || data;
        const perfilPendente = await buscarCadastroExistente(emailLimpo);
        onLoginSucesso(user, perfilPendente);
        onClose();
      }
    } catch (err) {
      setMsgErro('Erro de rede ao conectar.');
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
            {modo === 'login' ? 'Iniciar Sessão no Sistema' : 'Registar Nova Conta'}
          </Text>

          {msgErro ? <Text style={styles.txtErroModal}>{msgErro}</Text> : null}

          <TextInput
            style={styles.darkInput}
            placeholder="E-mail de acesso"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.darkInput}
            placeholder="Palavra-passe (mínimo 6 caracteres)"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.btnEntrarDark} onPress={handleSubmeter} disabled={loading}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.txtEntrarDark}>{modo === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLinkDark} onPress={() => setModo(modo === 'login' ? 'registro' : 'login')}>
            <Text style={styles.txtLinkDark}>{modo === 'login' ? 'Registar Nova Conta' : 'Já tem conta? Iniciar Sessão'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnFecharDark} onPress={onClose}>
            <Text style={styles.txtFecharDark}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SeccaoAlunos({ escolaId, emailEscola }) {
  const [nome, setNome] = useState('');
  const [numProcesso, setNumProcesso] = useState('');
  const [curso, setCurso] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [numBilhete, setNumBilhete] = useState('');
  const [classe, setClasse] = useState('');
  const [turma, setTurma] = useState('');
  const [nomeEncarregado, setNomeEncarregado] = useState('');
  const [telefoneEncarregado, setTelefoneEncarregado] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [msgStatus, setMsgStatus] = useState('');
  const [idEscolaValido, setIdEscolaValido] = useState(escolaId);

  const selecionarFotoAluno = () => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setFotoUrl(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const obterIdEscola = async () => {
    if (idEscolaValido) return idEscolaValido;
    if (!emailEscola) return null;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/instituicoes?email=eq.${encodeURIComponent(emailEscola)}&select=id`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      const data = await res.json();
      if (res.ok && data.length > 0) {
        setIdEscolaValido(data[0].id);
        return data[0].id;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const carregarAlunos = async () => {
    const targetId = await obterIdEscola();
    if (!targetId) return;

    setCarregandoLista(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/alunos?escola_id=eq.${targetId}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      const data = await res.json();
      if (res.ok) setAlunos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregandoLista(false);
    }
  };

  useEffect(() => {
    carregarAlunos();
  }, [escolaId, emailEscola]);

  const handleCadastrarAluno = async () => {
    if (!nome.trim() || !classe.trim()) {
      setMsgStatus('⚠️ Preencha Nome Completo e Classe/Turma.');
      return;
    }

    const targetId = await obterIdEscola();

    setLoading(true);
    setMsgStatus('');

    const procValor = numProcesso.trim() || `PROC-${Date.now().toString().slice(-4)}`;

    const novoAluno = {
      escola_id: targetId || null,
      nome: nome.trim(),
      nome_completo: nome.trim(),
      numero_processo: procValor,
      curso: curso.trim() || 'Geral',
      data_nascimento: dataNascimento.trim(),
      num_bilhete: numBilhete.trim(),
      classe: classe.trim(),
      turma: turma.trim(),
      nome_encarregado: nomeEncarregado.trim(),
      telefone_encarregado: telefoneEncarregado.trim(),
      foto: fotoUrl || null,
      foto_url: fotoUrl || null
    };

    try {
      let res = await fetch(`${SUPABASE_URL}/rest/v1/alunos`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(novoAluno)
      });

      let resData = await res.json();

      if (!res.ok && resData.message && resData.message.includes('numero_processo')) {
        delete novoAluno.numero_processo;
        novoAluno.num_processo = procValor;

        res = await fetch(`${SUPABASE_URL}/rest/v1/alunos`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(novoAluno)
        });
        resData = await res.json();
      }

      if (res.ok) {
        setMsgStatus('✅ Aluno cadastrado com sucesso!');
        setNome('');
        setNumProcesso('');
        setCurso('');
        setDataNascimento('');
        setNumBilhete('');
        setClasse('');
        setTurma('');
        setNomeEncarregado('');
        setTelefoneEncarregado('');
        setFotoUrl('');
        carregarAlunos();
      } else {
        setMsgStatus(`❌ Erro: ${resData.message || 'Falha ao gravar aluno no banco.'}`);
      }
    } catch (e) {
      setMsgStatus('❌ Erro de ligação de rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <View style={styles.cardFormAluno}>
        <Text style={styles.tituloSecaoAluno}>🎓 Cadastrar Novo Aluno</Text>

        {msgStatus ? <Text style={styles.txtStatusAluno}>{msgStatus}</Text> : null}

        <Text style={styles.label}>Fotografia do Aluno</Text>
        <TouchableOpacity style={styles.btnBlueAction} onPress={selecionarFotoAluno}>
          <Text style={styles.txtBlueAction}>
            {fotoUrl ? '✅ Fotografia Selecionada' : '📷 Carregar Fotografia do Aluno'}
          </Text>
        </TouchableOpacity>

        {fotoUrl ? (
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Image source={{ uri: fotoUrl }} style={{ width: 80, height: 80, borderRadius: 40 }} />
          </View>
        ) : null}

        <Text style={styles.label}>Nome Completo *</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Lucas Gabriel" />

        <Text style={styles.label}>Nº de Processo / Matrícula</Text>
        <TextInput style={styles.input} value={numProcesso} onChangeText={setNumProcesso} placeholder="Ex: 2026/045" />

        <Text style={styles.label}>Curso</Text>
        <TextInput style={styles.input} value={curso} onChangeText={setCurso} placeholder="Ex: Máquinas e Motores / Ensino Geral" />

        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput style={styles.input} value={dataNascimento} onChangeText={setDataNascimento} placeholder="Ex: 12/05/2012" />

        <Text style={styles.label}>Número do Bilhete / Cédula</Text>
        <TextInput style={styles.input} value={numBilhete} onChangeText={setNumBilhete} placeholder="Ex: 009876543LA042" />

        <View style={styles.rowGrid}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.label}>Classe *</Text>
            <TextInput style={styles.input} value={classe} onChangeText={setClasse} placeholder="Ex: 7ª Classe" />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={styles.label}>Turma</Text>
            <TextInput style={styles.input} value={turma} onChangeText={setTurma} placeholder="Ex: Turma A" />
          </View>
        </View>

        <Text style={styles.label}>Nome do Encarregado</Text>
        <TextInput style={styles.input} value={nomeEncarregado} onChangeText={setNomeEncarregado} placeholder="Ex: Manuel Gabriel" />

        <Text style={styles.label}>Telefone do Encarregado</Text>
        <TextInput style={styles.input} value={telefoneEncarregado} onChangeText={setTelefoneEncarregado} keyboardType="phone-pad" placeholder="Ex: 929112233" />

        <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrarAluno} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>+ Cadastrar Aluno</Text>}
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.tituloSecaoAluno}>📋 Alunos Cadastrados ({alunos.length})</Text>
        {carregandoLista ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 10 }} />
        ) : alunos.length === 0 ? (
          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 6, textAlign: 'center' }}>Nenhum aluno cadastrado ainda.</Text>
        ) : (
          alunos.map((item) => (
            <View key={item.id} style={styles.itemAlunoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.foto || item.foto_url ? (
                  <Image source={{ uri: item.foto || item.foto_url }} style={{ width: 45, height: 45, borderRadius: 22.5, marginRight: 10 }} />
                ) : (
                  <Text style={{ fontSize: 24, marginRight: 10 }}>👤</Text>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemAlunoNome}>{item.nome || item.nome_completo}</Text>
                  <Text style={styles.itemAlunoSub}>🔢 Processo: {item.numero_processo || item.num_processo || 'N/A'}</Text>
                </View>
              </View>
              <Text style={[styles.itemAlunoSub, { marginTop: 6 }]}>📚 Curso: {item.curso || 'Geral'}</Text>
              <Text style={styles.itemAlunoSub}>🏫 Classe: {item.classe} {item.turma ? `(${item.turma})` : ''}</Text>
              {item.num_bilhete ? <Text style={styles.itemAlunoSub}>🪪 BI: {item.num_bilhete}</Text> : null}
              {item.nome_encarregado ? <Text style={styles.itemAlunoSub}>👨‍👦 Encarregado: {item.nome_encarregado} ({item.telefone_encarregado || 'S/N'})</Text> : null}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function PerfilEstiloFacebook({ dados, tipo, onVoltarHome }) {
  const [estadoAtual, setEstadoAtual] = useState(dados);
  const [carregando, setCarregando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('geral');

  const checarEstadoDB = async () => {
    if (!estadoAtual?.email) return;
    setCarregando(true);
    const resultado = await buscarCadastroExistente(estadoAtual.email);
    if (resultado && resultado.dados) {
      setEstadoAtual(resultado.dados);
    }
    setCarregando(false);
  };

  const isAprovado =
    estadoAtual.aprovado === true ||
    estadoAtual.estado_aprovacao?.toLowerCase() === 'aprovado';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.fbCover}>
        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>
          🏛️ PERFIL INSTITUCIONAL
        </Text>
      </View>

      <View style={styles.fbHeaderCard}>
        <View style={styles.fbAvatar}>
          <Text style={{ fontSize: 32 }}>🏫</Text>
        </View>
        <Text style={styles.fbName}>{estadoAtual.nome || estadoAtual.nome_completo}</Text>
        <Text style={styles.fbSub}>NIF: {estadoAtual.nif}</Text>

        <View style={[
          styles.badgePendenteContainer,
          { backgroundColor: isAprovado ? '#dcfce7' : '#fef3c7' }
        ]}>
          <Text style={{
            color: isAprovado ? '#15803d' : '#92400e',
            fontSize: 12,
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {isAprovado
              ? '✅ Registo Aprovado e Legalizado!'
              : '⏳ Gravação Confirmada! Pendente de Aprovação'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnVerificarStatus}
          onPress={checarEstadoDB}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: 'bold' }}>
              🔄 Verificar Atualização de Estado
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabItem, abaAtiva === 'geral' && styles.tabItemAtiva]}
          onPress={() => setAbaAtiva('geral')}
        >
          <Text style={[styles.tabTxt, abaAtiva === 'geral' && styles.tabTxtAtiva]}>Geral</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, abaAtiva === 'alunos' && styles.tabItemAtiva]}
          onPress={() => setAbaAtiva('alunos')}
        >
          <Text style={[styles.tabTxt, abaAtiva === 'alunos' && styles.tabTxtAtiva]}>+ Alunos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, abaAtiva === 'pautas' && styles.tabItemAtiva]}
          onPress={() => setAbaAtiva('pautas')}
        >
          <Text style={[styles.tabTxt, abaAtiva === 'pautas' && styles.tabTxtAtiva]}>Pautas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, abaAtiva === 'mural' && styles.tabItemAtiva]}
          onPress={() => setAbaAtiva('mural')}
        >
          <Text style={[styles.tabTxt, abaAtiva === 'mural' && styles.tabTxtAtiva]}>Mural</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {abaAtiva === 'geral' && (
          <View style={styles.fbInfoCard}>
            <Text style={styles.fbSectionTitle}>📌 Informações Gravadas</Text>
            <Text style={styles.fbInfoRow}>📧 Email: {estadoAtual.email}</Text>
            <Text style={styles.fbInfoRow}>📞 Contacto: {estadoAtual.telefone || estadoAtual.nif}</Text>
            <Text style={styles.fbInfoRow}>
              Status no Sistema: {isAprovado ? 'Ativo / Publicado' : 'Aguardando Aprovação'}
            </Text>
          </View>
        )}

        {abaAtiva === 'alunos' && (
          <SeccaoAlunos escolaId={estadoAtual.id} emailEscola={estadoAtual.email} />
        )}

        {abaAtiva === 'pautas' && (
          <View style={styles.fbInfoCard}>
            <Text style={styles.fbSectionTitle}>📊 Gestão de Pautas</Text>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Seção de publicação e consulta de pautas trimestrais.</Text>
          </View>
        )}

        {abaAtiva === 'mural' && (
          <View style={styles.fbInfoCard}>
            <Text style={styles.fbSectionTitle}>📢 Mural de Avisos</Text>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Publicações e convocatórias para encarregados de educação.</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.btnVoltarFb} onPress={onVoltarHome}>
        <Text style={styles.txtVoltarFb}>Voltar ao Menu Principal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FormCadastramentoInstituicao({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState(usuario?.email || '');
  const [director, setDirector] = useState('');
  const [viceDirector, setViceDirector] = useState('');
  const [numProfessores, setNumProfessores] = useState('');
  const [numEstudantes, setNumEstudantes] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [classesLecionadas, setClassesLecionadas] = useState('');
  const [eventosEscolares, setEventosEscolares] = useState('');
  const [pautaInformacoes, setPautaInformacoes] = useState('');
  const [convocatoria, setConvocatoria] = useState('');
  const [alunosDestaque, setAlunosDestaque] = useState('');
  const [guiaAluno, setGuiaAluno] = useState('');
  const [planoEstudo, setPlanoEstudo] = useState('');

  const [nomeFoto, setNomeFoto] = useState('');
  const [nomePdf, setNomePdf] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const selecionarFoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) setNomeFoto(file.name);
    };
    input.click();
  };

  const selecionarPdf = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) setNomePdf(file.name);
    };
    input.click();
  };

  const handleCadastrar = async () => {
    if (!nome.trim() || !nif.trim() || !email.trim()) {
      setErroForm('Preencha os campos obrigatórios (*).');
      return;
    }

    setLoading(true);
    setErroForm('');

    const objetoEnvio = {
      nome: nome.trim(),
      nif: nif.trim(),
      email: email.trim(),
      vice_director: viceDirector.trim(),
      num_professores_estimado: numProfessores.trim(),
      num_estudantes_estimado: numEstudantes.trim(),
      classes_lecionadas: classesLecionadas.trim(),
      eventos_escolares: eventosEscolares.trim(),
      pauta_informacoes: pautaInformacoes.trim(),
      convocatoria: convocatoria.trim(),
      alunos_destaque: alunosDestaque.trim(),
      guia_aluno: guiaAluno.trim(),
      plano_estudo: planoEstudo.trim(),
      estado_aprovacao: 'pendente'
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/instituicoes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(objetoEnvio)
      });

      const resData = await response.json();

      if (!response.ok) {
        setErroForm(resData.message || 'Erro ao gravar na base de dados.');
      } else {
        onConcluir(resData && resData.length > 0 ? resData[0] : objetoEnvio);
      }
    } catch (err) {
      setErroForm('Falha na ligação de rede.');
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

      {erroForm ? <Text style={styles.txtErroForm}>{erroForm}</Text> : null}

      <Text style={styles.label}>Nome da Instituição *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Colégio Futuro do Saber" />

      <Text style={styles.label}>Fotografia / Logotipo da Instituição</Text>
      <TouchableOpacity style={styles.btnBlueAction} onPress={selecionarFoto}>
        <Text style={styles.txtBlueAction}>
          {nomeFoto ? `✅ Foto: ${nomeFoto}` : '📷 Selecionar Foto/Logotipo'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Número / NIF *</Text>
      <TextInput style={styles.input} value={nif} onChangeText={setNif} placeholder="NIF ou Telefone" />

      <Text style={styles.label}>Email da Instituição *</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="lucasbandej@gmail.com" keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Director da Instituição</Text>
      <TextInput style={styles.input} value={director} onChangeText={setDirector} placeholder="Ex: Dr. Manuel dos Santos" />

      <Text style={styles.label}>Vice-Director</Text>
      <TextInput style={styles.input} value={viceDirector} onChangeText={setViceDirector} placeholder="Ex: Prof. Maria António" />

      <View style={styles.rowGrid}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Nº de Professores</Text>
          <TextInput style={styles.input} value={numProfessores} onChangeText={setNumProfessores} placeholder="Ex: 25" keyboardType="numeric" />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>Nº de Estudantes</Text>
          <TextInput style={styles.input} value={numEstudantes} onChangeText={setNumEstudantes} placeholder="Ex: 450" keyboardType="numeric" />
        </View>
      </View>

      <Text style={styles.label}>➡️ Localização</Text>
      <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Luanda, Viana, Bairro Cazenga" />

      <Text style={styles.label}>➡️ Classes Lecionadas</Text>
      <TextInput style={styles.input} value={classesLecionadas} onChangeText={setClassesLecionadas} placeholder="Ex: Iniciação à 12ª Classe" />

      <Text style={styles.label}>➡️ Eventos Escolares</Text>
      <TextInput style={styles.input} value={eventosEscolares} onChangeText={setEventosEscolares} placeholder="Ex: Feira das Ciências, Feira do Livro" />

      <Text style={styles.label}>➡️ Pauta / Informações</Text>
      <TextInput style={styles.input} value={pautaInformacoes} onChangeText={setPautaInformacoes} placeholder="Ex: Pautas do 1º Trimestre Publicadas" />

      <Text style={styles.label}>➡️ Convocatória</Text>
      <TextInput style={styles.input} value={convocatoria} onChangeText={setConvocatoria} placeholder="Ex: Reunião Geral de Encarregados" />

      <Text style={styles.label}>➡️ Alunos em Destaque</Text>
      <TextInput style={styles.input} value={alunosDestaque} onChangeText={setAlunosDestaque} placeholder="Ex: Quadro de Honra da 10ª Classe" />

      <Text style={styles.label}>➡️ Guia do Aluno</Text>
      <TextInput style={styles.input} value={guiaAluno} onChangeText={setGuiaAluno} placeholder="Ex: Regulamento Interno e Horários" />

      <Text style={styles.label}>➡️ Plano de Estudo</Text>
      <TextInput style={styles.input} value={planoEstudo} onChangeText={setPlanoEstudo} placeholder="Ex: Currículo do Ensino Geral" />

      <View style={styles.boxDecreto}>
        <Text style={styles.tituloDecreto}>📜 Requisitos do Decreto Presidencial 37/23</Text>
        <Text style={styles.corpoDecreto}>
          Anexe a Certidão de Registo, Estatutos e Projeto Pedagógico num único PDF para análise do administrador.
        </Text>
        <TouchableOpacity style={styles.btnBlueAction} onPress={selecionarPdf}>
          <Text style={styles.txtBlueAction}>
            {nomePdf ? `✅ PDF: ${nomePdf}` : '📎 Anexar Documentação em PDF'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Gravar Instituição</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function FormCadastramentoProfessor({ usuario, onConcluir, onCancelar }) {
  const [nome, setNome] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bi, setBi] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const handleCadastrarProf = async () => {
    if (!nome.trim() || !disciplina.trim() || !telefone.trim()) {
      setErroForm('Preencha Nome, Disciplina e Telefone.');
      return;
    }

    setLoading(true);
    setErroForm('');

    const objetoEnvio = {
      nome_completo: nome.trim(),
      disciplina: disciplina.trim(),
      telefone: telefone.trim(),
      num_bilhete: bi.trim(),
      email: usuario?.email || 'professor@escola.ao'
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/professores`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(objetoEnvio)
      });

      const resData = await response.json();

      if (!response.ok) {
        setErroForm(resData.message || 'Erro ao gravar na base de dados.');
      } else {
        onConcluir(resData && resData.length > 0 ? resData[0] : objetoEnvio);
      }
    } catch (err) {
      setErroForm('Falha na ligação de rede.');
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
        <Text style={styles.formTitle}>Cadastrar Professor</Text>
      </View>

      {erroForm ? <Text style={styles.txtErroForm}>{erroForm}</Text> : null}

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: João Manuel" />

      <Text style={styles.label}>Disciplina / Especialidade *</Text>
      <TextInput style={styles.input} value={disciplina} onChangeText={setDisciplina} placeholder="Ex: Matemática" />

      <Text style={styles.label}>Telefone *</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="Ex: 929500600" />

      <Text style={styles.label}>Nº Bilhete de Identidade (BI)</Text>
      <TextInput style={styles.input} value={bi} onChangeText={setBi} placeholder="Ex: 000000000LA000" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrarProf} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Gravar Professor</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function TelaPesquisaAlunos({ onCancelar }) {
  const [busca, setBusca] = useState('');

  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onCancelar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Pesquisa de Alunos e Encarregados</Text>
      </View>

      <Text style={styles.label}>Pesquisar por Nome ou BI</Text>
      <TextInput
        style={styles.input}
        value={busca}
        onChangeText={setBusca}
        placeholder="Digite o nome do aluno ou encarregado..."
      />

      <TouchableOpacity style={styles.btnSalvar} onPress={() => {}}>
        <Text style={styles.txtSalvar}>Pesquisar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuPrincipalHome({ usuario, onOpenLogin, onNavegarCadastramentoInst, onNavegarCadastramentoProf, onNavegarPesquisa, onNavegarPublicidades, publicidadeLigar, dadosPerfilExistente, onVerPerfilPendente }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={styles.headerRowHome}>
        <Text style={styles.homeTitleHeader}>Portal Escola</Text>
        <TouchableOpacity style={styles.btnPillPubHeader} onPress={onNavegarPublicidades}>
          <Text style={styles.txtPillPubHeader}>📢 Publicidade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.secaoTitulo}>Menu Principal do Sistema</Text>
        <Text style={styles.secaoSubtitulo}>Selecione a opção desejada para navegar:</Text>

        <TouchableOpacity style={[styles.cardMenu, { backgroundColor: '#2563eb', borderColor: '#1d4ed8' }]} onPress={onOpenLogin}>
          <Text style={styles.cardEmoji}>🔑</Text>
          <Text style={[styles.cardMenuTitulo, { color: '#ffffff' }]}>
            {usuario ? `Sessão Iniciada: ${usuario.email}` : 'Entrar / Iniciar Sessão'}
          </Text>
        </TouchableOpacity>

        {dadosPerfilExistente && (
          <TouchableOpacity style={[styles.cardMenu, { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]} onPress={onVerPerfilPendente}>
            <Text style={styles.cardEmoji}>⏳</Text>
            <Text style={[styles.cardMenuTitulo, { color: '#1d4ed8' }]}>Acompanhar Meu Registo / Estado de Aprovação</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarCadastramentoInst}>
          <Text style={styles.cardEmoji}>🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Instituições</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarPesquisa}>
          <Text style={styles.cardEmoji}>🔍</Text>
          <Text style={styles.cardMenuTitulo}>Pesquisa de Alunos e Encarregados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardMenu} onPress={onNavegarCadastramentoProf}>
          <Text style={styles.cardEmoji}>👨‍🏫</Text>
          <Text style={styles.cardMenuTitulo}>Cadastramento de Professores</Text>
        </TouchableOpacity>

        <CarrosselPublicidades publicidadeLigar={publicidadeLigar} onVerTodas={onNavegarPublicidades} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState('home');
  const [modalLoginVisivel, setModalLoginVisivel] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [dadosPerfilCriado, setDadosPerfilCriado] = useState(null);
  const [tipoPerfil, setTipoPerfil] = useState('escola');

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

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar style="dark" />

      {telaAtual === 'home' && (
        <MenuPrincipalHome
          usuario={usuario}
          onOpenLogin={() => setModalLoginVisivel(true)}
          onNavegarCadastramentoInst={() => solicitarAutenticacao('cadastramento')}
          onNavegarCadastramentoProf={() => solicitarAutenticacao('cadastramento_prof')}
          onNavegarPesquisa={() => setTelaAtual('pesquisa')}
          onNavegarPublicidades={() => setTelaAtual('mural_publicidades')}
          publicidadeLigar={ligarParaSuporte}
          dadosPerfilExistente={dadosPerfilCriado}
          onVerPerfilPendente={() => setTelaAtual('perfil_facebook')}
        />
      )}

      {telaAtual === 'mural_publicidades' && (
        <TelaTodasPublicidades
          onVoltar={() => setTelaAtual('home')}
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

      {telaAtual === 'pesquisa' && (
        <TelaPesquisaAlunos onCancelar={() => setTelaAtual('home')} />
      )}

      {telaAtual === 'perfil_facebook' && dadosPerfilCriado && (
        <PerfilEstiloFacebook
          dados={dadosPerfilCriado}
          tipo={tipoPerfil}
          onVoltarHome={() => setTelaAtual('home')}
        />
      )}

      <ModalLogin
        visivel={modalLoginVisivel}
        onClose={() => setModalLoginVisivel(false)}
        onLoginSucesso={(usr, perfilPendente) => {
          setUsuario(usr);
          if (perfilPendente) {
            setDadosPerfilCriado(perfilPendente.dados);
            setTipoPerfil(perfilPendente.tipo);
            setTelaAtual('perfil_facebook');
          } else if (acaoPendente) {
            setTelaAtual(acaoPendente);
            setAcaoPendente(null);
          } else {
            setTelaAtual('home');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRowHome: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 45, paddingBottom: 15, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  homeTitleHeader: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  btnPillPubHeader: { backgroundColor: '#e0e7ff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  txtPillPubHeader: { color: '#3730a3', fontSize: 13, fontWeight: 'bold' },
  secaoTitulo: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  secaoSubtitulo: { fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 2 },
  cardMenu: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardEmoji: { fontSize: 24, marginBottom: 8 },
  cardMenuTitulo: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cardPublicidade: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginTop: 12 },
  pubBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeCategoria: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  contadorPub: { color: '#fbbf24', fontSize: 12, fontWeight: 'bold' },
  tituloPublicidade: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  corpoPublicidade: { color: '#94a3b8', fontSize: 13, marginTop: 6, lineHeight: 18 },
  subCallPub: { color: '#cbd5e1', fontSize: 12, marginTop: 14 },
  btnLigarPub: { marginTop: 6, backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8, alignItems: 'center' },
  telefonePublicidade: { color: '#fbbf24', fontWeight: 'bold', fontSize: 13 },
  cardPublicidadeGeral: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16 },
  badgeCategoriaGeral: { alignSelf: 'flex-start', backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  tituloPublicidadeGeral: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  corpoPublicidadeGeral: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 18 },
  btnLigarPubGeral: { marginTop: 12, backgroundColor: '#1e293b', padding: 10, borderRadius: 8, alignItems: 'center' },
  formContainer: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  formHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  btnVoltarHeader: { marginRight: 15 },
  txtVoltarHeader: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 14, color: '#0f172a' },
  rowGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  btnBlueAction: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  txtBlueAction: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  boxDecreto: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 10, padding: 14, marginTop: 20 },
  tituloDecreto: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 6 },
  corpoDecreto: { fontSize: 12, color: '#1e40af', marginBottom: 12 },
  btnSalvar: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  txtSalvar: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  txtErroForm: { color: '#dc2626', backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 13 },
  txtErroModal: { color: '#ef4444', backgroundColor: '#450a0a', padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 13, textAlign: 'center' },
  darkModalOverlay: { flex: 1, backgroundColor: 'rgba(11, 19, 36, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  darkModalCard: { backgroundColor: '#1b253b', width: '100%', borderRadius: 16, padding: 24 },
  darkModalTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  darkModalSubtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  darkInput: { backgroundColor: '#243049', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, color: '#ffffff', marginBottom: 12 },
  btnEntrarDark: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  txtEntrarDark: { color: '#ffffff', fontWeight: 'bold' },
  btnLinkDark: { marginTop: 16, alignItems: 'center' },
  txtLinkDark: { color: '#38bdf8', fontSize: 13 },
  btnFecharDark: { marginTop: 16, alignItems: 'center' },
  txtFecharDark: { color: '#64748b', fontSize: 13 },
  fbCover: { height: 90, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  fbHeaderCard: { backgroundColor: '#ffffff', padding: 16, alignItems: 'center', marginHorizontal: 16, marginTop: -20, borderRadius: 12, elevation: 2 },
  fbAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginTop: -35, borderWidth: 3, borderColor: '#ffffff' },
  fbName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 6 },
  fbSub: { fontSize: 13, color: '#64748b' },
  badgePendenteContainer: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  btnVerificarStatus: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#e2e8f0', borderRadius: 8, alignItems: 'center' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 14, marginBottom: 10, borderRadius: 10, padding: 4, elevation: 1 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabItemAtiva: { backgroundColor: '#2563eb' },
  tabTxt: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
  tabTxtAtiva: { color: '#ffffff' },
  fbInfoCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12 },
  fbSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  fbInfoRow: { fontSize: 13, color: '#334155', marginBottom: 6 },
  btnVoltarFb: { backgroundColor: '#334155', padding: 14, marginHorizontal: 16, marginVertical: 20, borderRadius: 8, alignItems: 'center' },
  txtVoltarFb: { color: '#ffffff', fontWeight: 'bold' },
  cardFormAluno: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12 },
  tituloSecaoAluno: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  txtStatusAluno: { fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  itemAlunoCard: { backgroundColor: '#ffffff', padding: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  itemAlunoNome: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  itemAlunoSub: { fontSize: 12, color: '#475569', marginTop: 2 }
});
