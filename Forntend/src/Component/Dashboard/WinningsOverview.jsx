import { useState, useEffect, useRef } from "react";
import { getMyWins, uploadProof } from "../../api/api";

const STATUS_STYLES = {
  pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  proof_submitted: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  verified: "text-green-400 bg-green-500/10 border-green-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
  paid: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

const STATUS_LABELS = {
  pending: "Pending Proof",
  proof_submitted: "Under Review",
  verified: "Verified",
  rejected: "Rejected",
  paid: "Paid ✓",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function WinningsOverview({ mini = false }) {
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    getMyWins()
      .then((r) => setWins(r.data.wins || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalWon = wins.filter((w) => w.verificationStatus === "paid").reduce((sum, w) => sum + w.prizeAmount, 0);
  const pendingAmount = wins.filter((w) => ["verified", "pending", "proof_submitted"].includes(w.verificationStatus)).reduce((sum, w) => sum + w.prizeAmount, 0);

  if (loading) return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-center">
      <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (mini) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-gray-400 text-sm mb-2">TOTAL WINNINGS</p>
        <p className="text-3xl font-bold text-green-400">₹{totalWon.toLocaleString()}</p>
        <p className="text-yellow-400 text-sm mt-1">₹{pendingAmount.toLocaleString()} pending payment</p>
        <p className="text-gray-500 text-xs mt-2">{wins.length} draw {wins.length === 1 ? "win" : "wins"} total</p>
      </div>
    );
  }

  const handleUploadProof = async (winId) => {
    const file = fileRef.current?.files[0];
    if (!file) return;
    setError(""); setUploading(winId);
    try {
      const formData = new FormData();
      formData.append("proof", file);
      await uploadProof(winId, formData);
      const r = await getMyWins();
      setWins(r.data.wins || []);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-4xl font-bold text-green-400">₹{totalWon.toLocaleString()}</p>
          <p className="text-gray-400 text-sm mt-1">Total Paid Out</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-4xl font-bold text-yellow-400">₹{pendingAmount.toLocaleString()}</p>
          <p className="text-gray-400 text-sm mt-1">Pending Payment</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-4xl font-bold text-white">{wins.length}</p>
          <p className="text-gray-400 text-sm mt-1">Total Wins</p>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* WINS LIST */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><span>🏆</span> Win History</h2>

        {wins.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🎰</p>
            <p className="text-gray-400">No wins yet. Keep playing — your scores are in this month's draw!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wins.map((win) => (
              <div key={win._id} className="bg-black/20 rounded-xl p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-lg">
                      {win.matchType}-Number Match
                      {win.matchType === 5 && " 🎉 JACKPOT"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {win.drawId ? `${MONTHS[win.drawId.month - 1]} ${win.drawId.year}` : "—"}
                      {" · "}
                      Matched: <span className="text-green-400">{win.matchedNumbers?.join(", ") || "—"}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">₹{win.prizeAmount?.toLocaleString()}</p>
                    <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full border ${STATUS_STYLES[win.verificationStatus]}`}>
                      {STATUS_LABELS[win.verificationStatus]}
                    </span>
                  </div>
                </div>

                {/* Upload proof if pending */}
                {win.verificationStatus === "pending" && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-yellow-400 text-sm font-medium mb-2">Action required: Upload proof of your golf scores</p>
                    <p className="text-gray-400 text-xs mb-3">Upload a screenshot from your golf platform showing your scores.</p>
                    <div className="flex gap-3 flex-wrap">
                      <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" />
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="text-sm border border-white/20 px-4 py-2 rounded-full hover:border-green-400 transition"
                      >
                        Choose File
                      </button>
                      <button
                        onClick={() => handleUploadProof(win._id)}
                        disabled={uploading === win._id}
                        className="text-sm bg-green-500 text-black px-4 py-2 rounded-full font-medium hover:scale-105 transition disabled:opacity-60"
                      >
                        {uploading === win._id ? "Uploading..." : "Upload Proof"}
                      </button>
                    </div>
                  </div>
                )}

                {win.verificationStatus === "rejected" && win.adminNote && (
                  <div className="mt-3 text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                    Admin note: {win.adminNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
