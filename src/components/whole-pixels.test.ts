import { wholePixels } from './whole-pixels';

// React Native's own reader for transform origins, the one phones use. It's an internal file
// with no types, so it's given its shape here.
const processTransformOrigin: (origin: string) => (string | number)[] =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-native/Libraries/StyleSheet/processTransformOrigin').default;

describe('wholePixels', () => {
  it('is read on phones as the point it names', () => {
    expect(processTransformOrigin(wholePixels(45.64, 88.13))).toEqual([46, 88, 0]);
  });

  it('is needed: a fraction is misread on phones', () => {
    expect(processTransformOrigin('45.64px 88.13px')).not.toEqual([45.64, 88.13, 0]);
  });
});
