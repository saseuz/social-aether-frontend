import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SidebarLeft from "./components/SidebarLeft";
import Feed from "./components/Feed";
import SidebarRight from "./components/SidebarRight";
import Login from "./pages/Login";
import Register from "./pages/Register";

function AetherLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 sm:px-6 md:pb-0 pb-20">
      <a 
        href="#feed" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-aether-glow focus:px-4 focus:py-2.5 focus:text-stellar-white focus:outline-none focus:ring-2 focus:ring-nebula-teal font-mono text-xs tracking-wider uppercase"
      >
        Skip to content
      </a>
      <div className="flex justify-between gap-6 lg:gap-8">
        {/* Left Column (Navigation) */}
        <SidebarLeft />
        
        {/* Middle Column (Main Content Feed) */}
        <main className="flex-1 max-w-3xl py-0 md:py-6">
          <Feed />
        </main>
        
        {/* Right Column (Trends / Discovery) */}
        <SidebarRight />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AetherLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
