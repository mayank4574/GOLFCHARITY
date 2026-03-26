import { useState, useEffect } from "react";
import { adminGetWinners, adminVerifyWinner, adminPayoutWinner } from "../../api/api";

const STATUS_STYLES = {
  pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  proof_submitted: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  verified: "text-green-400 bg-green-500/10 border-green-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
  paid: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

const STATUS_LABELS = {
  pending: "Pending",
  proof_submitted: "Proof Submitted",
  verified: "Verified",
  rejected: "Rejected",
  paid: "Paid",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionNote, setActionNote] = useState("");
  const [actioning, setActioning] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchWinners = async (status = "") => {
    setLoading(true);
    try {
      const { data } = await adminGetWinners(status ? { status } : {});
      setWinners(data.winners || []);
    } catch { setError("Failed to load winners"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchWinners(statusFilter); }, [statusFilter]);

  const handleVerify = async (id, action) => {
    setError(""); setSuccess("");
    setActioning(id);
    try {
      await adminVerifyWinner(id, { action, adminNote: actionNote });
      setSuccess(`Winner ${action === "approve" ? "approved" : "rejected"} successfully`);
      setActionNote("");
      fetchWinners(statusFilter);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally { setActioning(null); }
  };

  const handlePayout = async (id) => {
    if (!confirm("Mark this winner as paid?")) return;
    setActioning(id);
    try {
      await adminPayoutWinner(id);
      setSuccess("Marked as paid!");
      fetchWinners(statusFilter);
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Payout update failed"); } finally { setActioning(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-green-400 text-xs tracking-widest mb-1">ADMIN</p>
        <h1 className="text-3xl font-bold">Winner Verification</h1>
        <p className="text-gray-400 mt-1">Review proof submissions and manage payouts.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl">{success}</div>}

      {/* FILTER */}
      <div className="flex gap-2 flex-wrap">
        {["", "pending", "proof_submitted", "verified", "rejected", "paid"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${statusFilter === s ? "bg-green-500 text-black border-green-500" : "border-white/10 text-gray-400 hover:text-white"}`}>
            {s === "" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* WINNERS LIST */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : winners.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-400">
          No winners found {statusFilter && `with status: ${STATUS_LABELS[statusFilter]}`}
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map((w) => (
            <div key={w._id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="font-semibold text-lg">{w.userId?.fullName || "Unknown User"}</p>
                  <p className="text-gray-400 text-sm">{w.userId?.email}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {w.matchType}-Number Match ·{" "}
                    {w.drawId ? `${MONTHS[w.drawId.month - 1]} ${w.drawId.year}` : "—"}
                  </p>
                  {w.matchedNumbers?.length > 0 && (
                    <p className="text-xs text-green-400 mt-1">
                      Matched: {w.matchedNumbers.join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">₹{w.prizeAmount?.toLocaleString()}</p>
                  <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full border ${STATUS_STYLES[w.verificationStatus]}`}>
                    {STATUS_LABELS[w.verificationStatus]}
                  </span>
                </div>
              </div>

              {/* Proof */}
              {w.proofUrl && (
                <div className="mt-4">
                  <a href={`http://localhost:5000${w.proofUrl}`} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 text-sm hover:underline flex items-center gap-2">
                    📎 View Proof Submission →
                  </a>
                </div>
              )}

              {/* Actions for proof_submitted */}
              {w.verificationStatus === "proof_submitted" && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <label className="text-xs text-gray-400">ADMIN NOTE (optional)</label>
                  <input value={actionNote} onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Add a note for the winner..."
                    className="w-full mt-2 px-4 py-2 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white text-sm mb-3" />
                  <div className="flex gap-3">
                    <button onClick={() => handleVerify(w._id, "approve")} disabled={actioning === w._id}
                      className="bg-green-500 text-black px-6 py-2 rounded-full text-sm font-semibold hover:scale-105 transition disabled:opacity-60">
                      ✓ Approve
                    </button>
                    <button onClick={() => handleVerify(w._id, "reject")} disabled={actioning === w._id}
                      className="bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-2 rounded-full text-sm hover:bg-red-500/30 transition disabled:opacity-60">
                      ✕ Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Pay out verified winners */}
              {w.verificationStatus === "verified" && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <button onClick={() => handlePayout(w._id)} disabled={actioning === w._id}
                    className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-6 py-2 rounded-full text-sm hover:bg-purple-500/30 transition disabled:opacity-60">
                    💷 Mark as Paid
                  </button>
                </div>
              )}

              {w.adminNote && (
                <div className="mt-3 text-xs text-gray-400 bg-black/20 rounded-lg px-3 py-2">
                  Note: {w.adminNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
