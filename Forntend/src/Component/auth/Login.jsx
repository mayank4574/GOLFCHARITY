import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser, getSubscriptionStatus } from "../../api/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      // Get subscription status
      let sub = null;
      try {
        const subRes = await getSubscriptionStatus();
        sub = subRes.data.subscription;
      } catch {}
      login(data.user, data.token, sub);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white">
      <div className="flex items-start justify-center px-6 md:px-10 pt-24 md:pt-28">
        <div className="max-w-[1200px] w-full grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT SIDE */}
          <div>
            <p className="text-green-400 text-xs tracking-widest mb-4">THE GOLF CHARITY PLATFORM</p>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Return to your{" "}
              <span className="text-green-400">momentum.</span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-md">
              Access your subscription, track your Stableford scores, participate in monthly prize draws, and support your chosen charity.
            </p>
            <div className="bg-white/5 backdrop-blur border border-white/10 px-6 py-4 rounded-xl w-fit flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">⛳</div>
              <div>
                <p className="font-semibold">Monthly Prize Draws</p>
                <p className="text-gray-400 text-sm">Play. Win. Give Back.</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — FORM */}
          <div className="bg-white/5 backdrop-blur border border-white/10 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm mb-6">Enter your credentials to access your dashboard.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="text-xs text-gray-400">EMAIL ADDRESS</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full mt-2 px-4 py-3 rounded-full bg-black/30 outline-none focus:ring-2 focus:ring-green-500 text-white"
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-400">
                  <label>PASSWORD</label>
                  <span className="text-yellow-400 cursor-pointer">Forgot Password?</span>
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full mt-2 px-4 py-3 rounded-full bg-black/30 outline-none focus:ring-2 focus:ring-green-500 text-white"
                />
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-black py-3 rounded-full font-semibold hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Enter Platform →"}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              Not a member yet?{" "}
              <Link to="/signup" className="text-green-400 hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}