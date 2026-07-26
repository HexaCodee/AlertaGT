// client-user/src/features/auth/hooks/useAuth.js
// Lógica de autenticación: login y registro contra el auth-service de AlertaGT.

import { useState, useCallback } from 'react';
import { authClient } from '../../../shared/api/authClient.js';
import { useAuthStore } from '../../../shared/store/authStore.js';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  // Inicia sesión. Respuesta real del backend: { success, message, token, userDetails, expiresAt }.
  // Se toleran también accessToken/user por si el contrato cambia más adelante.
  const handleLogin = useCallback(
    async ({ emailOrUsername, password }) => {
      setLoading(true);
      setError('');
      try {
        const response = await authClient.post('/login', { emailOrUsername, password });
        const data = response.data ?? {};

        const token = data.token ?? data.accessToken ?? null;
        const user = data.userDetails ?? data.user ?? null;
        const refreshToken = data.refreshToken ?? null;

        if (!token) {
          throw new Error('Respuesta de login sin token');
        }

        login(token, user, refreshToken);
        return { success: true, user };
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'No se pudo iniciar sesión';
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  // Registra un usuario nuevo (multipart/form-data, igual que el registro web).
  // El registro NO autentica: el usuario debe verificar su email antes de iniciar sesión.
  const handleRegister = useCallback(async (fields) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      // Nombres de campo exactos del DTO de .NET (auth-service).
      formData.append('Name', fields.name ?? '');
      formData.append('Surname', fields.surname ?? '');
      formData.append('Username', fields.username ?? '');
      formData.append('Email', fields.email ?? '');
      formData.append('Password', fields.password ?? '');
      formData.append('Phone', String(fields.phone ?? '').replace(/\D/g, ''));
      formData.append('City', fields.city ?? 'Guatemala');
      formData.append('Address', fields.address ?? '');
      formData.append('Country', fields.country ?? 'Guatemala');

      // No fijar 'Content-Type' manualmente: el runtime (web o RN) debe generar
      // su propio boundary a partir del FormData; forzar el header sin boundary
      // rompe el parseo multipart en el backend.
      const response = await authClient.post('/register', formData);

      return { success: true, data: response.data };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'No se pudo crear la cuenta';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { handleLogin, handleRegister, loading, error, logout };
};

export default useAuth;
