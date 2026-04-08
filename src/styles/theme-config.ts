/**
 * 主题配置 - 集中管理所有主题的颜色方案
 * 包含 CSS 变量和 Naive UI theme overrides
 */

export interface ThemeConfig {
  name: string
  label: string
  primaryColor: string
  primaryColorHover: string
  primaryColorPressed: string
  primaryColorSuppl: string
  // CSS Variables
  cssVars: Record<string, string>
  // Naive UI Theme Overrides
  themeOverrides: Record<string, unknown>
}

// 创建主题的辅助函数
function createTheme(
  name: string,
  label: string,
  primary: string,
  primaryHover: string,
  primaryPressed: string
): ThemeConfig {
  const hex = primary.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const subtle = `rgba(${r}, ${g}, ${b}, 0.10)`
  const subtleHover = `rgba(${r}, ${g}, ${b}, 0.18)`
  const subtleLight = `rgba(${r}, ${g}, ${b}, 0.06)`
  const subtleActive = `rgba(${r}, ${g}, ${b}, 0.08)`
  const subtleSelected = `rgba(${r}, ${g}, ${b}, 0.04)`

  return {
    name,
    label,
    primaryColor: primary,
    primaryColorHover: primaryHover,
    primaryColorPressed: primaryPressed,
    primaryColorSuppl: primaryHover,

    cssVars: {
      '--accent-primary': primary,
      '--accent-primary-hover': primaryHover,
      '--accent-primary-pressed': primaryPressed,
      '--accent-primary-subtle': subtle,
      '--accent-primary-subtle-hover': subtleHover,

      '--bg-primary': '#ffffff',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': subtleSelected,
      '--bg-elevated': '#ffffff',
      '--bg-sidebar': '#fafbfc',
      '--bg-menubar': subtleSelected,
      '--bg-tabbar': subtleSelected,
      '--bg-hover': subtleLight,
      '--bg-active': subtleActive,
      '--bg-selected': subtle,
      '--bg-row-hover': subtleSelected,

      '--text-primary': '#1a1a2e',
      '--text-secondary': '#4a4a6a',
      '--text-tertiary': '#7a7a9a',
      '--text-quaternary': '#9a9ab8',
      '--text-disabled': '#b0b0c8',
      '--text-placeholder': '#b0b0c8',
      '--text-hint': '#b0b0c8',

      '--border-primary': 'rgba(0, 0, 0, 0.10)',
      '--border-secondary': 'rgba(0, 0, 0, 0.06)',
      '--border-hover': 'rgba(0, 0, 0, 0.14)',
      '--border-strong': 'rgba(0, 0, 0, 0.18)',

      '--shadow-soft-sm': '0 2px 8px rgba(0, 0, 0, 0.08)',
      '--shadow-soft': '0 4px 16px rgba(0, 0, 0, 0.10)',
      '--shadow-rail': '4px 0 16px rgba(0, 0, 0, 0.06)',

      '--code-bg': '#f8f9fc',
      '--code-comment': 'rgba(0, 0, 0, 0.35)',
    },

    themeOverrides: {
      common: {
        primaryColor: primary,
        primaryColorHover: primaryHover,
        primaryColorPressed: primaryPressed,
        primaryColorSuppl: primaryHover,

        borderRadius: '6px',
        borderRadiusSmall: '4px',

        popoverColor: '#ffffff',
        tableColor: '#ffffff',
        cardColor: '#ffffff',
        modalColor: '#ffffff',
        bodyColor: '#ffffff',
        tagColor: '#ffffff',
        actionColor: '#ffffff',
        tableHeaderColor: '#fafbfc',
        hoverColor: subtleLight,
        pressedColor: subtle,

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
        inputBorderFocus: primary,
        inputBoxShadowFocus: `0 0 0 2px ${subtle}`,

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
        colorPrimary: primary,
        colorHoverPrimary: primaryHover,
        colorPressedPrimary: primaryPressed,
        borderPrimary: primary,
        borderHoverPrimary: primaryHover,
        borderPressedPrimary: primaryPressed,
      },
      Input: {
        borderFocus: primary,
        boxShadowFocus: `0 0 0 2px ${subtle}`,
      },
      Select: {
        peers: {
          InternalSelection: {
            borderFocus: primary,
            boxShadowFocus: `0 0 0 2px ${subtle}`,
          },
          InternalSelectMenu: {
            optionColorActive: subtle,
            optionTextColorActive: primary,
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
        itemTextColorActive: primary,
        itemColorActive: subtle,
        itemTextColorActiveHover: primary,
        itemColorActiveHover: subtleHover,
      },
      Tabs: {
        tabTextColorActive: primary,
        barColor: primary,
        tabTextColorActiveBar: primary,
        colorSegment: subtle,
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
        railColorActive: primary,
      },
      Checkbox: {
        colorChecked: primary,
        borderChecked: primary,
      },
      Radio: {
        buttonColorActive: primary,
        buttonBorderActive: primary,
      },
      Pagination: {
        itemColorActive: primary,
        itemBorderActive: primary,
      },
      Tree: {
        nodeColorActive: subtle,
        nodeTextColorActive: primary,
      },
      Spin: {
        color: primary,
      },
      DatePicker: {
        cellColorSelected: subtle,
        cellTextColorSelected: primary,
        cellBorderCurrent: primary,
      },
      Dropdown: {
        color: '#ffffff',
        optionColorActive: subtle,
        optionTextColorActive: primary,
      },
      Tooltip: {
        color: '#1a1a2e',
        textColor: '#ffffff',
      },
    },
  }
}

// 预设主题
export const themes: Record<string, ThemeConfig> = {
  orange: createTheme('orange', '活力橙', '#FF6B00', '#FF8C42', '#CC5500'),
  purple: createTheme('purple', '优雅紫', '#7c3aed', '#8b5cf6', '#6d28d9'),
  starryPurple: createTheme('starryPurple', '星夜紫', '#6366f1', '#818cf8', '#4f46e5'),
  titaniumSilver: createTheme('titaniumSilver', '钛空银', '#64748b', '#94a3b8', '#475569'),
  flowTeal: createTheme('flowTeal', '流光青', '#14b8a6', '#2dd4bf', '#0d9488'),
  pulseBlue: createTheme('pulseBlue', '脉冲蓝', '#0ea5e9', '#38bdf8', '#0284c7'),
  obsidianBlack: createTheme('obsidianBlack', '曜石黑', '#374151', '#6b7280', '#1f2937'),
  warmWhite: createTheme('warmWhite', '暖云白', '#f97316', '#fb923c', '#ea580c'),
  islandBlue: createTheme('islandBlue', '海岛蓝', '#0891b2', '#06b6d4', '#0e7490'),
  pastoralGreen: createTheme('pastoralGreen', '牧野绿', '#22c55e', '#4ade80', '#16a34a'),
  gildedBlack: createTheme('gildedBlack', '鎏金黑', '#ca8a04', '#eab308', '#a16207'),
}

// 根据名称获取主题
export function getTheme(name: string): ThemeConfig {
  return themes[name] || themes.orange
}

// 导出所有主题名称（用于设置选项）
export const themeOptions = Object.entries(themes).map(([value, theme]) => ({
  value,
  label: theme.label,
}))
