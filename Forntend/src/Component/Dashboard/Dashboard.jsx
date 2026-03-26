import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SubscriptionStatus from "./SubscriptionStatus";
import ScoreEntry from "./ScoreEntry";
import CharitySelector from "./CharitySelector";
import DrawParticipation from "./DrawParticipation";
import WinningsOverview from "./WinningsOverview";

const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "scores", label: "My Scores", icon: "⛳" },
  { id: "draws", label: "Draws", icon: "🎰" },
  { id: "charity", label: "Charity", icon: "💚" },
  { id: "winnings", label: "Winnings", icon: "🏆" },
];

export default function Dashboard() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { user, subscription, hasActiveSubscription } = useAuth();
  const [activeTab, setActiveTab] = useState(tab || "overview");

  useEffect(() => {
    if (tab && TABS.find((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    navigate(`/dashboard/${tabId}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#071a2f] text-white pt-[70px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-green-400 text-sm tracking-widest mb-1">YOUR DASHBOARD</p>
          <h1 className="text-3xl font-bold">Welcome back, <span className="text-green-400">{user?.fullName?.split(" ")[0]}</span></h1>
          <p className="text-gray-400 mt-1">
            {hasActiveSubscription
              ? `Active ${subscription?.plan === "yearly" ? "Yearly" : "Monthly"} Subscriber`
              : "No active subscription — "}
            {!hasActiveSubscription && (
              <a href="/join-sanctuary" className="text-green-400 hover:underline">Subscribe now</a>
            )}
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-white/5 border border-white/10 rounded-2xl p-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-green-500 text-black"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div>
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "scores" && <ScoreEntry />}
          {activeTab === "draws" && <DrawParticipation />}
          {activeTab === "charity" && <CharitySelector />}
          {activeTab === "winnings" && <WinningsOverview />}
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab (mini-preview of all panels) ─────────────────────────────────
function OverviewTab() {
  const { subscription, hasActiveSubscription } = useAuth();
  return (
    <div className="space-y-6">
      <SubscriptionStatus mini />
      <div className="grid md:grid-cols-2 gap-6">
        <DrawParticipation mini />
        <WinningsOverview mini />
      </div>
    </div>
  );
}
