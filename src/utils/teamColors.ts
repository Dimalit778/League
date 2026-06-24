export type JerseyPattern =
  | 'solid'
  | 'vertical_stripes'
  | 'horizontal_stripes'
  | 'diagonal_sash'
  | 'chest_band'
  | 'half';

export type TeamJerseyColors = {
  teamName: string;
  primaryColor: string;
  secondaryColor: string;
  thirdColor?: string | null;
  textColor?: string;
  pattern: JerseyPattern;
  stripeCount?: number;
  collarColor?: string;
  sleeveColor?: string;
};
export const LA_LIGA_TEAM_COLORS = [
    {
      teamName: "FC Barcelona",
      apiFootballId: null,
      primaryColor: "#004D98",
      secondaryColor: "#A50044",
      thirdColor: "#EDBB00",
      textColor: "#FFFFFF",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#004D98",
      sleeveColor: "#004D98",
      confidence: "leaked",
      note: "26/27 home kit leaked; classic blaugrana vertical stripes. Use blue/red stripes with yellow accent."
    },
    {
      teamName: "Real Madrid",
      apiFootballId: null,
      primaryColor: "#FFFFFF",
      secondaryColor: "#D4AF37",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "solid",
      stripeCount: 0,
      collarColor: "#D4AF37",
      sleeveColor: "#FFFFFF",
      confidence: "official",
      note: "26/27 home kit listed as official/released. White base with gold/black details."
    },
    {
      teamName: "Atletico Madrid",
      apiFootballId: null,
      primaryColor: "#C8102E",
      secondaryColor: "#FFFFFF",
      thirdColor: "#003B7A",
      textColor: "#003B7A",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#003B7A",
      sleeveColor: "#C8102E",
      confidence: "leaked",
      note: "Home kit leak exists; traditional red/white stripes with navy/blue details."
    },
    {
      teamName: "Athletic Club",
      apiFootballId: null,
      primaryColor: "#EE2523",
      secondaryColor: "#FFFFFF",
      thirdColor: "#000000",
      textColor: "#000000",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#000000",
      sleeveColor: "#EE2523",
      confidence: "official",
      note: "26/27 home/away listed. Classic red/white vertical stripes."
    },
    {
      teamName: "Real Betis",
      apiFootballId: null,
      primaryColor: "#00954C",
      secondaryColor: "#FFFFFF",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#00954C",
      sleeveColor: "#FFFFFF",
      confidence: "official",
      note: "26/27 home listed. Green/white vertical stripes."
    },
    {
      teamName: "Villarreal CF",
      apiFootballId: null,
      primaryColor: "#FFE667",
      secondaryColor: "#005BAC",
      thirdColor: "#111111",
      textColor: "#005BAC",
      pattern: "solid",
      stripeCount: 0,
      collarColor: "#005BAC",
      sleeveColor: "#FFE667",
      confidence: "official",
      note: "26/27 home listed as released. Yellow base with blue details."
    },
    {
      teamName: "Valencia CF",
      apiFootballId: null,
      primaryColor: "#FFFFFF",
      secondaryColor: "#000000",
      thirdColor: "#FF8200",
      textColor: "#000000",
      pattern: "solid",
      stripeCount: 0,
      collarColor: "#000000",
      sleeveColor: "#FFFFFF",
      confidence: "leaked",
      note: "26/27 home/away leaks listed. Use classic white shirt with black/orange details."
    },
    {
      teamName: "Sevilla FC",
      apiFootballId: null,
      primaryColor: "#FFFFFF",
      secondaryColor: "#D71920",
      thirdColor: "#111111",
      textColor: "#D71920",
      pattern: "solid",
      stripeCount: 0,
      collarColor: "#D71920",
      sleeveColor: "#FFFFFF",
      confidence: "leaked",
      note: "26/27 home/away leaks listed. Classic white base with red details."
    },
    {
      teamName: "Girona FC",
      apiFootballId: null,
      primaryColor: "#D71920",
      secondaryColor: "#FFFFFF",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#111111",
      sleeveColor: "#D71920",
      confidence: "leaked",
      note: "26/27 Girona kit leaks/info listed. Traditional red/white stripes."
    },
  
    {
      teamName: "Celta Vigo",
      apiFootballId: null,
      primaryColor: "#A7D8F0",
      secondaryColor: "#FFFFFF",
      thirdColor: "#D71920",
      textColor: "#003B5C",
      pattern: "solid",
      stripeCount: 0,
      collarColor: "#FFFFFF",
      sleeveColor: "#A7D8F0",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Based on traditional sky blue home shirt."
    },
    {
      teamName: "Getafe CF",
      apiFootballId: null,
      primaryColor: "#0057B8",
      secondaryColor: "#FFFFFF",
      thirdColor: "#D71920",
      textColor: "#FFFFFF",
      pattern: "solid",
      stripeCount: 0,
      collarColor: "#FFFFFF",
      sleeveColor: "#0057B8",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Based on traditional blue home shirt."
    },
    {
      teamName: "Rayo Vallecano",
      apiFootballId: null,
      primaryColor: "#FFFFFF",
      secondaryColor: "#E30613",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "diagonal_sash",
      stripeCount: 1,
      collarColor: "#FFFFFF",
      sleeveColor: "#FFFFFF",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Classic white shirt with red diagonal sash."
    },
    {
      teamName: "RCD Espanyol",
      apiFootballId: null,
      primaryColor: "#005BAC",
      secondaryColor: "#FFFFFF",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#005BAC",
      sleeveColor: "#005BAC",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Classic blue/white vertical stripes."
    },
    {
      teamName: "RCD Mallorca",
      apiFootballId: null,
      primaryColor: "#D71920",
      secondaryColor: "#000000",
      thirdColor: "#FFFFFF",
      textColor: "#FFFFFF",
      pattern: "solid",
      stripeCount: 0,
      collarColor: "#000000",
      sleeveColor: "#D71920",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Traditional red home shirt with black details."
    },
    {
      teamName: "CA Osasuna",
      apiFootballId: null,
      primaryColor: "#C8102E",
      secondaryColor: "#003B7A",
      thirdColor: "#FFFFFF",
      textColor: "#FFFFFF",
      pattern: "solid",
      stripeCount: 0,
      collarColor: "#003B7A",
      sleeveColor: "#C8102E",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Traditional red shirt with navy details."
    },
    {
      teamName: "Deportivo Alaves",
      apiFootballId: null,
      primaryColor: "#0057B8",
      secondaryColor: "#FFFFFF",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#0057B8",
      sleeveColor: "#0057B8",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Traditional blue/white vertical stripes."
    },
    {
      teamName: "Elche CF",
      apiFootballId: null,
      primaryColor: "#FFFFFF",
      secondaryColor: "#007A3D",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "chest_band",
      stripeCount: 1,
      collarColor: "#FFFFFF",
      sleeveColor: "#FFFFFF",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Classic white shirt with green chest band."
    },
    {
      teamName: "Levante UD",
      apiFootballId: null,
      primaryColor: "#003B7A",
      secondaryColor: "#A50044",
      thirdColor: "#FFFFFF",
      textColor: "#FFFFFF",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#003B7A",
      sleeveColor: "#003B7A",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Traditional blue/claret vertical stripes."
    },
    {
      teamName: "Real Sociedad",
      apiFootballId: null,
      primaryColor: "#005BAC",
      secondaryColor: "#FFFFFF",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#005BAC",
      sleeveColor: "#005BAC",
      confidence: "estimated",
      note: "26/27 kit not confirmed. Classic blue/white vertical stripes."
    },
    {
      teamName: "Deportivo La Coruna",
      apiFootballId: null,
      primaryColor: "#0057B8",
      secondaryColor: "#FFFFFF",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "vertical_stripes",
      stripeCount: 5,
      collarColor: "#0057B8",
      sleeveColor: "#0057B8",
      confidence: "estimated",
      note: "Promoted for 26/27. Traditional blue/white vertical stripes."
    },
    {
      teamName: "Racing Santander",
      apiFootballId: null,
      primaryColor: "#FFFFFF",
      secondaryColor: "#00843D",
      thirdColor: "#111111",
      textColor: "#111111",
      pattern: "solid",
      stripeCount: 0,
      collarColor: "#00843D",
      sleeveColor: "#FFFFFF",
      confidence: "estimated",
      note: "Promoted for 26/27. Traditional white shirt with green details."
    }
  ] as const;
  function normalizeTeamNameForSearch(name: string) {
    return name
      .toLowerCase()
      .replace(/fc/g, '')
      .replace(/cf/g, '')
      .replace(/rcd/g, '')
      .replace(/real/g, '')
      .replace(/club/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }
  
  export function getTeamJersey(teamName: string): TeamJerseyColors | undefined {
    const normalizedName = normalizeTeamNameForSearch(teamName);
  
    return LA_LIGA_TEAM_COLORS.find((team) => {
      const normalizedJerseyName = normalizeTeamNameForSearch(team.teamName);
  
      return (
        normalizedJerseyName === normalizedName ||
        normalizedJerseyName.includes(normalizedName) ||
        normalizedName.includes(normalizedJerseyName)
      );
    });
  }