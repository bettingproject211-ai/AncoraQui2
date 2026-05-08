import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 16, color }}>{emoji}</Text>;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0c0f1a',
          borderTopColor: '#181c2a',
          borderTopWidth: 1,
          height: 60 + insets.bottom + 8,
          paddingBottom: insets.bottom + 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#c9965a',
        tabBarInactiveTintColor: '#5a5f72',
        tabBarLabelStyle: { fontSize: 10 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color }) => <TabBarIcon emoji="🚨" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ricaduta"
        options={{
          title: 'Ricaduta',
          tabBarIcon: ({ color }) => <TabBarIcon emoji="🤲" color={color} />,
        }}
      />
      <Tabs.Screen
        name="voci"
        options={{
          title: 'Voci',
          tabBarIcon: ({ color }) => <TabBarIcon emoji="👥" color={color} />,
        }}
      />
      <Tabs.Screen
        name="soldi"
        options={{
          title: 'Soldi',
          tabBarIcon: ({ color }) => <TabBarIcon emoji="💶" color={color} />,
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