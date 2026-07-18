// client-user/src/features/notifications/screens/NotificationDetailScreen.jsx
// Detalle de una notificación + acceso a la alerta relacionada (si aplica).

import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, LoadingSpinner } from '../../../shared/components/common/Common.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';

export const NotificationDetailScreen = ({ route, navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const insets = useSafeAreaInsets();
  const { notification } = route.params || {};

  if (!notification) return <LoadingSpinner message="Cargando notificación..." />;

  // El postId puede venir en el nivel raíz o dentro de data.
  const postId = notification.postId || notification.data?.postId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: SPACING.md + insets.top }]}>
      <Card>
        <Text style={styles.type}>{notification.type}</Text>
        <Text style={styles.title}>{notification.title}</Text>
        {notification.body ? <Text style={styles.body}>{notification.body}</Text> : null}
        {notification.createdAt ? (
          <Text style={styles.date}>
            {new Date(notification.createdAt).toLocaleString('es-GT')}
          </Text>
        ) : null}
      </Card>

      {postId ? (
        <Button
          title="Ver alerta relacionada"
          onPress={() =>
            navigation.navigate('Alerts', { screen: 'AlertDetail', params: { id: postId } })
          }
        />
      ) : null}
    </ScrollView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  type: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  title: { marginTop: SPACING.xs, fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.text },
  body: { marginTop: SPACING.sm, fontSize: FONT_SIZE.md, color: COLORS.text, lineHeight: 22 },
  date: { marginTop: SPACING.md, fontSize: FONT_SIZE.xs, color: COLORS.textLight },
});

export default NotificationDetailScreen;
