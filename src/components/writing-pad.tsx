import { useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Path, Polyline, Text } from 'react-native-svg';

import { calligraphyColors as c, colors, fonts } from '@/constants/theme';
import type { Stroke } from '@/constants/strokes';
import type { Point } from '@/core/calligraphy';

// KanjiVG's strokes are drawn on a 109-unit square.
const GRID = 109;

type Props = {
  strokes: readonly Stroke[];
  done: number; // how many strokes are written
  demo: number | null; // during "Show order": the stroke being shown
  onStroke: (points: Point[]) => void;
};

// The calligraphy frame from the mock: centre guides, the kana faint underneath, numbered dots
// where each stroke starts, written strokes in green, and the stroke being drawn in ink. Drag
// a finger to draw; letting go hands the stroke over to be judged.
export function WritingPad({ strokes, done, demo, onStroke }: Props) {
  const [size, setSize] = useState(0);
  const [drawing, setDrawing] = useState<Point[]>([]);
  // The stroke so far, kept in a ref too, so letting go hands over every point even if the
  // last few haven't reached the screen yet. It's only touched in the touch handlers.
  const points = useRef<Point[]>([]);

  // A touch's place on the 109-unit grid.
  const toGrid = (event: GestureResponderEvent): Point => [
    (event.nativeEvent.locationX * GRID) / (size || GRID),
    (event.nativeEvent.locationY * GRID) / (size || GRID),
  ];

  const touch = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderGrant: (event: GestureResponderEvent) => {
      points.current = [toGrid(event)];
      setDrawing(points.current);
    },
    onResponderMove: (event: GestureResponderEvent) => {
      points.current = [...points.current, toGrid(event)];
      setDrawing(points.current);
    },
    onResponderRelease: () => {
      onStroke(points.current);
      points.current = [];
      setDrawing([]);
    },
    onResponderTerminate: () => {
      points.current = [];
      setDrawing([]);
    },
  };

  function onLayout(event: LayoutChangeEvent) {
    setSize(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.frame} onLayout={onLayout}>
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      {size > 0 && (
        <Svg width={size} height={size} viewBox={`0 0 ${GRID} ${GRID}`} pointerEvents="none">
          <Path d="M54.5 6v97M6 54.5h97" stroke={c.centreLine} strokeWidth={0.8} strokeDasharray="3 3" />
          {/* The whole kana, faint, to trace over. */}
          <G fill="none" stroke={c.guide} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
            {strokes.map((stroke, i) => (
              <Path key={i} d={stroke.d} />
            ))}
          </G>
          {/* Strokes written so far. */}
          {strokes.slice(0, done).map((stroke, i) => (
            <Path key={i} d={stroke.d} fill="none" stroke={colors.pine} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {demo !== null && strokes[demo] && (
            <Path d={strokes[demo]!.d} fill="none" stroke={colors.vermilion} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          )}
          {/* Where each stroke starts, numbered in order. */}
          {strokes.map((stroke, i) => {
            const [x, y] = stroke.points[0] ?? [0, 0];
            const state = i < done ? 'done' : i === done ? 'now' : 'later';
            return (
              <G key={`dot${i}`}>
                <Circle cx={x} cy={y} r={4.6} fill={state === 'done' ? colors.pineLight : state === 'now' ? c.centreLine : c.laterDot} />
                <Text
                  x={x}
                  y={y + 2.2}
                  fontSize={6}
                  fontFamily={fonts.uiBlack}
                  textAnchor="middle"
                  fill={state === 'done' ? colors.pineDark : state === 'now' ? colors.sumi : colors.muted}>
                  {i + 1}
                </Text>
              </G>
            );
          })}
          {/* The stroke being drawn now. */}
          {drawing.length > 1 && (
            <Polyline
              points={drawing.map(([x, y]) => `${x},${y}`).join(' ')}
              fill="none"
              stroke={colors.sumi}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      )}
      {/* Touches land on this clear layer over the drawing, so their position is always
          measured from the frame, never from one of the strokes under the finger. */}
      <View style={StyleSheet.absoluteFill} {...touch} />
    </View>
  );
}

const CORNER = 15;

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.sumi,
  },
  topLeft: { top: 7, left: 7, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 7, right: 7, borderTopWidth: 3, borderRightWidth: 3 },
});
