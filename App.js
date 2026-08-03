import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

import PerfilInstituicao from './PerfilInstituicao';
import CadastroPessoas from './CadastroPessoas';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('perfil');
  const INSTITUICAO_ID = 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Portal Escola</Text>
        <TouchableOpacity 
          style={styles.btnNavegar} 
          onPress={() => setTelaAtual(telaAtual === 'perfil' ? 'cadastro' : 'perfil')}
        >
          <Text style={styles.btnNavegarTexto}>
            {telaAtual === 'perfil' ? '+ Cadastrar Membro' : 'Ver Perfil FB'}
          </Text>
        </TouchableOpacity>
      </View>

      {telaAtual === 'perfil' ? (
        <PerfilInstituicao 
          instituicaoId={INSTITUICAO_ID} 
          onNavegarCadastro={() => setTelaAtual('cadastro')} 
        />
      ) : (
        <CadastroPessoas 
          instituicaoId={INSTITUICAO_ID} 
          onSucesso={() => setTelaAtual('perfil')} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBar: {
    height: 56,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
    elevation: 2,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1877f2',
  },
  btnNavegar: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnNavegarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
