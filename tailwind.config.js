/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#05080e',
        surface: {
          DEFAULT: '#0a101b',
          raised: '#0e1624',
          overlay: '#111b2c',
        },
        line: {
          DEFAULT: 'rgba(148, 163, 184, 0.13)',
          strong: 'rgba(148, 163, 184, 0.24)',
        },
        content: {
          DEFAULT: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
          faint: '#475569',
        },
        accent: {
          cyan: '#22d3ee',
          teal: '#2dd4bf',
          blue: '#60a5fa',
        },
        signal: {
          green: '#34d399',
          amber: '#fbbf24',
          orange: '#fb923c',
          red: '#f87171',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'SFMono-Regular',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      boxShadow: {
        panel: '0 18px 50px -24px rgba(0, 0, 0, 0.85)',
        float: '0 24px 70px -30px rgba(0, 0, 0, 0.9)',
        glow: '0 0 28px -6px rgba(34, 211, 238, 0.35)',
      },
      borderRadius: {
        panel: '1rem',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
};
