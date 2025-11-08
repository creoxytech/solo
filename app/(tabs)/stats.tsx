import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Minus, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import { StatsCard } from '@/components/StatsCard';
import { GradientButton } from '@/components/GradientButton';
import { soloTheme } from '@/constants/theme';

const statLabels: Record<string, string> = {
  strength: 'Strength',
  agility: 'Agility',
  intelligence: 'Intelligence',
  sense: 'Sense',
  vitality: 'Vitality',
  luck: 'Luck',
};

const statDescriptions: Record<string, string> = {
  strength: 'Increases physical damage and carrying capacity',
  agility: 'Improves speed, reflexes, and evasion',
  intelligence: 'Enhances magical power and mana pool',
  sense: 'Sharpens perception and critical hit chance',
  vitality: 'Boosts health points and stamina',
  luck: 'Affects drop rates and critical outcomes',
};

export default function StatsScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [pointsToAllocate, setPointsToAllocate] = useState(0);

  const handleStatPress = (stat: string) => {
    if (stat === 'hp' || stat === 'mp') return;
    if (!profile || profile.stat_points === 0) return;

    setSelectedStat(stat);
    setPointsToAllocate(0);
    setModalVisible(true);
  };

  const allocatePoints = async () => {
    if (!user || !profile || !selectedStat || pointsToAllocate === 0) return;

    try {
      const oldValue = profile[selectedStat as keyof typeof profile] as number;
      const newValue = oldValue + pointsToAllocate;
      const newStatPoints = profile.stat_points - pointsToAllocate;

      let updates: any = {
        [selectedStat]: newValue,
        stat_points: newStatPoints,
        updated_at: new Date().toISOString(),
      };

      if (selectedStat === 'vitality') {
        const hpIncrease = pointsToAllocate * 10;
        updates.max_hp = profile.max_hp + hpIncrease;
        updates.hp = profile.hp + hpIncrease;
      } else if (selectedStat === 'intelligence') {
        const mpIncrease = pointsToAllocate * 5;
        updates.max_mp = profile.max_mp + mpIncrease;
        updates.mp = profile.mp + mpIncrease;
      }

      await Promise.all([
        supabase
          .from('users')
          .update(updates)
          .eq('id', user.uid),
        supabase.from('stat_history').insert({
          user_id: user.uid,
          stat_name: selectedStat,
          old_value: oldValue,
          new_value: newValue,
          change_reason: 'manual_allocation',
        }),
      ]);

      await refreshProfile();

      setModalVisible(false);
      setSelectedStat(null);
      setPointsToAllocate(0);

      if (Platform.OS === 'web') {
        alert('Stats updated successfully!');
      }
    } catch (error) {
      console.error('Error allocating stat points:', error);
      if (Platform.OS === 'web') {
        alert('Failed to allocate stat points');
      }
    }
  };

  if (!user || !profile) {
    router.replace('/');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Status Window</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your character's attributes and stats. Level up and complete quests to
            earn stat points that can be allocated to improve your abilities.
          </Text>
        </View>

        <StatsCard profile={profile} onStatPress={handleStatPress} />

        {profile.stat_points > 0 && (
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>You have unallocated stat points!</Text>
            <Text style={styles.tipText}>
              Tap on any stat (except HP/MP) to allocate your {profile.stat_points}{' '}
              available point{profile.stat_points !== 1 ? 's' : ''}.
            </Text>
          </View>
        )}

        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Stat Effects</Text>
          {Object.entries(statDescriptions).map(([stat, description]) => (
            <View key={stat} style={styles.legendItem}>
              <Text style={styles.legendStat}>{statLabels[stat]}</Text>
              <Text style={styles.legendDescription}>{description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Allocate Points to {selectedStat && statLabels[selectedStat]}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={soloTheme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedStat && (
              <>
                <Text style={styles.modalDescription}>
                  {statDescriptions[selectedStat]}
                </Text>

                <View style={styles.allocationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.allocationButton,
                      pointsToAllocate === 0 && styles.allocationButtonDisabled,
                    ]}
                    onPress={() =>
                      setPointsToAllocate(Math.max(0, pointsToAllocate - 1))
                    }
                    disabled={pointsToAllocate === 0}>
                    <Minus size={24} color={soloTheme.colors.text} />
                  </TouchableOpacity>

                  <View style={styles.allocationDisplay}>
                    <Text style={styles.allocationValue}>+{pointsToAllocate}</Text>
                    <Text style={styles.allocationLabel}>points</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.allocationButton,
                      profile &&
                        pointsToAllocate >= profile.stat_points &&
                        styles.allocationButtonDisabled,
                    ]}
                    onPress={() =>
                      profile &&
                      setPointsToAllocate(
                        Math.min(profile.stat_points, pointsToAllocate + 1)
                      )
                    }
                    disabled={profile && pointsToAllocate >= profile.stat_points}>
                    <Plus size={24} color={soloTheme.colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.statsPreview}>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Current:</Text>
                    <Text style={styles.previewValue}>
                      {profile && profile[selectedStat as keyof typeof profile]}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>After allocation:</Text>
                    <Text style={styles.previewValueNew}>
                      {profile &&
                        (profile[selectedStat as keyof typeof profile] as number) +
                          pointsToAllocate}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Remaining points:</Text>
                    <Text style={styles.previewValue}>
                      {profile && profile.stat_points - pointsToAllocate}
                    </Text>
                  </View>
                </View>

                <GradientButton
                  title="Confirm Allocation"
                  onPress={allocatePoints}
                  disabled={pointsToAllocate === 0}
                  style={styles.confirmButton}
                />
              </>
            )}
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
  infoBox: {
    backgroundColor: soloTheme.colors.surface,
    padding: soloTheme.spacing.md,
    borderRadius: soloTheme.borderRadius.lg,
    marginBottom: soloTheme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: soloTheme.colors.textSecondary,
    lineHeight: 20,
  },
  tipBox: {
    backgroundColor: soloTheme.colors.primary,
    padding: soloTheme.spacing.md,
    borderRadius: soloTheme.borderRadius.lg,
    marginBottom: soloTheme.spacing.md,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: soloTheme.colors.text,
    marginBottom: soloTheme.spacing.xs,
  },
  tipText: {
    fontSize: 14,
    color: soloTheme.colors.text,
    lineHeight: 20,
  },
  legendContainer: {
    backgroundColor: soloTheme.colors.surface,
    padding: soloTheme.spacing.md,
    borderRadius: soloTheme.borderRadius.lg,
    marginBottom: soloTheme.spacing.xl,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: soloTheme.colors.text,
    marginBottom: soloTheme.spacing.md,
  },
  legendItem: {
    marginBottom: soloTheme.spacing.md,
  },
  legendStat: {
    fontSize: 14,
    fontWeight: '600',
    color: soloTheme.colors.primary,
    marginBottom: 4,
  },
  legendDescription: {
    fontSize: 13,
    color: soloTheme.colors.textSecondary,
    lineHeight: 18,
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
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: soloTheme.spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: soloTheme.colors.text,
    flex: 1,
  },
  modalDescription: {
    fontSize: 14,
    color: soloTheme.colors.textSecondary,
    marginBottom: soloTheme.spacing.lg,
    lineHeight: 20,
  },
  allocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: soloTheme.spacing.lg,
    marginBottom: soloTheme.spacing.lg,
  },
  allocationButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: soloTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allocationButtonDisabled: {
    backgroundColor: soloTheme.colors.surfaceLight,
    opacity: 0.5,
  },
  allocationDisplay: {
    alignItems: 'center',
    minWidth: 100,
  },
  allocationValue: {
    fontSize: 36,
    fontWeight: '700',
    color: soloTheme.colors.text,
  },
  allocationLabel: {
    fontSize: 14,
    color: soloTheme.colors.textMuted,
  },
  statsPreview: {
    backgroundColor: soloTheme.colors.background,
    padding: soloTheme.spacing.md,
    borderRadius: soloTheme.borderRadius.md,
    marginBottom: soloTheme.spacing.lg,
    gap: soloTheme.spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: soloTheme.colors.textSecondary,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: soloTheme.colors.text,
  },
  previewValueNew: {
    fontSize: 16,
    fontWeight: '600',
    color: soloTheme.colors.primary,
  },
  confirmButton: {
    marginTop: soloTheme.spacing.md,
  },
});
