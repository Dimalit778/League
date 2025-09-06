export const getRoundNumber = (round: string) => {
  const match = round.match(/(\d+)$/);
  return match ? match[1] : '';
};
