import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Reports", icon: "📊", end: true },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/draws", label: "Draws", icon: "🎰" },
  { to: "/admin/charities", label: "Charities", icon: "💚" },
  { to: "/admin/winners", label: "Winners", icon: "🏆" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#060f1e] text-white flex pt-[70px]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b1326] border-r border-white/10 flex flex-col fixed top-[70px] bottom-0 left-0 z-40">
        <div className="p-6 border-b border-white/10">
          <p className="text-xs text-gray-400 tracking-widest mb-1">LOGGED IN AS</p>
          <p className="font-semibold">{user?.fullName}</p>
          <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <NavLink to="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 text-sm hover:text-white transition">← View Site</NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 text-sm hover:text-red-300 transition">⏻ Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
