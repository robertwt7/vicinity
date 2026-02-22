import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/auth';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginLoading, loginError, register, registerLoading, registerError } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const isLoading = mode === 'login' ? loginLoading : registerLoading;
  const apiError = mode === 'login' ? loginError : registerError;
  const errorMessage = localError ?? apiError?.message ?? null;

  const shake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const pressButton = (cb: () => void) => {
    Animated.sequence([
      Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true, speed: 40 }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    cb();
  };

  const handleSubmit = async () => {
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your email.');
      shake();
      return;
    }
    if (!password.trim()) {
      setLocalError('Please enter your password.');
      shake();
      return;
    }
    if (mode === 'register' && !username.trim()) {
      setLocalError('Please enter a username.');
      shake();
      return;
    }

    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ email: email.trim(), password, username: username.trim() });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      shake();
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setLocalError(null);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoArea}>
            <View style={styles.logoIcon}>
              <MapPin color={Colors.accent} size={28} strokeWidth={2.5} />
            </View>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE INCIDENTS</Text>
            </View>
            <Text style={styles.appName}>Vicinity</Text>
            <Text style={styles.tagline}>Know what's happening around you</Text>
          </View>

          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
                onPress={() => switchMode('login')}
                testID="tab-login"
              >
                <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
                onPress={() => switchMode('register')}
                testID="tab-register"
              >
                <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fields}>
              {mode === 'register' && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>USERNAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. alex_nyc"
                    placeholderTextColor={Colors.textMuted}
                    value={username}
                    onChangeText={(t) => { setUsername(t); setLocalError(null); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="input-username"
                  />
                </View>
              )}

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>EMAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setLocalError(null); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="input-email"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setLocalError(null); }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="input-password"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword((v) => !v)}
                    testID="toggle-password-visibility"
                  >
                    {showPassword
                      ? <EyeOff color={Colors.textMuted} size={18} strokeWidth={2} />
                      : <Eye color={Colors.textMuted} size={18} strokeWidth={2} />
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {errorMessage ? (
              <View style={styles.errorBox} testID="error-message">
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={() => pressButton(handleSubmit)}
                disabled={isLoading}
                activeOpacity={0.88}
                testID="submit-auth"
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.bg} size="small" />
                ) : (
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {mode === 'login' && (
              <TouchableOpacity style={styles.forgotBtn} testID="forgot-password">
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing you agree to our{' '}
              <Text style={styles.footerLink}>Terms</Text>
              {' '}and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 36,
    paddingTop: 20,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  liveLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 2,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSub,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: Colors.border,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  modeTabTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  fields: {
    gap: 16,
    marginBottom: 20,
  },
  fieldWrap: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: '#FF404015',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF404040',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#FF8080',
    fontWeight: '500',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.bg,
    letterSpacing: -0.3,
  },
  forgotBtn: {
    alignItems: 'center',
    paddingTop: 16,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.textSub,
    fontWeight: '500',
  },
  footer: {
    paddingTop: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: Colors.textSub,
    fontWeight: '600',
  },
});
