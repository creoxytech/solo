import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { soloTheme, difficultyConfig } from '@/constants/theme';
import { Habit } from '@/services/supabase';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onPress: (habit: Habit) => void;
}

export function HabitCard({ habit, onComplete, onPress }: HabitCardProps) {
  const difficulty = difficultyConfig[habit.difficulty];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(habit)}
      style={styles.container}>
      <View style={[styles.card, { borderLeftColor: habit.color }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Target size={20} color={habit.color} />
              <Text style={styles.title}>{habit.title}</Text>
            </View>
            <View style={styles.streakContainer}>
              <Flame size={16} color={soloTheme.colors.gold} />
              <Text style={styles.streak}>{habit.streak}</Text>
            </View>
          </View>

          {habit.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {habit.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: difficulty.color },
              ]}>
              <Text style={styles.difficultyText}>{difficulty.label}</Text>
              <Text style={styles.xpText}>+{difficulty.xp} XP</Text>
            </View>

            <TouchableOpacity
              onPress={() => onComplete(habit.id)}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[soloTheme.colors.primary, soloTheme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.completeButton}>
                <Text style={styles.completeText}>Complete</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: soloTheme.spacing.md,
  },
  card: {
    backgroundColor: soloTheme.colors.surface,
    borderRadius: soloTheme.borderRadius.lg,
    borderLeftWidth: 4,
    ...soloTheme.shadows.sm,
  },
  content: {
    padding: soloTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: soloTheme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: soloTheme.spacing.sm,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: soloTheme.colors.text,
    flex: 1,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: soloTheme.colors.surfaceLight,
    paddingHorizontal: soloTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: soloTheme.borderRadius.sm,
  },
  streak: {
    fontSize: 14,
    fontWeight: '700',
    color: soloTheme.colors.gold,
  },
  description: {
    fontSize: 14,
    color: soloTheme.colors.textSecondary,
    marginBottom: soloTheme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: soloTheme.spacing.md,
    paddingVertical: soloTheme.spacing.xs,
    borderRadius: soloTheme.borderRadius.sm,
    flexDirection: 'row',
    gap: soloTheme.spacing.xs,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: soloTheme.colors.text,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: soloTheme.colors.text,
  },
  completeButton: {
    paddingHorizontal: soloTheme.spacing.lg,
    paddingVertical: soloTheme.spacing.sm,
    borderRadius: soloTheme.borderRadius.sm,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
    color: soloTheme.colors.text,
  },
});
