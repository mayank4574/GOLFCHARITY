import { useState, useEffect } from "react";
import { adminGetReports } from "../../api/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetReports()
      .then((r) => setReports(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!reports) return <p className="text-red-400">Failed to load reports.</p>;

  const stats = [
    { label: "Total Users", value: reports.totalUsers, icon: "👥", color: "text-white" },
    { label: "Active Subscribers", value: reports.activeSubscriptions, icon: "✅", color: "text-green-400" },
    { label: "Monthly Subs", value: reports.monthlySubscriptions, icon: "📅", color: "text-blue-400" },
    { label: "Yearly Subs", value: reports.yearlySubscriptions, icon: "📆", color: "text-purple-400" },
    { label: "Total Charities", value: reports.totalCharities, icon: "💚", color: "text-green-400" },
    { label: "Total Draws Run", value: reports.totalDraws, icon: "🎰", color: "text-yellow-400" },
    { label: "Monthly Revenue", value: `₹${(reports.monthlyRevenue || 0).toLocaleString()}`, icon: "💷", color: "text-green-400" },
    { label: "Est. Prize Pool", value: `₹${(reports.estimatedPrizePool || 0).toLocaleString()}`, icon: "🏆", color: "text-yellow-400" },
    { label: "Charity Fund", value: `₹${(reports.estimatedCharityFund || 0).toLocaleString()}`, icon: "🌍", color: "text-blue-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-green-400 text-xs tracking-widest mb-1">ADMIN</p>
        <h1 className="text-3xl font-bold">Platform Reports</h1>
        <p className="text-gray-400 mt-1">Analytics and key metrics for the platform.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{s.icon}</span>
              <span className="text-gray-400 text-xs">{s.label.toUpperCase()}</span>
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* RECENT WINNERS */}
      {reports.recentWinners?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Winners</h3>
          <div className="space-y-2">
            {reports.recentWinners.map((w) => (
              <div key={w._id} className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium">{w.userId?.fullName || "—"}</p>
                  <p className="text-xs text-gray-400">{w.matchType}-number match · {w.drawId ? `${MONTHS[w.drawId.month - 1]} ${w.drawId.year}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">₹{w.prizeAmount?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 capitalize">{w.verificationStatus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT DRAWS */}
      {reports.recentDraws?.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Draws</h3>
          <div className="space-y-2">
            {reports.recentDraws.map((d) => (
              <div key={d._id} className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium">{MONTHS[d.month - 1]} {d.year}</p>
                  <p className="text-xs text-gray-400">
                    Numbers: <span className="text-green-400">{d.winningNumbers?.join(" · ")}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">₹{d.totalPrizePool?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 capitalize">{d.drawType} draw</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
