import { useEffect, useState } from "react";
import { getCurrentDraw, getDraws } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function DrawParticipation({ mini = false }) {
  const { hasActiveSubscription } = useAuth();
  const [currentDraw, setCurrentDraw] = useState(null);
  const [pastDraws, setPastDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCurrentDraw(), getDraws()])
      .then(([curr, past]) => {
        setCurrentDraw(curr.data);
        setPastDraws(past.data.draws || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-center">
        <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (mini) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-gray-400 text-sm mb-2">CURRENT PRIZE POOL</p>
        <p className="text-3xl font-bold text-green-400">
          ₹{(currentDraw?.prizePool || 0).toLocaleString()}
        </p>
        <p className="text-gray-400 text-sm mt-2">Monthly draw · {currentDraw?.activeSubscribers || 0} subscribers entered</p>
        <div className="mt-3 text-xs text-gray-500">
          {hasActiveSubscription ? "✅ You're entered in this month's draw" : "⚠ Subscribe to enter draws"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CURRENT DRAW */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🎰</span>
          <div>
            <h2 className="text-xl font-semibold">Current Month's Draw</h2>
            <p className="text-gray-400 text-sm">
              {MONTHS[(currentDraw?.month || new Date().getMonth() + 1) - 1]} {currentDraw?.year || new Date().getFullYear()}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Prize Pool", value: `₹${(currentDraw?.prizePool || 0).toLocaleString()}`, icon: "💰", color: "text-green-400" },
            { label: "5-Match Jackpot (40%)", value: `₹${(currentDraw?.jackpot || 0).toLocaleString()}`, icon: "🏆", color: "text-yellow-400" },
            { label: "4-Match Pool (35%)", value: `₹${(currentDraw?.fourMatch || 0).toLocaleString()}`, icon: "🥈", color: "text-blue-400" },
            { label: "3-Match Pool (25%)", value: `₹${(currentDraw?.threeMatch || 0).toLocaleString()}`, icon: "🥉", color: "text-orange-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-black/20 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Entry status */}
        <div className={`rounded-xl p-4 border ${hasActiveSubscription ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
          <p className={`font-medium ${hasActiveSubscription ? "text-green-400" : "text-red-400"}`}>
            {hasActiveSubscription
              ? "✅ You are entered in this month's draw"
              : "❌ Subscribe to be entered in this draw"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {hasActiveSubscription
              ? "Your last 5 Stableford scores will be matched against the winning numbers after the draw is run."
              : "All active subscribers automatically participate in each monthly draw."}
          </p>
        </div>

        {/* HOW IT WORKS */}
        <div className="mt-6 bg-black/10 rounded-xl p-4">
          <p className="text-sm font-medium mb-3">How the draw works:</p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>🎲 5 winning numbers are drawn from 1–45 (Stableford range)</p>
            <p>⛳ Your last 5 scores are compared to the winning numbers</p>
            <p>🏆 Match 3, 4 or 5 numbers to win a prize tier</p>
            <p>🔄 Jackpot rolls over to next month if no 5-match winner</p>
          </div>
        </div>
      </div>

      {/* PAST DRAWS */}
      {pastDraws.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Past Draws</h3>
          <div className="space-y-3">
            {pastDraws.map((draw) => (
              <div key={draw._id} className="flex items-center justify-between bg-black/20 rounded-xl px-5 py-3">
                <div>
                  <p className="font-medium">{MONTHS[draw.month - 1]} {draw.year}</p>
                  <p className="text-gray-400 text-xs">
                    Winning: {draw.winningNumbers?.join(" · ") || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">₹{draw.totalPrizePool?.toLocaleString() || "—"}</p>
                  <p className="text-xs text-gray-400 capitalize">{draw.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
