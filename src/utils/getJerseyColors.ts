
export type JerseyColors = {
  baseColor: string;
  secondaryColor: string;
  sleeveTrimColor: string;
  collarColor: string;
  textOutlineColor: string;
};

function normalizeColor(color?: string | null, fallback = 'red') {
  if (!color) return fallback;

  const clean = color.trim().toLowerCase();

  const aliases: Record<string, string> = {
    'navy blue': 'navy',
    'sky blue': 'lightskyblue',
    'light blue': 'lightblue',
    'dark blue': 'darkblue',
    'royal blue': 'royalblue',
    grey: 'gray',
  };

  return aliases[clean] ?? clean;
}

function getAccentFallback(baseColor: string) {
  const clean = baseColor.toLowerCase();

  if (clean === 'white' || clean === '#fff' || clean === '#ffffff') {
    return 'black';
  }

  return 'white';
}

export function getJerseyFromClubColors(clubColors?: string | null): JerseyColors {
  const colors =
    clubColors
      ?.split('/')
      .map((color) => color.trim())
      .filter(Boolean) ?? [];

  const baseColor = normalizeColor(colors[0], 'red');

  const secondaryColor = normalizeColor(
    colors[1],
    getAccentFallback(baseColor)
  );

  const thirdColor = normalizeColor(colors[2], secondaryColor);

  return {
    baseColor,
    secondaryColor,
    sleeveTrimColor: thirdColor,
    collarColor: secondaryColor,
    textOutlineColor: secondaryColor,
  };
}