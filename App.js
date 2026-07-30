import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import RegistroEscola from './screens/RegistroEscola';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <RegistroEscola />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
});
