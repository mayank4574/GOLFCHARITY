import { useState, useEffect } from "react";
import { getCurrentDraw, getDraws } from "../../api/api";
import { Link } from "react-router-dom";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Price() {
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

  return (
    <div className="min-h-screen bg-[#071a2f] text-white pt-[70px]">

      {/* HERO */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 text-center">
        <p className="text-green-400 text-xs tracking-widest mb-4">🎰 MONTHLY PRIZE DRAWS</p>
        <h1 className="text-5xl font-bold mb-4">Win. Every Month.</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          All active subscribers are entered automatically. Match your Stableford scores against the winning numbers to claim a prize.
        </p>
      </div>

      {/* CURRENT PRIZE POOL */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 mb-16">
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/5 border border-green-500/20 rounded-3xl p-8 text-center">
          <p className="text-gray-400 text-sm tracking-widest mb-2">CURRENT PRIZE POOL</p>
          <div className="text-6xl font-bold text-green-400 mb-4">
            ₹{loading ? "—" : (currentDraw?.prizePool || 0).toLocaleString()}
          </div>
          <p className="text-gray-400 mb-6">
            {MONTHS[(currentDraw?.month || new Date().getMonth() + 1) - 1]} {currentDraw?.year || new Date().getFullYear()} Draw ·{" "}
            {currentDraw?.activeSubscribers || 0} subscribers entered
          </p>
          <Link to="/join-sanctuary" className="bg-green-500 text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition text-lg">
            Enter This Month's Draw →
          </Link>
        </div>
      </div>

      {/* PRIZE TIER BREAKDOWN */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Prize Tier Breakdown</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { match: "5-Number Match", share: "40%", amount: currentDraw?.jackpot || 0, icon: "🏆", desc: "Jackpot — rolls over if unclaimed", color: "border-yellow-500/30 text-yellow-400" },
            { match: "4-Number Match", share: "35%", amount: currentDraw?.fourMatch || 0, icon: "🥈", desc: "Split among multiple winners", color: "border-green-500/30 text-green-400" },
            { match: "3-Number Match", share: "25%", amount: currentDraw?.threeMatch || 0, icon: "🥉", desc: "Split among multiple winners", color: "border-blue-500/30 text-blue-400" },
          ].map((tier) => (
            <div key={tier.match} className={`bg-white/5 border rounded-2xl p-6 text-center ${tier.color}`}>
              <div className="text-4xl mb-3">{tier.icon}</div>
              <p className="font-bold text-lg">{tier.match}</p>
              <p className="text-3xl font-bold mt-1">₹{loading ? "—" : tier.amount.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-2">{tier.share} of prize pool</p>
              <p className="text-gray-500 text-xs mt-1">{tier.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">How the Draw Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Subscribe", desc: "Choose a monthly or yearly plan to get entered into draws automatically.", icon: "✅" },
            { step: "2", title: "Enter Scores", desc: "Log your last 5 Stableford scores (1–45) on your dashboard.", icon: "⛳" },
            { step: "3", title: "Draw Day", desc: "5 winning numbers are drawn monthly from the Stableford range.", icon: "🎰" },
            { step: "4", title: "Claim Prize", desc: "Match 3, 4 or 5 numbers? Upload proof and get paid!", icon: "💷" },
          ].map(({ step, title, desc, icon }) => (
            <div key={step} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{icon}</div>
              <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">{step}</div>
              <p className="font-semibold mb-2">{title}</p>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PAST DRAWS */}
      {pastDraws.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 mb-16">
          <h2 className="text-2xl font-bold mb-6">Past Draw Results</h2>
          <div className="space-y-4">
            {pastDraws.map((draw) => (
              <div key={draw._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-semibold">{MONTHS[draw.month - 1]} {draw.year}</p>
                  <div className="flex gap-2 mt-2">
                    {draw.winningNumbers?.map((n) => (
                      <span key={n} className="w-8 h-8 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center text-xs font-bold">{n}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">₹{draw.totalPrizePool?.toLocaleString()}</p>
                  {draw.jackpotRolledOver && <p className="text-yellow-400 text-xs">🔄 Jackpot rolled over</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500/10 to-transparent border-t border-white/5 py-16">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 text-center">
          <p className="text-3xl font-bold mb-4">Ready to win?</p>
          <Link to="/join-sanctuary" className="bg-green-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition">
            Subscribe & Enter Draws →
          </Link>
        </div>
      </div>
    </div>
  );
}