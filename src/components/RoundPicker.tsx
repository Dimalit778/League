import React from "react";

interface RoundSelectorProps {
  availableRounds: string[];
  selectedRound: string;
  onRoundChange: (round: string) => void;
  completedRounds?: string[]; // Optionally, pass in completed rounds for styling
}

export const RoundSelector: React.FC<RoundSelectorProps> = ({
  availableRounds,
  selectedRound,
  onRoundChange,
  completedRounds = [],
}) => {
  // Extract round numbers for display
  const getRoundNumber = (roundName: string) => {
    const match = roundName.match(/- (\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  // Sort rounds by number
  const sortedRounds = [...availableRounds].sort(
    (a, b) => getRoundNumber(a) - getRoundNumber(b)
  );

  // Determine if a round is completed
  const isCompleted = (round: string) => completedRounds.includes(round);

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Gameweek</h1>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sortedRounds.map((round) => {
          const roundNum = getRoundNumber(round);
          const isSelected = selectedRound === round;
          let buttonClass =
            "flex-shrink-0 w-12 h-12 rounded-lg font-semibold transition-all";
          if (isSelected) {
            buttonClass += " bg-green-500 text-white shadow-lg";
          } else if (isCompleted(round)) {
            buttonClass += " bg-green-100 text-green-700";
          } else {
            buttonClass += " bg-gray-100 text-gray-600 hover:bg-gray-200";
          }
          return (
            <button
              key={round}
              onClick={() => onRoundChange(round)}
              className={buttonClass}
            >
              {roundNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};
