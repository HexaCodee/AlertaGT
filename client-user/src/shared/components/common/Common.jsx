// client-user/src/shared/components/common/Common.jsx
// Componentes de UI compartidos: LoadingSpinner, EmptyState y Card.

import { useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, SHADOWS } from '../../constants/theme.js';
import { useTheme } from '../../context/ThemeContext.jsx';

// Spinner centrado con mensaje opcional.
export const LoadingSpinner = ({ message = 'Cargando...', style }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  return (
    <View style={[styles.centered, style]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message ? <Text style={styles.loadingText}>{message}</Text> : null}
    </View>
  );
};

// Estado vacío con ícono, título y descripción opcional.
export const EmptyState = ({
  icon = 'inbox',
  title = 'Sin resultados',
  message,
  style,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  return (
    <View style={[styles.centered, style]}>
      <MaterialIcons name={icon} size={56} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
    </View>
  );
};

// Tarjeta contenedora con sombra suave.
export const Card = ({ children, style }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  return <View style={[styles.card, style]}>{children}</View>;
};

const createStyles = (COLORS) => StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyMessage: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
});

export default { LoadingSpinner, EmptyState, Card };
