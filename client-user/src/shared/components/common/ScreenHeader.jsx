// client-user/src/shared/components/common/ScreenHeader.jsx
// Barra superior roja sólida, calcada de .detail-header/.map-header de
// client-admin (web): botón de regreso opcional, título centrado en blanco,
// y un accesorio a la derecha (badge, menú, botones de acción...).

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, FONT_SIZE } from '../../constants/theme.js';

// Rojo sólido de marca (#d30000) — igual que .detail-header/.map-header/.notifications-header en web.
const HEADER_RED = '#d30000';

export const ScreenHeader = ({ title, onBack, right, subtitle }) => {
  // El rojo se extiende hasta arriba (como Instagram) para que no quede un
  // hueco del color de fondo entre el notch/reloj y el header; el contenido
  // (back, título, acciones) se empuja hacia abajo con el inset superior.
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: SPACING.md + insets.top }]}>
      {onBack ? (
        <Pressable style={styles.iconBtn} onPress={onBack} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={22} color="#ffffff" />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}

      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {right ? <View style={styles.rightWrap}>{right}</View> : <View style={styles.spacer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: HEADER_RED,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  spacer: { width: 40 },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#ffffff', letterSpacing: 0.2 },
  subtitle: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  rightWrap: { alignItems: 'flex-end', justifyContent: 'center' },
});

export default ScreenHeader;
