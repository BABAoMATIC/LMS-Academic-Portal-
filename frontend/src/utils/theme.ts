export const theme = {
  colors: {
    // Primary colors
    primary: '#FF6B35', // Orange
    secondary: '#6B46C1', // Purple
    accent: '#00FF88', // Neon Green
    
    // Dark theme colors
    background: {
      primary: '#0A0A0A', // Very dark black
      secondary: '#1A1A1A', // Dark gray
      tertiary: '#2A2A2A', // Medium dark gray
      card: '#1E1E1E', // Card background
      modal: '#2D2D2D', // Modal background
    },
    
    // Text colors
    text: {
      primary: '#FFFFFF', // White
      secondary: '#B0B0B0', // Light gray
      tertiary: '#808080', // Medium gray
      muted: '#606060', // Dark gray
      inverse: '#000000', // Black for light backgrounds
    },
    
    // Status colors
    success: '#00FF88', // Neon Green
    warning: '#FFB347', // Orange
    error: '#FF4757', // Red
    info: '#3742FA', // Blue
    
    // Border colors
    border: {
      primary: '#333333',
      secondary: '#444444',
      accent: '#FF6B35',
    },
    
    // Gradient colors
    gradients: {
      primary: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      secondary: 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)',
      accent: 'linear-gradient(135deg, #00FF88 0%, #00D4AA 100%)',
      dark: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
    },
    
    // Shadow colors
    shadow: {
      primary: 'rgba(255, 107, 53, 0.2)',
      secondary: 'rgba(107, 70, 193, 0.2)',
      accent: 'rgba(0, 255, 136, 0.2)',
      dark: 'rgba(0, 0, 0, 0.3)',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  
  // Transitions
  transitions: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

export type Theme = typeof theme;

// Utility functions for theme
export const getColor = (colorPath: string) => {
  const path = colorPath.split('.');
  let value: any = theme.colors;
  
  for (const key of path) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return theme.colors.text.primary;
    }
  }
  
  return value;
};

export const getSpacing = (size: keyof typeof theme.spacing) => {
  return theme.spacing[size];
};

export const getBorderRadius = (size: keyof typeof theme.borderRadius) => {
  return theme.borderRadius[size];
};

export const getShadow = (size: keyof typeof theme.shadows) => {
  return theme.shadows[size];
};

export const getTransition = (property: string = 'all', duration: keyof typeof theme.transitions.duration = 'normal', easing: keyof typeof theme.transitions.easing = 'ease') => {
  return `${property} ${theme.transitions.duration[duration]} ${theme.transitions.easing[easing]}`;
};
