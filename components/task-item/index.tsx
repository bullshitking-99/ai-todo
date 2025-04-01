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
import { SubTask, Task } from "@/lib/store";
import { Slider } from "../ui/slider";
import { StoreFunctionKeys } from "@/lib/dispatcher";
import TaskSteps from "./task-steps";
import TaskStepsEditor from "./task-step-editor";

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
  const [editedSubTasks, setEditedSubTasks] = useState<SubTask[]>([
    ...task.subTasks,
  ]);

  useEffect(() => {
    setEditedTask({
      title: task.title,
      description: task.description,
      progress: task.progress,
    });
  }, [task]);

  const taskCompleted = task.progress === 100;

  const handleSave = () => {
    // Ensure steps add up to 100%
    const totalSteps = editedSubTasks.reduce(
      (total, step) => total + step.step,
      0
    );

    let finalSubTasks = [...editedSubTasks];

    // If steps don't add up to 100%, distribute evenly
    if (totalSteps !== 100) {
      const evenPercentage = Math.floor(100 / finalSubTasks.length);
      const remainder = 100 - evenPercentage * finalSubTasks.length;

      finalSubTasks = finalSubTasks.map((step, index) => ({
        ...step,
        step: evenPercentage + (index === 0 ? remainder : 0),
      }));
    }

    // Calculate progress based on completed steps
    const completedSteps = finalSubTasks.filter((step) => step.finished);
    const completedPercentage = completedSteps.reduce(
      (total, step) => total + step.step,
      0
    );

    onTaskChange({
      type: "updateTask",
      params: {
        ...task,
        title: editedTask.title,
        description: editedTask.description,
        progress: completedPercentage,
        subTasks: finalSubTasks,
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

  const handleCompleteTask = () => {
    // Mark all steps as completed
    const updatedSubTasks = task.subTasks.map((step) => ({
      ...step,
      finished: true,
    }));

    onTaskChange({
      type: "updateTask",
      params: {
        ...task,
        progress: 100,
        subTasks: updatedSubTasks,
      },
    });
  };

  const handleStepChange = (updatedSubTasks: SubTask[]) => {
    // Calculate progress based on completed steps
    const completedSteps = updatedSubTasks.filter((step) => step.finished);
    const completedPercentage = completedSteps.reduce(
      (total, step) => total + step.step,
      0
    );

    onTaskChange({
      type: "updateTask",
      params: {
        ...task,
        progress: completedPercentage,
        subTasks: updatedSubTasks,
      },
    });
  };

  return (
    <Card className={`p-4 transition-all hover:shadow-md ${getCardClasses()}`}>
      {isEditing ? (
        <div className="space-y-3">
          <Input
            value={editedTask.title}
            onChange={(e) =>
              setEditedTask({ ...editedTask, title: e.target.value })
            }
            className="font-medium border-2 "
          />
          <Textarea
            value={editedTask.description}
            onChange={(e) =>
              setEditedTask({ ...editedTask, description: e.target.value })
            }
            className="text-sm resize-none h-20 border-2 "
          />

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Task Steps</h4>
            <TaskStepsEditor
              subTasks={editedSubTasks}
              onChange={setEditedSubTasks}
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
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start ">
            <div className="flex-1 pr-4">
              <h3 className="font-medium text-foreground">{task.title}</h3>
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCompleteTask}
                disabled={task.progress === 100}
                className="h-8 w-8 text-success hover:text-success/80"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
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
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <Progress
              value={task.progress}
              className={`h-2 ${taskCompleted ? "[&>div]:bg-success" : ""}`}
            />
          </div>

          {task.subTasks.length > 0 && (
            <TaskSteps subTasks={task.subTasks} onChange={handleStepChange} />
          )}

          {task.progress === 100 && (
            <div className="flex items-center text-xs text-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Completed</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
