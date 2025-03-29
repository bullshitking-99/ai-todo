"use client";

import { useEffect, useState } from "react";
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
import { Task } from "@/lib/store";
import { Slider } from "./ui/slider";
import { StoreFunctionKeys } from "@/lib/dispatcher";

interface TaskItemProps {
  task: Task;
  onTaskChange: (action: { type: StoreFunctionKeys; params: any }) => void;
}

export default function TaskItem({ task, onTaskChange }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    progress: task.progress,
  });

  useEffect(() => {
    setEditedTask({
      title: task.title,
      description: task.description,
      progress: task.progress,
    });
  }, [task]);

  const taskCompleted = task.progress === 100;

  const handleSave = () => {
    onTaskChange({
      type: "updateTask",
      params: {
        ...task,
        title: editedTask.title,
        description: editedTask.description,
        progress: editedTask.progress,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask({
      title: task.title,
      description: task.description,
      progress: task.progress,
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setIsRemoving(true);
    setTimeout(() => {
      onTaskChange({
        type: "deleteTask",
        params: id,
      });
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
            value={editedTask.title}
            onChange={(e) =>
              setEditedTask({ ...editedTask, title: e.target.value })
            }
            className="font-medium"
          />
          <Textarea
            value={editedTask.description}
            onChange={(e) =>
              setEditedTask({ ...editedTask, description: e.target.value })
            }
            className="text-sm resize-none h-20"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs shrink-0">Progress:</span>
            <Slider
              value={[editedTask.progress]}
              onValueChange={([number]) =>
                setEditedTask({ ...editedTask, progress: number })
              }
              min={0}
              max={100}
              step={1}
            />
            <span className="text-xs shrink-0">{editedTask.progress}%</span>
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
                  onClick={() =>
                    onTaskChange({
                      type: "updateTask",
                      params: { ...task, progress: 100 },
                    })
                  }
                  disabled={taskCompleted}
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
              className={`h-2 ${taskCompleted ? "[&>div]:bg-success" : ""}`}
            />
          </div>

          {task.progress === 100 && (
            <div className="flex items-center  text-xs text-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Completed</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
