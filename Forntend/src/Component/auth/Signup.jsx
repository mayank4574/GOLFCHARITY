import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerUser, getCharities } from "../../api/api";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedCharity: "",
    charityContributionPct: 10,
  });
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
    // Load charities for selection
    getCharities().then((r) => setCharities(r.data.charities || [])).catch(() => {});
  }, [isAuthenticated, navigate]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      const { data } = await registerUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        selectedCharity: form.selectedCharity || null,
        charityContributionPct: Number(form.charityContributionPct),
      });
      login(data.user, data.token, null);
      navigate("/join-sanctuary"); // Redirect to subscription plans
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white flex flex-col justify-between">
      <div className="flex items-center justify-center px-6 md:px-10 py-20">
        <div className="w-full max-w-[560px] bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">

          <h1 className="text-center text-green-400 font-bold mb-2 tracking-widest text-sm">⛳ GOLF CHARITY PLATFORM</h1>
          <h2 className="text-3xl font-bold mb-2 text-center">Create your <span className="text-green-400">account.</span></h2>
          <p className="text-gray-400 text-sm text-center mb-8">Join thousands of golfers supporting charities through monthly prize draws.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400">FULL NAME</label>
              <input id="signup-name" type="text" value={form.fullName} onChange={set("fullName")} placeholder="Alex Sterling" required
                className="w-full mt-2 px-4 py-3 rounded-full bg-black/30 outline-none focus:ring-2 focus:ring-green-500 text-white" />
            </div>

            <div>
              <label className="text-xs text-gray-400">EMAIL ADDRESS</label>
              <input id="signup-email" type="email" value={form.email} onChange={set("email")} placeholder="alex@example.com" required
                className="w-full mt-2 px-4 py-3 rounded-full bg-black/30 outline-none focus:ring-2 focus:ring-green-500 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400">PASSWORD</label>
                <input id="signup-password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required
                  className="w-full mt-2 px-4 py-3 rounded-full bg-black/30 outline-none focus:ring-2 focus:ring-green-500 text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400">CONFIRM</label>
                <input id="signup-confirm" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" required
                  className="w-full mt-2 px-4 py-3 rounded-full bg-black/30 outline-none focus:ring-2 focus:ring-green-500 text-white" />
              </div>
            </div>

            {/* Charity Selection */}
            <div>
              <label className="text-xs text-gray-400">CHOOSE A CHARITY (optional)</label>
              <select id="signup-charity" value={form.selectedCharity} onChange={set("selectedCharity")}
                className="w-full mt-2 px-4 py-3 rounded-full bg-black/30 outline-none focus:ring-2 focus:ring-green-500 text-white">
                <option value="">Select a charity to support...</option>
                {charities.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Contribution % */}
            <div>
              <label className="text-xs text-gray-400">
                CHARITY CONTRIBUTION — {form.charityContributionPct}% of your subscription
              </label>
              <input type="range" min="10" max="50" step="5" value={form.charityContributionPct}
                onChange={set("charityContributionPct")}
                className="w-full mt-2 accent-green-500" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10% (minimum)</span><span>50%</span>
              </div>
            </div>

            <button id="signup-submit" type="submit" disabled={loading}
              className="w-full bg-green-500 text-black py-3 rounded-full font-semibold hover:scale-105 transition mt-2 disabled:opacity-60">
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already a member?{" "}
            <Link to="/login" className="text-yellow-400 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}