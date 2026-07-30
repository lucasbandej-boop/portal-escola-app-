import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { supabase } from '../supabaseClient';

export default function LoginEscola({ onNavigateRegister, onLoginSuccess }) {
  const [licencaOuNome, setLicencaOuNome] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const showAlert = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const handleLogin = async () => {
    if (!licencaOuNome.trim() || !senha.trim()) {
      showAlert('Atenção', 'Por favor, preencha a Licença/Nome e a Senha.');
      return;
    }

    setLoading(true);

    try {
      // Buscar escola pelo Número de Licença ou pelo Nome da Instituição
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .or(`numero_licenca.eq.${licencaOuNome.trim()},nome.ilike.%${licencaOuNome.trim()}%`)
        .eq('senha_acesso', senha.trim())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        showAlert('Erro de Acesso', 'Credenciais inválidas. Verifique o número de licença/nome e a senha.');
        setLoading(false);
        return;
      }

      showAlert('Sucesso', `Bem-vindo, ${data.nome}!`);
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      showAlert('Erro', err.message || 'Falha ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>Portal Escola</Text>
        <Text style={styles.subtitulo}>Acesso à Secretaria Virtual</Text>

        <Text style={styles.label}>Nº de Licença ou Nome da Escola</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: LIC-2026-001 ou Colégio ABC"
          value={licencaOuNome}
          onChangeText={setLicencaOuNome}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha de Acesso</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.botaoLogin} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotao}>Entrar na Plataforma</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkCadastro} onPress={onNavigateRegister}>
          <Text style={styles.textoLink}>Não tem conta? Cadastrar Instituição</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F1F5F9',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  botaoLogin: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  linkCadastro: {
    marginTop: 18,
    alignItems: 'center',
  },
  textoLink: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
});
