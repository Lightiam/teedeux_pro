/** Teedeux brand tokens, mirroring the web app's CSS custom properties. */
export const colors = {
  primary: '#9c3f00',
  primaryBright: '#c45100',
  primaryContainer: '#ffdbcc',
  secondary: '#3b6934',
  secondaryContainer: '#b9eeab',
  danger: '#9E2A2B',

  background: '#fcf9f8',
  surface: '#ffffff',
  surfaceLow: '#f6f3f2',
  surfaceHigh: '#eae7e7',

  onSurface: '#1c1b1b',
  onSurfaceVariant: '#584238',
  muted: '#8c7166',
  border: '#e5e2e1',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;
