// A transform origin (the point something spins and scales around) in whole pixels. Phones
// only read whole numbers there: "45.6px" is read as "6px", and "36.4%" as "364%", which
// spins and scales things around the wrong point, often off the screen. The web reads either.
export function wholePixels(x: number, y: number): string {
  return `${Math.round(x)}px ${Math.round(y)}px`;
}
