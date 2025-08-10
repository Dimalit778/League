const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  export { formatDate, formatTime, getMatchStatusColor };
