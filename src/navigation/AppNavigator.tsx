import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors, typography } from '../theme/colors';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { RecipeProvider } from '../context/RecipeContext';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FormScreen from '../screens/FormScreen';
import DetailScreen from '../screens/DetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation utama (tanpa AuthContext)
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textLight,
        headerTitleStyle: typography.h3,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Resep Kopiku' }}
      />
      <Stack.Screen
        name="Form"
        component={FormScreen}
        options={{ title: 'Form Resep' }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: 'Detail Resep' }}
      />
    </Stack.Navigator>
  );
}

// Root component dengan providers
export default function App() {
  return (
    <AuthProvider>
      <RecipeProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </RecipeProvider>
    </AuthProvider>
  );
}
