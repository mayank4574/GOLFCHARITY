import { useState, useEffect } from "react";
import { getScores, addScore, deleteScore } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function ScoreEntry() {
  const { hasActiveSubscription } = useAuth();
  const [scores, setScores] = useState([]);
  const [form, setForm] = useState({ score: "", scoreDate: new Date().toISOString().split("T")[0] });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchScores = async () => {
    try {
      const { data } = await getScores();
      setScores(data.scores || []);
    } catch (err) {
      if (err.response?.data?.code !== "SUBSCRIPTION_REQUIRED") {
        setError("Failed to load scores.");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (hasActiveSubscription) fetchScores();
    else setFetchLoading(false);
  }, [hasActiveSubscription]);

  if (!hasActiveSubscription) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-4xl mb-4">⛳</p>
        <h3 className="text-xl font-semibold mb-2">Subscription Required</h3>
        <p className="text-gray-400 mb-6">You need an active subscription to enter and track your golf scores.</p>
        <Link to="/join-sanctuary" className="bg-green-500 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition">
          Subscribe Now →
        </Link>
      </div>
    );
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const scoreNum = Number(form.score);
    if (scoreNum < 1 || scoreNum > 45) {
      return setError("Score must be between 1 and 45 (Stableford format)");
    }
    if (!form.scoreDate) return setError("Please select a score date");

    setLoading(true);
    try {
      const { data } = await addScore({ score: scoreNum, scoreDate: form.scoreDate });
      setScores(data.scores || []);
      setForm({ score: "", scoreDate: new Date().toISOString().split("T")[0] });
      setSuccess("Score added! Oldest score replaced if you had 5.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add score");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this score?")) return;
    try {
      await deleteScore(id);
      setScores((prev) => prev.filter((s) => s._id !== id));
    } catch {
      setError("Failed to delete score");
    }
  };

  return (
    <div className="space-y-6">
      {/* ADD SCORE FORM */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">⛳</span>
          <div>
            <h2 className="text-xl font-semibold">Enter Your Score</h2>
            <p className="text-gray-400 text-sm">Stableford format — 1 to 45 points. Only your latest 5 scores are kept.</p>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl mb-4">{success}</div>}

        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-400">STABLEFORD SCORE (1–45)</label>
            <input
              id="score-value"
              type="number"
              min="1" max="45"
              value={form.score}
              onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
              placeholder="e.g. 32"
              required
              className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400">DATE PLAYED</label>
            <input
              id="score-date"
              type="date"
              value={form.scoreDate}
              onChange={(e) => setForm((p) => ({ ...p, scoreDate: e.target.value }))}
              required
              max={new Date().toISOString().split("T")[0]}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              id="add-score-btn"
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-green-500 text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Score"}
            </button>
          </div>
        </form>
      </div>

      {/* SCORES LIST */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Last 5 Scores</h2>
          <span className="text-gray-400 text-sm">{scores.length}/5 scores recorded</span>
        </div>

        {fetchLoading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : scores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">⛳</p>
            <p className="text-gray-400">No scores yet. Enter your first score above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((s, idx) => (
              <div key={s._id} className="flex items-center justify-between bg-black/20 rounded-xl px-5 py-4">
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? "bg-green-500 text-black" : "bg-white/10 text-gray-400"}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-2xl">{s.score} <span className="text-sm font-normal text-gray-400">pts</span></p>
                    <p className="text-gray-400 text-xs">{new Date(s.scoreDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {idx === 0 && <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">LATEST</span>}
                  <button onClick={() => handleDelete(s._id)} className="text-red-400 hover:text-red-300 text-sm transition" title="Delete score">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar: 5 score slots */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Score slots used</span>
            <span>{scores.length}/5</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full">
            <div className="h-2 bg-green-500 rounded-full transition-all duration-500" style={{ width: `${(scores.length / 5) * 100}%` }} />
          </div>
          {scores.length === 5 && (
            <p className="text-yellow-400 text-xs mt-2">⚠ Adding a new score will remove your oldest score automatically.</p>
          )}
        </div>
      </div>
    </div>
  );
}
