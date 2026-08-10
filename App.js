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
  Linking
} from 'react-native';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGxueXlva3R4amRlbXl4dHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMjI5OTMsImV4cCI6MjEwMDc5ODk5M30.qZlRZwiLRK7gWWiaCBG89-kk6FGxERrOynbqTcWRVzM';

// Email do Administrador
const EMAIL_ADMIN = 'lucasbandej@gmail.com';

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
    if (resInst.ok && Array.isArray(dadosInst) && dadosInst.length > 0) {
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
    if (resProf.ok && Array.isArray(dadosProf) && dadosProf.length > 0) {
      return { tipo: 'professor', dados: dadosProf[0] };
    }
  } catch (err) {
    console.error('Erro ao consultar cadastro:', err);
  }
  return null;
};

const buscarPendentes = async () => {
  try {
    const resInst = await fetch(
      `${SUPABASE_URL}/rest/v1/instituicoes?estado_aprovacao=eq.pendente&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    const instituicoes = await resInst.json();

    const resProf = await fetch(
      `${SUPABASE_URL}/rest/v1/professores?estado_aprovacao=eq.pendente&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    const professores = await resProf.json();

    return {
      instituicoes: Array.isArray(instituicoes) ? instituicoes : [],
      professores: Array.isArray(professores) ? professores : []
    };
  } catch (err) {
    console.error('Erro ao buscar pendentes:', err);
    return { instituicoes: [], professores: [] };
  }
};

const aprovarRegisto = async (tabela, id) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ estado_aprovacao: 'aprovado', status: 'Aprovado' })
    });
    return response.ok;
  } catch (err) {
    console.error('Erro ao aprovar:', err);
    return false;
  }
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

