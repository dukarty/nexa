/** Sistema de diseño NEXA — tokens centralizados. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f5f6f8',
        surface: '#ffffff',
        ink: { DEFAULT: '#171a21', soft: '#3d4652' },
        muted: { DEFAULT: '#9198a3', 2: '#b6bcc6' },
        line: '#ecedf1',
        blue: { DEFAULT: '#2f66ff', dark: '#2f5be0', soft: '#e9f0ff' },
        ok: { DEFAULT: '#1e9e5a', bg: '#e4f7ec' },
        warn: '#f59e0b',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '16px', '2xl': '22px', '3xl': '26px' },
      boxShadow: {
        card: '0 6px 28px rgba(23,26,33,.06)',
        blue: '0 8px 22px rgba(47,102,255,.28)',
      },
      transitionTimingFunction: { nexa: 'cubic-bezier(.22,1,.36,1)' },
      keyframes: {
        fade: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        up: { from: { opacity: 0, transform: 'translateY(100%)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { fade: 'fade .35s var(--ease)', up: 'up .3s var(--ease)' },
    },
  },
  plugins: [],
};
