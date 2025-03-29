import TaskPanel from "@/components/task-panel";
import ChatPanel from "@/components/chat-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden">
      {/* 固定宽度或占一部分比例 */}
      <div className="w-1/2 border-r border-border">
        <TaskPanel />
      </div>

      {/* 剩余空间全给 ChatPanel */}
      <div className="w-1/2 flex-1">
        <ChatPanel />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </main>
  );
}
