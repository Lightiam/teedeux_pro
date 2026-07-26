import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../AuthContext';
import { colors, radius } from '../theme';

type Mode = 'login' | 'signup';

export const SignInScreen: React.FC = () => {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);

    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await signup(name.trim(), email.trim(), password);
      // The navigator swaps as soon as auth state flips — nothing to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Text style={styles.logoText}>T</Text>
          </View>

          <Text style={styles.title}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to pick up where you left off.'
              : 'Authentic African groceries, delivered nationwide.'}
          </Text>

          {error && (
            <View style={styles.error} accessibilityRole="alert">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {mode === 'signup' && (
            <Field label="Full name" value={name} onChange={setName} autoCapitalize="words" />
          )}

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Pressable
            onPress={submit}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cta, (pressed || busy) && { opacity: 0.75 }]}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            accessibilityRole="button"
            style={styles.switch}
          >
            <Text style={styles.switchText}>
              {mode === 'login'
                ? 'New to Teedeux Mart? Create an account'
                : 'Already have an account? Sign in'}
            </Text>
          </Pressable>

          {mode === 'login' && (
            <View style={styles.demo}>
              <Text style={styles.demoLabel}>DEMO ACCOUNT</Text>
              <Text style={styles.demoValue}>marcus.vance@example.com</Text>
              <Text style={styles.demoValue}>teedeux1234</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  autoComplete?: 'email';
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, ...rest }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      style={styles.input}
      placeholderTextColor={colors.muted}
      {...rest}
    />
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 32, paddingBottom: 40 },

  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { color: '#fff', fontSize: 26, fontWeight: '800' },

  title: { fontSize: 24, fontWeight: '800', color: colors.onSurface },
  subtitle: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4, marginBottom: 24 },

  error: {
    backgroundColor: '#ffdad6',
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: { color: '#93000a', fontSize: 12, fontWeight: '600' },

  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, marginBottom: 6 },
  input: {
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.onSurface,
  },

  cta: {
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  switch: { paddingVertical: 16, alignItems: 'center' },
  switchText: { fontSize: 13, color: colors.primary, fontWeight: '700' },

  demo: {
    marginTop: 8,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.lg,
    padding: 14,
  },
  demoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.onSurfaceVariant,
  },
  demoValue: { fontSize: 12, color: colors.onSurface, marginTop: 4 },
});
