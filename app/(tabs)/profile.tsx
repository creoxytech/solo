import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { LogOut, Mail, Award } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LevelCard } from '@/components/LevelCard';
import { GradientButton } from '@/components/GradientButton';
import { soloTheme } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Profile</Text>

        <LevelCard
          level={profile.level}
          experience={profile.experience}
          displayName={profile.display_name || user.email?.split('@')[0] || 'Hunter'}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.infoRow}>
            <Mail size={20} color={soloTheme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Award size={20} color={soloTheme.colors.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Hunter Rank</Text>
              <Text style={styles.infoValue}>Level {profile.level}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Solo is inspired by the popular manhwa "Solo Leveling". Track your
            daily habits as quests, earn experience points, and level up your
            life just like Sung Jin-Woo!
          </Text>
          <Text style={styles.aboutText}>
            Every quest you complete brings you closer to becoming the strongest
            version of yourself.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}>
          <LogOut size={20} color={soloTheme.colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>Rise from the shadows</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: soloTheme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: soloTheme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: soloTheme.colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: soloTheme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: soloTheme.colors.text,
    marginBottom: soloTheme.spacing.md,
  },
  section: {
    backgroundColor: soloTheme.colors.surface,
    borderRadius: soloTheme.borderRadius.lg,
    padding: soloTheme.spacing.lg,
    marginBottom: soloTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: soloTheme.colors.text,
    marginBottom: soloTheme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: soloTheme.spacing.md,
    paddingVertical: soloTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: soloTheme.colors.border,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: soloTheme.colors.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: soloTheme.colors.text,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    color: soloTheme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: soloTheme.spacing.sm,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: soloTheme.spacing.sm,
    backgroundColor: soloTheme.colors.surface,
    paddingVertical: soloTheme.spacing.md,
    borderRadius: soloTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: soloTheme.colors.danger,
    marginBottom: soloTheme.spacing.xl,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: soloTheme.colors.danger,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: soloTheme.spacing.xl,
    gap: soloTheme.spacing.xs,
  },
  footerText: {
    fontSize: 12,
    color: soloTheme.colors.textMuted,
  },
});
