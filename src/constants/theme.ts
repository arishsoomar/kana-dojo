export const colors = {
  sumi: '#1F2024',
  vermilion: '#E0492F',
  pine: '#2E9E5B',
  gold: '#C9A227',
  wood: '#D9B383',
  indigo: '#3B82C4',
  paper: '#EEF0F3',
  night: '#17181C',
  line: '#DDE1E8',
  ink2: '#5E6372',
  card: '#FFFFFF',
  muted: '#A3A9B6',
  edge: '#CDD2DB',
  pineDark: '#1E7A43',
  pineLight: '#E4F4EA',
  vermilionDark: '#B8341D',
  vermilionLight: '#FDECE8',
  backdrop: 'rgba(23, 24, 28, 0.5)', // night at 50%, behind dialogs
} as const;

// Karasu, the crow sensei.
export const karasuColors = {
  outline: '#0E0F15',
  body: '#232634',
  wing: '#1A1C27',
  chest: '#3A3F52',
  chestLines: '#2A2E3C',
  sheen: '#3E4357',
  brow: '#6B7185',
  eye: '#FFFFFF',
  beak: '#F2B53A',
  mouth: '#8C2F22',
  shadow: 'rgba(0, 0, 0, 0.14)',
} as const;

// Yellow icons: the memory-tip bulb and the XP bolt.
export const iconColors = {
  yellow: '#FFC93C',
  yellowEdge: '#DDA200',
  bulbBase: '#A9A2BF',
} as const;

// Outline for belt drawings: a light edge for the white belt, a dark one for the rest.
export const beltEdges = {
  light: '#C3C8D2',
  dark: 'rgba(0, 0, 0, 0.35)',
} as const;

export const beltColors = {
  white: '#FFFFFF',
  green: '#2E9E5B',
  brown: '#7A4A26',
  black: '#1B1D26',
} as const;

export const fonts = {
  uiMedium: 'Archivo_500Medium',
  uiSemiBold: 'Archivo_600SemiBold',
  uiBold: 'Archivo_700Bold',
  uiExtraBold: 'Archivo_800ExtraBold',
  uiBlack: 'Archivo_900Black',
  jp: 'ZenKakuGothicNew_900Black',
} as const;
