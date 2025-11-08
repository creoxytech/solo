import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { GradientButton } from '@/components/GradientButton';
import { soloTheme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  React.useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  const handleAuth = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        alert('Please fill in all fields');
      }
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Auth error:', error);
      if (Platform.OS === 'web') {
        alert(error.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={soloTheme.colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[soloTheme.colors.background, soloTheme.colors.surface]}
      style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>SOLO</Text>
          <Text style={styles.subtitle}>Level Up Your Life</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={soloTheme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={soloTheme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <GradientButton
            title={isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            onPress={handleAuth}
            disabled={isLoading}
            style={styles.button}
          />

          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text
              style={styles.switchLink}
              onPress={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Start your journey as a Hunter
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: soloTheme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: soloTheme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: soloTheme.spacing.xl * 2,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: soloTheme.colors.text,
    letterSpacing: 4,
    marginBottom: soloTheme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: soloTheme.colors.textSecondary,
    letterSpacing: 1,
  },
  form: {
    gap: soloTheme.spacing.md,
  },
  input: {
    backgroundColor: soloTheme.colors.surface,
    borderRadius: soloTheme.borderRadius.md,
    padding: soloTheme.spacing.md,
    fontSize: 16,
    color: soloTheme.colors.text,
    borderWidth: 1,
    borderColor: soloTheme.colors.border,
  },
  button: {
    marginTop: soloTheme.spacing.md,
  },
  switchText: {
    textAlign: 'center',
    color: soloTheme.colors.textSecondary,
    fontSize: 14,
    marginTop: soloTheme.spacing.md,
  },
  switchLink: {
    color: soloTheme.colors.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: soloTheme.spacing.xl * 2,
  },
  footerText: {
    fontSize: 14,
    color: soloTheme.colors.textMuted,
    fontStyle: 'italic',
  },
});
