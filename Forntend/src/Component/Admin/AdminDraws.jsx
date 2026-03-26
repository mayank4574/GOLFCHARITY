import { useState, useEffect } from "react";
import { simulateDraw, publishDraw, adminGetWinners } from "../../api/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminDraws() {
  const [drawType, setDrawType] = useState("random");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [simulation, setSimulation] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [pubLoading, setPubLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSimulate = async () => {
    setError(""); setSuccess(""); setSimulation(null);
    setSimLoading(true);
    try {
      const { data } = await simulateDraw({ month, year, drawType });
      setSimulation(data);
    } catch (err) {
      setError(err.response?.data?.message || "Simulation failed");
    } finally {
      setSimLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm(`Publish the ${MONTHS[month - 1]} ${year} draw? This will create winner records and cannot be undone.`)) return;
    setError(""); setSuccess("");
    setPubLoading(true);
    try {
      const { data } = await publishDraw({ month, year, drawType });
      setSuccess(`✅ Draw published! ${data.winners.fiveMatch.length + data.winners.fourMatch.length + data.winners.threeMatch.length} winner(s) created.`);
      if (data.jackpotRolledOver) {
        setSuccess((p) => p + " 🔄 Jackpot rolled over to next month.");
      }
      setSimulation(null);
    } catch (err) {
      setError(err.response?.data?.message || "Publish failed");
    } finally {
      setPubLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-green-400 text-xs tracking-widest mb-1">ADMIN</p>
        <h1 className="text-3xl font-bold">Draw Management</h1>
        <p className="text-gray-400 mt-1">Configure, simulate, and publish monthly prize draws.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl">{success}</div>}

      {/* DRAW CONFIG */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Draw Configuration</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs text-gray-400">MONTH</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400">YEAR</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min="2024" max="2030"
              className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400">DRAW TYPE</label>
            <select value={drawType} onChange={(e) => setDrawType(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white">
              <option value="random">Random (Standard Lottery)</option>
              <option value="algorithmic">Algorithmic (Score-Weighted)</option>
            </select>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-4 mb-6 text-sm text-gray-400">
          {drawType === "random"
            ? "🎲 Random: 5 numbers drawn from 1–45 using a standard random number generator."
            : "📊 Algorithmic: Numbers weighted by score frequency — less frequent scores have a higher chance of being drawn."}
        </div>

        <div className="flex gap-4">
          <button onClick={handleSimulate} disabled={simLoading}
            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-6 py-3 rounded-xl font-semibold hover:bg-blue-500/30 transition disabled:opacity-60">
            {simLoading ? "Simulating..." : "🧪 Run Simulation"}
          </button>
          <button onClick={handlePublish} disabled={pubLoading}
            className="bg-green-500 text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-60">
            {pubLoading ? "Publishing..." : "🚀 Publish Draw"}
          </button>
        </div>
      </div>

      {/* SIMULATION RESULTS */}
      {simulation && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-400 text-xs bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">SIMULATION ONLY — Not Published</span>
          </div>
          <h3 className="text-lg font-semibold mb-4">Simulation Results — {MONTHS[simulation.month - 1]} {simulation.year}</h3>

          {/* WINNING NUMBERS */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Winning Numbers Drawn:</p>
            <div className="flex gap-3">
              {simulation.winningNumbers.map((n) => (
                <div key={n} className="w-12 h-12 rounded-full bg-green-500 text-black font-bold text-lg flex items-center justify-center">
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* PRIZE POOL */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-gray-400 text-xs">5-MATCH JACKPOT</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">₹{simulation.jackpot?.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{simulation.winners.fiveMatch.length} winner(s)</p>
              {simulation.jackpotRollover && <p className="text-yellow-400 text-xs mt-1">🔄 No winner — will rollover</p>}
            </div>
            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-gray-400 text-xs">4-MATCH POOL</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">₹{simulation.winners.fourMatch.reduce((s, w) => s + w.prizeAmount, 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{simulation.winners.fourMatch.length} winner(s)</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-gray-400 text-xs">3-MATCH POOL</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">₹{simulation.winners.threeMatch.reduce((s, w) => s + w.prizeAmount, 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{simulation.winners.threeMatch.length} winner(s)</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm">{simulation.activeSubscribers} active subscribers entered this draw.</p>

          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-400 text-sm font-medium">Ready to publish?</p>
            <p className="text-gray-400 text-xs mt-1">Click "Publish Draw" above to make this official and notify winners.</p>
          </div>
        </div>
      )}
    </div>
  );
}
