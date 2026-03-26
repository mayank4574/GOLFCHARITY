import { useState, useEffect } from "react";
import { adminGetUsers, adminUpdateUser, adminDeleteUser } from "../../api/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async (p = 1, s = "") => {
    setLoading(true);
    try {
      const { data } = await adminGetUsers({ page: p, limit: 15, search: s });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(page, search); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const handleEdit = (user) => {
    setEditUser({ ...user, role: user.role });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateUser(editUser._id, {
        fullName: editUser.fullName,
        email: editUser.email,
        role: editUser.role,
      });
      setEditUser(null);
      fetchUsers(page, search);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Permanently delete this user and all their data?")) return;
    try {
      await adminDeleteUser(userId);
      fetchUsers(page, search);
    } catch {
      setError("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-green-400 text-xs tracking-widest mb-1">ADMIN</p>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-400 mt-1">{total} total users</p>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white" />
        <button type="submit" className="bg-green-500 text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Search</button>
      </form>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-gray-400 text-xs tracking-widest">
                <th className="text-left p-4">USER</th>
                <th className="text-left p-4">ROLE</th>
                <th className="text-left p-4">SUBSCRIPTION</th>
                <th className="text-left p-4">CHARITY</th>
                <th className="text-left p-4">JOINED</th>
                <th className="text-left p-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><div className="inline-block w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4">
                    <p className="font-medium">{u.fullName}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${u.role === "admin" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" : "text-gray-400 border-white/10"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.subscription ? (
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full border capitalize ${
                          u.subscription.status === "active" ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-red-400 border-red-500/30"
                        }`}>{u.subscription.status}</span>
                        <p className="text-gray-500 text-xs mt-1 capitalize">{u.subscription.plan}</p>
                      </div>
                    ) : <span className="text-gray-500 text-xs">None</span>}
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{u.selectedCharity?.name || "—"}</td>
                  <td className="p-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(u)} className="text-blue-400 text-xs border border-blue-400/30 px-3 py-1 rounded-full hover:bg-blue-500/10 transition">Edit</button>
                      <button onClick={() => handleDelete(u._id)} className="text-red-400 text-xs border border-red-400/30 px-3 py-1 rounded-full hover:bg-red-500/10 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {pages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition ${p === page ? "bg-green-500 text-black" : "bg-white/5 text-gray-400 hover:text-white"}`}
            >{p}</button>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditUser(null)}>
          <div className="bg-[#0b1326] border border-white/10 rounded-2xl p-6 w-[90%] md:w-[500px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">FULL NAME</label>
                <input value={editUser.fullName} onChange={(e) => setEditUser((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400">EMAIL</label>
                <input value={editUser.email} onChange={(e) => setEditUser((p) => ({ ...p, email: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400">ROLE</label>
                <select value={editUser.role} onChange={(e) => setEditUser((p) => ({ ...p, role: e.target.value }))}
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-green-500 text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="bg-green-500 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditUser(null)} className="border border-white/20 px-6 py-2 rounded-full text-gray-400 hover:text-white transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
