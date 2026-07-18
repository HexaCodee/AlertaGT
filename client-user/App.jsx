// client-user/App.jsx
// Punto de entrada de la app: áreas seguras, barra de estado y navegación raíz.

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator.jsx';
import { ThemeProvider } from './src/shared/context/ThemeContext.jsx';
import { COLORS } from './src/shared/constants/theme.js';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {/* El header (ScreenHeader) siempre es rojo sólido en ambos temas,
            igual que en la web, así que el StatusBar no necesita variar. */}
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
