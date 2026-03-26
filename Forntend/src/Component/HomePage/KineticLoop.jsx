import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCurrentDraw } from "../../api/api";

const STEPS = [
  {
    num: "01",
    title: "Subscribe",
    desc: "Choose Monthly (₹29) or Yearly (₹249) plan. No commitment required on monthly.",
    icon: "💎",
    detail: "Your subscription enters you into every monthly prize draw automatically. Cancel anytime.",
    link: "/join-sanctuary",
    linkText: "View Plans →",
    color: "from-green-500/20 to-green-500/5 border-green-500/30",
    dot: "bg-green-400",
  },
  {
    num: "02",
    title: "Enter Scores",
    desc: "Log your Stableford golf scores (1–45). We keep your best 5.",
    icon: "⛳",
    detail: "Your last 5 Stableford scores are stored securely. When a draw runs, they are matched against the winning numbers.",
    link: "/dashboard/scores",
    linkText: "Enter Scores →",
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
    dot: "bg-blue-400",
  },
  {
    num: "03",
    title: "Win & Give Back",
    desc: "Match 3, 4 or 5 numbers for prizes. Part of every subscription supports your charity.",
    icon: "🏆",
    detail: "Jackpot rolls over if no 5-match winner. 10–50% of your subscription goes directly to your chosen charity.",
    link: "/dashboard/draws",
    linkText: "See Current Draw →",
    color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
    dot: "bg-yellow-400",
  },
];

export default function KineticLoop() {
  const { isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(null);
  const stepRefs = useRef([]);

  // Auto-cycle steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Get live subscriber count
  useEffect(() => {
    getCurrentDraw()
      .then((r) => setSubscriberCount(r.data?.activeSubscribers || 0))
      .catch(() => {});
  }, []);

  return (
    <section className="bg-[#0a1628] py-20 border-y border-white/5">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <p className="text-green-400 text-xs tracking-widest mb-3">HOW IT WORKS</p>
            <h2 className="text-4xl font-bold">The Kinetic Loop</h2>
            <p className="text-gray-400 mt-2 max-w-md">
              Three steps to play, win, and make a difference every single month.
            </p>
          </div>
          {subscriberCount !== null && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full w-fit">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">{subscriberCount} active subscribers</span>
            </div>
          )}
        </div>

        {/* STEPS GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={i}
              ref={(el) => (stepRefs.current[i] = el)}
              onClick={() => setActiveStep(i)}
              className={`rounded-2xl border bg-gradient-to-b p-6 cursor-pointer transition-all duration-500 ${step.color} ${
                activeStep === i
                  ? "scale-[1.02] shadow-xl shadow-black/30"
                  : "opacity-70 hover:opacity-90"
              }`}
            >
              {/* Step number + icon */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-gray-500 text-xs font-mono tracking-widest">{step.num}</span>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-black/20`}>
                  {step.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>

              {/* Expanded content when active */}
              <div className={`overflow-hidden transition-all duration-500 ${activeStep === i ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="text-gray-300 text-sm mb-4 border-t border-white/10 pt-4">{step.detail}</p>
                <Link
                  to={isAuthenticated ? step.link : (i === 0 ? "/join-sanctuary" : "/login")}
                  className="inline-flex items-center text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
                >
                  {step.linkText}
                </Link>
              </div>

              {/* Bottom progress bar */}
              <div className="mt-5 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-1 ${step.dot} rounded-full transition-all duration-[3400ms] ${activeStep === i ? "w-full" : "w-0"}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* STEP DOTS */}
        <div className="flex justify-center gap-2 mt-8">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeStep === i ? "w-8 bg-green-400" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/join-sanctuary"
            className="inline-block bg-green-500 text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition text-sm"
          >
            Start Your Journey →
          </Link>
        </div>

      </div>
    </section>
  );
}