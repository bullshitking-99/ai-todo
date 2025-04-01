"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SubTask } from "@/lib/store";

interface TaskStepsProps {
  subTasks: SubTask[];
  onChange: (subTasks: SubTask[]) => void;
}

export default function TaskSteps({ subTasks, onChange }: TaskStepsProps) {
  const handleStepToggle = (id: string, checked: boolean) => {
    const updatedSubTasks = subTasks.map((step) =>
      step.id === id ? { ...step, finished: checked } : step
    );
    onChange(updatedSubTasks);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground mb-1">Steps</h4>
      <div className="space-y-3">
        {subTasks.map((step) => (
          <div key={step.id} className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-5 h-5">
              <Checkbox
                id={`step-${step.id}`}
                checked={step.finished}
                onCheckedChange={(checked) =>
                  handleStepToggle(step.id, checked as boolean)
                }
                className="group-hover:border-primary"
              />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <Label
                htmlFor={`step-${step.id}`}
                className={`text-sm cursor-pointer transition-all duration-200 ${
                  step.finished
                    ? "line-through text-muted-foreground"
                    : "group-hover:text-primary"
                }`}
              >
                {step.content}
              </Label>
              <span
                className={`text-xs transition-colors duration-200 ml-2 ${
                  step.finished
                    ? "text-muted-foreground"
                    : "text-muted-foreground/70 group-hover:text-muted-foreground"
                }`}
              >
                {step.step}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
