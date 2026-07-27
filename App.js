import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import InstituicaoScreen from './src/screens/InstituicaoScreen';
import ProfessorScreen from './src/screens/ProfessorScreen';
import api from './src/services/api';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('consulta'); // 'consulta', 'instituicao', 'professores'

  // Estados da Consulta Pública do Estudante
  const [numProcesso, setNumProcesso] = useState('');
  const [bi, setBi] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const buscarPauta = async () => {
    if (!numProcesso || !bi) {
      Alert.alert('Atenção', 'Por favor, preencha o Nº de Processo e o BI/Cédula.');
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const response = await api.post('/estudantes/consulta-pauta', {
        numero_processo: numProcesso.trim(),
        bi_ou_cedula: bi.trim(),
      });

      if (response.data && response.data.dados) {
        setResultado(response.data.dados);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Alert.alert('Não Encontrado', 'Nenhum estudante ou nota cadastrada com esses dados.');
      } else {
        Alert.alert('Erro', 'Falha ao conectar com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F9" />
      
      {/* Barra de Navegação Superior */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={[styles.navTab, abaAtiva === 'consulta' && styles.navTabActive]} 
          onPress={() => setAbaAtiva('consulta')}
        >
          <Text style={[styles.navText, abaAtiva === 'consulta' && styles.navTextActive]}>
            👨‍🎓 Aluno
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, abaAtiva === 'professores' && styles.navTabActive]} 
          onPress={() => setAbaAtiva('professores')}
        >
          <Text style={[styles.navText, abaAtiva === 'professores' && styles.navTextActive]}>
            👨‍🏫 Talentos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, abaAtiva === 'instituicao' && styles.navTabActive]} 
          onPress={() => setAbaAtiva('instituicao')}
        >
          <Text style={[styles.navText, abaAtiva === 'instituicao' && styles.navTextActive]}>
            🏫 Escola
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo dinâmico dependendo da aba selecionada */}
      {abaAtiva === 'instituicao' ? (
        <InstituicaoScreen />
      ) : abaAtiva === 'professores' ? (
        <ProfessorScreen />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Portal Escolar</Text>
            <Text style={styles.subtitle}>Consulta Pública de Pautas e Notas</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Consultar Notas do Aluno</Text>
            
            <Text style={styles.label}>Nº de Processo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 12345"
              keyboardType="numeric"
              value={numProcesso}
              onChangeText={setNumProcesso}
            />

            <Text style={styles.label}>Nº do BI / Cédula</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 009876543LA042"
              autoCapitalize="characters"
              value={bi}
              onChangeText={setBi}
            />

            <TouchableOpacity style={styles.button} onPress={buscarPauta} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Consultar Pauta</Text>
              )}
            </TouchableOpacity>
          </View>

          {resultado && resultado.length > 0 && (
            <View style={styles.resultCard}>
              <Text style={styles.studentName}>{resultado[0].aluno}</Text>
              <Text style={styles.schoolInfo}>
                {resultado[0].escola} • {resultado[0].classe} ({resultado[0].turma})
              </Text>
              <Text style={styles.courseInfo}>Curso: {resultado[0].curso || 'Geral'}</Text>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Boletim de Notas</Text>

              {resultado.map((item, index) => (
                <View key={index} style={styles.gradeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectText}>{item.disciplina || 'Geral'}</Text>
                    <Text style={styles.trimesterText}>{item.trimestre || 1}º Trimestre</Text>
                  </View>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>
                      {item.nota_final ? item.nota_final : 'N/A'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navTabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#2563EB',
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  navTextActive: {
    color: '#2563EB',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
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
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#2563EB',
    elevation: 3,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  schoolInfo: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
  },
  courseInfo: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subjectText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  trimesterText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  gradeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
});
