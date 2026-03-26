import { Platform } from 'react-native';

// ─── Cores originais do template ──────────────────────────────
const tintColorLight = '#0a7ea4';
const tintColorDark  = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// ─── Cores do WMS Mini ────────────────────────────────────────
export const WMS = {
  teal:       '#1d9e75',
  tealBg:     'rgba(29,158,117,0.12)',
  tealBorder: 'rgba(29,158,117,0.3)',

  blue:       '#378add',
  blueBg:     'rgba(55,138,221,0.12)',
  blueBorder: 'rgba(55,138,221,0.3)',

  amber:       '#ef9f27',
  amberBg:     'rgba(239,159,39,0.12)',
  amberBorder: 'rgba(239,159,39,0.3)',

  red:       '#e24b4a',
  redBg:     'rgba(226,75,74,0.12)',
  redBorder: 'rgba(226,75,74,0.3)',

  purple:       '#7f77dd',
  purpleBg:     'rgba(127,119,221,0.12)',
  purpleBorder: 'rgba(127,119,221,0.3)',

  border:  'rgba(255,255,255,0.09)',
  border2: 'rgba(255,255,255,0.16)',
  muted:   '#7a766e',
  surface: '#1a1917',
  surface2:'#242220',
  bg:      '#0f0e0d',
};

export const statusColor = {
  ok:          { text: WMS.teal,   bg: WMS.tealBg,   border: WMS.tealBorder },
  pendente:    { text: WMS.amber,  bg: WMS.amberBg,  border: WMS.amberBorder },
  divergencia: { text: WMS.red,    bg: WMS.redBg,    border: WMS.redBorder },
};

export const tipoColor = {
  qrcode: { text: WMS.purple, bg: WMS.purpleBg, border: WMS.purpleBorder },
  ocr:    { text: WMS.blue,   bg: WMS.blueBg,   border: WMS.blueBorder },
};

// ─── Fontes (original) ────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});