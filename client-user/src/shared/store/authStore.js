// client-user/src/shared/store/authStore.js
// Estado global de autenticación con persistencia (zustand + AsyncStorage).
//
// NOTA: el auth-service de AlertaGT hoy NO expone refresh token; el login solo
// devuelve { token, userDetails, expiresAt }. Por eso el store maneja un único
// token de sesión. expo-secure-store se deja como dependencia lista para cuando
// exista el flujo de refresh, pero aún no se usa aquí.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // Inicia sesión: guarda token y usuario, marca como autenticado.
      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: Boolean(token),
        }),

      // Cierra sesión: limpia todo el estado de auth.
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),

      // Actualiza solo el token (por ejemplo, tras un refresh futuro).
      setToken: (token) => set({ token, isAuthenticated: Boolean(token) }),

      // Actualiza los datos del usuario en memoria/persistencia.
      updateUser: (partial) =>
        set((state) => ({ user: { ...(state.user || {}), ...partial } })),

      // Marca que la persistencia terminó de hidratar (evita parpadeos en el arranque).
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'alertagt-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Solo persistimos lo esencial de sesión.
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;
