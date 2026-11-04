import { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CoffeeContext } from '../context/CoffeeContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, demoLogin, user } = useContext(CoffeeContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setIsLoading(true);
    await login(name, email);
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    await demoLogin();
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your barista credentials</Text>

        <TextInput
          style={styles.input}
          placeholder="Barista Name"
          placeholderTextColor="#8A5D3B"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#8A5D3B"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Masuk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.demoButton]}
          onPress={handleDemoLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Mode Demo</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Demo mode will log you in as "Coffee Lover" without credentials.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '85%',
    maxWidth: 400,
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2B1E16',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A5D3B',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#FAF7F2',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    color: '#2B1E16',
    borderColor: '#D4A373',
    borderWidth: 1,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#8A5D3B',
  },
  demoButton: {
    backgroundColor: '#D4A373',
  },
  buttonText: {
    color: '#FAF7F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#8A5D3B',
    textAlign: 'center',
    marginTop: 20,
  },
});
