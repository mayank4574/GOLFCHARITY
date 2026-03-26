export default function HeroVault() {
  return (
    <div className="grid md:grid-cols-2 gap-10 items-center">

      {/* LEFT */}
      <div>
        <h1 className="text-5xl font-bold mb-6">
          Prize <span className="text-yellow-400">Vault</span>
        </h1>

        <p className="text-gray-400 mb-6">
          Unlock high-value rewards while contributing to global impact.
        </p>

        <div className="bg-white/5 backdrop-blur border border-white/10 px-6 py-4 rounded-xl w-fit hover:scale-105 transition">
          <span className="text-green-400 text-2xl font-bold">45</span> SECS
        </div>
      </div>

      {/* RIGHT */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1612832021009-7a7f3b2f1c44"
          className="rounded-xl"
        />

        <div className="mt-4 bg-black/40 p-4 rounded-xl flex justify-between">
          <span className="font-semibold">$125,400</span>
          <span className="text-green-400">Active Pool</span>
        </div>
      </div>

    </div>
  );
}