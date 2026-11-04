import { Stack } from 'expo-router';
import { CoffeeProvider } from '../context/CoffeeContext';

export default function RootLayout() {
  return (
    <CoffeeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </CoffeeProvider>
  );
}
