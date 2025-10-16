import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { projects, tasks, subtasks, users } from "../lib/data";
import { useTime } from "../contexts/TimeContext";

const currentUser = users.find((u) => u.email === "akhil@example.com")!;

const formatSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { workLog, startTimer } = useTime();

  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<string>();
  const [description, setDescription] = useState("");

  const workedOnSubtasks = useMemo(() => {
    return Object.keys(workLog)
      .map((subtaskId) => {
        const subtask = subtasks.find((st) => st.id === subtaskId);
        if (!subtask) return null;
        const task = tasks.find((t) => t.id === subtask.taskId);
        const project = projects.find((p) => p.id === task?.projectId);
        return {
          ...subtask,
          taskName: task?.name,
          projectName: project?.name,
          totalTime: workLog[subtaskId],
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null && s.totalTime > 0)
      .sort((a, b) => b.totalTime - a.totalTime);
  }, [workLog]);

  const filteredTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter((task) => task.projectId === selectedProjectId);
  }, [selectedProjectId]);

  const filteredSubtasks = useMemo(() => {
    if (!selectedTaskId) return [];
    return subtasks.filter(
      (subtask) => subtask.taskId === selectedTaskId && subtask.assignedToUserId === currentUser.id
    );
  }, [selectedTaskId]);

  const selectedSubtask = useMemo(() => {
    if (!selectedSubtaskId) return null;
    return subtasks.find((subtask) => subtask.id === selectedSubtaskId);
  }, [selectedSubtaskId]);

  const handleStart = () => {
    if (selectedSubtaskId) {
      startTimer(selectedSubtaskId);
      navigate(`/work-session/${selectedSubtaskId}`);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* ... your existing JSX for selects, textarea, button, cards ... */}
    </div>
  );
}
