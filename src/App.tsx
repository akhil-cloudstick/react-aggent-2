// App.tsx
import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard";
import WorkSessionPage from "./pages/WorkSession";
import { TimeProvider } from "./contexts/TimeContext";
import { MonitoringProvider } from "./contexts/MonitoringContext"; // <-- NEW

function App() {
  return (
    <TimeProvider>
      <MonitoringProvider> {/* <-- NEW */}
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
              path="/work-session/:subtaskId/:workDiaryId/:taskActivityId"
              element={
                <MainLayout>
                  <WorkSessionPage />
                </MainLayout>
              }
            />
          </Routes>
        </HashRouter>
      </MonitoringProvider>
    </TimeProvider>
  );
}

export default App;
