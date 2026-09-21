import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CharactersScreen from './screens/CharactersScreen';
import CharacterDetailScreen from './screens/CharacterDetailScreen';
import HomeScreen from './screens/HomeScreen';
import { colors } from './styles/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CharactersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Characters"
        component={CharactersScreen}
        options={{ title: 'Personagens', headerBackTitle: 'Voltar' }}
      />
      <Stack.Screen
        name="CharacterDetail"
        component={CharacterDetailScreen}
        options={({ route }) => ({ title: route.params?.name ?? 'Detalhes' })}
      />
    </Stack.Navigator>
  );
}

export default function Navigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          initialRouteName="Início"
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '800' },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: { paddingBottom: 8, height: 60 },
          }}
        >
          <Tab.Screen
            name="Início"
            component={HomeScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size, color }}>🏠</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Personagens"
            component={CharactersStack}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Text style={{ fontSize: size, color }}>🍥</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}