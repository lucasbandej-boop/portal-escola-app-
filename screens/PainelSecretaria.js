import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function PainelSecretaria({ escolaNome, navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Secretaria Virtual</Text>
        <Text style={styles.escolaName}>{escolaNome || 'Escola Autenticada'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Gestão de Cadastros</Text>

      <TouchableOpacity 
        style={styles.cardMenu}
        onPress={() => navigation && navigation.navigate('CadastrarEstudante')}
      >
        <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
          <Text style={styles.iconText}>🎓</Text>
        </View>
        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>Cadastrar Estudante</Text>
          <Text style={styles.menuSub}>Matrículas, ficha do aluno, turma e dados pessoais</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cardMenu}
        onPress={() => navigation && navigation.navigate('CadastrarProfessor')}
      >
        <View style={[styles.iconBox, { backgroundColor: '#10B981' }]}>
          <Text style={styles.iconText}>👨‍🏫</Text>
        </View>
        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>Cadastrar Professor</Text>
          <Text style={styles.menuSub}>Disciplinas lecionadas, contactos e atribuição de turmas</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F1F5F9', flexGrow: 1 },
  header: { marginBottom: 20, padding: 16, backgroundColor: '#1E293B', borderRadius: 12 },
  welcome: { color: '#94A3B8', fontSize: 14 },
  escolaName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  cardMenu: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  iconText: { fontSize: 22 },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  menuSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
