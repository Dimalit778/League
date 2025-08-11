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

  const ScheduledStatus = ["Time To Be Defined", "Not Started"];
  const InPlayStatus = ["First Half","Kick Off","HalfTime","Second Half","2nd Half Started","Break Time","Penalty In Progress","Match Suspended","Match Interrupted"];
  const FinishedStatus = ["Match Finished", "Match Postponed", "Match Cancelled", "Match Abandoned"];
  const CancelledStatus = ["Match Cancelled", "Match Abandoned"];



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
