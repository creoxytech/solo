import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { soloTheme, getXpForNextLevel } from '@/constants/theme';

interface LevelCardProps {
  level: number;
  experience: number;
  displayName: string;
}

export function LevelCard({ level, experience, displayName }: LevelCardProps) {
  const nextLevelXp = getXpForNextLevel(level);
  const progress = (experience / nextLevelXp) * 100;

  return (
    <LinearGradient
      colors={[soloTheme.colors.primary, soloTheme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{displayName || 'Hunter'}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LV {level}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.xpText}>
          {experience} / {nextLevelXp} XP
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: soloTheme.borderRadius.lg,
    padding: soloTheme.spacing.lg,
    marginBottom: soloTheme.spacing.md,
    ...soloTheme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: soloTheme.spacing.md,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: soloTheme.colors.text,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: soloTheme.spacing.md,
    paddingVertical: soloTheme.spacing.xs,
    borderRadius: soloTheme.borderRadius.sm,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: soloTheme.colors.text,
  },
  progressContainer: {
    gap: soloTheme.spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: soloTheme.colors.gold,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
});
