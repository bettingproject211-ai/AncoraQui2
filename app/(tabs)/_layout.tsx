import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({ emoji, focused, label }: { emoji: string; focused: boolean; label: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: 44, height: 28, borderRadius: 14,
        backgroundColor: focused ? 'rgba(212,168,83,0.12)' : 'transparent',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 2,
      }}>
        <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
      </View>
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
          backgroundColor: '#080b12',
          borderTopColor: 'rgba(255,255,255,0.05)',
          borderTopWidth: 1,
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#d4a853',
        tabBarInactiveTintColor: '#4b5563',
        tabBarLabelStyle: { fontSize: 10, letterSpacing: 0.3, marginTop: -2 },
        tabBarItemStyle: { paddingTop: 6 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" focused={focused} label="SOS" />,
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: 'Forum',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} label="Forum" />,
        }}
      />
      <Tabs.Screen
        name="profilo"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} label="Profilo" />,
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