// App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard";
import WorkSessionPage from "./pages/WorkSession";
import DiaryPage from "./pages/Diary";

import { TimeProvider } from "./contexts/TimeContext"; // import your provider

function App() {
  return (
    <TimeProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </TimeProvider>
  );
}

export default App;
