import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbaar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <div className={`w-full fixed top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0b1326]/95 backdrop-blur shadow-lg shadow-black/30" : "bg-[#0b1326]"} border-b border-white/10`}>
      <nav className="max-w-[1200px] mx-auto px-6 md:px-10 h-[70px] flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="text-green-400 font-bold text-xl tracking-tight">
          ⛳ GOLFCHARITY
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-8 text-gray-300 text-sm items-center">
          <Link to="/" className="hover:text-white transition">HOW IT WORKS</Link>
          <Link to="/charities" className="hover:text-white transition">CHARITIES</Link>
          <Link to="/prizes" className="hover:text-white transition">DRAWS</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="hover:text-white transition">DASHBOARD</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="hover:text-white transition text-yellow-400">ADMIN</Link>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              <span className="text-gray-400 text-sm">Hi, {user?.fullName?.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="text-gray-300 text-sm hover:text-white transition"
              >
                Logout
              </button>
              <Link
                to="/dashboard"
                className="bg-green-500 text-black px-5 py-2 rounded-full text-sm font-semibold hover:scale-105 transition"
              >
                My Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 text-sm hover:text-white transition">Login</Link>
              <Link
                to="/join-sanctuary"
                className="bg-green-500 text-black px-5 py-2 rounded-full text-sm font-semibold hover:scale-105 transition"
              >
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2">
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-white transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0b1326] border-t border-white/10 px-6 py-4 space-y-4">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">How It Works</Link>
          <Link to="/charities" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">Charities</Link>
          <Link to="/prizes" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">Draws</Link>
          {isAuthenticated && (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">Dashboard</Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-yellow-400 hover:text-yellow-300">Admin Panel</Link>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="block text-red-400 hover:text-red-300">Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white">Login</Link>
              <Link to="/join-sanctuary" onClick={() => setMobileOpen(false)} className="block text-green-400 font-semibold">Join Now</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}