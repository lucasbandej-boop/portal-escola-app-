import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import RegistroEscola from './screens/RegistroEscola';
import LoginEscola from './screens/LoginEscola';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('login'); // 'login' | 'registro' | 'painel'
  const [escolaLogada, setEscolaLogada] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {telaAtual === 'login' && (
        <LoginEscola
          onNavigateRegister={() => setTelaAtual('registro')}
          onLoginSuccess={(escola) => {
            setEscolaLogada(escola);
            setTelaAtual('painel');
          }}
        />
      )}

      {telaAtual === 'registro' && (
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={() => setTelaAtual('login')}>
            <Text style={styles.textoVoltar}>← Voltar para o Login</Text>
          </TouchableOpacity>
          <RegistroEscola />
        </View>
      )}

      {telaAtual === 'painel' && (
        <View style={styles.painelTemp}>
          <Text style={styles.tituloPainel}>🎉 Bem-vindo ao Painel!</Text>
          <Text style={styles.nomeEscola}>{escolaLogada?.nome}</Text>
          <Text style={styles.infoEscola}>Licença: {escolaLogada?.numero_licenca || 'N/A'}</Text>
          
          <TouchableOpacity style={styles.botaoSair} onPress={() => setTelaAtual('login')}>
            <Text style={styles.textoSair}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  botaoVoltar: {
    padding: 14,
    backgroundColor: '#0F172A',
  },
  textoVoltar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  painelTemp: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tituloPainel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  nomeEscola: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  infoEscola: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  botaoSair: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoSair: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
