import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import MenuPrincipal from './src/screens/MenuPrincipal';

const TITULOS = {
  PaginaInstituicao: 'Página da Instituição',
  PesquisaAlunos: 'Pesquisa de Alunos e Encarregados',
  CadastroProfessores: 'Cadastramento de Professores',
};

export default function App() {
  const [tela, setTela] = useState('MenuPrincipal');

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tela !== 'MenuPrincipal') {
        setTela('MenuPrincipal');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [tela]);

  if (tela === 'MenuPrincipal') {
    return <MenuPrincipal navigation={{ navigate: setTela }} />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        {TITULOS[tela]} (em construção)
      </Text>
      <TouchableOpacity
        onPress={() => setTela('MenuPrincipal')}
        style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>← Voltar ao Menu</Text>
      </TouchableOpacity>
    </View>
  );
}
