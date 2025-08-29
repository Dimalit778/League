const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      day: "numeric",
      month: "numeric",
    });
  };
const getMatchStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "not started":
        return ["#6366F1", "#8B5CF6"];
      case "first half":
      case "second half":
      case "halftime":
        return ["#EF4444", "#F97316"];
      case "match finished":
        return ["#10B981", "#059669"];
      default:
        return ["#6B7280", "#9CA3AF"];
    }
  };
  // Helper function for prediction accuracy

  const ScheduledStatus = ["Time To Be Defined", "Not Started"];
  const InPlayStatus = ["First Half","Kick Off","HalfTime","Second Half","2nd Half Started","Break Time","Penalty In Progress","Match Suspended","Match Interrupted"];
  const FinishedStatus = ["Match Finished", "Match Postponed", "Match Cancelled", "Match Abandoned"];
  const CancelledStatus = ["Match Cancelled", "Match Abandoned"];

  export const predictionAccuracy = (
    predictedHomeScore: number,
    predictedAwayScore: number,
    actualHomeScore: number | null,
    actualAwayScore: number | null
  ) => {
    if (actualHomeScore === null || actualAwayScore === null)
      return null;

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

export const isMatchScheduled = (statusShort: string): boolean => {
  const isScheduled = ScheduledStatus.includes(statusShort);
  return isScheduled;
};

export const isMatchInPlay = (statusShort: string): boolean => {
  const isInPlay = InPlayStatus.includes(statusShort);
  return isInPlay;
};

export const isMatchFinished = (statusShort: string): boolean => {
  const isFinished = FinishedStatus.includes(statusShort);
  return isFinished;
};


export const isMatchCancelled = (statusShort: string): boolean => {
  const isCancelled = CancelledStatus.includes(statusShort);
  return isCancelled;
};

export const canMakePredictions = (statusShort: string): boolean => {
  return isMatchScheduled(statusShort);
};


  export { formatDate, formatTime, getMatchStatusColor };
