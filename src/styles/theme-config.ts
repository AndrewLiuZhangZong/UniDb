import type { GlobalThemeOverrides } from 'naive-ui'

// ── Accent Color Palettes ────────────────────────────────
const ORANGE = {
  primary: '#FF6B00',
  primaryHover: '#FF8C42',
  primaryPressed: '#CC5500',
  primarySuppl: '#FF8C42',
} as const

const PURPLE = {
  primary: '#7c3aed',
  primaryHover: '#8b5cf6',
  primaryPressed: '#6d28d9',
  primarySuppl: '#a78bfa',
} as const

export type AccentColor = 'orange' | 'purple'

export function getAccentColors(accent: AccentColor) {
  return accent === 'purple' ? PURPLE : ORANGE
}

// ── Status ──────────────────────────────────────────────────
const STATUS = {
  success: '#18a058',
  successHover: '#36b374',
  successPressed: '#0e7a43',
  warning: '#f0a020',
  warningHover: '#f5b942',
  warningPressed: '#d48a10',
  error: '#d03050',
  errorHover: '#e04060',
  errorPressed: '#b02040',
  info: '#2080f0',
  infoHover: '#4090f8',
  infoPressed: '#1870d8',
} as const

// ── Dark theme raw values (mirrors :root in theme-dark.css) ─
const DARK = {
  bgPrimary: '#111118',
  bgSecondary: '#1a1a24',
  bgCard: '#1a1a24',
  bgModal: '#1e1e28',
  bgHover: 'rgba(255,255,255,0.06)',
  bgRowHover: 'rgba(255,255,255,0.03)',
  borderPrimary: 'rgba(255,255,255,0.08)',
  borderSecondary: 'rgba(255,255,255,0.06)',
  textPrimary: 'rgba(255,255,255,0.95)',
  textSecondary: 'rgba(255,255,255,0.85)',
  textTertiary: 'rgba(255,255,255,0.7)',
  textDisabled: 'rgba(255,255,255,0.38)',
  accentSubtleOrange: 'rgba(255,107,0,0.15)',
  accentSubtlePurple: 'rgba(124,58,237,0.22)',
} as const

// ── Light theme raw values ──────────────────────────────────
const LIGHT = {
  bgPrimary: '#ffffff',
  bgSecondary: '#ffffff',
  bgCard: '#ffffff',
  bgModal: '#ffffff',
  bgHover: 'rgba(0,0,0,0.04)',
  bgRowHover: 'rgba(0,0,0,0.02)',
  borderPrimary: 'rgba(0,0,0,0.08)',
  borderSecondary: 'rgba(0,0,0,0.07)',
  textPrimary: 'rgba(0,0,0,0.90)',
  textSecondary: 'rgba(0,0,0,0.82)',
  textTertiary: 'rgba(0,0,0,0.65)',
  textDisabled: 'rgba(0,0,0,0.35)',
  accentSubtleOrange: 'rgba(255,107,0,0.10)',
  accentSubtlePurple: 'rgba(124,58,237,0.12)',
} as const

