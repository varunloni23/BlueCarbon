import { createTheme } from '@mui/material/styles';

// Luxury Color Palette
export const luxuryColors = {
  // Dark base colors
  darkBase: '#1C1C28',
  deepNavy: '#0F172A',
  
  // Primary accent colors
  gold: '#FFD700',
  royalBlue: '#4A90E2',
  
  // Secondary accent colors
  emeraldGreen: '#34D399',
  luxuryPurple: '#9333EA',
  
  // Neutral backgrounds
  offWhite: '#F8FAFC',
  lightGray: '#F1F5F9',
  mediumGray: '#64748B',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const luxuryTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: luxuryColors.royalBlue,
      dark: '#3A7BD5',
      light: '#6BA3F0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: luxuryColors.luxuryPurple,
      dark: '#7C2D91',
      light: '#A855F7',
      contrastText: '#FFFFFF',
    },
    accent: {
      main: luxuryColors.gold,
      dark: '#DAA520',
      light: '#FFF176',
      contrastText: luxuryColors.darkBase,
    },
    success: {
      main: luxuryColors.success,
      dark: '#059669',
      light: luxuryColors.emeraldGreen,
    },
    warning: {
      main: luxuryColors.warning,
      dark: '#D97706',
      light: '#FCD34D',
    },
    error: {
      main: luxuryColors.error,
      dark: '#DC2626',
      light: '#F87171',
    },
    info: {
      main: luxuryColors.info,
      dark: '#1D4ED8',
      light: '#60A5FA',
    },
    background: {
      default: luxuryColors.offWhite,
      paper: '#FFFFFF',
      sidebar: luxuryColors.darkBase,
      sidebarHover: '#252534',
    },
    text: {
      primary: luxuryColors.darkBase,
      secondary: luxuryColors.mediumGray,
      sidebar: '#FFFFFF',
      sidebarSecondary: '#B8BCC8',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 12px 24px rgba(0, 0, 0, 0.12)',
    '0px 16px 32px rgba(0, 0, 0, 0.15)',
    '0px 20px 40px rgba(0, 0, 0, 0.18)',
    '0px 24px 48px rgba(0, 0, 0, 0.2)',
    '0px 32px 64px rgba(0, 0, 0, 0.25)',
    // Continue with remaining shadow levels...
    '0px 40px 80px rgba(0, 0, 0, 0.3)',
    '0px 48px 96px rgba(0, 0, 0, 0.35)',
    '0px 56px 112px rgba(0, 0, 0, 0.4)',
    '0px 64px 128px rgba(0, 0, 0, 0.45)',
    '0px 72px 144px rgba(0, 0, 0, 0.5)',
    '0px 80px 160px rgba(0, 0, 0, 0.55)',
    '0px 88px 176px rgba(0, 0, 0, 0.6)',
    '0px 96px 192px rgba(0, 0, 0, 0.65)',
    '0px 104px 208px rgba(0, 0, 0, 0.7)',
    '0px 112px 224px rgba(0, 0, 0, 0.75)',
    '0px 120px 240px rgba(0, 0, 0, 0.8)',
    '0px 128px 256px rgba(0, 0, 0, 0.85)',
    '0px 136px 272px rgba(0, 0, 0, 0.9)',
    '0px 144px 288px rgba(0, 0, 0, 0.95)',
    '0px 152px 304px rgba(0, 0, 0, 1)',
    '0px 160px 320px rgba(0, 0, 0, 1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0',
          backgroundColor: luxuryColors.darkBase,
          color: '#FFFFFF',
        },
      },
    },
  },
});

export default luxuryTheme;