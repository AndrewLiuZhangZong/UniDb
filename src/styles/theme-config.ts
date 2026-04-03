import type { GlobalThemeOverrides } from 'naive-ui'

// 主题色配置
export const THEME_COLORS = {
  // 主色
  primary: '#FF6B00',
  primaryHover: '#FF8C42',
  primaryPressed: '#CC5500',
  primarySuppl: '#FF8C42',
} as const

// Naive UI 主题覆盖配置
export function createThemeOverrides(isDark: boolean): GlobalThemeOverrides {
  return {
    common: {
      primaryColor: THEME_COLORS.primary,
      primaryColorHover: THEME_COLORS.primaryHover,
      primaryColorPressed: THEME_COLORS.primaryPressed,
      primaryColorSuppl: THEME_COLORS.primarySuppl,
      successColor: '#18a058',
      successColorHover: '#36b374',
      successColorPressed: '#0e7a43',
      warningColor: '#f0a020',
      warningColorHover: '#f5b942',
      warningColorPressed: '#d48a10',
      errorColor: '#d03050',
      errorColorHover: '#e04060',
      errorColorPressed: '#b02040',
      infoColor: '#2080f0',
      infoColorHover: '#4090f8',
      infoColorPressed: '#1870d8',
      borderRadius: '8px',
      borderRadiusSmall: '6px',
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
      colorPrimary: THEME_COLORS.primary,
      colorHoverPrimary: THEME_COLORS.primaryHover,
      colorPressedPrimary: THEME_COLORS.primaryPressed,
      colorFocusPrimary: THEME_COLORS.primary,
      borderPrimary: `1px solid ${THEME_COLORS.primary}`,
      borderHoverPrimary: `1px solid ${THEME_COLORS.primaryHover}`,
      borderPressedPrimary: `1px solid ${THEME_COLORS.primaryPressed}`,
      borderFocusPrimary: `1px solid ${THEME_COLORS.primary}`,
      textColorPrimary: '#ffffff',
      textColorHoverPrimary: '#ffffff',
      textColorPressedPrimary: '#ffffff',
      textColorFocusPrimary: '#ffffff',
      textColor: isDark ? '#e0e0e0' : '#333333',
      textColorHover: isDark ? '#ffffff' : '#000000',
      textColorPressed: isDark ? '#ffffff' : '#000000',
      color: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
      colorHover: isDark ? 'rgba(255,255,255,0.12)' : '#f0f0f0',
      colorPressed: isDark ? 'rgba(255,255,255,0.16)' : '#e6e6e6',
      border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #d9d9d9',
      borderHover: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #bfbfbf',
      borderPressed: isDark ? '1px solid rgba(255,255,255,0.24)' : '1px solid #a8a8a8',
      borderFocus: isDark ? '1px solid rgba(255,255,255,0.24)' : `1px solid ${THEME_COLORS.primary}`,
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
      color: isDark ? '#1a1a24' : '#ffffff',
      colorModal: isDark ? '#1e1e28' : '#ffffff',
      borderRadius: '12px',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
      borderColorModal: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)'
    },
    Input: {
      color: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
      colorFocus: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d9d9d9',
      borderColorFocus: THEME_COLORS.primary,
      borderRadius: '8px',
      heightMedium: '34px',
      colorDisabled: isDark ? 'rgba(255,255,255,0.02)' : '#f5f5f5',
      textColor: isDark ? 'rgba(255,255,255,0.9)' : '#333333',
      caretColor: THEME_COLORS.primary
    },
    Select: {
      peers: {
        InternalSelection: {
          color: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d9d9d9',
          borderColorFocus: THEME_COLORS.primary,
          borderRadius: '8px',
          heightMedium: '34px',
          textColor: isDark ? 'rgba(255,255,255,0.9)' : '#333333'
        }
      }
    },
    Tree: {
      color: isDark ? 'transparent' : 'transparent',
      nodeTextColor: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
      nodeTextColorHover: isDark ? '#ffffff' : '#000000',
      nodeColorHover: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      arrowColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
    },
    Menu: {
      itemTextColor: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)',
      itemTextColorHover: isDark ? '#ffffff' : '#000000',
      itemTextColorActive: THEME_COLORS.primary,
      itemColorHover: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      itemColorActive: isDark ? 'rgba(255,107,0,0.15)' : 'rgba(255,107,0,0.1)',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
    },
    Tabs: {
      tabTextColorLine: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
      tabTextColorActiveLine: THEME_COLORS.primary,
      tabTextColorHoverLine: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
      tabColorSegment: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      tabBorderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      colorActive: THEME_COLORS.primary,
      barColor: THEME_COLORS.primary
    },
    Tag: {
      borderRadius: '6px',
      heightMedium: '28px',
      heightSmall: '22px'
    },
    Dialog: {
      color: isDark ? '#1e1e28' : '#ffffff',
      borderRadius: '12px',
      titleTextColor: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
    },
    Message: {
      colorSuccess: isDark ? 'rgba(24,160,88,0.2)' : 'rgba(24,160,88,0.1)',
      textColorSuccess: isDark ? '#36b374' : '#18a058',
      colorError: isDark ? 'rgba(208,48,80,0.2)' : 'rgba(208,48,80,0.1)',
      textColorError: isDark ? '#e04060' : '#d03050',
      colorWarning: isDark ? 'rgba(255,107,0,0.2)' : 'rgba(255,107,0,0.1)',
      textColorWarning: isDark ? '#FF8C42' : '#FF6B00',
      colorInfo: isDark ? 'rgba(32,128,240,0.2)' : 'rgba(32,128,240,0.1)',
      textColorInfo: isDark ? '#4090f8' : '#2080f0'
    },
    DataTable: {
      thColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f8fb',
      thColorHover: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f8',
      tdColor: 'transparent',
      tdColorHover: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
      thTextColor: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
      tdTextColor: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.82)'
    },
    Dropdown: {
      color: isDark ? '#1e1e28' : '#ffffff',
      optionColorHover: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      optionTextColor: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
      borderRadius: '8px'
    },
    Tooltip: {
      color: '#1e1e28',
      textColor: 'rgba(255,255,255,0.9)',
      borderRadius: '6px'
    }
  }
}
