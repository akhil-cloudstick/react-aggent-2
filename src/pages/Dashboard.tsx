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

    const getAssignedSubtaskCountForProject = (projectId: string) => {
    const projectTaskIds = tasks.filter(t => t.projectId === projectId).map(t => t.id);
    return subtasks.filter(st => projectTaskIds.includes(st.taskId) && st.assignedToUserId === currentUser.id).length;
  };
  const getAssignedSubtaskCountForTask = (taskId: string) => {
    return subtasks.filter(st => st.taskId === taskId && st.assignedToUserId === currentUser.id).length;
  };

  return (
    <div className="space-y-6 flex flex-col h-full ">
      <div className="space-y-6 flex flex-col h-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Hi, {currentUser.name}</h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-select">Projects</Label>
          <Select value={selectedProjectId} onValueChange={(value) => { setSelectedProjectId(value); setSelectedTaskId(undefined); setSelectedSubtaskId(undefined); }}>
            <SelectTrigger id="project-select"><SelectValue placeholder="Select a project" /></SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} ({getAssignedSubtaskCountForProject(project.id)} assigned)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="task-select">Tasks</Label>
            <Select value={selectedTaskId} onValueChange={(value) => { setSelectedTaskId(value); setSelectedSubtaskId(undefined); }} disabled={!selectedProjectId}>
              <SelectTrigger id="task-select"><SelectValue placeholder="Select a task" /></SelectTrigger>
              <SelectContent>
                {filteredTasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name} ({getAssignedSubtaskCountForTask(task.id)} assigned)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="subtask-select">Subtasks</Label>
            <Select value={selectedSubtaskId} onValueChange={setSelectedSubtaskId} disabled={!selectedTaskId}>
              <SelectTrigger id="subtask-select"><SelectValue placeholder="Select a subtask" /></SelectTrigger>
              <SelectContent>
                {filteredSubtasks.map(subtask => (
                    <SelectItem key={subtask.id} value={subtask.id}>
                      {subtask.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
        </div>
      </div>
      <div className="space-y-2">
          <Label htmlFor="description">Work Note Entry</Label>
          <Textarea 
              id="description"
              placeholder={selectedSubtask ? selectedSubtask.description : "Add a description of your work..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-24"
              disabled={!selectedSubtask}
          />
      </div>
      
      <Button className="w-full bg-gray-300 hover:bg-gray-200 text-accent-foreground" onClick={handleStart} disabled={!selectedSubtaskId}>
        Start Work
      </Button>
      <Separator />
      <div className="space-y-2">
        <h5 className="text-xl font-bold">Work History</h5>
      </div>
      {workedOnSubtasks.length > 0 ? (
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 -mr-2">
          {workedOnSubtasks.map(subtask => (
            <Card key={subtask.id} className="cursor-pointer hover:bg-secondary/50" >
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>{subtask.name}</span>
                    <Badge variant="secondary">{formatSeconds(subtask.totalTime)}</Badge>
                  </CardTitle>
                  <CardDescription>{subtask.projectName} / {subtask.taskName}</CardDescription>
                </CardHeader>
              </Card>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
            <Card className="p-6 border-dashed">
                <CardHeader>
                    <CardTitle>No Activity Yet</CardTitle>
                    <CardDescription>You haven't tracked any work yet. Select a subtask to get started.</CardDescription>
                </CardHeader>
            </Card>
        </div>
      )}
    </div>
    </div>
  );
}
