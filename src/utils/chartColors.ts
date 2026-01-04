// Centralized chart color palettes for light and dark modes

export interface ChartColors {
  primary: string[];
  secondary: string[];
  infrastructure: {
    gridLines: string;
    axes: string;
    text: string;
    zeroLine: string;
    accent: string;
  };
}

// Light mode chart colors
const LIGHT_MODE_COLORS: ChartColors = {
  primary: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
  secondary: ['#1a2f3a', '#1d6d63', '#a68a48', '#ab7143', '#a34e38'],
  infrastructure: {
    gridLines: '#e5e7eb',
    axes: '#6b7280',
    text: '#374151',
    zeroLine: '#6b7280',
    accent: '#2563eb',
  },
};

// Dark mode chart colors (optimized for dark backgrounds)
const DARK_MODE_COLORS: ChartColors = {
  primary: ['#3d7a8a', '#4dc4b5', '#ffd97d', '#ffb57a', '#ff8f7a'],
  secondary: ['#4d8da0', '#52d9c9', '#c9a961', '#c98c5e', '#c9695d'],
  infrastructure: {
    gridLines: '#374151',
    axes: '#9ca3af',
    text: '#d1d5db',
    zeroLine: '#9ca3af',
    accent: '#60a5fa',
  },
};

/**
 * Get chart colors for the current theme
 * @param isDarkMode - Whether dark mode is active
 * @returns ChartColors object with primary, secondary, and infrastructure colors
 */
export const getChartColors = (isDarkMode: boolean): ChartColors => {
  return isDarkMode ? DARK_MODE_COLORS : LIGHT_MODE_COLORS;
};

/**
 * Get a color from the chart palette by index
 * @param index - Index of the color to retrieve
 * @param isDarkMode - Whether dark mode is active
 * @param useSecondary - Whether to use secondary palette colors
 * @returns Hex color string
 */
export const getChartColorByIndex = (
  index: number,
  isDarkMode: boolean,
  useSecondary: boolean = false
): string => {
  const colors = getChartColors(isDarkMode);
  const palette = useSecondary ? colors.secondary : colors.primary;
  return palette[index % palette.length];
};

/**
 * Get combined primary and secondary palettes for category differentiation
 * @param isDarkMode - Whether dark mode is active
 * @returns Array of 10 colors (5 primary + 5 secondary)
 */
export const getCombinedChartPalette = (isDarkMode: boolean): string[] => {
  const colors = getChartColors(isDarkMode);
  return [...colors.primary, ...colors.secondary];
};

/**
 * Get color for error frequency visualization
 * Generates gradient colors based on percentage: green (0%) → yellow (25%) → orange (50%) → red (100%)
 * @param freq - Frequency percentage (0-100)
 * @param isDarkMode - Whether dark mode is active
 * @returns RGB color string
 */
export const getColorForFrequency = (freq: number, isDarkMode: boolean): string => {
  if (isDarkMode) {
    // Dark mode: brighter colors for visibility
    if (freq <= 25) {
      // 0-25%: bright green to bright yellow
      const t = freq / 25;
      const r = Math.round(80 + (255 - 80) * t);
      const g = Math.round(255 + (220 - 255) * t);
      const b = Math.round(80 + (80 - 80) * t);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (freq <= 50) {
      // 25-50%: bright yellow to bright orange
      const t = (freq - 25) / 25;
      const r = Math.round(255 + (255 - 255) * t);
      const g = Math.round(220 + (165 - 220) * t);
      const b = Math.round(80 + (90 - 80) * t);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // 50-100%: bright orange to bright red
      const t = (freq - 50) / 50;
      const r = Math.round(255 + (255 - 255) * t);
      const g = Math.round(165 + (100 - 165) * t);
      const b = Math.round(90 + (100 - 90) * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
  } else {
    // Light mode: original colors
    if (freq <= 25) {
      // 0-25%: green to yellow
      const t = freq / 25;
      const r = Math.round(34 + (234 - 34) * t);
      const g = Math.round(220 + (179 - 220) * t);
      const b = Math.round(34 + (8 - 34) * t);
      return `rgb(${r}, ${g}, ${b})`;
    } else if (freq <= 50) {
      // 25-50%: yellow to orange
      const t = (freq - 25) / 25;
      const r = Math.round(234 + (249 - 234) * t);
      const g = Math.round(179 + (115 - 179) * t);
      const b = Math.round(8 + (22 - 8) * t);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // 50-100%: orange to dark red
      const t = (freq - 50) / 50;
      const r = Math.round(249 + (153 - 249) * t);
      const g = Math.round(115 + (27 - 115) * t);
      const b = Math.round(22 + (27 - 22) * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
};
