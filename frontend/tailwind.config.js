/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Theme - "Academic Clarity"
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6', // Primary Accent - Royal Blue
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Secondary Accent - Emerald Green
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        accent: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Chatbot/CTA Button - Indigo
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Background colors
        background: {
          primary: '#FFFFFF', // White
          secondary: '#F9FAFB', // Cool Gray 50
          tertiary: '#F3F4F6', // Cool Gray 100
          card: '#F3F4F6', // Cool Gray 100
        },
        // Text colors
        text: {
          primary: '#1F2937', // Slate Gray 800 - Headings
          secondary: '#4B5563', // Slate Gray 600 - Body Text
          muted: '#6B7280', // Gray 500
          inverse: '#FFFFFF',
        },
        // Border colors
        border: {
          primary: '#E5E7EB', // Gray 200
          secondary: '#D1D5DB', // Gray 300
          accent: '#3B82F6', // Primary Blue
        },
        // Dark Theme - "Tech Intellect"
        dark: {
          background: {
            primary: '#0F172A', // Midnight Blue
            secondary: '#0F172A', // Slate 900
            tertiary: '#1E293B', // Slate 800
            card: '#1E293B', // Slate 800
          },
          text: {
            primary: '#F1F5F9', // Slate 100 - Headings
            secondary: '#CBD5E1', // Slate 300 - Body Text
            muted: '#94A3B8', // Slate 400
            inverse: '#0F172A',
          },
          border: {
            primary: '#475569', // Slate 600
            secondary: '#334155', // Slate 700
            accent: '#A78BFA', // Electric Purple
          },
          primary: {
            500: '#A78BFA', // Electric Purple
            600: '#9333EA',
            700: '#7C3AED',
          },
          secondary: {
            500: '#2DD4BF', // Vibrant Teal
            600: '#14B8A6',
            700: '#0D9488',
          },
          accent: {
            500: '#22D3EE', // Neon Cyan
            600: '#06B6D4',
            700: '#0891B2',
          },
        },
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'rubik': ['Rubik', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-purple': '0 0 20px rgba(167, 139, 250, 0.3)',
        'glow-teal': '0 0 20px rgba(45, 212, 191, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
