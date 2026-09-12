import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './HomeScreen';
import PerfilInstituicao from './PerfilInstituicao';
import ProfessorScreen from './src/screens/ProfessorScreen';
import LoginEscola from './src/screens/LoginEscola';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#2563EB',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Portal Escola' }} 
        />
        <Stack.Screen 
          name="PerfilInstituicao" 
          component={PerfilInstituicao} 
          options={{ title: 'Página da Instituição' }} 
        />
        <Stack.Screen 
          name="Professores" 
          component={ProfessorScreen} 
          options={{ title: 'Cadastramento de Professores' }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginEscola} 
          options={{ title: 'Acesso Restrito' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
