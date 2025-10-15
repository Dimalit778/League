const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString([], {
    day: 'numeric',
    month: 'numeric',
  });
};
const getMatchStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'not started':
      return ['#6366F1', '#8B5CF6'];
    case 'first half':
    case 'second half':
    case 'halftime':
      return ['#EF4444', '#F97316'];
    case 'match finished':
      return ['#10B981', '#059669'];
    default:
      return ['#6B7280', '#9CA3AF'];
  }
};
// Helper function for prediction accuracy

export const predictionAccuracy = (
  predictedHomeScore: number,
  predictedAwayScore: number,
  actualHomeScore: number | null,
  actualAwayScore: number | null
) => {
  if (actualHomeScore === null || actualAwayScore === null) return null;

  const predictedResult =
    predictedHomeScore > predictedAwayScore
      ? 'H'
      : predictedHomeScore < predictedAwayScore
        ? 'A'
        : 'D';
  const actualResult =
    actualHomeScore > actualAwayScore
      ? 'H'
      : actualHomeScore < actualAwayScore
        ? 'A'
        : 'D';

  if (
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore
  ) {
    return {
      type: 'exact',
      points: 3,
      color: '#059669',

      text: 'Perfect!',
      icon: '🎯',
    };
  } else if (predictedResult === actualResult) {
    return {
      type: 'result',
      points: 1,
      color: '#F59E0B',
      text: 'Result ✓',
      icon: '📈',
    };
  }
  return {
    type: 'wrong',
    points: 0,
    color: '#EF4444',

    text: 'Miss',
    icon: '❌',
  };
};

export { formatDate, formatTime, getMatchStatusColor };
