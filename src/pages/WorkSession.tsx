import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { screenshots as mockScreenshots, subtasks, users } from "../lib/data";
import type { Screenshot } from "../lib/definitions";
import { useTime } from "../contexts/TimeContext";
import { X, Clock, Keyboard, MousePointerClick } from "lucide-react";
import { PlaceHolderImages } from '../lib/placeholder-images';

const formatSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export default function WorkSessionPage() {
  const { subtaskId } = useParams<{ subtaskId: string }>();
  const navigate = useNavigate();
  const { sessionWorkSeconds, isTimerRunning, setTimerRunning, startTimer, stopTimer, workLog } = useTime();
  const [screenshots, setScreenshots] = useState<Screenshot[]>(mockScreenshots);
useEffect(()=>{
  console.log('====================================');
  console.log(screenshots);
  console.log('====================================');
},[screenshots])
  useEffect(() => {
    if (!isTimerRunning && subtaskId) startTimer(subtaskId);
  }, [isTimerRunning, startTimer, subtaskId]);

  const handleToggle = (isRunning: boolean) => {
    setTimerRunning(isRunning);
    if (!isRunning) {
      stopTimer();
      navigate("/dashboard");
    }
  };

  const subtask = subtasks.find((st) => st.id === subtaskId);
  const assignedUser = users.find((u) => u.id === subtask?.assignedToUserId);
  if (!subtask || !assignedUser) return <div>Subtask not found.</div>;

  const totalSubtaskTime = (workLog[subtaskId!] || 0) + sessionWorkSeconds;
  const currentScreenshot = screenshots[0] || null;

  const handleDelete = (id: string) => setScreenshots(screenshots.filter((ss) => ss.id !== id));

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{subtask.name}</h2>
        <div className="flex items-center space-y-2">
          <Label className={`font-semibold ${isTimerRunning ? "text-primary" : "text-muted-foreground"}`}>
            {isTimerRunning ? "Start" : "Stop"}
          </Label>
          <Switch checked={isTimerRunning} onCheckedChange={handleToggle} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
        {currentScreenshot && (() => {
          const placeholder = PlaceHolderImages.find((p) => p.id === currentScreenshot.id);
          return (
            <Card key={currentScreenshot.id} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div>
                   {currentScreenshot && (
                  <img
                    src={currentScreenshot.imageUrl}
                    alt={currentScreenshot.imageHint}
                    className="w-full h-auto object-cover"
                  />
                )}

                </div>
               
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 text-white">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{currentScreenshot.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Keyboard size={12} />
                      <span>{currentScreenshot.keyboardStrokes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointerClick size={12} />
                      <span>{currentScreenshot.mouseMovements}</span>
                    </div>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the screenshot.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(currentScreenshot.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
        <Button variant="outline" onClick={() => navigate("/diary")}>Work Diary</Button>
      </div>
    </div>
  );
}
