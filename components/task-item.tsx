"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  CheckCircle,
  MoreHorizontal,
  X,
  Save,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/lib/store";

type TaskStatus = "normal" | "active" | "passive";

interface Task {
  id: string;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  status: TaskStatus;
}

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { deleteTask, completeTask, updateTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedProgress, setEditedProgress] = useState(task.progress);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleSave = () => {
    updateTask({
      ...task,
      title: editedTitle,
      description: editedDescription,
      progress: editedProgress,
      status: task.status,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setEditedProgress(task.progress);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setIsRemoving(true);
    setTimeout(() => {
      deleteTask(id);
    }, 500); // Match animation duration
  };

  const getCardClasses = () => {
    const baseClasses = isRemoving
      ? "task-removing"
      : "task-visible transition-all duration-500";

    const statusStyle =
      task.status === "active"
        ? "border-primary border-2 shadow-md"
        : task.status === "passive"
        ? "opacity-60"
        : "";

    return `${baseClasses} ${statusStyle}`;
  };

  return (
    <Card className={`p-4 hover:shadow-md ${getCardClasses()}`}>
      {isEditing ? (
        <div className="space-y-3">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="font-medium"
          />
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="text-sm resize-none h-20"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs">Progress: {editedProgress}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={editedProgress}
              onChange={(e) =>
                setEditedProgress(Number.parseInt(e.target.value))
              }
              className="flex-1"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-foreground">{task.title}</h3>
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Task options</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => completeTask(task.id)}
                  disabled={task.completed}
                  className="text-success"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Complete
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <Progress
              value={task.progress}
              className={`h-2 ${task.completed ? "[&>div]:bg-success" : ""}`}
            />
          </div>

          {task.completed && (
            <div className="flex items-center mt-2 text-xs text-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Completed</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
