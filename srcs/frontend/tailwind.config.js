/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#111827', // Deep Ink
          hover: '#0F172A',
          light: '#EEF2FF',
        },
        secondary: {
          DEFAULT: '#4F6EF7', // Refined Indigo
          hover: '#4059D6',
        },
        background: '#F8FAFC', // Soft White
        surface: '#FFFFFF', // Pure White
        muted: '#64748B', // Slate 500
        border: '#E2E8F0',
        subtle: '#F1F5F9',
        success: {
          DEFAULT: '#16A34A',
          light: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
        info: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
      }
    },
  },
  plugins: [],
}
