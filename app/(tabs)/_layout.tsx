import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon({ emoji, color, active }: { emoji: string; color: string; active: boolean }) {
  return (
    <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, opacity: active ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  );
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
        tabBarLabelStyle: { fontSize: 9, fontFamily: 'Outfit' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabBarIcon emoji="🏠" color={color} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color, focused }) => <TabBarIcon emoji="🚨" color={color} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: 'Forum',
          tabBarIcon: ({ color, focused }) => <TabBarIcon emoji="💬" color={color} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profilo"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color, focused }) => <TabBarIcon emoji="👤" color={color} active={focused} />,
        }}
      />
      <Tabs.Screen name="diario" options={{ href: null }} />
      <Tabs.Screen name="soldi" options={{ href: null }} />
      <Tabs.Screen name="ricaduta" options={{ href: null }} />
      <Tabs.Screen name="voci" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
    </Tabs>
  );
}