// ── Naive UI theme overrides ──────────────────────��──────────
export function createThemeOverrides(
  isDark: boolean,
  accent: AccentColor = 'orange'
): GlobalThemeOverrides {
  const bg = isDark ? DARK : LIGHT
  const ac = getAccentColors(accent)
  const accentSubtle = accent === 'purple' ? bg.accentSubtlePurple : bg.accentSubtleOrange

  return {
    common: {
      primaryColor: ac.primary,
      primaryColorHover: ac.primaryHover,
      primaryColorPressed: ac.primaryPressed,
      primaryColorSuppl: ac.primarySuppl,
      bodyColor: bg.bgPrimary,
      successColor: STATUS.success,
      successColorHover: STATUS.successHover,
      successColorPressed: STATUS.successPressed,
      warningColor: STATUS.warning,
      warningColorHover: STATUS.warningHover,
      warningColorPressed: STATUS.warningPressed,
      errorColor: STATUS.error,
      errorColorHover: STATUS.errorHover,
      errorColorPressed: STATUS.errorPressed,
      infoColor: STATUS.info,
      infoColorHover: STATUS.infoHover,
      infoColorPressed: STATUS.infoPressed,
      borderRadius: '12px',
      borderRadiusSmall: '8px',
      fontSize: '14px',
      fontSizeMini: '12px',
      fontSizeSmall: '13px',
      fontSizeMedium: '14px',
      fontSizeLarge: '15px',
      fontSizeHuge: '16px',
      heightMini: '24px',
      heightSmall: '28px',
      heightMedium: '34px',
      heightLarge: '40px',
      heightHuge: '46px'
    },
    Button: {
      colorPrimary: ac.primary,
      colorHoverPrimary: ac.primaryHover,
      colorPressedPrimary: ac.primaryPressed,
      colorFocusPrimary: ac.primary,
      borderPrimary: `1px solid ${ac.primary}`,
      borderHoverPrimary: `1px solid ${ac.primaryHover}`,
      borderPressedPrimary: `1px solid ${ac.primaryPressed}`,
      borderFocusPrimary: `1px solid ${ac.primary}`,
      textColorPrimary: '#ffffff',
      textColorHoverPrimary: '#ffffff',
      textColorPressedPrimary: '#ffffff',
      textColorFocusPrimary: '#ffffff',
      textColor: bg.textSecondary,
      textColorHover: bg.textPrimary,
      textColorPressed: bg.textPrimary,
      color: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
      colorHover: isDark ? 'rgba(255,255,255,0.12)' : '#f0f0f0',
      colorPressed: isDark ? 'rgba(255,255,255,0.16)' : '#e6e6e6',
      border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #d9d9d9',
      borderHover: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #bfbfbf',
      borderPressed: isDark ? '1px solid rgba(255,255,255,0.24)' : '1px solid #a8a8a8',
      borderFocus: isDark ? '1px solid rgba(255,255,255,0.24)' : `1px solid ${ac.primary}`,
      borderRadiusMedium: '8px',
      borderRadiusSmall: '6px',
      borderRadiusLarge: '10px',
      fontSizeMedium: '14px',
      fontSizeSmall: '13px',
      fontSizeLarge: '15px',
      paddingLarge: '0 20px',
      paddingMedium: '0 16px',
      paddingSmall: '0 12px'
    },
    Card: {
      color: bg.bgCard,
      colorModal: bg.bgModal,
      borderRadius: '18px',
      borderColor: bg.borderSecondary,
      borderColorModal: bg.borderPrimary
    },
    Input: {
      color: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
      colorFocus: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d9d9d9',
      borderColorFocus: ac.primary,
      borderRadius: '8px',
      heightMedium: '34px',
      colorDisabled: isDark ? 'rgba(255,255,255,0.02)' : '#f5f5f5',
      textColor: bg.textPrimary,
      caretColor: ac.primary
    },
    Select: {
      peers: {
        InternalSelection: {
          color: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
          borderFocus: `1px solid ${ac.primary}`,
          borderRadius: '8px',
          heightMedium: '34px',
          textColor: bg.textPrimary
        }
      }
    },
    Tree: {
      color: 'transparent',
      nodeTextColor: bg.textSecondary,
      nodeTextColorHover: bg.textPrimary,
      nodeColorHover: bg.bgHover,
      arrowColor: bg.textDisabled
    },
    Menu: {
      itemTextColor: bg.textTertiary,
      itemTextColorHover: bg.textPrimary,
      itemTextColorActive: ac.primary,
      itemColorHover: bg.bgHover,
      itemColorActive: accentSubtle,
      borderColor: bg.borderSecondary
    },
    Tabs: {
      tabTextColorLine: bg.textTertiary,
      tabTextColorActiveLine: ac.primary,
      tabTextColorHoverLine: bg.textPrimary,
      tabColorSegment: bg.bgRowHover,
      tabBorderColor: bg.borderPrimary,
      colorActive: ac.primary,
      barColor: ac.primary
    },
    Tag: {
      borderRadius: '6px',
      heightMedium: '28px',
      heightSmall: '22px'
    },
    Dialog: {
      color: bg.bgModal,
      borderRadius: '18px',
      titleTextColor: bg.textPrimary
    },
    Message: {
      colorSuccess: isDark ? `rgba(24,160,88,0.2)` : `rgba(24,160,88,0.1)`,
      textColorSuccess: isDark ? STATUS.successHover : STATUS.success,
      colorError: isDark ? `rgba(208,48,80,0.2)` : `rgba(208,48,80,0.1)`,
      textColorError: isDark ? STATUS.errorHover : STATUS.error,
      colorWarning: isDark ? `rgba(240,160,32,0.22)` : `rgba(240,160,32,0.12)`,
      textColorWarning: isDark ? STATUS.warningHover : STATUS.warning,
      colorInfo: isDark ? `rgba(32,128,240,0.2)` : `rgba(32,128,240,0.1)`,
      textColorInfo: isDark ? STATUS.infoHover : STATUS.info
    },
    DataTable: {
      thColor: isDark ? bg.bgRowHover : '#f5f6f8',
      thColorHover: bg.bgHover,
      tdColor: bg.bgPrimary,
      tdColorHover: bg.bgRowHover,
      tdColorStriped: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      borderColor: bg.borderSecondary,
      thTextColor: bg.textTertiary,
      tdTextColor: bg.textSecondary
    },
    Dropdown: {
      color: bg.bgModal,
      optionColorHover: bg.bgHover,
      optionTextColor: bg.textSecondary,
      borderRadius: '8px'
    },
    Tooltip: {
      color: DARK.bgModal,
      textColor: DARK.textPrimary,
      borderRadius: '6px'
    },
    Layout: {
      color: bg.bgPrimary,
      siderColor: isDark ? DARK.bgSecondary : '#f4f5f9',
      headerColor: bg.bgPrimary,
      footerColor: bg.bgPrimary
    },
    Scrollbar: {
      color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
      colorHover: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
    }
  }
}
