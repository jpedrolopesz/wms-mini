import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { WMS } from '@/constants/theme';

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + (Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: WMS.teal,
        tabBarInactiveTintColor: WMS.muted,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: WMS.surface,
          borderTopColor: WMS.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom,
          paddingTop: 8,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: WMS.surface,
        },
        headerTintColor: '#ede9e3',
        headerTitleStyle: { fontSize: 16, fontWeight: '600' },
        headerShadowVisible: false,
        sceneStyle: {
          backgroundColor: WMS.bg,
          paddingBottom: tabBarHeight,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <Icon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="qrcode"
        options={{
          title: 'QR Code',
          tabBarIcon: ({ focused }) => <Icon emoji="⬛" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ocr"
        options={{
          title: 'OCR',
          tabBarIcon: ({ focused }) => <Icon emoji="📷" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="inventario"
        options={{
          title: 'Inventário',
          tabBarIcon: ({ focused }) => <Icon emoji="📦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ia"
        options={{
          title: 'Agente IA',
          tabBarIcon: ({ focused }) => <Icon emoji="🤖" focused={focused} />,
        }}
      />
    </Tabs>
  );
}