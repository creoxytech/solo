import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { soloTheme } from '@/constants/theme';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function GradientButton({
  onPress,
  title,
  style,
  textStyle,
  disabled = false,
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.container, style]}>
      <LinearGradient
        colors={
          disabled
            ? ['#4b5563', '#374151']
            : [soloTheme.colors.primary, soloTheme.colors.secondary]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: soloTheme.borderRadius.md,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: soloTheme.spacing.md,
    paddingHorizontal: soloTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: soloTheme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
