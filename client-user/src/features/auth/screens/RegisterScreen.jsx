// client-user/src/features/auth/screens/RegisterScreen.jsx
// Pantalla de registro. Tras crear la cuenta, el usuario debe verificar su email
// antes de poder iniciar sesión (mismo flujo que la app web).

import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../shared/components/common/Button.jsx';
import { Input } from '../../../shared/components/common/Input.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { showAlert } from '../../../shared/utils/alert.js';
import { useTheme } from '../../../shared/context/ThemeContext.jsx';
import { SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterScreen = ({ navigation }) => {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const insets = useSafeAreaInsets();
  const { handleRegister, loading, error } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      city: 'Guatemala',
      address: '',
      country: 'Guatemala',
    },
  });

  const onSubmit = async (values) => {
    const result = await handleRegister(values);
    if (result.success) {
      showAlert(
        'Cuenta creada',
        'Te enviamos un correo para verificar tu cuenta. Verifica tu email antes de iniciar sesión.',
        () => navigation.navigate('Login')
      );
    }
  };

  const renderField = (name, label, rules, options = {}) => (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <Input
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={errors[name]?.message}
          {...options}
        />
      )}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: SPACING.md + insets.top, paddingBottom: insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a la comunidad de AlertaGT</Text>

        {renderField('name', 'Nombre', { required: 'El nombre es obligatorio' }, {
          placeholder: 'Juan',
          autoCapitalize: 'words',
        })}
        {renderField('surname', 'Apellido', { required: 'El apellido es obligatorio' }, {
          placeholder: 'Pérez',
          autoCapitalize: 'words',
        })}
        {renderField('username', 'Nombre de usuario', { required: 'El usuario es obligatorio' }, {
          placeholder: 'juanperez',
        })}
        {renderField(
          'email',
          'Correo electrónico',
          {
            required: 'El correo es obligatorio',
            pattern: { value: EMAIL_REGEX, message: 'Correo no válido' },
          },
          { placeholder: 'correo@ejemplo.com', keyboardType: 'email-address' }
        )}
        {renderField(
          'password',
          'Contraseña',
          {
            required: 'La contraseña es obligatoria',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          },
          { placeholder: 'Mínimo 8 caracteres', secureTextEntry: true }
        )}
        {renderField(
          'phone',
          'Teléfono',
          {
            required: 'El teléfono es obligatorio',
            pattern: { value: /^\d{8}$/, message: 'Debe tener 8 dígitos' },
          },
          { placeholder: '55551234', keyboardType: 'phone-pad' }
        )}
        {renderField('address', 'Dirección', { required: 'La dirección es obligatoria' }, {
          placeholder: 'Zona 10, Ciudad de Guatemala',
        })}

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <Button
          title="Crear cuenta"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submit}
        />

        <Text style={styles.terms}>
          Al crear una cuenta, aceptas nuestros{' '}
          <Text style={styles.termsLink} onPress={() => navigation.navigate('Terms')}>
            Términos de Servicio
          </Text>{' '}
          y{' '}
          <Text style={styles.termsLink} onPress={() => navigation.navigate('Privacy')}>
            Política de Privacidad
          </Text>
          .
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}> Inicia sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (COLORS) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
  },
  errorBanner: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  submit: {
    marginTop: SPACING.sm,
  },
  terms: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
  },
  link: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
});

export default RegisterScreen;
