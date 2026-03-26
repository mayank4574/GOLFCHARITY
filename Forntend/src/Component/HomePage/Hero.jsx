import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCurrentDraw } from "../../api/api";

export default function Hero() {
  const [drawData, setDrawData] = useState(null);

  useEffect(() => {
    getCurrentDraw()
      .then((r) => setDrawData(r.data))
      .catch(() => {});
  }, []);

  const prizePool = drawData?.prizePool || 128450;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* LEFT */}
        <div className="max-w-xl">
          <p className="text-green-400 text-xs tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            THE GOLF CHARITY PLATFORM
          </p>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Play. Win. <br />
            <span className="text-green-400">Give Back.</span>
          </h1>

          <p className="text-gray-400 mt-6 text-lg">
            Subscribe to enter monthly prize draws with your Stableford scores, and support a charity you love — all in one platform.
          </p>

          <div className="flex gap-4 mt-8">
            <Link to="/join-sanctuary" className="bg-green-500 text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
              Start Your Journey →
            </Link>
            <Link to="/prizes" className="border border-white/20 text-white px-6 py-3 rounded-full hover:border-green-500 transition">
              View Draws
            </Link>
          </div>
        </div>

        {/* RIGHT — LIVE PRIZE CARD */}
        <div className="mt-10 md:mt-0 bg-[#0f172a] border border-white/10 p-8 rounded-3xl w-full md:w-[380px] shadow-2xl shadow-green-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-8 translate-x-8" />

          <p className="text-gray-400 text-sm tracking-widest">CURRENT PRIZE POOL</p>
          <h2 className="text-4xl font-bold text-green-400 mt-1">
            ₹{prizePool.toLocaleString()}
          </h2>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Monthly Progress</span>
              <span>84%</span>
            </div>
            <div className="bg-gray-700 h-2 rounded-full">
              <div className="bg-green-400 h-2 rounded-full w-[84%] transition-all duration-1000" />
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">5-Match Jackpot (40%)</span>
              <span className="text-yellow-400 font-semibold">₹{Math.floor(prizePool * 0.4).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">4-Match Pool (35%)</span>
              <span className="text-blue-400 font-semibold">₹{Math.floor(prizePool * 0.35).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">3-Match Pool (25%)</span>
              <span className="text-orange-400 font-semibold">₹{Math.floor(prizePool * 0.25).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {drawData?.activeSubscribers || "—"} subscribers entered this month
          </div>
        </div>

      </div>
    </section>
  );
}