import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity, Heart, Zap, Sword, Wind, Brain, Eye, Shield, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { soloTheme } from '@/constants/theme';
import { User } from '@/services/supabase';

interface StatsCardProps {
  profile: User;
  onStatPress?: (stat: string) => void;
}

const statIcons: Record<string, any> = {
  hp: Heart,
  mp: Zap,
  strength: Sword,
  agility: Wind,
  intelligence: Brain,
  sense: Eye,
  vitality: Shield,
  luck: Sparkles,
};

const statColors: Record<string, string> = {
  hp: '#ef4444',
  mp: '#3b82f6',
  strength: '#f59e0b',
  agility: '#10b981',
  intelligence: '#8b5cf6',
  sense: '#06b6d4',
  vitality: '#ec4899',
  luck: '#fbbf24',
};

export function StatsCard({ profile, onStatPress }: StatsCardProps) {
  const renderStat = (name: string, label: string, value: number, maxValue?: number) => {
    const Icon = statIcons[name];
    const color = statColors[name];

    return (
      <TouchableOpacity
        key={name}
        style={styles.statRow}
        onPress={() => onStatPress?.(name)}
        activeOpacity={0.7}>
        <View style={styles.statIcon}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>{label}</Text>
          {maxValue ? (
            <View style={styles.statBarContainer}>
              <View style={styles.statBar}>
                <View
                  style={[
                    styles.statBarFill,
                    { width: `${(value / maxValue) * 100}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.statValue}>
                {value} / {maxValue}
              </Text>
            </View>
          ) : (
            <Text style={styles.statValue}>{value}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.header}>
        <Activity size={24} color={soloTheme.colors.primary} />
        <Text style={styles.headerTitle}>Status Window</Text>
        {profile.stat_points > 0 && (
          <View style={styles.statPointsBadge}>
            <Text style={styles.statPointsText}>{profile.stat_points} Points</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.statsContainer}>
        {renderStat('hp', 'HP', profile.hp, profile.max_hp)}
        {renderStat('mp', 'MP', profile.mp, profile.max_mp)}
        {renderStat('strength', 'Strength', profile.strength)}
        {renderStat('agility', 'Agility', profile.agility)}
        {renderStat('intelligence', 'Intelligence', profile.intelligence)}
        {renderStat('sense', 'Sense', profile.sense)}
        {renderStat('vitality', 'Vitality', profile.vitality)}
        {renderStat('luck', 'Luck', profile.luck)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: soloTheme.colors.surface,
    borderRadius: soloTheme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: soloTheme.spacing.md,
    ...soloTheme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: soloTheme.spacing.sm,
    padding: soloTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: soloTheme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: soloTheme.colors.text,
    flex: 1,
  },
  statPointsBadge: {
    backgroundColor: soloTheme.colors.primary,
    paddingHorizontal: soloTheme.spacing.md,
    paddingVertical: soloTheme.spacing.xs,
    borderRadius: soloTheme.borderRadius.sm,
  },
  statPointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: soloTheme.colors.text,
  },
  statsContainer: {
    padding: soloTheme.spacing.md,
    gap: soloTheme.spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: soloTheme.spacing.md,
    backgroundColor: soloTheme.colors.background,
    padding: soloTheme.spacing.md,
    borderRadius: soloTheme.borderRadius.md,
  },
  statIcon: {
    width: 36,
    height: 36,
    backgroundColor: soloTheme.colors.surfaceLight,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: soloTheme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: soloTheme.colors.text,
  },
  statBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: soloTheme.spacing.sm,
  },
  statBar: {
    flex: 1,
    height: 8,
    backgroundColor: soloTheme.colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
