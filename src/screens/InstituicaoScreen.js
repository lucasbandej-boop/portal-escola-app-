import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import api from '../services/api';

export default function InstituicaoScreen() {
  // Estados de Navegação Interna da Escola
  const [etapa, setEtapa] = useState('login'); // 'login', 'painel', 'cadastrar_aluno', 'lancar_nota'
  
  // Dados de Login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [instituicaoLogada, setInstituicaoLogada] = useState(null);

  // Dados do Novo Aluno
  const [numProcesso, setNumProcesso] = useState('');
  const [biAluno, setBiAluno] = useState('');
  const [nomeAluno, setNomeAluno] = useState('');
  const [curso, setCurso] = useState('');
  const [classe, setClasse] = useState('');
  const [turma, setTurma] = useState('');
  const [anoLectivo, setAnoLectivo] = useState('2026');

  // Dados para Lançar Pauta
  const [estudanteIdNota, setEstudanteIdNota] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [trimestre, setTrimestre] = useState('1');
  const [mac, setMac] = useState('');
  const [npp, setNpp] = useState('');
  const [npt, setNpt] = useState('');

  // 1. Função de Login
  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha o e-mail e a senha.');
      return;
    }

    try {
      const response = await api.post('/instituicoes/login', { email, senha });
      setInstituicaoLogada(response.data.instituicao);
      setEtapa('painel');
      Alert.alert('Sucesso', `Bem-vinda, ${response.data.instituicao.nome}!`);
    } catch (error) {
      Alert.alert('Erro', 'E-mail ou senha incorretos.');
    }
  };

  // 2. Função de Cadastrar Aluno
  const handleCadastrarAluno = async () => {
    if (!numProcesso || !biAluno || !nomeAluno) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios do aluno.');
      return;
    }

    try {
      await api.post('/estudantes/registro', {
        instituicao_id: instituicaoLogada.id,
        numero_processo: numProcesso,
        bi_ou_cedula: biAluno,
        nome_completo: nomeAluno,
        curso,
        classe,
        turma,
        ano_lectivo: anoLectivo,
      });
      Alert.alert('Sucesso', 'Estudante cadastrado com sucesso!');
      setNumProcesso('');
      setBiAluno('');
      setNomeAluno('');
      setCurso('');
      setClasse('');
      setTurma('');
      setEtapa('painel');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o estudante. Verifique os dados.');
    }
  };

  // 3. Função de Lançar Nota
  const handleLancarNota = async () => {
    if (!estudanteIdNota || !disciplina || !mac || !npp || !npt) {
      Alert.alert('Atenção', 'Preencha todos os campos da pauta.');
      return;
    }

    try {
      await api.post('/pautas/lancamento', {
        estudante_id: estudanteIdNota,
        disciplina,
        trimestre: parseInt(trimestre),
        nota_mac: parseFloat(mac),
        nota_npp: parseFloat(npp),
        nota_npt: parseFloat(npt),
      });
      Alert.alert('Sucesso', 'Notas lançadas na pauta com sucesso!');
      setEstudanteIdNota('');
      setDisciplina('');
      setMac('');
      setNpp('');
      setNpt('');
      setEtapa('painel');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao lançar pauta. Verifique o ID do estudante.');
    }
  };

  // TELA 1: LOGIN
  if (etapa === 'login') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Painel da Instituição</Text>
          <Text style={styles.subtitle}>Faça login para gerenciar sua escola</Text>

          <Text style={styles.label}>E-mail Institucional</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: contato@escola.ao"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar na Escola</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // TELA 2: MENU PRINCIPAL DA ESCOLA LOGADA
  if (etapa === 'painel') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.welcomeCard}>
          <Text style={styles.schoolName}>{instituicaoLogada.nome}</Text>
          <Text style={styles.schoolLocation}>Província: {instituicaoLogada.provincia}</Text>
        </View>

        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setEtapa('cadastrar_aluno')}
        >
          <Text style={styles.menuButtonText}>➕ Cadastrar Novo Aluno</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setEtapa('lancar_nota')}
        >
          <Text style={styles.menuButtonText}>📊 Lançar Pauta / Notas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuButton, { backgroundColor: '#64748B' }]} 
          onPress={() => setEtapa('login')}
        >
          <Text style={styles.menuButtonText}>🚪 Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // TELA 3: CADASTRAR ALUNO
  if (etapa === 'cadastrar_aluno') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cadastrar Novo Estudante</Text>

          <Text style={styles.label}>Nº de Processo</Text>
          <TextInput style={styles.input} placeholder="Ex: 102030" value={numProcesso} onChangeText={setNumProcesso} keyboardType="numeric" />

          <Text style={styles.label}>Nº do BI ou Cédula</Text>
          <TextInput style={styles.input} placeholder="Ex: 009876543LA042" value={biAluno} onChangeText={setBiAluno} />

          <Text style={styles.label}>Nome Completo do Aluno</Text>
          <TextInput style={styles.input} placeholder="Ex: Ana Paula" value={nomeAluno} onChangeText={setNomeAluno} />

          <Text style={styles.label}>Curso</Text>
          <TextInput style={styles.input} placeholder="Ex: Informática" value={curso} onChangeText={setCurso} />

          <Text style={styles.label}>Classe</Text>
          <TextInput style={styles.input} placeholder="Ex: 12ª Classe" value={classe} onChangeText={setClasse} />

          <Text style={styles.label}>Turma</Text>
          <TextInput style={styles.input} placeholder="Ex: A" value={turma} onChangeText={setTurma} />

          <TouchableOpacity style={styles.button} onPress={handleCadastrarAluno}>
            <Text style={styles.buttonText}>Salvar Estudante</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => setEtapa('painel')}>
            <Text style={styles.backButtonText}>← Voltar ao Painel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // TELA 4: LANÇAR NOTA
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lançamento de Notas na Pauta</Text>

        <Text style={styles.label}>ID do Estudante no Banco</Text>
        <TextInput style={styles.input} placeholder="Ex: 1" value={estudanteIdNota} onChangeText={setEstudanteIdNota} keyboardType="numeric" />

        <Text style={styles.label}>Disciplina</Text>
        <TextInput style={styles.input} placeholder="Ex: Matemática" value={disciplina} onChangeText={setDisciplina} />

        <Text style={styles.label}>Trimestre (1, 2 ou 3)</Text>
        <TextInput style={styles.input} placeholder="1" value={trimestre} onChangeText={setTrimestre} keyboardType="numeric" />

        <Text style={styles.label}>Nota MAC (Média Contínua)</Text>
        <TextInput style={styles.input} placeholder="Ex: 14" value={mac} onChangeText={setMac} keyboardType="numeric" />

        <Text style={styles.label}>Nota NPP (Prova do Professor)</Text>
        <TextInput style={styles.input} placeholder="Ex: 15" value={npp} onChangeText={setNpp} keyboardType="numeric" />

        <Text style={styles.label}>Nota NPT (Prova Trimestral)</Text>
        <TextInput style={styles.input} placeholder="Ex: 16" value={npt} onChangeText={setNpt} keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={handleLancarNota}>
          <Text style={styles.buttonText}>Gravar Notas na Pauta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => setEtapa('painel')}>
          <Text style={styles.backButtonText}>← Voltar ao Painel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F4F6F9',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  welcomeCard: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  schoolName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  schoolLocation: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
