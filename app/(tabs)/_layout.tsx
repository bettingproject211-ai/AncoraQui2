import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0c0f1a',
          borderTopColor: '#181c2a',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#c9965a',
        tabBarInactiveTintColor: '#5a5f72',
        tabBarLabelStyle: { fontSize: 10 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🚨</Text>,
        }}
      />
      <Tabs.Screen
        name="ricaduta"
        options={{
          title: 'Ricaduta',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🤲</Text>,
        }}
      />
      <Tabs.Screen
        name="voci"
        options={{
          title: 'Voci',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="soldi"
        options={{
          title: 'Soldi',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💶</Text>,
        }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}