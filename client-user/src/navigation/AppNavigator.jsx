// client-user/src/navigation/AppNavigator.jsx
// Navegador raíz: espera la hidratación del store, luego decide entre la app
// autenticada (MainTabs) y el flujo de auth (AuthStack).

import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './AuthStack.jsx';
import { MainTabs } from './MainTabs.jsx';
import { useAuthStore } from '../shared/store/authStore.js';
import { LoadingSpinner } from '../shared/components/common/Common.jsx';

export const AppNavigator = () => {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Mientras la persistencia no termine de cargar, evitamos parpadeos de pantalla.
  if (!hasHydrated) {
    return <LoadingSpinner message="Cargando AlertaGT..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
