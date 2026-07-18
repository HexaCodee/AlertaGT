// client-user/src/features/notifications/screens/NotificationSettingsScreen.jsx
// Preferencias de notificaciones ligadas a los flags reales de UserPreferences.

import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../hooks/useNotifications.js';
import { Card, LoadingSpinner } from '../../../shared/components/common/Common.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { showAlert } from '../../../shared/utils/alert.js';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';

// Flags reales de UserPreferences en el auth-service.
const OPTIONS = [
  { key: 'notifyNewAlerts', label: 'Nuevas alertas' },
  { key: 'notifyComments', label: 'Comentarios en mis alertas' },
  { key: 'notifyModeration', label: 'Moderación' },
  { key: 'notifyNearbyAlerts', label: 'Alertas cercanas' },
];

export const NotificationSettingsScreen = () => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const insets = useSafeAreaInsets();
  const { fetchPreferences, updatePreferences, loading } = useNotifications();
  const [prefs, setPrefs] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const load = useCallback(async () => {
    setInitializing(true);
    const data = await fetchPreferences();
    setPrefs(data || {});
    setInitializing(false);
  }, [fetchPreferences]);

  useEffect(() => { load(); }, [load]);

  const toggle = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev?.[key] }));

  const save = async () => {
    const result = await updatePreferences(prefs);
    showAlert(
      result.success ? 'Preferencias guardadas' : 'No se pudo guardar',
      result.success ? 'Tus preferencias se actualizaron.' : result.message
    );
  };

  if (initializing) return <LoadingSpinner message="Cargando preferencias..." />;

  return (
    <View style={[styles.container, { paddingTop: SPACING.md + insets.top }]}>
      <Card>
        <Text style={styles.title}>Preferencias de notificaciones</Text>
        {OPTIONS.map((opt) => (
          <View key={opt.key} style={styles.row}>
            <Text style={styles.label}>{opt.label}</Text>
            <Switch
              value={Boolean(prefs?.[opt.key])}
              onValueChange={() => toggle(opt.key)}
              trackColor={{ true: COLORS.primary, false: COLORS.border }}
              thumbColor={COLORS.surface}
            />
          </View>
        ))}
      </Card>
      <Button title="Guardar cambios" onPress={save} loading={loading} style={styles.save} />
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  title: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  label: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  save: { marginTop: SPACING.md },
});

export default NotificationSettingsScreen;
