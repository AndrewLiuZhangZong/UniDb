// ── 主题色定义 ────────────────────────────────
// 每个主题色只需要在这里定义颜色值
// 所有组件样式通过 accent-*.css 的 CSS 选择器覆盖

export const ACCENT_COLORS = {
  orange: {
    primary: '#FF6B00',
    primaryHover: '#FF8C42',
    primaryPressed: '#CC5500',
    primarySuppl: '#FF8C42'
  },
  purple: {
    primary: '#7c3aed',
    primaryHover: '#8b5cf6',
    primaryPressed: '#6d28d9',
    primarySuppl: '#a78bfa'
  }
} as const

export type AccentColor = 'orange' | 'purple'

export function getAccentColors(accent: AccentColor) {
  return accent === 'purple' ? ACCENT_COLORS.purple : ACCENT_COLORS.orange
}