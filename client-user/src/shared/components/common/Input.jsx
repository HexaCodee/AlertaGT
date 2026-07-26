// client-user/src/shared/components/common/Input.jsx
// Campo de texto reutilizable con etiqueta y mensaje de error.

import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '../../constants/theme.js';
import { useTheme } from '../../context/ThemeContext.jsx';

export const Input = ({
  label,
  error,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  style,
}) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          style={[
            styles.input,
            secureTextEntry && styles.inputWithToggle,
            multiline && styles.multiline,
            focused && styles.inputFocused,
            error && styles.inputError,
          ]}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setVisible((prev) => !prev)}
            style={styles.toggleBtn}
            hitSlop={8}
          >
            <MaterialIcons
              name={visible ? 'visibility-off' : 'visibility'}
              size={20}
              color={COLORS.textLight}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputWithToggle: {
    paddingRight: SPACING.xl + SPACING.sm,
  },
  toggleBtn: {
    position: 'absolute',
    right: SPACING.md,
    padding: SPACING.xs,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
  },
});

export default Input;
