import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NewApplication from './pages/NewApplication';
import ApplicationResult from './pages/ApplicationResult';
import Simulator from './pages/Simulator';
import Analytics from './pages/Analytics';
import LandingPage from './pages/LandingPage';
import Architecture from "./pages/Architecture";

function AppContent() {
  const location = useLocation();

  // ✅ Pages that should be FULL WIDTH
  const isFullPage =
    location.pathname === "/" || location.pathname === "/architecture";

  return (
    <div className="min-h-screen bg-[#030712]">

      {/* Navbar */}
      {!isFullPage && <Navbar />}

      {/* FULL WIDTH PAGES */}
      {isFullPage ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
      ) : (
        /* DASHBOARD PAGES (WITH CONTAINER) */
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apply" element={<NewApplication />} />
            <Route path="/result" element={<ApplicationResult />} />
            <Route path="/simulate" element={<Simulator />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;