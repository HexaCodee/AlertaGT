// client-user/src/features/reports/components/StarRating.jsx
// Estrellas de calificación. Interactivas (onRate) o solo lectura (readOnly).

import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';

export const StarRating = ({ value = 0, onRate, readOnly = false, size = 28 }) => {
  const { colors: COLORS } = useTheme();
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          disabled={readOnly}
          onPress={() => onRate?.(star)}
          hitSlop={4}
        >
          <MaterialIcons
            name={star <= value ? 'star' : 'star-border'}
            size={size}
            color={star <= value ? COLORS.warning : COLORS.border}
          />
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
});

export default StarRating;
