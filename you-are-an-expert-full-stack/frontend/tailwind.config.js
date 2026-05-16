/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        ink: '#111827',
        muted: '#6B7280',
      },
      borderRadius: {
        app: '8px',
      },
      boxShadow: {
        soft: '0 12px 30px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
};
