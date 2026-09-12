import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../supabase';

export default function LoginEscola({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Erro no Acesso', error.message);
    } else {
      navigation.navigate('PerfilInstituicao');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Acesso da Instituição</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail da Escola"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Palavra-passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Entrar no Portal</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F3F4F6' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#FFF' },
  btn: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
