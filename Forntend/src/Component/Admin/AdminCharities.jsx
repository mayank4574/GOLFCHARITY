import { useState, useEffect } from "react";
import { getCharities, createCharity, updateCharity, deleteCharity } from "../../api/api";

const CATEGORIES = ["environment", "health", "education", "community", "sports", "other"];

const EMPTY_FORM = {
  name: "", description: "", shortDescription: "", imageUrl: "", website: "", category: "other", featured: false,
};

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCharities = async () => {
    try {
      const { data } = await getCharities();
      setCharities(data.charities || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCharities(); }, []);

  const set = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); setError(""); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description, shortDescription: c.shortDescription || "", imageUrl: c.imageUrl || "", website: c.website || "", category: c.category, featured: c.featured }); setEditId(c._id); setShowForm(true); setError(""); };

  const handleSave = async () => {
    setError(""); setSaving(true);
    try {
      if (!form.name || !form.description) return setError("Name and description are required");
      if (editId) await updateCharity(editId, form);
      else await createCharity(form);
      setShowForm(false);
      setSuccess(editId ? "Charity updated!" : "Charity created!");
      fetchCharities();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this charity?")) return;
    try {
      await deleteCharity(id);
      fetchCharities();
    } catch { setError("Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-400 text-xs tracking-widest mb-1">ADMIN</p>
          <h1 className="text-3xl font-bold">Charity Management</h1>
        </div>
        <button onClick={openCreate} className="bg-green-500 text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">+ Add Charity</button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl">{success}</div>}

      {/* CHARITY GRID */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {charities.map((c) => (
            <div key={c._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <img src={c.imageUrl} alt={c.name} className="h-40 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">{c.name}</p>
                  {c.featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Featured</span>}
                  <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full capitalize">{c.category}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{c.shortDescription || c.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="text-blue-400 text-xs border border-blue-400/30 px-3 py-1 rounded-full hover:bg-blue-500/10 transition">Edit</button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-400 text-xs border border-red-400/30 px-3 py-1 rounded-full hover:bg-red-500/10 transition">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-[#0b1326] border border-white/10 rounded-2xl p-6 w-full max-w-[600px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{editId ? "Edit Charity" : "Add New Charity"}</h3>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

            <div className="space-y-4">
              {[["Name *", "name", "text"], ["Short Description", "shortDescription", "text"], ["Image URL", "imageUrl", "text"], ["Website", "website", "text"]].map(([label, field, type]) => (
                <div key={field}>
                  <label className="text-xs text-gray-400">{label.toUpperCase()}</label>
                  <input type={type} value={form[field]} onChange={set(field)} placeholder={label}
                    className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white" />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400">FULL DESCRIPTION *</label>
                <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Full charity description..."
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-400">CATEGORY</label>
                <select value={form.category} onChange={set("category")}
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white">
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={set("featured")} className="accent-green-500 w-4 h-4" />
                <span className="text-sm text-gray-300">Featured on homepage</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="bg-green-500 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition disabled:opacity-60">
                {saving ? "Saving..." : (editId ? "Update" : "Create")}
              </button>
              <button onClick={() => setShowForm(false)} className="border border-white/20 px-6 py-2 rounded-full text-gray-400 hover:text-white transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
