import { useState, useEffect } from "react";
import { getCharities, updateProfile } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export default function CharitySelector() {
  const { user, updateUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [selected, setSelected] = useState(user?.selectedCharity?._id || user?.selectedCharity || "");
  const [pct, setPct] = useState(user?.charityContributionPct || 10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getCharities().then((r) => setCharities(r.data.charities || [])).catch(() => {});
  }, []);

  const filtered = charities.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.shortDescription || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || c.category === filter;
    return matchSearch && matchFilter;
  });

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (pct < 10) return setError("Minimum charity contribution is 10%");
    setLoading(true);
    try {
      const { data } = await updateProfile({ selectedCharity: selected || null, charityContributionPct: pct });
      updateUser(data.user);
      setSuccess("Charity preferences saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const currentCharity = charities.find((c) => c._id === selected);

  return (
    <div className="space-y-6">
      {/* CURRENT CHARITY */}
      {currentCharity && (
        <div className="bg-white/5 border border-green-500/30 rounded-2xl p-6 flex gap-6">
          <img src={currentCharity.imageUrl} alt={currentCharity.name} className="w-24 h-24 rounded-xl object-cover" />
          <div>
            <p className="text-xs text-green-400 tracking-widest mb-1">CURRENTLY SUPPORTING</p>
            <h3 className="text-xl font-bold">{currentCharity.name}</h3>
            <p className="text-gray-400 text-sm mt-1">{currentCharity.shortDescription}</p>
            <p className="text-green-400 font-semibold mt-2">{pct}% of your subscription goes to this charity</p>
          </div>
        </div>
      )}

      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl">{success}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* CONTRIBUTION SLIDER */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">💚 Contribution Percentage</h3>
        <div className="flex items-center gap-6">
          <input type="range" min="10" max="50" step="5" value={pct} onChange={(e) => setPct(Number(e.target.value))}
            className="flex-1 accent-green-500" />
          <div className="text-3xl font-bold text-green-400 w-20 text-right">{pct}%</div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>10% (minimum)</span><span>50% (maximum)</span>
        </div>
        <p className="text-gray-400 text-sm mt-3">
          You contribute <strong className="text-green-400">{pct}%</strong> of your subscription to your chosen charity.
          {pct >= 20 && " 🌍 Thank you for your generosity!"}
        </p>
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">🔍 Browse Charities</h3>
        <div className="flex gap-4 mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search charities..."
            className="flex-1 px-4 py-2 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white text-sm" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white text-sm">
            <option value="">All Categories</option>
            <option value="environment">Environment</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="community">Community</option>
            <option value="sports">Sports</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              onClick={() => setSelected(c._id)}
              className={`flex gap-4 p-4 rounded-xl cursor-pointer border transition ${
                selected === c._id
                  ? "border-green-500 bg-green-500/10"
                  : "border-white/10 bg-black/10 hover:border-white/30"
              }`}
            >
              <img src={c.imageUrl} alt={c.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{c.name}</p>
                  {c.featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Featured</span>}
                </div>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{c.shortDescription}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{c.category}</p>
              </div>
              {selected === c._id && <div className="text-green-400 text-xl self-center">✓</div>}
            </div>
          ))}
        </div>
      </div>

      <button
        id="save-charity"
        onClick={handleSave}
        disabled={loading}
        className="bg-green-500 text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Charity Preferences →"}
      </button>
    </div>
  );
}
