/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          50: '#f9f6f8',
          100: '#f5eff3',
          200: '#ecdfe8',
          300: '#dcc2d4',
          400: '#a37296',
          500: '#714b67',
          600: '#603f57',
          700: '#4e3347',
          800: '#3d2837',
          900: '#252733',
          950: '#1a1b24',
        },
        slate: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9fa2b4',
          500: '#6c6e7e',
          600: '#4b4d5a',
          700: '#373946',
          800: '#2c2e3b',
          900: '#252733',
          950: '#1a1b24',
        },
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['"Josefin Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Unbounded"', '"Josefin Sans"', 'sans-serif'],
        display: ['"Unbounded"', '"Josefin Sans"', 'sans-serif'],
        cinzel: ['"Cinzel"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(37, 39, 51, 0.04), 0 1px 2px 0 rgba(37, 39, 51, 0.02)',
        'elevated': '0 4px 6px -1px rgba(37, 39, 51, 0.06), 0 2px 4px -1px rgba(37, 39, 51, 0.03)',
        'panel': '0 10px 15px -3px rgba(37, 39, 51, 0.05), 0 4px 6px -2px rgba(37, 39, 51, 0.02)',
      }
    },
  },
  plugins: [],
};
