"use client";

import { useState, useEffect } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SubTask } from "@/lib/store";

interface TaskStepsEditorProps {
  subTasks: SubTask[];
  onChange: (subTasks: SubTask[]) => void;
}

export default function TaskStepsEditor({
  subTasks,
  onChange,
}: TaskStepsEditorProps) {
  const [localSubTasks, setLocalSubTasks] = useState<SubTask[]>(subTasks);
  const [totalPercentage, setTotalPercentage] = useState<number>(
    subTasks.reduce((sum, task) => sum + task.step, 0)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Calculate total percentage whenever subTasks change
    const total = localSubTasks.reduce(
      (sum, task) => sum + (task.step || 0),
      0
    );
    setTotalPercentage(total);

    // Validate total percentage
    if (total !== 100) {
      setError(`Total percentage must be 100%. Current total: ${total}%`);
    } else {
      setError(null);
      // Only update parent when valid
      onChange(localSubTasks);
    }
  }, [localSubTasks, onChange]);

  const handleContentChange = (id: string, content: string) => {
    setLocalSubTasks((prev) =>
      prev.map((step) => (step.id === id ? { ...step, content } : step))
    );
  };

  const handleStepChange = (id: string, stepValue: string) => {
    const step = Number.parseInt(stepValue);
    setLocalSubTasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, step } : s))
    );
  };

  const handleAddStep = () => {
    const newStep: SubTask = {
      id: Date.now().toString(),
      content: "New step",
      step: 0,
      finished: false,
    };
    setLocalSubTasks([...localSubTasks, newStep]);
  };

  const handleRemoveStep = (id: string) => {
    if (localSubTasks.length <= 1) {
      setError("Task must have at least one step");
      return;
    }
    setLocalSubTasks((prev) => prev.filter((step) => step.id !== id));
  };

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">Total: {totalPercentage}%</span>
      </div>

      <div className="space-y-2">
        {localSubTasks.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            <Input
              value={step.content}
              onChange={(e) => handleContentChange(step.id, e.target.value)}
              className="flex-1"
              placeholder="Step description"
            />
            <div className="flex items-center w-24 gap-1">
              <Input
                type="number"
                value={step.step}
                onChange={(e) => handleStepChange(step.id, e.target.value)}
                className="w-16"
              />
              <span className="text-xs">%</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveStep(step.id)}
              className="h-8 w-8 text-primary hover:text-primary/80"
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddStep}
        className="w-full mt-2 [border-style:dashed] [border-width:1px] [border-dash-length:8px] [border-dash-gap:16px] border-primary hover:border-primary dark:border-primary dark:hover:border-primary bg-transparent hover:bg-transparent"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Step
      </Button>
    </div>
  );
}
