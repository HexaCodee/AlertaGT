// client-user/src/shared/store/authStore.js
// Estado global de autenticación con persistencia (zustand + AsyncStorage).
//
// El login devuelve { token, refreshToken, userDetails, expiresAt,
// refreshTokenExpiresAt }. El access token dura poco (60 min); el refresh
// token (30 días) se usa en shared/api/tokenRefresh.js para renovar la
// sesión sin pedir credenciales de nuevo, hasta que el usuario cierre sesión.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // Inicia sesión: guarda tokens y usuario, marca como autenticado.
      login: (token, user, refreshToken) =>
        set({
          token,
          refreshToken: refreshToken ?? null,
          user,
          isAuthenticated: Boolean(token),
        }),

      // Cierra sesión: limpia todo el estado de auth.
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      // Actualiza el access token (y, si viene, el refresh token) tras un refresh.
      setToken: (token, refreshToken) =>
        set((state) => ({
          token,
          refreshToken: refreshToken ?? state.refreshToken,
          isAuthenticated: Boolean(token),
        })),

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
        refreshToken: state.refreshToken,
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
