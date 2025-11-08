export const soloTheme = {
  colors: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceLight: '#2a2a2a',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
    gold: '#fbbf24',
    danger: '#ef4444',
    success: '#10b981',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    border: '#374151',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
    },
  },
};

export const difficultyConfig = {
  easy: {
    xp: 10,
    color: '#10b981',
    label: 'Easy Quest',
  },
  medium: {
    xp: 25,
    color: '#f59e0b',
    label: 'Medium Quest',
  },
  hard: {
    xp: 50,
    color: '#ef4444',
    label: 'Hard Quest',
  },
};

export const levelThresholds = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200,
  5950, 6750, 7600, 8500, 9450, 10450,
];

export function calculateLevel(xp: number): number {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (xp >= levelThresholds[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getXpForNextLevel(currentLevel: number): number {
  if (currentLevel >= levelThresholds.length) {
    return levelThresholds[levelThresholds.length - 1] + 1000;
  }
  return levelThresholds[currentLevel];
}
