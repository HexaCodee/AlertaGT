// client-user/src/navigation/MainTabs.jsx
// Navegación principal de la app autenticada: calca exactamente las 5 pestañas
// del bottom-nav de client-admin (web) — Inicio, Mapa, Crear, Notificaciones,
// Cuenta — mismo orden y mismos íconos. La web no tiene una pestaña de
// "Reportes": reportar vive en el detalle de alerta y la reputación se muestra
// dentro del perfil, así que aquí replicamos esa misma estructura.

import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../shared/context/ThemeContext.jsx';
import { SPACING } from '../shared/constants/theme.js';

// Pantallas reales por dominio.
import { AlertsListScreen } from '../features/alerts/screens/AlertsListScreen.jsx';
import { AlertDetailScreen } from '../features/alerts/screens/AlertDetailScreen.jsx';
import { CreateAlertScreen } from '../features/alerts/screens/CreateAlertScreen.jsx';
import { MyReportsScreen } from '../features/reports/screens/MyReportsScreen.jsx';
import { ReportDetailScreen } from '../features/reports/screens/ReportDetailScreen.jsx';
import { NotificationsListScreen } from '../features/notifications/screens/NotificationsListScreen.jsx';
import { NotificationDetailScreen } from '../features/notifications/screens/NotificationDetailScreen.jsx';
import { NotificationSettingsScreen } from '../features/notifications/screens/NotificationSettingsScreen.jsx';
import { MapScreen } from '../features/map/screens/MapScreen.jsx';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen.jsx';

const Tab = createBottomTabNavigator();
const AlertsStackNav = createNativeStackNavigator();
const NotificationsStackNav = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

// ---- Stacks anidados por pestaña ----
const AlertsStack = () => (
  <AlertsStackNav.Navigator screenOptions={{ headerShown: false }}>
    <AlertsStackNav.Screen name="AlertsList" component={AlertsListScreen} />
    <AlertsStackNav.Screen name="AlertDetail" component={AlertDetailScreen} />
  </AlertsStackNav.Navigator>
);

const NotificationsStack = () => (
  <NotificationsStackNav.Navigator screenOptions={{ headerShown: false }}>
    <NotificationsStackNav.Screen name="NotificationsList" component={NotificationsListScreen} />
    <NotificationsStackNav.Screen name="NotificationDetail" component={NotificationDetailScreen} />
    <NotificationsStackNav.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
  </NotificationsStackNav.Navigator>
);

// La reputación/reportes no tiene tab propio en la web: vive dentro del perfil
// ("Mi reputación" + "Mis reportes"), igual que aquí.
const ProfileStack = () => {
  const { colors: COLORS } = useTheme();
  return (
    <ProfileStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.headerSurface },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
      }}
    >
      <ProfileStackNav.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <ProfileStackNav.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'Mis reportes' }} />
      <ProfileStackNav.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Detalle de reporte' }} />
    </ProfileStackNav.Navigator>
  );
};

// Íconos MaterialIcons por pestaña — mismos conceptos que los SVG de web
// (casa=Inicio, mapa=Mapa, más-en-círculo=Crear, campana=Notificaciones, persona=Cuenta).
const TAB_ICONS = {
  Alerts: 'home',
  Map: 'map',
  CreateAlert: 'add-circle',
  Notifications: 'notifications',
  Profile: 'person',
};

export const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: [
          styles.tabBar,
          {
            height: styles.tabBar.height + insets.bottom,
            paddingBottom: SPACING.sm + insets.bottom,
          },
        ],
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Alerts" component={AlertsStack} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Mapa' }} />
      <Tab.Screen name="CreateAlert" component={CreateAlertScreen} options={{ title: 'Crear' }} />
      <Tab.Screen name="Notifications" component={NotificationsStack} options={{ title: 'Notificaciones' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Cuenta' }} />
    </Tab.Navigator>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default MainTabs;
