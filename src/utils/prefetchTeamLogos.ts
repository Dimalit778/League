import { Image as ExpoImage } from 'expo-image';

type TeamLogoInput = {
  home_team_logo?: string | null;
  away_team_logo?: string | null;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;

  home_team?: {
    crest?: string | null;
    logo?: string | null;
  } | null;

  away_team?: {
    crest?: string | null;
    logo?: string | null;
  } | null;

  homeTeam?: {
    crest?: string | null;
    logo?: string | null;
  } | null;

  awayTeam?: {
    crest?: string | null;
    logo?: string | null;
  } | null;
};

const isValidImageUrl = (url?: string | null) => {
  return typeof url === 'string' && url.trim().startsWith('http');
};

export const prefetchTeamLogos = async (
  logos: (string | null | undefined)[],
) => {
  const uniqueLogos = [...new Set(logos.filter(isValidImageUrl))] as string[];

  if (uniqueLogos.length === 0) return;

  try {
    await ExpoImage.prefetch(uniqueLogos, { cachePolicy: 'memory-disk' });
  } catch {
    // Image prefetch is an optimization; rendering should not depend on it.
  }
};

export const prefetchMatchTeamLogos = async (
  matches: TeamLogoInput | TeamLogoInput[],
) => {
  const matchList = Array.isArray(matches) ? matches : [matches];

  const logos = matchList.flatMap((match) => [
    match.home_team_logo,
    match.away_team_logo,
    match.homeTeamLogo,
    match.awayTeamLogo,

    match.home_team?.crest,
    match.away_team?.crest,
    match.home_team?.logo,
    match.away_team?.logo,

    match.homeTeam?.crest,
    match.awayTeam?.crest,
    match.homeTeam?.logo,
    match.awayTeam?.logo,
  ]);

  await prefetchTeamLogos(logos);
};
