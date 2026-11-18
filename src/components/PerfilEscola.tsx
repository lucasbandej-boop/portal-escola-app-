import React from 'react';
import { View, Text, Image } from 'react-native';

export default function PerfilEscolaHeader({ urlCapa, urlPerfil }) {
  return (
    <View className="w-full bg-white">
      {/* Capa */}
      <View className="relative w-full h-36 bg-gray-200">
        <Image 
          source={{ uri: urlCapa }} 
          className="w-full h-full object-cover" 
        />
      </View>

      {/* Foto de Perfil com margem negativa (-mt-12) para subir e encaixar na capa */}
      <View className="items-center -mt-12 mb-4">
        <View className="w-24 h-24 rounded-full p-1 bg-white shadow-md border-4 border-white">
          <Image 
            source={{ uri: urlPerfil }} 
            className="w-full h-full rounded-full object-cover" 
          />
        </View>
        
        <Text className="text-xl font-bold mt-2 text-gray-900">Colégio Elísio Filhos</Text>
        <Text className="text-sm text-gray-500 mt-0.5">Ensino Médio</Text>
        <Text className="text-xs text-gray-400 mt-1">📍 4 de abril, Camama, Luanda</Text>
      </View>
    </View>
  );
}
