import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { useAppSelector } from "@/store/hooks";
import { useTime } from "../contexts/TimeContext";
import { X, Clock, Keyboard, MousePointerClick, LogOut } from "lucide-react";
import { useMonitoring } from "@/contexts/MonitoringContext";

const formatSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export default function WorkSessionPage() {
  const { subtaskId, workDiaryId, taskActivityId } = useParams<{ subtaskId: string, workDiaryId: string, taskActivityId: string }>();
  const navigate = useNavigate();
  const { sessionWorkSeconds, isTimerRunning, setTimerRunning, startTimer, stopTimer } = useTime();
  const {  stopMonitoring, latestLogEntry } = useMonitoring();

  useEffect(() => {
    if (subtaskId && taskActivityId && workDiaryId) {
      localStorage.setItem("subtaskId", subtaskId.toString())
      localStorage.setItem("taskActivityId", taskActivityId)
      localStorage.setItem("workDiaryId", workDiaryId)
    }
  }, [subtaskId, taskActivityId])
  const handleToggle = (isRunning: boolean) => {
    setTimerRunning(isRunning);
    if (!isRunning) {
      stopTimer();
      if (subtaskId && taskActivityId && workDiaryId) {
        stopMonitoring(subtaskId, Number(workDiaryId), Number(taskActivityId));
      }
      navigate("/dashboard");
    }
  };
  const projects = useAppSelector((state) => state.task.projectsData);
  const subtask = projects
    .flatMap((p) => (p.tasks ?? []))
    .flatMap((t) => (t.subtasks ?? []))
    .find((st) => st.id === Number(subtaskId));

  if (!subtask) return <div>Subtask not found.</div>;
  const totalSubtaskTime = 0 + sessionWorkSeconds;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{subtask.name}</h2>
        <div className="flex items-center gap-2 space-y-2">
          <Label className={`font-semibold ${isTimerRunning ? "text-primary" : "text-muted-foreground"} m-0`}>
            {isTimerRunning ? "Start" : "Stop"}
          </Label>
          <Switch className="bg-[#0b2479]" checked={isTimerRunning} onCheckedChange={handleToggle} />
        </div>
      </div>

      <div className="mt-5 mb-15">
        {latestLogEntry && (() => {
          return (
            <Card key={latestLogEntry.subtaskId} className="relative group overflow-hidden rounded-md border-0 ">
              <CardContent className="p-0  ">
                <div>
                  {latestLogEntry.screenshot && (
                    <img
                      src={`data:image/jpeg;base64,${latestLogEntry.screenshot}`}
                    />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 text-white 
                    rounded-b-md">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>
                        {latestLogEntry.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Keyboard size={12} />
                      <span>{latestLogEntry.keyActions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointerClick size={12} />
                      <span>{latestLogEntry.mouseActions}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>
      <div className="flex-shrink-0 flex items-center justify-between pt-2 border-t">
        <div className="text-left">
          <p className="text-xs text-muted-foreground">Subtask Time</p>
          <p className="text-lg font-semibold tabular-nums">{formatSeconds(totalSubtaskTime)}</p>
        </div>
        <Button variant="outline">Work Diary</Button>
      </div>

    </div>

  );
}
