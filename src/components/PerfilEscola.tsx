import React from 'react';
import { View, Text, Image } from 'react-native';

export default function PerfilEscolaHeader({ urlCapa, urlPerfil }) {
  return (
    <View className="w-full bg-white pb-4">
      {/* Capa com overflow-visible para permitir que a foto saia para fora da capa sem ser cortada */}
      <View className="relative w-full h-36 bg-gray-200 overflow-visible z-0">
        <Image 
          source={{ uri: urlCapa }} 
          className="w-full h-full object-cover" 
        />
      </View>

      {/* Foto de Perfil com z-10 para ficar por cima da capa e margem negativa ajustada */}
      <View className="items-center -mt-12 z-10">
        <View className="w-24 h-24 rounded-full p-1 bg-white shadow-lg border-4 border-white">
          <Image 
            source={{ uri: urlPerfil }} 
            className="w-full h-full rounded-full object-cover" 
          />
        </View>
        
        <Text className="text-xl font-bold mt-2 text-gray-900">Afonso Fonseca</Text>
        <Text className="text-sm text-gray-500 mt-0.5">Ensino Médio</Text>
        <Text className="text-xs text-gray-400 mt-1">📍 F5, Camama, Luanda</Text>
      </View>
    </View>
  );
}
