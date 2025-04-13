import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 模拟打字效果
export function typeText({
  fullText,
  onUpdate,
  onDone,
  delay = 25,
}: {
  fullText: string;
  onUpdate: (partialText: string) => void;
  onDone?: () => void;
  delay?: number;
}) {
  let index = 0;
  const interval = setInterval(() => {
    onUpdate(fullText.slice(0, index + 1));
    index += 1;

    if (index >= fullText.length) {
      clearInterval(interval);
      onDone?.();
    }
  }, delay);
}
