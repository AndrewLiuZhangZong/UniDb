/**
 * 主题配置 - 集中管理所有主题的颜色方案
 * 包含 CSS 变量和 Naive UI theme overrides
 */

export interface ThemeConfig {
  name: string
  primaryColor: string
  primaryColorHover: string
  primaryColorPressed: string
  primaryColorSuppl: string
  // CSS Variables
  cssVars: Record<string, string>
  // Naive UI Theme Overrides
  themeOverrides: Record<string, unknown>
}

// Orange 主题配置
const orangeTheme: ThemeConfig = {
  name: 'orange',
  primaryColor: '#FF6B00',
  primaryColorHover: '#FF8C42',
  primaryColorPressed: '#CC5500',
  primaryColorSuppl: '#FF8C42',

  cssVars: {
    '--accent-primary': '#FF6B00',
    '--accent-primary-hover': '#FF8C42',
    '--accent-primary-pressed': '#CC5500',
    '--accent-primary-subtle': 'rgba(255, 107, 0, 0.12)',
    '--accent-primary-subtle-hover': 'rgba(255, 107, 0, 0.20)',
  },

  themeOverrides: {
    common: {
      primaryColor: '#FF6B00',
      primaryColorHover: '#FF8C42',
      primaryColorPressed: '#CC5500',
      primaryColorSuppl: '#FF8C42',

      borderRadius: '6px',
      borderRadiusSmall: '4px',

      // 亮色主题背景
      popoverColor: '#ffffff',
      tableColor: '#ffffff',
      cardColor: '#ffffff',
      modalColor: '#ffffff',
      bodyColor: '#ffffff',
      tagColor: '#ffffff',

      // 文字颜色
      textColorBase: '#1a1a2e',
      textColor1: '#1a1a2e',
      textColor2: '#4a4a6a',
      textColor3: '#7a7a9a',
      textColorDisabled: '#b0b0c8',

      // 边框颜色
      borderColor: 'rgba(0, 0, 0, 0.10)',
      dividerColor: 'rgba(0, 0, 0, 0.06)',

      // 输入框
      inputColor: '#ffffff',
      inputBorder: 'rgba(0, 0, 0, 0.12)',
      inputBorderHover: 'rgba(0, 0, 0, 0.18)',
      inputBorderFocus: '#FF6B00',
      inputBoxShadowFocus: '0 0 0 2px rgba(255, 107, 0, 0.15)',

      // 按钮
      buttonColor: '#ffffff',
      buttonBorder: 'rgba(0, 0, 0, 0.12)',
      buttonColor2: '#ffffff',
      buttonBorder2: 'rgba(0, 0, 0, 0.10)',
      buttonColor2Hover: 'rgba(0, 0, 0, 0.04)',
      buttonBorder2Hover: 'rgba(0, 0, 0, 0.16)',

      // 滚动条
      scrollbarColor: 'rgba(0, 0, 0, 0.15)',
      scrollbarColorHover: 'rgba(0, 0, 0, 0.25)',

      // 阴影
      boxShadow1: '0 2px 8px rgba(0, 0, 0, 0.08)',
      boxShadow2: '0 4px 16px rgba(0, 0, 0, 0.10)',
      boxShadow3: '0 8px 32px rgba(0, 0, 0, 0.15)',
    },
    Button: {
      colorPrimary: '#FF6B00',
      colorHoverPrimary: '#FF8C42',
      colorPressedPrimary: '#CC5500',
      borderPrimary: '#FF6B00',
      borderHoverPrimary: '#FF8C42',
      borderPressedPrimary: '#CC5500',
    },
    Input: {
      borderFocus: '#FF6B00',
      boxShadowFocus: '0 0 0 2px rgba(255, 107, 0, 0.15)',
    },
    Select: {
      peers: {
        InternalSelection: {
          borderFocus: '#FF6B00',
          boxShadowFocus: '0 0 0 2px rgba(255, 107, 0, 0.15)',
        },
        InternalSelectMenu: {
          optionColorActive: 'rgba(255, 107, 0, 0.10)',
          optionTextColorActive: '#FF6B00',
        },
      },
    },
    DataTable: {
      thColor: 'rgba(0, 0, 0, 0.02)',
      tdColor: '#ffffff',
      thTextColor: '#4a4a6a',
      tdTextColor: '#1a1a2e',
      borderColor: 'rgba(0, 0, 0, 0.08)',
    },
    Menu: {
      itemTextColorActive: '#FF6B00',
      itemColorActive: 'rgba(255, 107, 0, 0.10)',
      itemTextColorActiveHover: '#FF6B00',
      itemColorActiveHover: 'rgba(255, 107, 0, 0.15)',
    },
    Tabs: {
      tabTextColorActive: '#FF6B00',
      barColor: '#FF6B00',
      tabTextColorActiveBar: '#FF6B00',
      colorSegment: 'rgba(255, 107, 0, 0.10)',
    },
    Tag: {
      color: 'rgba(0, 0, 0, 0.04)',
      border: 'rgba(0, 0, 0, 0.10)',
      textColor: '#4a4a6a',
    },
    Card: {
      color: '#ffffff',
      borderColor: 'rgba(0, 0, 0, 0.08)',
    },
    Dialog: {
      color: '#ffffff',
    },
    Switch: {
      railColorActive: '#FF6B00',
    },
    Checkbox: {
      colorChecked: '#FF6B00',
      borderChecked: '#FF6B00',
    },
    Radio: {
      buttonColorActive: '#FF6B00',
      buttonBorderActive: '#FF6B00',
    },
    Pagination: {
      itemColorActive: '#FF6B00',
      itemBorderActive: '#FF6B00',
    },
    Tree: {
      nodeColorActive: 'rgba(255, 107, 0, 0.10)',
      nodeTextColorActive: '#FF6B00',
    },
    Spin: {
      color: '#FF6B00',
    },
    DatePicker: {
      cellColorSelected: 'rgba(255, 107, 0, 0.10)',
      cellTextColorSelected: '#FF6B00',
      cellBorderCurrent: '#FF6B00',
    },
    Dropdown: {
      color: '#ffffff',
      optionColorActive: 'rgba(255, 107, 0, 0.10)',
      optionTextColorActive: '#FF6B00',
    },
    Tooltip: {
      color: '#1a1a2e',
      textColor: '#ffffff',
    },
  },
}

