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
  indigoLight: '#E6F0FA',
  indigoDark: '#1D5B8C',
  woodDark: '#A67C44',
  goldDark: '#8A6D0E',
  goldLight: '#FBF3D9',
  nightRaised: '#26282E', // chips and cards on the night background
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
  fledglingBody: '#343949', // white-belt Karasu is a lighter, younger crow
  staff: '#8A6A43', // black-belt Karasu's staff
  hat: '#151515',
  hatEdge: '#4A4F62',
  lightBeltEdge: '#B9BFCB', // outline of a white belt
  shadow: 'rgba(0, 0, 0, 0.14)',
} as const;

// The dojo wall on the Learn path: the rail plaques hang from, and their cords and pegs;
// and the wooden floor Karasu stands on, with its edge and the lines between planks.
export const wallColors = {
  rail: '#6B4E35',
  cord: '#6B5236',
  peg: '#3A2E22',
  floor: '#CFC79A',
  floorEdge: '#8A6A43',
  plank: 'rgba(0, 0, 0, 0.07)',
} as const;

// Kana Rain: the sky, clouds, the paper tags the kana fall on, and the ground.
export const rainColors = {
  sky: '#DCE6EF',
  cloud: '#EDF2F7',
  tag: '#FBF6EC',
  tagEdge: '#C9B894',
  ground: '#CFC79A',
  groundEdge: '#8A6A43',
} as const;

// Duels: a dark red room, with a raised panel for the tip, the score track, and soft text.
export const duelColors = {
  background: '#2A1512',
  panel: 'rgba(255, 255, 255, 0.08)',
  track: '#54302A',
  soft: '#E4B6AC',
} as const;

// Yokai, the kana spirits a learner faces in duels: horns, eyes, belly, and body colours.
export const yokaiColors = {
  outline: '#0E0F15',
  horn: '#EFE6D2',
  eye: '#F2C14E',
  belly: '#F4EFE4',
  fang: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.3)',
  redBody: '#B8341D',
  slateBody: '#3A3F52',
} as const;

// Won scrolls: the paper, and the rule above the result line. The rods use wallColors.rail.
export const scrollColors = {
  paper: '#F8F4EC',
  rule: '#E0D8C6',
} as const;

// Icon fills: the memory-tip bulb, the XP bolt, the streak flame, and the rest-day star.
export const iconColors = {
  yellow: '#FFC93C',
  yellowEdge: '#DDA200',
  bulbBase: '#A9A2BF',
  flame: '#FF9B3D',
  star: '#FBE7A0',
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
