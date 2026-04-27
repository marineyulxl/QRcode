/**
 * UI UX Pro Max 对齐说明（访客 / 园区 / 正式）：
 * - Style: Minimalism，少装饰、清晰层级
 * - Colors: 主色 Teal（可信/政务友好）、背景 Slate-50、文字 Slate-900
 * - Typography: Inter + system-ui
 * - UX: 大触控目标(min-h-touch)、表单错误就近展示、提交 loading 禁用按钮
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E',
          hover: '#0D9488',
          foreground: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
        },
        border: {
          DEFAULT: '#E2E8F0',
        },
        cta: {
          DEFAULT: '#0284C7',
          hover: '#0369A1',
        },
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
    },
  },
  plugins: [],
}
