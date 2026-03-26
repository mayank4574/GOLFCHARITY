import { useState, useEffect } from "react";
import { getCharities, createCharity } from "../../api/api";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "environment", label: "Environment" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "community", label: "Community" },
  { value: "sports", label: "Sports" },
];

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCharity, setNewCharity] = useState({ name: "", description: "", shortDescription: "", imageUrl: "", category: "environment", website: "" });
  const [adding, setAdding] = useState(false);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await getCharities(params);
      setCharities(data.charities || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCharities(); }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCharities();
  };

  const handleAddCharity = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await createCharity(newCharity);
      setShowAddModal(false);
      setNewCharity({ name: "", description: "", shortDescription: "", imageUrl: "", category: "environment", website: "" });
      fetchCharities(); // Refresh list
    } catch (err) {
      alert("Failed to add charity: " + (err.response?.data?.message || err.message));
    } finally {
      setAdding(false);
    }
  };

  const featured = charities.filter((c) => c.featured);

  return (
    <div className="min-h-screen bg-[#071a2f] text-white pt-[70px]">

      {/* HERO */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 text-center">
        <p className="text-green-400 text-xs tracking-widest mb-4">💚 IMPACT DIRECTORY</p>
        <h1 className="text-5xl font-bold mb-4">Charities We Support</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Choose a cause close to your heart. A portion of every subscription goes directly to your selected charity.
        </p>
      </div>

      {/* FEATURED SPOTLIGHT */}
      {featured.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">⭐ Featured Charities</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featured.slice(0, 2).map((c) => (
              <div key={c._id} onClick={() => setSelected(c)} className="relative rounded-3xl overflow-hidden cursor-pointer group">
                <img src={c.imageUrl} alt={c.name} className="h-64 w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold mb-2 inline-block">FEATURED</span>
                  <p className="text-xl font-bold">{c.name}</p>
                  <p className="text-gray-300 text-sm">{c.shortDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH & FILTER */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-start md:items-center">
          <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto flex-1">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search charities..."
              className="flex-1 max-w-lg px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white" />
            <button type="submit" className="bg-green-500 text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Search</button>
          </form>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition flex items-center gap-2">
              <span>+</span> Add Charity
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`px-4 py-2 rounded-full text-sm border transition ${category === c.value ? "bg-green-500 text-black border-green-500" : "border-white/10 text-gray-400 hover:text-white"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* CHARITY GRID */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pb-20">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : charities.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No charities found.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {charities.map((c) => (
              <div key={c._id} onClick={() => setSelected(c)}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 transition duration-300 hover:shadow-xl hover:shadow-green-500/10">
                <img src={c.imageUrl} alt={c.name} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{c.name}</h3>
                    {c.featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Featured</span>}
                  </div>
                  <p className="text-gray-400 text-sm">{c.shortDescription}</p>
                  <span className="inline-block mt-3 text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full capitalize">{c.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-500/10 to-transparent border-t border-white/5 py-16">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 text-center">
          <p className="text-3xl font-bold mb-4">Choose your charity today.</p>
          <p className="text-gray-400 mb-8">Every subscription funds real change. Select a charity when you sign up.</p>
          <Link to="/signup" className="bg-green-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition">
            Subscribe & Give Back →
          </Link>
        </div>
      </div>

      {/* CHARITY DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0b1326] border border-white/10 rounded-3xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <img src={selected.imageUrl || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=800"} alt={selected.name} className="h-56 w-full object-cover rounded-t-3xl" />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selected.name}</h2>
              <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full capitalize mb-4 inline-block">{selected.category}</span>
              <p className="text-gray-300 mt-3">{selected.description}</p>

              {selected.events?.length > 0 && (
                <div className="mt-6">
                  <p className="font-semibold mb-3">Upcoming Events</p>
                  {selected.events.map((ev, i) => (
                    <div key={i} className="bg-black/20 rounded-xl p-4 mb-2">
                      <p className="font-medium">{ev.title}</p>
                      <p className="text-gray-400 text-sm">{ev.description}</p>
                      <p className="text-green-400 text-xs mt-1">📅 {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}</p>
                      {ev.location && <p className="text-gray-500 text-xs">📍 {ev.location}</p>}
                    </div>
                  ))}
                </div>
              )}

              {selected.website && (
                <a href={selected.website} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-4 text-green-400 text-sm hover:underline">
                  Visit Website →
                </a>
              )}

              <div className="flex gap-3 mt-6">
                <Link to="/join-sanctuary" className="flex-1 bg-green-500 text-black py-3 rounded-full font-semibold text-center hover:scale-105 transition">
                  Support This Charity →
                </Link>
                <button onClick={() => setSelected(null)} className="border border-white/20 px-6 py-3 rounded-full text-gray-400 hover:text-white transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CHARITY MODAL */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#0b1326] border border-white/10 rounded-3xl w-full max-w-[600px] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Add New Charity</h2>
            <form onSubmit={handleAddCharity} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Charity Name *</label>
                <input required value={newCharity.name} onChange={(e) => setNewCharity({...newCharity, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500" placeholder="e.g. Gaia Roots" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select value={newCharity.category} onChange={(e) => setNewCharity({...newCharity, category: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500">
                    <option value="environment">Environment</option>
                    <option value="health">Health</option>
                    <option value="education">Education</option>
                    <option value="community">Community</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Website URL</label>
                  <input value={newCharity.website} onChange={(e) => setNewCharity({...newCharity, website: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500" placeholder="https://" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Short Description *</label>
                <input required value={newCharity.shortDescription} onChange={(e) => setNewCharity({...newCharity, shortDescription: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500" placeholder="One line summary..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Description *</label>
                <textarea required value={newCharity.description} onChange={(e) => setNewCharity({...newCharity, description: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 h-24" placeholder="Detailed description..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input value={newCharity.imageUrl} onChange={(e) => setNewCharity({...newCharity, imageUrl: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500" placeholder="https://image-url..." />
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                <button type="submit" disabled={adding} className="flex-1 bg-green-500 text-black py-3 rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-50">
                  {adding ? "Adding..." : "Add Charity"}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:text-white transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}