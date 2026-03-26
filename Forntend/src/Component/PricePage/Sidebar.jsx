export default function Sidebar() {
  return (
    <div className="w-64 bg-[#0f172a]/80 backdrop-blur-md p-6 hidden md:flex flex-col justify-between border-r border-white/10">

      <div>
        <h1 className="text-green-400 font-bold text-xl mb-10">
          KINETICHORIZON
        </h1>

        <div className="space-y-4 text-gray-400 text-sm">
          <p className="hover:text-white cursor-pointer transition">Impact</p>
          <p className="text-green-400">Rewards</p>
          <p className="hover:text-white cursor-pointer transition">Vault</p>
          <p className="hover:text-white cursor-pointer transition">Stories</p>
        </div>
      </div>

      <button className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm hover:scale-105 transition">
        Upgrade to Pro
      </button>
    </div>
  );
}