// Purple 主题配置
const purpleTheme: ThemeConfig = {
  name: 'purple',
  primaryColor: '#7c3aed',
  primaryColorHover: '#8b5cf6',
  primaryColorPressed: '#6d28d9',
  primaryColorSuppl: '#8b5cf6',

  cssVars: {
    '--accent-primary': '#7c3aed',
    '--accent-primary-hover': '#8b5cf6',
    '--accent-primary-pressed': '#6d28d9',
    '--accent-primary-subtle': 'rgba(124, 58, 237, 0.10)',
    '--accent-primary-subtle-hover': 'rgba(124, 58, 237, 0.18)',
  },

  themeOverrides: {
    common: {
      primaryColor: '#7c3aed',
      primaryColorHover: '#8b5cf6',
      primaryColorPressed: '#6d28d9',
      primaryColorSuppl: '#8b5cf6',

      borderRadius: '6px',
      borderRadiusSmall: '4px',

      popoverColor: '#ffffff',
      tableColor: '#ffffff',
      cardColor: '#ffffff',
      modalColor: '#ffffff',
      bodyColor: '#ffffff',
      tagColor: '#ffffff',

      textColorBase: '#1a1a2e',
      textColor1: '#1a1a2e',
      textColor2: '#4a4a6a',
      textColor3: '#7a7a9a',
      textColorDisabled: '#b0b0c8',

      borderColor: 'rgba(0, 0, 0, 0.10)',
      dividerColor: 'rgba(0, 0, 0, 0.06)',

      inputColor: '#ffffff',
      inputBorder: 'rgba(0, 0, 0, 0.12)',
      inputBorderHover: 'rgba(0, 0, 0, 0.18)',
      inputBorderFocus: '#7c3aed',
      inputBoxShadowFocus: '0 0 0 2px rgba(124, 58, 237, 0.15)',

      buttonColor: '#ffffff',
      buttonBorder: 'rgba(0, 0, 0, 0.12)',
      buttonColor2: '#ffffff',
      buttonBorder2: 'rgba(0, 0, 0, 0.10)',
      buttonColor2Hover: 'rgba(0, 0, 0, 0.04)',
      buttonBorder2Hover: 'rgba(0, 0, 0, 0.16)',

      scrollbarColor: 'rgba(0, 0, 0, 0.15)',
      scrollbarColorHover: 'rgba(0, 0, 0, 0.25)',

      boxShadow1: '0 2px 8px rgba(0, 0, 0, 0.08)',
      boxShadow2: '0 4px 16px rgba(0, 0, 0, 0.10)',
      boxShadow3: '0 8px 32px rgba(0, 0, 0, 0.15)',
    },
    Button: {
      colorPrimary: '#7c3aed',
      colorHoverPrimary: '#8b5cf6',
      colorPressedPrimary: '#6d28d9',
      borderPrimary: '#7c3aed',
      borderHoverPrimary: '#8b5cf6',
      borderPressedPrimary: '#6d28d9',
    },
    Input: {
      borderFocus: '#7c3aed',
      boxShadowFocus: '0 0 0 2px rgba(124, 58, 237, 0.15)',
    },
    Select: {
      peers: {
        InternalSelection: {
          borderFocus: '#7c3aed',
          boxShadowFocus: '0 0 0 2px rgba(124, 58, 237, 0.15)',
        },
        InternalSelectMenu: {
          optionColorActive: 'rgba(124, 58, 237, 0.10)',
          optionTextColorActive: '#7c3aed',
        },
      },
    },
    DataTable: {
      thColor: 'rgba(0, 0, 0, 0.02)',
      tdColor: '#ffffff',
      thTextColor: '#4a4a6a',
      tdTextColor: '#1a1a2e',
      borderColor: 'rgba(0, 0, 0, 0.08)',
    },
    Menu: {
      itemTextColorActive: '#7c3aed',
      itemColorActive: 'rgba(124, 58, 237, 0.10)',
      itemTextColorActiveHover: '#7c3aed',
      itemColorActiveHover: 'rgba(124, 58, 237, 0.15)',
    },
    Tabs: {
      tabTextColorActive: '#7c3aed',
      barColor: '#7c3aed',
      tabTextColorActiveBar: '#7c3aed',
      colorSegment: 'rgba(124, 58, 237, 0.10)',
    },
    Tag: {
      color: 'rgba(0, 0, 0, 0.04)',
      border: 'rgba(0, 0, 0, 0.10)',
      textColor: '#4a4a6a',
    },
    Card: {
      color: '#ffffff',
      borderColor: 'rgba(0, 0, 0, 0.08)',
    },
    Dialog: {
      color: '#ffffff',
    },
    Switch: {
      railColorActive: '#7c3aed',
    },
    Checkbox: {
      colorChecked: '#7c3aed',
      borderChecked: '#7c3aed',
    },
    Radio: {
      buttonColorActive: '#7c3aed',
      buttonBorderActive: '#7c3aed',
    },
    Pagination: {
      itemColorActive: '#7c3aed',
      itemBorderActive: '#7c3aed',
    },
    Tree: {
      nodeColorActive: 'rgba(124, 58, 237, 0.10)',
      nodeTextColorActive: '#7c3aed',
    },
    Spin: {
      color: '#7c3aed',
    },
    DatePicker: {
      cellColorSelected: 'rgba(124, 58, 237, 0.10)',
      cellTextColorSelected: '#7c3aed',
      cellBorderCurrent: '#7c3aed',
    },
    Dropdown: {
      color: '#ffffff',
      optionColorActive: 'rgba(124, 58, 237, 0.10)',
      optionTextColorActive: '#7c3aed',
    },
    Tooltip: {
      color: '#1a1a2e',
      textColor: '#ffffff',
    },
  },
}

// 导出所有主题
export const themes: Record<string, ThemeConfig> = {
  orange: orangeTheme,
  purple: purpleTheme,
}

// 根据名称获取主题
export function getTheme(name: string): ThemeConfig {
  return themes[name] || orangeTheme
}

// 导出单个主题供直接使用
export { orangeTheme, purpleTheme }
