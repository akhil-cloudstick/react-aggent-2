// App.tsx
import React from "react";
// 🚀 FINAL FIX: Changed BrowserRouter to HashRouter for compatibility 
// with Electron's file:// protocol.
import { HashRouter, Routes, Route } from "react-router-dom"; 

import MainLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard";
import WorkSessionPage from "./pages/WorkSession";
import DiaryPage from "./pages/Diary";

import { TimeProvider } from "./contexts/TimeContext"; // import your provider

function App() {
  return (
    <TimeProvider>
      {/* 🚀 Changed BrowserRouter to HashRouter */}
      <HashRouter> 
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            }
          />
          <Route
            path="/work-session/:subtaskId"
            element={
              <MainLayout>
                <WorkSessionPage />
              </MainLayout>
            }
          />
          <Route
            path="/diary"
            element={
              <MainLayout>
                <DiaryPage />
              </MainLayout>
            }
          />
        </Routes>
      </HashRouter>
    </TimeProvider>
  );
}

export default App;
