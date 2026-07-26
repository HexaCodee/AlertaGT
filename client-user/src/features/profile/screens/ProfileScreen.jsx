// client-user/src/features/profile/screens/ProfileScreen.jsx
// Perfil del usuario: datos (solo lectura, igual que AccountPage en la web),
// apariencia (modo oscuro + radio de alertas) y cerrar sesión.

import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfile } from '../hooks/useProfile.js';
import { useReports } from '../../reports/hooks/useReports.js';
import { StarRating } from '../../reports/components/StarRating.jsx';
import { Card, LoadingSpinner } from '../../../shared/components/common/Common.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { RangeSlider } from '../../../shared/components/common/RangeSlider.jsx';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { authClient } from '../../../shared/api/authClient.js';
import { showConfirm } from '../../../shared/utils/alert.js';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import {
  getAlertRadius,
  setAlertRadius,
  formatRadius,
  ALERT_RADIUS_MIN,
  ALERT_RADIUS_MAX,
  ALERT_RADIUS_STEP,
} from '../../../shared/utils/preferences.js';
import { SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';

// Igual que en web (AccountPage): estado de reputación con color semántico.
// Estos colores de estado son iguales en ambos temas (ver LIGHT_COLORS/DARK_COLORS).
const STATUS_META = {
  ACTIVE: { label: 'Activo', color: '#16a34a' },
  WARNED: { label: 'En aviso', color: '#f59e0b' },
  SUSPENDED: { label: 'Suspendido', color: '#dc2626' },
};

export const ProfileScreen = ({ navigation }) => {
  const { colors: COLORS, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const { fetchProfile } = useProfile();
  const { fetchReputation } = useReports();
  const logout = useAuthStore((state) => state.logout);

  const [profile, setProfile] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [radius, setRadius] = useState(ALERT_RADIUS_MIN);

  const load = useCallback(async () => {
    setInitializing(true);
    const data = await fetchProfile();
    if (data) {
      setProfile(data);
      if (data.id) setReputation(await fetchReputation(data.id));
    }
    setInitializing(false);
  }, [fetchProfile, fetchReputation]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getAlertRadius().then(setRadius); }, []);

  const handleRadiusChange = (value) => {
    setRadius(value);
    setAlertRadius(value);
  };

  const confirmLogout = () => {
    showConfirm('Cerrar sesión', '¿Seguro que deseas salir de tu cuenta?', async () => {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) {
        // Revoca la sesión en el servidor. Best-effort: si falla (sin
        // conexión, backend caído), igual se cierra sesión localmente.
        try {
          await authClient.post('/logout', { refreshToken });
        } catch {
          // Ignorado a propósito.
        }
      }
      logout();
    }, 'Cerrar sesión');
  };

  if (initializing) return <LoadingSpinner message="Cargando tu perfil..." />;
  if (!profile) return <LoadingSpinner message="Cargando tu perfil..." />;

  // Avatar: usa la URL si es http(s); de lo contrario, ícono por defecto.
  const hasAvatar = typeof profile.profilePicture === 'string' && profile.profilePicture.startsWith('http');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {hasAvatar ? (
          <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <MaterialIcons name="person" size={48} color={COLORS.surface} />
          </View>
        )}
        <Text style={styles.name}>{profile.name} {profile.surname}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
      </View>

      {reputation ? (
        <Card>
          <Text style={styles.sectionTitle}>Mi reputación</Text>
          <View style={styles.repRow}>
            <Text style={styles.trust}>{reputation.trustScore}</Text>
            <Text style={styles.trustMax}>/100</Text>
            <View style={[styles.badge, { backgroundColor: (STATUS_META[reputation.status] || STATUS_META.ACTIVE).color }]}>
              <Text style={styles.badgeText}>{(STATUS_META[reputation.status] || STATUS_META.ACTIVE).label}</Text>
            </View>
          </View>
          <View style={styles.starsRow}>
            <StarRating value={Math.round(reputation.averageRating || 0)} readOnly size={18} />
            <Text style={styles.starsText}>
              {(reputation.averageRating || 0).toFixed(1)} · {reputation.ratingsCount || 0} calificaciones
            </Text>
          </View>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <Field styles={styles} label="Correo" value={profile.email} />
        <Field styles={styles} label="Usuario" value={profile.username} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Contacto y ubicación</Text>
        <Field styles={styles} label="Teléfono" value={profile.phone || '—'} />
        <Field styles={styles} label="Ciudad" value={profile.city || '—'} />
        <Field styles={styles} label="Dirección" value={profile.address || '—'} />
        <Field styles={styles} label="País" value={profile.country || '—'} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <View style={styles.themeRow}>
          <MaterialIcons name={isDark ? 'dark-mode' : 'light-mode'} size={20} color={COLORS.textLight} />
          <Text style={styles.optionLabel}>Modo oscuro</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ true: COLORS.primary, false: COLORS.border }}
            thumbColor={COLORS.surface}
          />
        </View>

        <View style={styles.radiusBlock}>
          <View style={styles.radiusHead}>
            <MaterialIcons name="my-location" size={20} color={COLORS.textLight} />
            <Text style={styles.optionLabel}>Radio de alertas</Text>
            <Text style={styles.radiusValue}>{formatRadius(radius)}</Text>
          </View>
          <RangeSlider
            style={styles.slider}
            minimumValue={ALERT_RADIUS_MIN}
            maximumValue={ALERT_RADIUS_MAX}
            step={ALERT_RADIUS_STEP}
            value={radius}
            onValueChange={handleRadiusChange}
            trackColor={COLORS.border}
            fillColor={COLORS.primary}
            thumbColor={COLORS.primary}
          />
          <Text style={styles.radiusHint}>Muestra alertas dentro de este radio en el mapa.</Text>
        </View>
      </Card>

      <Card>
        <Pressable style={styles.optionRow} onPress={() => navigation.navigate('MyReports')}>
          <MaterialIcons name="flag" size={20} color={COLORS.textLight} />
          <Text style={styles.optionLabel}>Mis reportes</Text>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.textLight} />
        </Pressable>
      </Card>

      <Button title="Cerrar sesión" variant="secondary" onPress={confirmLogout} style={styles.logout} />
    </ScrollView>
  );
};

const Field = ({ styles, label, value }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  header: { alignItems: 'center', marginBottom: SPACING.lg },
  repRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.xs },
  trust: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.primary, lineHeight: 34 },
  trustMax: { fontSize: FONT_SIZE.sm, color: COLORS.textLight, marginBottom: 4 },
  badge: { marginLeft: 'auto', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 999 },
  badgeText: { color: '#ffffff', fontSize: FONT_SIZE.xs, fontWeight: '700' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  starsText: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  optionLabel: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text, fontWeight: '600' },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  radiusBlock: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  radiusHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  radiusValue: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.primary },
  slider: { width: '100%', height: 36, marginTop: SPACING.xs },
  radiusHint: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.border },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { marginTop: SPACING.sm, fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.text },
  username: { fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  field: { paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  fieldLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, textTransform: 'uppercase' },
  fieldValue: { marginTop: 2, fontSize: FONT_SIZE.md, color: COLORS.text },
  logout: { marginTop: SPACING.lg },
});

export default ProfileScreen;
