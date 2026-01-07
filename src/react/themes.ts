import type { MlinkTheme, MlinkThemePreset } from './types';

export const lightTheme: MlinkTheme = {
  // Colors
  '--mlink-bg-primary': '#ffffff',
  '--mlink-bg-secondary': '#f8f9fa',
  '--mlink-border-color': '#e9ecef',
  '--mlink-text-primary': '#212529',
  '--mlink-text-secondary': '#6c757d',
  '--mlink-text-link': '#0d6efd',
  '--mlink-button-bg': '#212529',
  '--mlink-button-text': '#ffffff',
  '--mlink-button-hover': '#343a40',
  '--mlink-button-disabled': '#adb5bd',
  '--mlink-input-bg': '#ffffff',
  '--mlink-input-border': '#ced4da',
  '--mlink-input-text': '#212529',
  '--mlink-input-placeholder': '#adb5bd',
  '--mlink-success': '#198754',
  '--mlink-error': '#dc3545',
  '--mlink-warning': '#ffc107',
  // Sizing
  '--mlink-border-radius': '12px',
  '--mlink-button-radius': '8px',
  '--mlink-input-radius': '8px',
  // Shadows
  '--mlink-shadow': '0 2px 8px rgba(0, 0, 0, 0.08)',
};

export const darkTheme: MlinkTheme = {
  // Colors
  '--mlink-bg-primary': '#1a1a1a',
  '--mlink-bg-secondary': '#2d2d2d',
  '--mlink-border-color': '#404040',
  '--mlink-text-primary': '#ffffff',
  '--mlink-text-secondary': '#a0a0a0',
  '--mlink-text-link': '#60a5fa',
  '--mlink-button-bg': '#ffffff',
  '--mlink-button-text': '#1a1a1a',
  '--mlink-button-hover': '#e5e5e5',
  '--mlink-button-disabled': '#525252',
  '--mlink-input-bg': '#2d2d2d',
  '--mlink-input-border': '#404040',
  '--mlink-input-text': '#ffffff',
  '--mlink-input-placeholder': '#6b7280',
  '--mlink-success': '#22c55e',
  '--mlink-error': '#ef4444',
  '--mlink-warning': '#f59e0b',
  // Sizing
  '--mlink-border-radius': '12px',
  '--mlink-button-radius': '8px',
  '--mlink-input-radius': '8px',
  // Shadows
  '--mlink-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)',
};

export const mantleTheme: MlinkTheme = {
  // Colors - Mantle brand colors
  '--mlink-bg-primary': '#0a0a0a',
  '--mlink-bg-secondary': '#141414',
  '--mlink-border-color': '#2a2a2a',
  '--mlink-text-primary': '#ffffff',
  '--mlink-text-secondary': '#9ca3af',
  '--mlink-text-link': '#65d9e4',
  '--mlink-button-bg': '#65d9e4',
  '--mlink-button-text': '#000000',
  '--mlink-button-hover': '#85e3ec',
  '--mlink-button-disabled': '#374151',
  '--mlink-input-bg': '#1f1f1f',
  '--mlink-input-border': '#374151',
  '--mlink-input-text': '#ffffff',
  '--mlink-input-placeholder': '#6b7280',
  '--mlink-success': '#34d399',
  '--mlink-error': '#f87171',
  '--mlink-warning': '#fbbf24',
  // Sizing
  '--mlink-border-radius': '16px',
  '--mlink-button-radius': '10px',
  '--mlink-input-radius': '10px',
  // Shadows
  '--mlink-shadow': '0 4px 16px rgba(101, 217, 228, 0.1)',
};

export const themePresets: Record<MlinkThemePreset, MlinkTheme> = {
  light: lightTheme,
  dark: darkTheme,
  mantle: mantleTheme,
};

export function resolveTheme(
  theme?: Partial<MlinkTheme> | MlinkThemePreset
): MlinkTheme {
  if (!theme) {
    return darkTheme;
  }

  if (typeof theme === 'string') {
    return themePresets[theme] || darkTheme;
  }

  // Merge custom theme with dark theme as base
  return { ...darkTheme, ...theme };
}

export function themeToCSS(theme: MlinkTheme): React.CSSProperties {
  return theme as unknown as React.CSSProperties;
}
