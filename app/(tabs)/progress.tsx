import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Trophy, Flame, Target, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Habit, HabitCompletion } from '@/services/supabase';
import { soloTheme } from '@/constants/theme';

export default function ProgressScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompletions: 0,
    totalHabits: 0,
    longestStreak: 0,
    thisWeekCompletions: 0,
  });

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [habitsResult, completionsResult] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', user.uid),
        supabase.from('habit_completions').select('*').eq('user_id', user.uid),
      ]);

      const habits: Habit[] = habitsResult.data || [];
      const completions: HabitCompletion[] = completionsResult.data || [];

      const longestStreak = habits.reduce(
        (max, habit) => Math.max(max, habit.best_streak),
        0
      );

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const thisWeekCompletions = completions.filter(
        (c) => new Date(c.completed_at) >= oneWeekAgo
      ).length;

      setStats({
        totalCompletions: completions.length,
        totalHabits: habits.length,
        longestStreak,
        thisWeekCompletions,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Progress</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: soloTheme.colors.primary }]}>
            <View style={styles.statIcon}>
              <Target size={24} color={soloTheme.colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalHabits}</Text>
            <Text style={styles.statLabel}>Total Quests</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: soloTheme.colors.success }]}>
            <View style={styles.statIcon}>
              <Trophy size={24} color={soloTheme.colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.totalCompletions}</Text>
            <Text style={styles.statLabel}>Completions</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: soloTheme.colors.gold }]}>
            <View style={styles.statIcon}>
              <Flame size={24} color={soloTheme.colors.gold} />
            </View>
            <Text style={styles.statValue}>{stats.longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: soloTheme.colors.secondary }]}>
            <View style={styles.statIcon}>
              <Calendar size={24} color={soloTheme.colors.secondary} />
            </View>
            <Text style={styles.statValue}>{stats.thisWeekCompletions}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement System</Text>
          <Text style={styles.sectionText}>
            Complete quests to earn experience points and level up. The
            difficulty of each quest determines how much XP you earn:
          </Text>
          <View style={styles.xpList}>
            <View style={styles.xpItem}>
              <View
                style={[styles.xpDot, { backgroundColor: soloTheme.colors.success }]}
              />
              <Text style={styles.xpText}>Easy Quests: +10 XP</Text>
            </View>
            <View style={styles.xpItem}>
              <View
                style={[styles.xpDot, { backgroundColor: '#f59e0b' }]}
              />
              <Text style={styles.xpText}>Medium Quests: +25 XP</Text>
            </View>
            <View style={styles.xpItem}>
              <View
                style={[styles.xpDot, { backgroundColor: soloTheme.colors.danger }]}
              />
              <Text style={styles.xpText}>Hard Quests: +50 XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keep Your Streak</Text>
          <Text style={styles.sectionText}>
            Build consistency by completing your quests daily. Your streak
            increases each day you complete a quest, helping you form lasting
            habits.
          </Text>
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
  content: {
    flex: 1,
    padding: soloTheme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: soloTheme.colors.text,
    marginBottom: soloTheme.spacing.lg,
  },
  statsGrid: {
    gap: soloTheme.spacing.md,
    marginBottom: soloTheme.spacing.xl,
  },
  statCard: {
    backgroundColor: soloTheme.colors.surface,
    borderRadius: soloTheme.borderRadius.lg,
    padding: soloTheme.spacing.lg,
    borderLeftWidth: 4,
    ...soloTheme.shadows.sm,
  },
  statIcon: {
    marginBottom: soloTheme.spacing.sm,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: soloTheme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: soloTheme.colors.textSecondary,
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
    marginBottom: soloTheme.spacing.sm,
  },
  sectionText: {
    fontSize: 14,
    color: soloTheme.colors.textSecondary,
    lineHeight: 20,
  },
  xpList: {
    marginTop: soloTheme.spacing.md,
    gap: soloTheme.spacing.sm,
  },
  xpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: soloTheme.spacing.sm,
  },
  xpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 14,
    color: soloTheme.colors.text,
  },
});
