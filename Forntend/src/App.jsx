import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbaar from "./Component/Navbaar";
import Footer from "./Component/Footer";

// Public pages
import Home from "./Component/HomePage/Home";
import Charities from "./Component/CharitiesPage/Charities";
import Prizes from "./Component/PricePage/Price";
import Testimonials from "./Component/TestimonialsPage/Testimonials";
import Login from "./Component/auth/Login";
import Signup from "./Component/auth/Signup";
import JoinSantu from "./Component/JoinSantunary/JoinSantu";
import SuccessPage from "./Component/Subscription/SuccessPage";
import CancelPage from "./Component/Subscription/CancelPage";

// Protected user pages
import Dashboard from "./Component/Dashboard/Dashboard";

// Admin pages
import AdminLayout from "./Component/Admin/AdminLayout";
import AdminUsers from "./Component/Admin/AdminUsers";
import AdminDraws from "./Component/Admin/AdminDraws";
import AdminCharities from "./Component/Admin/AdminCharities";
import AdminWinners from "./Component/Admin/AdminWinners";
import AdminReports from "./Component/Admin/AdminReports";

// ── Protected Route Guard ─────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#071a2f] flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ── Admin Route Guard ─────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#071a2f] flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbaar />
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/prizes" element={<Prizes />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/join-sanctuary" element={<JoinSantu />} />
        <Route path="/subscription/success" element={<SuccessPage />} />
        <Route path="/subscription/cancel" element={<CancelPage />} />

        {/* ── User Dashboard ── */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard/:tab" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminReports />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="draws" element={<AdminDraws />} />
          <Route path="charities" element={<AdminCharities />} />
          <Route path="winners" element={<AdminWinners />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* ── 404 fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;