import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Habit } from '@/services/supabase';
import { LevelCard } from '@/components/LevelCard';
import { HabitCard } from '@/components/HabitCard';
import { GradientButton } from '@/components/GradientButton';
import { soloTheme, difficultyConfig, calculateLevel } from '@/constants/theme';

export default function QuestsScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }
    fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async () => {
    if (!user || !newHabit.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.uid,
          title: newHabit.title,
          description: newHabit.description,
          difficulty: newHabit.difficulty,
        })
        .select()
        .single();

      if (error) throw error;

      setHabits([data, ...habits]);
      setModalVisible(false);
      setNewHabit({ title: '', description: '', difficulty: 'medium' });
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const completeHabit = async (habitId: string) => {
    if (!user || !profile) return;

    try {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const xpEarned = difficultyConfig[habit.difficulty].xp;
      const newXp = profile.experience + xpEarned;
      const oldLevel = profile.level;
      const newLevel = calculateLevel(newXp);
      const leveledUp = newLevel > oldLevel;
      const statPointsEarned = leveledUp ? (newLevel - oldLevel) * 3 : 0;

      const today = new Date().toISOString().split('T')[0];
      const { data: lastCompletion } = await supabase
        .from('habit_completions')
        .select('completed_at')
        .eq('habit_id', habitId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastCompletionDate = lastCompletion
        ? new Date(lastCompletion.completed_at).toISOString().split('T')[0]
        : null;

      let newStreak = habit.streak;
      if (lastCompletionDate !== today) {
        newStreak = habit.streak + 1;
      }

      const newBestStreak = Math.max(newStreak, habit.best_streak);

      const userUpdates: any = {
        experience: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      };

      if (statPointsEarned > 0) {
        userUpdates.stat_points = profile.stat_points + statPointsEarned;
      }

      await Promise.all([
        supabase.from('habit_completions').insert({
          habit_id: habitId,
          user_id: user.uid,
          xp_earned: xpEarned,
        }),
        supabase
          .from('habits')
          .update({
            streak: newStreak,
            best_streak: newBestStreak,
            updated_at: new Date().toISOString(),
          })
          .eq('id', habitId),
        supabase.from('users').update(userUpdates).eq('id', user.uid),
      ]);

      await refreshProfile();
      fetchHabits();
    } catch (error) {
      console.error('Error completing habit:', error);
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
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Daily Quests</Text>

        {profile && (
          <LevelCard
            level={profile.level}
            experience={profile.experience}
            displayName={profile.display_name}
          />
        )}

        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              onComplete={completeHabit}
              onPress={() => {}}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No quests yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first quest to start leveling up!
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}>
          <Plus size={24} color={soloTheme.colors.text} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Quest</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={soloTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Quest Name"
              placeholderTextColor={soloTheme.colors.textMuted}
              value={newHabit.title}
              onChangeText={(text) =>
                setNewHabit({ ...newHabit, title: text })
              }
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor={soloTheme.colors.textMuted}
              value={newHabit.description}
              onChangeText={(text) =>
                setNewHabit({ ...newHabit, description: text })
              }
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.difficultyContainer}>
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.difficultyButton,
                    newHabit.difficulty === diff &&
                      styles.difficultyButtonActive,
                    {
                      borderColor: difficultyConfig[diff].color,
                      backgroundColor:
                        newHabit.difficulty === diff
                          ? difficultyConfig[diff].color
                          : 'transparent',
                    },
                  ]}
                  onPress={() => setNewHabit({ ...newHabit, difficulty: diff })}>
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      newHabit.difficulty === diff &&
                        styles.difficultyButtonTextActive,
                    ]}>
                    {difficultyConfig[diff].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <GradientButton
              title="Create Quest"
              onPress={createHabit}
              disabled={!newHabit.title.trim()}
              style={styles.createButton}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: soloTheme.spacing.md,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: soloTheme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: soloTheme.colors.textSecondary,
    marginBottom: soloTheme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: soloTheme.colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: soloTheme.spacing.lg,
    right: soloTheme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: soloTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...soloTheme.shadows.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: soloTheme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: soloTheme.colors.surface,
    borderTopLeftRadius: soloTheme.borderRadius.xl,
    borderTopRightRadius: soloTheme.borderRadius.xl,
    padding: soloTheme.spacing.lg,
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: soloTheme.spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: soloTheme.colors.text,
  },
  input: {
    backgroundColor: soloTheme.colors.background,
    borderRadius: soloTheme.borderRadius.md,
    padding: soloTheme.spacing.md,
    fontSize: 16,
    color: soloTheme.colors.text,
    marginBottom: soloTheme.spacing.md,
    borderWidth: 1,
    borderColor: soloTheme.colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: soloTheme.colors.text,
    marginBottom: soloTheme.spacing.sm,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: soloTheme.spacing.sm,
    marginBottom: soloTheme.spacing.lg,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: soloTheme.spacing.md,
    borderRadius: soloTheme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    borderWidth: 2,
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: soloTheme.colors.textSecondary,
  },
  difficultyButtonTextActive: {
    color: soloTheme.colors.text,
  },
  createButton: {
    marginTop: soloTheme.spacing.md,
  },
});
