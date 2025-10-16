import React from "react";
import { useTime } from "../contexts/TimeContext"; // adjust path if needed

// Helper to format seconds into hh:mm:ss
const formatSeconds = (seconds: number): string => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const Header: React.FC = () => {
  const { punchInTime, totalWorkSeconds } = useTime();

  return (
    <header className="flex-shrink-0 bg-card p-3 shadow-md">
      <div className="flex justify-between text-sm font-medium">
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Punch-in</span>
          <span className="font-semibold text-primary">{punchInTime || "--:-- --"}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Total Work Time</span>
          <span className="font-semibold text-primary">{formatSeconds(totalWorkSeconds)}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
