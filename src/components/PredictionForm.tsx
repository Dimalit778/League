import { supabase } from "@/lib/supabase";
import useAuthStore from "@/store/useAuthStore";
import { useState } from "react";

interface PredictionFormProps {
  fixture: {
    fixture_id: number;
    can_predict: boolean;
    // Add other fixture fields as needed
  };
}

const PredictionForm: React.FC<PredictionFormProps> = ({ fixture }) => {
  const { user } = useAuthStore();
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!user) {
      setMessage("You must be logged in to submit a prediction.");
      setLoading(false);
      return;
    }

    if (!fixture.can_predict) {
      setMessage("Predictions are closed for this fixture.");
      setLoading(false);
      return;
    }

    if (homeScore === "" || awayScore === "") {
      setMessage("Please enter both scores.");
      setLoading(false);
      return;
    }

 
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="number"
          min="0"
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value)}
          placeholder="Home"
          disabled={!fixture.can_predict || loading}
          style={{ width: "60px" }}
        />
        <span>-</span>
        <input
          type="number"
          min="0"
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value)}
          placeholder="Away"
          disabled={!fixture.can_predict || loading}
          style={{ width: "60px" }}
        />
        <button type="submit" disabled={!fixture.can_predict || loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
      {message && (
        <div
          style={{
            marginTop: "8px",
            color: message === "Prediction saved!" ? "green" : "red",
          }}
        >
          {message}
        </div>
      )}
    </form>
  );
};

export default PredictionForm;
