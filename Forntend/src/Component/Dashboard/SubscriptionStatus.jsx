import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getSubscriptionStatus, cancelSubscription } from "../../api/api";
import { Link } from "react-router-dom";

export default function SubscriptionStatus({ mini = false }) {
  const { subscription: ctxSub, updateSubscription } = useAuth();
  const [sub, setSub] = useState(ctxSub);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getSubscriptionStatus()
      .then((r) => {
        setSub(r.data.subscription);
        updateSubscription(r.data.subscription);
      })
      .catch(() => {});
  }, []);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setCancelling(true);
    try {
      await cancelSubscription();
      const r = await getSubscriptionStatus();
      setSub(r.data.subscription);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (!sub) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📋</span>
          <h2 className="text-xl font-semibold">Subscription Status</h2>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <p className="text-red-400 font-medium">No Active Subscription</p>
          <p className="text-gray-400 text-sm mt-1">Subscribe to enter monthly draws and support your charity.</p>
        </div>
        <Link to="/join-sanctuary" className="inline-block bg-green-500 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition">
          View Plans →
        </Link>
      </div>
    );
  }

  const statusColor = {
    active: "text-green-400 bg-green-500/10 border-green-500/20",
    inactive: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
    past_due: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  }[sub.status] || "text-gray-400";

  const renewalDate = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  if (mini) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">SUBSCRIPTION</p>
            <p className="text-xl font-bold capitalize mt-1">{sub.plan} Plan</p>
            <p className="text-gray-400 text-sm mt-1">Renews: {renewalDate}</p>
          </div>
          <span className={`px-3 py-1 rounded-full border text-sm font-medium capitalize ${statusColor}`}>
            {sub.status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📋</span>
        <h2 className="text-xl font-semibold">Subscription Status</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs tracking-widest">PLAN</p>
          <p className="text-xl font-bold capitalize mt-1">{sub.plan}</p>
        </div>
        <div className="bg-black/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs tracking-widest">STATUS</p>
          <span className={`inline-block mt-1 px-3 py-1 rounded-full border text-sm font-medium capitalize ${statusColor}`}>
            {sub.status}
          </span>
        </div>
        <div className="bg-black/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs tracking-widest">
            {sub.status === "cancelled" ? "CANCELLED" : "RENEWS"}
          </p>
          <p className="text-lg font-semibold mt-1">{renewalDate}</p>
        </div>
      </div>

      {sub.status === "active" && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="text-red-400 border border-red-400/30 px-4 py-2 rounded-full text-sm hover:bg-red-500/10 transition disabled:opacity-60"
        >
          {cancelling ? "Cancelling..." : "Cancel Subscription"}
        </button>
      )}

      {(sub.status === "cancelled" || sub.status === "inactive") && (
        <Link to="/join-sanctuary" className="inline-block bg-green-500 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition">
          Resubscribe →
        </Link>
      )}
    </div>
  );
}