function PerfilEstiloFacebook({ dados, tipo, onVoltarHome }) {
  const [estadoAtual, setEstadoAtual] = useState(dados);
  const [carregando, setCarregando] = useState(false);

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
    estadoAtual.estado_aprovacao?.toLowerCase() === 'aprovado' ||
    estadoAtual.status?.toLowerCase() === 'aprovado';

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
        <Text style={styles.fbName}>{estadoAtual.nome || estadoAtual.nome_completo}</Text>
        <Text style={styles.fbSub}>{tipo === 'escola' ? `NIF: ${estadoAtual.nif}` : `Disciplina: ${estadoAtual.disciplina}`}</Text>

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

      <View style={styles.fbInfoCard}>
        <Text style={styles.fbSectionTitle}>📌 Informações Gravadas</Text>
        <Text style={styles.fbInfoRow}>📧 Email: {estadoAtual.email}</Text>
        <Text style={styles.fbInfoRow}>📞 Contacto: {estadoAtual.telefone || estadoAtual.nif}</Text>
        <Text style={styles.fbInfoRow}>
          Status no Sistema: {isAprovado ? 'Ativo / Publicado' : 'Aguardando Aprovação'}
        </Text>
      </View>

      <TouchableOpacity style={styles.btnVoltarFb} onPress={onVoltarHome}>
        <Text style={styles.txtVoltarFb}>Voltar ao Menu Principal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function TelaPainelAdmin({ onVoltar }) {
  const [pendentes, setPendentes] = useState({ instituicoes: [], professores: [] });
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    const dados = await buscarPendentes();
    setPendentes(dados);
    setCarregando(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAprovar = async (tabela, id, nome) => {
    const ok = await aprovarRegisto(tabela, id);
    if (ok) {
      alert(`✅ ${nome} foi aprovado com sucesso!`);
      carregarDados();
    } else {
      alert('❌ Erro ao aprovar o registo.');
    }
  };

  return (
    <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.btnVoltarHeader} onPress={onVoltar}>
          <Text style={styles.txtVoltarHeader}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Painel de Gestão Admin ⚙️</Text>
      </View>

      {carregando ? (
        <ActivityIndicator color="#38bdf8" size="large" style={{ marginTop: 20 }} />
      ) : (
        <>
          <Text style={styles.secaoSubtitulo}>Instituições Pendentes ({pendentes.instituicoes.length})</Text>
          {pendentes.instituicoes.length === 0 ? (
            <Text style={{ color: '#94a3b8', marginBottom: 16 }}>Nenhuma instituição aguardando aprovação.</Text>
          ) : (
            pendentes.instituicoes.map((inst) => (
              <View key={inst.id} style={styles.cardPublicidadeGeral}>
                <Text style={styles.tituloPublicidadeGeral}>{inst.nome}</Text>
                <Text style={{ color: '#cbd5e1', fontSize: 12 }}>NIF: {inst.nif}</Text>
                <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Email: {inst.email}</Text>

                <TouchableOpacity
                  style={[styles.btnSalvar, { marginTop: 10, padding: 10 }]}
                  onPress={() => handleAprovar('instituicoes', inst.id, inst.nome)}
                >
                  <Text style={styles.txtSalvar}>Aprovar Instituição ✅</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <Text style={[styles.secaoSubtitulo, { marginTop: 20 }]}>Professores Pendentes ({pendentes.professores.length})</Text>
          {pendentes.professores.length === 0 ? (
            <Text style={{ color: '#94a3b8' }}>Nenhum professor aguardando aprovação.</Text>
          ) : (
            pendentes.professores.map((prof) => (
              <View key={prof.id} style={styles.cardPublicidadeGeral}>
                <Text style={styles.tituloPublicidadeGeral}>{prof.nome_completo || prof.nome}</Text>
                <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Disciplina: {prof.disciplina}</Text>
                <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Contacto: {prof.telefone}</Text>

                <TouchableOpacity
                  style={[styles.btnSalvar, { marginTop: 10, padding: 10 }]}
                  onPress={() => handleAprovar('professores', prof.id, prof.nome_completo || prof.nome)}
                >
                  <Text style={styles.txtSalvar}>Aprovar Professor ✅</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </>
      )}
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
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) setNomeFoto(file.name);
      };
      input.click();
    }
  };

  const selecionarPdf = () => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) setNomePdf(file.name);
      };
      input.click();
    }
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
      setErroForm('Preencha os campos obrigatórios (*).');
      return;
    }

    setLoading(true);
    setErroForm('');

    const objetoEnvio = {
      nome_completo: nome.trim(),
      disciplina: disciplina.trim(),
      telefone: telefone.trim(),
      bi: bi.trim(),
      email: usuario?.email || '',
      estado_aprovacao: 'pendente'
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
        setErroForm(resData.message || 'Erro ao guardar dados do professor.');
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
        <Text style={styles.formTitle}>Cadastramento de Professor</Text>
      </View>

      {erroForm ? <Text style={styles.txtErroForm}>{erroForm}</Text> : null}

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Professor António Manuel" />

      <Text style={styles.label}>Disciplina Principal *</Text>
      <TextInput style={styles.input} value={disciplina} onChangeText={setDisciplina} placeholder="Ex: Matemática / Física" />

      <Text style={styles.label}>Telefone / WhatsApp *</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="Ex: 923112233" />

      <Text style={styles.label}>Nº do Bilhete de Identidade (BI)</Text>
      <TextInput style={styles.input} value={bi} onChangeText={setBi} placeholder="Ex: 009281721LA042" />

      <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrarProf} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txtSalvar}>Gravar Professor</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState('home'); 
  const [modalLoginVisivel, setModalLoginVisivel] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [dadosPerfil, setDadosPerfil] = useState(null);
  const [tipoPerfil, setTipoPerfil] = useState('');
  const [termoPesquisa, setTermoPesquisa] = useState('');

  const ligarParaPublicidade = () => {
    Linking.openURL('tel:929500600');
  };

  const handleLoginSucesso = (user, perfilPendente) => {
    setUsuarioLogado(user);
    if (perfilPendente) {
      setDadosPerfil(perfilPendente.dados);
      setTipoPerfil(perfilPendente.tipo);
      setTelaAtual('perfil');
    }
  };

  const handleConcluirCadastro = (dados, tipo) => {
    setDadosPerfil(dados);
    setTipoPerfil(tipo);
    setTelaAtual('perfil');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      {telaAtual === 'home' && (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.headerHome}>
            <Text style={styles.logoTitle}>Portal Escola 🎓</Text>

            {usuarioLogado ? (
              <TouchableOpacity
                style={styles.btnUserStatus}
                onPress={() => setTelaAtual('perfil')}
              >
                <Text style={styles.txtUserStatus}>
                  👤 {usuarioLogado.email ? usuarioLogado.email.split('@')[0] : 'Minha Conta'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.btnLoginHeader}
                onPress={() => setModalLoginVisivel(true)}
              >
                <Text style={styles.txtLoginHeader}>Entrar / Registo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* O MENU E A PESQUISA FICAM EM CIMA */}
          <View style={styles.menuGrid}>
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.inputSearch}
                placeholder="🔍 Pesquisar escolas, cursos, professores..."
                placeholderTextColor="#94a3b8"
                value={termoPesquisa}
                onChangeText={setTermoPesquisa}
              />
            </View>

            {usuarioLogado?.email === EMAIL_ADMIN && (
              <TouchableOpacity
                style={[styles.menuCard, { borderColor: '#eab308', borderWidth: 2 }]}
                onPress={() => setTelaAtual('admin')}
              >
                <Text style={styles.menuEmoji}>⚙️</Text>
                <Text style={styles.menuTitle}>Painel de Administração Admin</Text>
                <Text style={styles.menuSub}>Gerenciar e aprovar cadastramentos pendentes</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => {
                if (!usuarioLogado) setModalLoginVisivel(true);
                else setTelaAtual('cad_escola');
              }}
            >
              <Text style={styles.menuEmoji}>🏫</Text>
              <Text style={styles.menuTitle}>Legalização de Instituição</Text>
              <Text style={styles.menuSub}>Registe a sua escola e cumpra com o Decreto 37/23</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => {
                if (!usuarioLogado) setModalLoginVisivel(true);
                else setTelaAtual('cad_prof');
              }}
            >
              <Text style={styles.menuEmoji}>👨‍🏫</Text>
              <Text style={styles.menuTitle}>Registo de Professor</Text>
              <Text style={styles.menuSub}>Cadastre o seu perfil docente e disciplinas</Text>
            </TouchableOpacity>
          </View>

          {/* O PAINEL DE PUBLICIDADE FICA EMBAIXO */}
          <CarrosselPublicidades
            publicidadeLigar={ligarParaPublicidade}
            onVerTodas={() => setTelaAtual('todas_pubs')}
          />
        </ScrollView>
      )}

      {telaAtual === 'todas_pubs' && (
        <TelaTodasPublicidades
          onVoltar={() => setTelaAtual('home')}
          publicidadeLigar={ligarParaPublicidade}
        />
      )}

      {telaAtual === 'admin' && (
        <TelaPainelAdmin
          onVoltar={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'cad_escola' && (
        <FormCadastramentoInstituicao
          usuario={usuarioLogado}
          onConcluir={(dados) => handleConcluirCadastro(dados, 'escola')}
          onCancelar={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'cad_prof' && (
        <FormCadastramentoProfessor
          usuario={usuarioLogado}
          onConcluir={(dados) => handleConcluirCadastro(dados, 'professor')}
          onCancelar={() => setTelaAtual('home')}
        />
      )}

      {telaAtual === 'perfil' && dadosPerfil && (
        <PerfilEstiloFacebook
          dados={dadosPerfil}
          tipo={tipoPerfil}
          onVoltarHome={() => setTelaAtual('home')}
        />
      )}

      <ModalLogin
        visivel={modalLoginVisivel}
        onClose={() => setModalLoginVisivel(false)}
        onLoginSucesso={handleLoginSucesso}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  headerHome: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1e293b' },
  logoTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  btnLoginHeader: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  txtLoginHeader: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  btnUserStatus: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  txtUserStatus: { color: '#38bdf8', fontSize: 12, fontWeight: '600' },
  searchBarContainer: { marginBottom: 12 },
  inputSearch: { backgroundColor: '#1e293b', color: '#ffffff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 14 },
  cardPublicidade: { backgroundColor: '#1e293b', margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginTop: 16 },
  pubBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  badgeCategoria: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold' },
  contadorPub: { color: '#94a3b8', fontSize: 12 },
  tituloPublicidade: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  corpoPublicidade: { color: '#cbd5e1', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  subCallPub: { color: '#94a3b8', fontSize: 11, marginBottom: 4 },
  btnLigarPub: { backgroundColor: '#16a34a', padding: 10, borderRadius: 8, alignItems: 'center' },
  telefonePublicidade: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  menuGrid: { paddingHorizontal: 16, gap: 12, marginTop: 12 },
  menuCard: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  menuEmoji: { fontSize: 28, marginBottom: 8 },
  menuTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  menuSub: { color: '#94a3b8', fontSize: 12 },
  formContainer: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  btnVoltarHeader: { backgroundColor: '#334155', padding: 8, borderRadius: 6 },
  txtVoltarHeader: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  formTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  label: { color: '#cbd5e1', fontSize: 13, marginTop: 12, marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: '#1e293b', color: '#ffffff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 14 },
  rowGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  boxDecreto: { backgroundColor: '#1e293b', padding: 14, borderRadius: 8, marginTop: 16, borderWidth: 1, borderColor: '#334155' },
  tituloDecreto: { color: '#38bdf8', fontWeight: 'bold', fontSize: 13, marginBottom: 6 },
  corpoDecreto: { color: '#94a3b8', fontSize: 12, marginBottom: 10 },
  btnBlueAction: { backgroundColor: '#2563eb', padding: 10, borderRadius: 6, alignItems: 'center' },
  txtBlueAction: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  btnSalvar: { backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  txtSalvar: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  txtErroForm: { color: '#ef4444', backgroundColor: '#450a0a', padding: 10, borderRadius: 6, marginBottom: 10 },
  darkModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  darkModalCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  darkModalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  darkModalSubtitle: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 16 },
  darkInput: { backgroundColor: '#0f172a', color: '#ffffff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  btnEntrarDark: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  txtEntrarDark: { color: '#ffffff', fontWeight: 'bold' },
  btnLinkDark: { padding: 10, alignItems: 'center' },
  txtLinkDark: { color: '#38bdf8', fontSize: 12 },
  btnFecharDark: { padding: 8, alignItems: 'center' },
  txtFecharDark: { color: '#94a3b8', fontSize: 12 },
  txtErroModal: { color: '#ef4444', fontSize: 12, textAlign: 'center', marginBottom: 10 },
  fbCover: { height: 60, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  fbHeaderCard: { backgroundColor: '#ffffff', padding: 16, alignItems: 'center', marginBottom: 12 },
  fbAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginTop: -32 },
  fbName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 8 },
  fbSub: { fontSize: 13, color: '#64748b' },
  badgePendenteContainer: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  btnVerificarStatus: { marginTop: 12, backgroundColor: '#e2e8f0', padding: 10, borderRadius: 8, width: '100%', alignItems: 'center' },
  fbInfoCard: { backgroundColor: '#ffffff', padding: 16, marginHorizontal: 12, borderRadius: 8, marginBottom: 12 },
  fbSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  fbInfoRow: { fontSize: 13, color: '#334155', marginBottom: 6 },
  btnVoltarFb: { backgroundColor: '#334155', marginHorizontal: 12, padding: 12, borderRadius: 8, alignItems: 'center' },
  txtVoltarFb: { color: '#ffffff', fontWeight: 'bold' },
  cardPublicidadeGeral: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  badgeCategoriaGeral: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  tituloPublicidadeGeral: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  corpoPublicidadeGeral: { color: '#cbd5e1', fontSize: 13, marginBottom: 10 },
  btnLigarPubGeral: { backgroundColor: '#16a34a', padding: 8, borderRadius: 6, alignItems: 'center' },
  secaoSubtitulo: { color: '#94a3b8', fontSize: 13, marginBottom: 16 }
});
