import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getSubscriptionStatus } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const { updateSubscription } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll subscription status to get the activated subscription
    const poll = async (retries = 5) => {
      try {
        const { data } = await getSubscriptionStatus();
        if (data.hasActiveSubscription || retries <= 0) {
          if (data.subscription) updateSubscription(data.subscription);
          setLoading(false);
        } else {
          setTimeout(() => poll(retries - 1), 2000);
        }
      } catch {
        setLoading(false);
      }
    };
    setTimeout(() => poll(), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-[#071a2f] text-white flex items-center justify-center pt-[70px]">
      <div className="text-center max-w-lg mx-auto px-6">
        {loading ? (
          <div>
            <div className="w-12 h-12 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-400">Activating your subscription...</p>
          </div>
        ) : (
          <div>
            <div className="text-7xl mb-8">🎉</div>
            <h1 className="text-4xl font-bold mb-4 text-green-400">You're In!</h1>
            <p className="text-gray-300 text-lg mb-2">Your subscription is now active.</p>
            <p className="text-gray-400 mb-8">
              You're entered in this month's prize draw. Start entering your Stableford scores to participate!
            </p>
            <div className="space-y-3">
              <Link to="/dashboard/scores"
                className="block w-full bg-green-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition">
                Enter Your Golf Scores →
              </Link>
              <Link to="/dashboard"
                className="block w-full border border-white/20 px-8 py-4 rounded-full text-gray-300 hover:text-white transition">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
