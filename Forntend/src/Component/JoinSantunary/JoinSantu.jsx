import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCharities } from "../../api/api";
import PaymentModal from "../Payment/PaymentModal";

export default function JoinSantu() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    getCharities().then((r) => setCharities(r.data.charities?.slice(0, 3) || [])).catch(() => {});
  }, []);

  const handleSubscribe = (plan) => {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white px-6 md:px-10 py-20">

      {/* HERO */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-green-400 text-xs tracking-widest mb-4">⛳ GOLF CHARITY SUBSCRIPTION</p>
        <h1 className="text-5xl font-bold mb-4">
          Choose your <span className="text-green-400">plan.</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Every subscription enters you into monthly prize draws and contributes to your chosen charity.
        </p>
      </div>



      {/* PRICING CARDS */}
      <div className="grid md:grid-cols-2 gap-8 max-w-[900px] mx-auto">

        {/* MONTHLY */}
        <div className="bg-white/5 backdrop-blur border border-white/10 p-8 rounded-3xl hover:scale-[1.02] transition duration-300 hover:shadow-xl hover:shadow-green-500/10">
          <p className="text-green-400 text-sm mb-2 tracking-widest">MONTHLY PLAN</p>
          <h2 className="text-2xl font-bold mb-1">Flexible</h2>
          <p className="text-gray-400 text-sm mb-6">Cancel anytime. Full access from day one.</p>
          <div className="mb-6">
            <span className="text-5xl font-bold">₹29</span>
            <span className="text-gray-400 text-lg">/month</span>
          </div>
          <ul className="text-gray-400 space-y-3 mb-8 text-sm">
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Monthly prize draw entry</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Stableford score tracking (5 scores)</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Charity contribution (min 10%)</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Full user dashboard</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Winner verification system</li>
          </ul>
          <button
            id="subscribe-monthly"
            onClick={() => handleSubscribe("monthly")}
            className="w-full border border-green-400 py-3 rounded-full font-semibold hover:bg-green-500 hover:text-black transition flex items-center justify-center gap-2"
          >
            💳 Subscribe Monthly →
          </button>

        </div>

        {/* YEARLY (BEST VALUE) */}
        <div className="bg-white/5 backdrop-blur border-2 border-green-500 p-8 rounded-3xl shadow-xl shadow-green-500/10 relative">
          <div className="absolute -top-4 -right-4 bg-yellow-500 text-black px-4 py-1.5 rounded-full font-bold text-sm transform rotate-3 shadow-lg">
            BEST VALUE — SAVE ₹99
          </div>
          <p className="font-bold text-2xl mb-2 text-white">Yearly Plan</p>
          <h2 className="text-2xl font-bold mb-1">Committed</h2>
          <p className="text-gray-400 text-sm mb-6">Save ₹99 vs monthly. Maximum impact.</p>
          <div className="mb-2">
            <span className="text-5xl font-bold">₹249</span>
            <span className="text-gray-400 text-lg">/year</span>
          </div>
          <p className="text-green-400 text-sm mb-6">≈ ₹20.75/month</p>
          <ul className="text-gray-400 space-y-3 mb-8 text-sm">
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> All Monthly Plan features</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Priority draw consideration</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Annual charity report</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Larger charity contribution pool</li>
            <li className="flex items-center gap-2"><span className="text-yellow-400">★</span> Early access to new features</li>
          </ul>
          <button
            id="subscribe-yearly"
            onClick={() => handleSubscribe("yearly")}
            className="w-full bg-green-500 text-black py-3 rounded-full font-semibold hover:scale-105 transition flex items-center justify-center gap-2"
          >
            💳 Subscribe Yearly →
          </button>
        </div>

      </div>

      {/* WHAT'S IN THE PRIZE POOL */}
      <div className="max-w-[900px] mx-auto mt-16">
        <h3 className="text-xl font-semibold text-center mb-8">Prize Pool Distribution</h3>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "5-Number Match", share: "40%", desc: "Jackpot — rolls over if unclaimed", color: "text-yellow-400" },
            { label: "4-Number Match", share: "35%", desc: "Split equally among winners", color: "text-green-400" },
            { label: "3-Number Match", share: "25%", desc: "Split equally among winners", color: "text-blue-400" },
          ].map((tier) => (
            <div key={tier.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className={`text-3xl font-bold ${tier.color}`}>{tier.share}</p>
              <p className="font-semibold mt-2">{tier.label}</p>
              <p className="text-gray-400 text-xs mt-1">{tier.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED CHARITIES */}
      {charities.length > 0 && (
        <div className="max-w-[900px] mx-auto mt-16">
          <h3 className="text-xl font-semibold text-center mb-2">Supported Charities</h3>
          <p className="text-gray-400 text-center text-sm mb-8">Your subscription contributes to real-world impact</p>
          <div className="grid md:grid-cols-3 gap-6">
            {charities.map((c) => (
              <div key={c._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <img src={c.imageUrl} alt={c.name} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{c.shortDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NO ACCOUNT CTA */}
      {!isAuthenticated && (
        <div className="text-center mt-16">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-green-400 hover:underline">Log in to subscribe</Link>
          </p>
        </div>
      )}

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          defaultPlan={selectedPlan}
        />
      )}

    </div>
  );
}