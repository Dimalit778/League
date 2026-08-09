/**
 * Returns the same RGB color with a different alpha value.
 *
 * This is useful for gradients: fading a light color to the named color
 * `transparent` interpolates through transparent black and creates a grey band.
 */
export function setColorAlpha(color: string, alpha: number): string {
  const functionalColor = color.match(
    /^rgba?\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,)]+)\s*(?:,\s*[^)]+\s*)?\)$/i,
  );

  if (functionalColor) {
    const [, red, green, blue] = functionalColor;
    return `rgba(${red.trim()}, ${green.trim()}, ${blue.trim()}, ${alpha})`;
  }

  const hexColor = color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);

  if (hexColor) {
    const [, red, green, blue] = hexColor;
    return `rgba(${parseInt(red, 16)}, ${parseInt(green, 16)}, ${parseInt(blue, 16)}, ${alpha})`;
  }

  return color;
}
