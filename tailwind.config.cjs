module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        'off-white': '#F5F7FA',
        'dark-purple': '#2B2B3E',
        'status-completed': '#D1FAE5',
        'status-completed-text': '#065F46',
        'status-upcoming': '#E5E7EB',
        'status-upcoming-text': '#4B5563',
        'status-rejected': '#FEE2E2',
        'status-rejected-text': '#991B1B',
        'icon-teal': '#14B8A6',
        'icon-pink': '#EC4899',
        'icon-purple': '#8B5CF6',
        'icon-blue': '#60A5FA',
        'icon-orange': '#F97316',
        'icon-indigo': '#6366F1',
      }
    },
  },
  plugins: [],
};
