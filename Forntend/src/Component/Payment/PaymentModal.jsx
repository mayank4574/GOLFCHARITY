import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createCheckout, submitUpiPayment } from "../../api/api";

const PLANS = {
  monthly: { label: "Monthly Plan", amount: "₹29", period: "/month", stripe: "monthly" },
  yearly: { label: "Yearly Plan", amount: "₹249", period: "/year", stripe: "yearly", badge: "Save ₹99" },
};

const UPI_ID = "golfcharity@upi";
const UPI_NAME = "GolfCharity Platform";

export default function PaymentModal({ onClose, defaultPlan = "monthly" }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(defaultPlan);
  const [method, setMethod] = useState("card"); // 'card' | 'upi' | 'qr'
  const [upiId, setUpiId] = useState("");
  const [upiStep, setUpiStep] = useState("enter"); // 'enter' | 'confirm' | 'done'
  const [upiRef, setUpiRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const planData = PLANS[plan];

  const handleStripeCheckout = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate("/signup");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await createCheckout(planData.stripe);
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Stripe checkout failed. Please try again.");
      setLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpiSubmit = () => {
    if (!upiId.trim() || !upiId.includes("@")) {
      setError("Please enter a valid UPI ID (e.g. yourname@upi)");
      return;
    }
    setError("");
    setUpiStep("confirm");
  };

  const handleUpiConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await submitUpiPayment({
        plan: planData.stripe,
        upiSenderVpa: upiId,
        note: `UPI payment submission for ${planData.label}`,
      });
      setUpiRef(res.data.referenceId || `UPI-${Date.now().toString().slice(-8)}`);
      setUpiStep("done");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save UPI request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1b2e] border border-white/10 rounded-3xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <p className="text-xs text-green-400 tracking-widest">⛳ GOLF CHARITY PLATFORM</p>
            <h2 className="text-xl font-bold mt-1">Complete Your Subscription</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* PLAN SELECTOR */}
          <div>
            <p className="text-xs text-gray-400 tracking-widest mb-3">SELECT PLAN</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PLANS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setPlan(key)}
                  className={`p-4 rounded-2xl border text-left transition relative ${
                    plan === key
                      ? "border-green-500 bg-green-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-2 -right-2 text-xs bg-green-500 text-black font-bold px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                  <p className="text-xs text-gray-400 mb-1 capitalize">{p.label}</p>
                  <p className="text-2xl font-bold text-white">{p.amount}</p>
                  <p className="text-xs text-gray-500">{p.period}</p>
                  {plan === key && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-black text-xs font-bold">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PAYMENT METHOD TABS */}
          <div>
            <p className="text-xs text-gray-400 tracking-widest mb-3">PAYMENT METHOD</p>
            <div className="flex gap-2 bg-black/30 p-1 rounded-xl">
              {[
                { id: "card", icon: "💳", label: "Card / Stripe" },
                { id: "upi", icon: "📱", label: "UPI" },
                { id: "qr", icon: "📷", label: "Scan QR" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMethod(m.id); setError(""); setUpiStep("enter"); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
                    method === m.id
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* ── CARD / STRIPE ── */}
          {method === "card" && (
            <div className="space-y-4">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-400 text-sm font-medium mb-1">🔒 Secured by Stripe</p>
                <p className="text-gray-400 text-xs">
                  You will be redirected to Stripe's secure checkout page to complete payment with any credit/debit card.
                </p>
              </div>

              <div className="bg-black/20 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{planData.label}</span>
                  <span className="text-white font-semibold">{planData.amount}{planData.period}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-gray-400">Total due today</span>
                  <span className="text-green-400 font-bold">{planData.amount}</span>
                </div>
              </div>

              <button
                onClick={handleStripeCheckout}
                disabled={loading}
                className="w-full bg-green-500 text-black py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Redirecting to Stripe...
                  </span>
                ) : `Pay ${planData.amount} via Card →`}
              </button>

              <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                <span>🔒 256-bit SSL</span>
                <span>•</span>
                <span>💳 Visa / Mastercard / Amex</span>
                <span>•</span>
                <span>🔁 Cancel anytime</span>
              </div>
            </div>
          )}

          {/* ── UPI ── */}
          {method === "upi" && (
            <div className="space-y-4">
              {upiStep === "enter" && (
                <>
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🏦</span>
                      <p className="text-orange-400 text-sm font-medium">Pay via UPI</p>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Send the payment to <strong className="text-white">{UPI_ID}</strong> from any UPI app (GPay, PhonePe, Paytm, etc.)
                    </p>
                  </div>

                  {/* UPI ID to send money to */}
                  <div className="bg-black/30 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-2">SEND PAYMENT TO THIS UPI ID</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-green-400 text-sm">
                        {UPI_ID}
                      </div>
                      <button
                        onClick={copyUpiId}
                        className={`px-4 py-3 rounded-xl text-xs font-semibold transition ${
                          copied ? "bg-green-500 text-black" : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
                      >
                        {copied ? "Copied ✓" : "Copy"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Amount: <strong className="text-white">{planData.amount}</strong> · Name: {UPI_NAME}
                    </p>
                  </div>

                  {/* User enters their UPI ID for confirmation */}
                  <div>
                    <label className="text-xs text-gray-400">YOUR UPI ID (for payment confirmation)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@okicici / yourphone@upi"
                      className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We'll verify your payment manually and activate your subscription within 2–6 hours.
                    </p>
                  </div>

                  <button
                    onClick={handleUpiSubmit}
                    className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition"
                  >
                    I've Sent {planData.amount} — Confirm →
                  </button>
                </>
              )}

              {upiStep === "confirm" && (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 text-center">
                    <p className="text-3xl mb-2">⏳</p>
                    <p className="text-yellow-400 font-semibold">Confirm your payment</p>
                    <p className="text-gray-400 text-sm mt-2">
                      From: <strong className="text-white">{upiId}</strong><br />
                      To: <strong className="text-white">{UPI_ID}</strong><br />
                      Amount: <strong className="text-green-400">{planData.amount}</strong>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setUpiStep("enter")}
                      disabled={loading}
                      className="flex-1 border border-white/20 text-gray-300 py-3 rounded-xl hover:border-white/40 transition disabled:opacity-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleUpiConfirm}
                      disabled={loading}
                      className="flex-1 bg-green-500 text-black py-3 rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : "Yes, Confirm Payment ✓"}
                    </button>
                  </div>
                </div>
              )}

              {upiStep === "done" && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-green-400">Payment Request Saved!</h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
                    Your UPI payment request has been saved to our database. We'll verify and activate your subscription within 2–6 hours.
                  </p>
                  <div className="mt-4 bg-black/30 border border-green-500/20 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500">Reference ID</p>
                    <p className="text-green-400 font-mono font-bold">{upiRef || `UPI-${Date.now().toString().slice(-8)}`}</p>
                    <p className="text-xs text-gray-500 mt-1">Screenshot this for support queries</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-6 bg-green-500 text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── QR CODE ── */}
          {method === "qr" && (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-2xl p-6 flex flex-col items-center">
                <p className="text-xs text-gray-400 tracking-widest mb-4">SCAN WITH ANY UPI APP</p>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-green-500/10 mb-4">
                  <img
                    src="/upi-qr.png"
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <p className="text-green-400 font-mono text-sm">{UPI_ID}</p>
                <p className="text-gray-400 text-xs mt-1">{UPI_NAME}</p>

                {/* Works with */}
                <div className="flex items-center gap-4 mt-5 text-xs text-gray-500">
                  <span>📱 GPay</span>
                  <span>•</span>
                  <span>📱 PhonePe</span>
                  <span>•</span>
                  <span>📱 Paytm</span>
                  <span>•</span>
                  <span>🏦 All UPI Apps</span>
                </div>
              </div>

              {/* Amount box */}
              <div className="bg-black/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Amount to Pay</p>
                  <p className="text-2xl font-bold text-green-400">{planData.amount}</p>
                  <p className="text-xs text-gray-500">{planData.label}</p>
                </div>
                <button onClick={copyUpiId} className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition">
                  {copied ? "Copied ✓" : "Copy UPI ID"}
                </button>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-xs text-gray-400">
                📋 <strong className="text-white">After payment:</strong> Take a screenshot of your payment confirmation and upload it in your dashboard for verification. Your subscription activates within 2–6 hours.
              </div>

              <button
                onClick={() => { setMethod("upi"); setUpiStep("enter"); }}
                className="w-full text-center text-sm text-gray-400 hover:text-white transition py-2"
              >
                Already paid? Enter your UPI ID to confirm →
              </button>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-white/5 text-xs text-gray-500 text-center">
          By subscribing you agree to our Terms of Service. All payments are secure and encrypted.
        </div>
      </div>
    </div>
  );
}
