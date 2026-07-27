import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import api from '../services/api';

export default function ProfessorScreen() {
  const [modo, setModo] = useState('lista'); // 'lista' ou 'cadastro'

  // Estados do Formulário de Cadastro
  const [nome, setNome] = useState('');
  const [bi, setBi] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [provincia, setProvincia] = useState('Luanda');
  const [municipio, setMunicipio] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [nivelAcademico, setNivelAcademico] = useState('');
  const [biografia, setBiografia] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados da Lista e Filtros
  const [professores, setProfessores] = useState([]);
  const [filtroProvincia, setFiltroProvincia] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [loadingLista, setLoadingLista] = useState(false);

  const carregarProfessores = async () => {
    setLoadingLista(true);
    try {
      let params = {};
      if (filtroProvincia) params.provincia = filtroProvincia;
      if (filtroEspecialidade) params.especialidade = filtroEspecialidade;

      const response = await api.get('/professores', { params });
      if (response.data && response.data.professores) {
        setProfessores(response.data.professores);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    if (modo === 'lista') {
      carregarProfessores();
    }
  }, [modo]);

  const handleCadastrar = async () => {
    if (!nome || !bi || !email || !senha || !especialidade) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios (Nome, BI, E-mail, Senha e Especialidade).');
      return;
    }

    setLoading(true);
    try {
      await api.post('/professores/registro', {
        nome_completo: nome,
        bi,
        email,
        senha,
        telefone,
        provincia,
        municipio,
        especialidade,
        nivel_academico: nivelAcademico,
        biografia,
      });

      Alert.alert('Sucesso', 'Inscrição realizada no Banco de Talentos!');
      setNome('');
      setBi('');
      setEmail('');
      setSenha('');
      setTelefone('');
      setEspecialidade('');
      setNivelAcademico('');
      setBiografia('');
      setModo('lista');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o cadastro. Verifique se BI ou E-mail já existem.');
    } finally {
      setLoading(false);
    }
  };

  if (modo === 'cadastro') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inscrição no Banco de Talentos</Text>
          <Text style={styles.subtitle}>Cadastre-se para ser encontrado por escolas em Angola</Text>

          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput style={styles.input} placeholder="Ex: Manuel António" value={nome} onChangeText={setNome} />

          <Text style={styles.label}>Nº do BI *</Text>
          <TextInput style={styles.input} placeholder="Ex: 009876543LA042" value={bi} onChangeText={setBi} autoCapitalize="characters" />

          <Text style={styles.label}>E-mail *</Text>
          <TextInput style={styles.input} placeholder="professor@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" />

          <Text style={styles.label}>Senha *</Text>
          <TextInput style={styles.input} placeholder="Sua senha" secureTextEntry value={senha} onChangeText={setSenha} />

          <Text style={styles.label}>Telefone / WhatsApp</Text>
          <TextInput style={styles.input} placeholder="Ex: 923000000" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

          <Text style={styles.label}>Província</Text>
          <TextInput style={styles.input} placeholder="Ex: Luanda" value={provincia} onChangeText={setProvincia} />

          <Text style={styles.label}>Município</Text>
          <TextInput style={styles.input} placeholder="Ex: Viana" value={municipio} onChangeText={setMunicipio} />

          <Text style={styles.label}>Especialidade / Disciplina *</Text>
          <TextInput style={styles.input} placeholder="Ex: Matemática, Física, Língua Portuguesa" value={especialidade} onChangeText={setEspecialidade} />

          <Text style={styles.label}>Nível Académico</Text>
          <TextInput style={styles.input} placeholder="Ex: Licenciatura, Mestrado" value={nivelAcademico} onChangeText={setNivelAcademico} />

          <Text style={styles.label}>Biografia / Experiência</Text>
          <TextInput style={[styles.input, { height: 80 }]} placeholder="Fale um pouco sobre a sua carreira..." multiline value={biografia} onChangeText={setBiografia} />

          <TouchableOpacity style={styles.button} onPress={handleCadastrar} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar Perfil</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => setModo('lista')}>
            <Text style={styles.backButtonText}>← Voltar para a Lista</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Banco de Talentos</Text>
          <Text style={styles.subtitle}>Professores disponíveis para contratação</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModo('cadastro')}>
          <Text style={styles.addBtnText}>+ Sou Professor</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Pesquisar Docentes</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Especialidade"
            value={filtroEspecialidade}
            onChangeText={setFiltroEspecialidade}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={carregarProfessores}>
            <Text style={styles.searchBtnText}>Filtrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Professores */}
      {loadingLista ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
      ) : professores.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum professor encontrado com os filtros selecionados.</Text>
        </View>
      ) : (
        professores.map((prof) => (
          <View key={prof.id} style={styles.profCard}>
            <Text style={styles.profName}>{prof.nome_completo}</Text>
            <Text style={styles.profSpec}>👨‍🏫 {prof.especialidade}</Text>
            <Text style={styles.profDetails}>
              📍 {prof.provincia} {prof.municipio ? `(${prof.municipio})` : ''} • 🎓 {prof.nivel_academico || 'Ensino Superior'}
            </Text>
            {prof.biografia ? <Text style={styles.profBio}>"{prof.biografia}"</Text> : null}
            <View style={styles.contactRow}>
              <Text style={styles.profContact}>📞 {prof.telefone || 'Não informado'}</Text>
              <Text style={styles.profEmail}>✉️ {prof.email}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F4F6F9',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  searchBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  searchBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
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
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  profCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    elevation: 2,
  },
  profName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  profSpec: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 2,
  },
  profDetails: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  profBio: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#475569',
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
  },
  contactRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profContact: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  profEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
  },
});
