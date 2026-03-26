import { Link } from "react-router-dom";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#071a2f] text-white flex items-center justify-center pt-[70px]">
      <div className="text-center max-w-lg mx-auto px-6">
        <div className="text-7xl mb-8">😔</div>
        <h1 className="text-4xl font-bold mb-4">Checkout Cancelled</h1>
        <p className="text-gray-400 mb-8">
          No worries — your checkout was cancelled and you have not been charged.
          You can subscribe anytime to start entering monthly prize draws.
        </p>
        <div className="space-y-3">
          <Link to="/join-sanctuary"
            className="block w-full bg-green-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition">
            View Subscription Plans →
          </Link>
          <Link to="/"
            className="block w-full border border-white/20 px-8 py-4 rounded-full text-gray-300 hover:text-white transition">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
