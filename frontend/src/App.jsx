import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ApplicationProvider } from "./context/ApplicationContext"; // ✅ ADD
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import NewApplication from "./pages/NewApplication";
import ApplicationResult from "./pages/ApplicationResult";
import Simulator from "./pages/Simulator";
import Analytics from "./pages/Analytics";
import LandingPage from "./pages/LandingPage";
import Architecture from "./pages/Architecture";
import Chat from "./components/Chats/Chat";

function AppContent() {
  const location = useLocation();

  const isFullPage =
    location.pathname === "/" || location.pathname === "/architecture";

  return (
    <div className={`min-h-screen ${isFullPage ? "bg-[#030712]" : "bg-white"}`}>
      {!isFullPage && <Navbar />}

      {isFullPage ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
      ) : (
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/chat" element={<Chat />} />
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
    <ApplicationProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true, 
        }}
      >
        <AppContent />
      </BrowserRouter>
    </ApplicationProvider>
  );
}

export default App;
