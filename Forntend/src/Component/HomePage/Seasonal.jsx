import { useState, useEffect } from "react";
import { getCurrentDraw } from "../../api/api";
import PaymentModal from "../Payment/PaymentModal";
import { useAuth } from "../../context/AuthContext";

function getTimeUntilEndOfMonth() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0); // First of next month
  const diff = end - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, mins, secs };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PRIZE_ITEMS = [
  { icon: "🏌️", text: "Luxury golf experiences" },
  { icon: "🎯", text: "Exclusive prize integrations" },
  { icon: "✈️", text: "Global golf destinations" },
  { icon: "💚", text: "Direct charity grants" },
];

export default function Seasonal() {
  const { isAuthenticated, hasActiveSubscription } = useAuth();
  const [countdown, setCountdown] = useState(getTimeUntilEndOfMonth());
  const [drawData, setDrawData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [defaultPlan, setDefaultPlan] = useState("monthly");

  // Live countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilEndOfMonth());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real draw/pool data
  useEffect(() => {
    getCurrentDraw()
      .then((r) => setDrawData(r.data))
      .catch(() => {});
  }, []);

  const prizePool = drawData?.prizePool || 0;
  const participants = drawData?.activeSubscribers || 0;
  const currentMonth = MONTHS[new Date().getMonth()];

  const handleEnterClick = (plan = "monthly") => {
    setDefaultPlan(plan);
    setShowModal(true);
  };

  return (
    <>
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="bg-gradient-to-br from-[#0b1f3a] to-[#071628] rounded-3xl p-8 md:p-10 border border-white/5 shadow-xl relative overflow-hidden">

            {/* Background glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row justify-between gap-10">

              {/* ── LEFT ── */}
              <div className="flex-1">

                {/* Label */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-green-400 text-xs tracking-widest">{currentMonth.toUpperCase()} DRAW — LIVE NOW</p>
                </div>

                <h2 className="text-4xl font-bold mb-2">
                  The seasonal bounty.
                </h2>
                <p className="text-gray-400 mt-2 max-w-md">
                  Our rewards are as monumental as our mission. Every subscription grows the pool.
                </p>

                {/* Stats */}
                <div className="flex gap-10 mt-7">
                  <div>
                    <p className="text-green-400 text-3xl font-bold">
                      ₹{prizePool > 0 ? prizePool.toLocaleString() : <span className="text-gray-500">—</span>}
                    </p>
                    <p className="text-gray-400 text-xs tracking-widest mt-1">TOTAL POOL</p>
                  </div>
                  <div>
                    <p className="text-white text-3xl font-bold">
                      {participants > 0 ? `${participants.toLocaleString()}` : "—"}
                    </p>
                    <p className="text-gray-400 text-xs tracking-widest mt-1">PARTICIPANTS</p>
                  </div>
                  <div>
                    <p className="text-yellow-400 text-3xl font-bold">
                      ₹{prizePool > 0 ? Math.floor(prizePool * 0.4).toLocaleString() : "—"}
                    </p>
                    <p className="text-gray-400 text-xs tracking-widest mt-1">JACKPOT</p>
                  </div>
                </div>

                {/* Live countdown */}
                <div className="mt-8">
                  <p className="text-xs text-gray-500 mb-3 tracking-widest">DRAW CLOSES IN</p>
                  <div className="flex gap-3">
                    {[
                      { val: countdown.days, label: "DAYS" },
                      { val: countdown.hours, label: "HRS" },
                      { val: countdown.mins, label: "MIN" },
                      { val: countdown.secs, label: "SEC" },
                    ].map(({ val, label }) => (
                      <div key={label} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center min-w-[64px]">
                        <p className="text-2xl font-bold tabular-nums">
                          {String(val).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] text-gray-500 tracking-widest mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Already subscribed indicator */}
                {hasActiveSubscription ? (
                  <div className="mt-6 flex items-center gap-2 text-green-400 text-sm">
                    <span className="text-green-400">✅</span>
                    You're entered in this draw! Check your dashboard for status.
                  </div>
                ) : (
                  <div className="mt-6 flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleEnterClick("monthly")}
                      className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition text-sm"
                    >
                      ⚡ Enter This Cycle
                    </button>
                    <button
                      onClick={() => handleEnterClick("yearly")}
                      className="border border-green-500/40 text-green-400 px-6 py-3 rounded-full font-semibold hover:bg-green-500/10 transition text-sm"
                    >
                      Yearly Plan (Best Value)
                    </button>
                  </div>
                )}
              </div>

              {/* ── RIGHT — PRIZE VAULT ── */}
              <div className="bg-[#111f35] border border-white/10 p-6 rounded-2xl w-full md:w-[300px] shrink-0 flex flex-col">
                <h3 className="text-lg font-semibold mb-1">The Sanctuary Prize Vault</h3>
                <p className="text-gray-500 text-xs mb-5">What's up for grabs this cycle</p>

                <ul className="space-y-3 flex-1">
                  {PRIZE_ITEMS.map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="text-xl w-8 text-center">{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Prize pool distribution */}
                <div className="mt-5 pt-4 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>🏆 5-Match Jackpot</span>
                    <span className="text-yellow-400">40%</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>🥈 4-Match Pool</span>
                    <span className="text-blue-400">35%</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>🥉 3-Match Pool</span>
                    <span className="text-orange-400">25%</span>
                  </div>
                </div>

                {!hasActiveSubscription && (
                  <button
                    onClick={() => handleEnterClick("monthly")}
                    className="mt-5 bg-yellow-400 text-black w-full py-3 rounded-full font-bold hover:scale-105 transition text-sm"
                  >
                    Enter This Cycle →
                  </button>
                )}

                {/* Payment methods accepted */}
                <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-gray-600">
                  <span>💳 Card</span>
                  <span>•</span>
                  <span>📱 UPI</span>
                  <span>•</span>
                  <span>📷 QR</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* PAYMENT MODAL */}
      {showModal && (
        <PaymentModal
          onClose={() => setShowModal(false)}
          defaultPlan={defaultPlan}
        />
      )}
    </>
  );
}