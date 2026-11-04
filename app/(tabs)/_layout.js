import { Tabs } from 'expo-router';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8A5D3B',
        tabBarInactiveTintColor: '#D4A373',
        tabBarStyle: {
          backgroundColor: '#2B1E16',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 60,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Seduh',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="stopwatch" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Resep',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="book-open" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Tambah',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
