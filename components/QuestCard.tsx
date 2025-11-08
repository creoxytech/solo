import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Clock, AlertTriangle, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { soloTheme } from '@/constants/theme';
import { Quest } from '@/services/supabase';

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string) => void;
  onPress: (quest: Quest) => void;
}

const questTypeColors: Record<string, string> = {
  main: '#8b5cf6',
  daily: '#3b82f6',
  penalty: '#ef4444',
  instant: '#10b981',
};

const questTypeLabels: Record<string, string> = {
  main: 'Main Quest',
  daily: 'Daily Quest',
  penalty: 'Penalty Quest',
  instant: 'Instant Quest',
};

const difficultyColors: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
  extreme: '#dc2626',
};

export function QuestCard({ quest, onComplete, onPress }: QuestCardProps) {
  const typeColor = questTypeColors[quest.type];
  const difficultyColor = difficultyColors[quest.difficulty];
  const isActive = quest.status === 'active';
  const isCompleted = quest.status === 'completed';

  const getTimeRemaining = () => {
    if (!quest.expires_at) return null;
    const now = new Date();
    const expires = new Date(quest.expires_at);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)}d remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(quest)}
      style={[styles.container, !isActive && styles.inactiveContainer]}>
      <View style={[styles.card, { borderLeftColor: typeColor }]}>
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeText}>{questTypeLabels[quest.type]}</Text>
          </View>
          {timeRemaining && (
            <View style={styles.timeContainer}>
              <Clock size={14} color={soloTheme.colors.textMuted} />
              <Text style={styles.timeText}>{timeRemaining}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{quest.title}</Text>
          {quest.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {quest.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <View style={styles.rewardsContainer}>
              <View style={styles.reward}>
                <Star size={16} color={soloTheme.colors.gold} />
                <Text style={styles.rewardText}>+{quest.xp_reward} XP</Text>
              </View>
              {quest.stat_points_reward > 0 && (
                <View style={styles.reward}>
                  <AlertTriangle size={16} color={soloTheme.colors.primary} />
                  <Text style={styles.rewardText}>+{quest.stat_points_reward} SP</Text>
                </View>
              )}
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: difficultyColor },
                ]}>
                <Text style={styles.difficultyText}>{quest.difficulty.toUpperCase()}</Text>
              </View>
            </View>

            {isActive && (
              <TouchableOpacity
                onPress={() => onComplete(quest.id)}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={[soloTheme.colors.primary, soloTheme.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.completeButton}>
                  <CheckCircle size={16} color={soloTheme.colors.text} />
                  <Text style={styles.completeText}>Complete</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isCompleted && (
              <View style={styles.completedBadge}>
                <CheckCircle size={16} color={soloTheme.colors.success} />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
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
  inactiveContainer: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: soloTheme.colors.surface,
    borderRadius: soloTheme.borderRadius.lg,
    borderLeftWidth: 4,
    overflow: 'hidden',
    ...soloTheme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: soloTheme.spacing.md,
    paddingBottom: soloTheme.spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: soloTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: soloTheme.borderRadius.sm,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: soloTheme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: soloTheme.colors.textMuted,
  },
  content: {
    padding: soloTheme.spacing.md,
    paddingTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: soloTheme.colors.text,
    marginBottom: soloTheme.spacing.xs,
  },
  description: {
    fontSize: 14,
    color: soloTheme.colors.textSecondary,
    marginBottom: soloTheme.spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: soloTheme.spacing.md,
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: soloTheme.spacing.sm,
    flex: 1,
    flexWrap: 'wrap',
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: soloTheme.colors.background,
    paddingHorizontal: soloTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: soloTheme.borderRadius.sm,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: soloTheme.colors.text,
  },
  difficultyBadge: {
    paddingHorizontal: soloTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: soloTheme.borderRadius.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: soloTheme.colors.text,
    letterSpacing: 0.5,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: soloTheme.spacing.md,
    paddingVertical: soloTheme.spacing.sm,
    borderRadius: soloTheme.borderRadius.sm,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
    color: soloTheme.colors.text,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: soloTheme.spacing.md,
    paddingVertical: soloTheme.spacing.sm,
    borderRadius: soloTheme.borderRadius.sm,
    backgroundColor: soloTheme.colors.background,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: soloTheme.colors.success,
  },
});
