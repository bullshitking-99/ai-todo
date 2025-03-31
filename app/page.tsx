"use client";

import { useRef } from "react";
import TaskPanel from "@/components/task-panel";
import ChatPanel from "@/components/chat-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const chatPanelRef = useRef(null);
  return (
    <main className="flex h-screen w-screen overflow-hidden">
      {/* 固定宽度或占一部分比例 */}
      <div className="w-1/2 border-r border-border">
        <TaskPanel chatPanelRef={chatPanelRef} />
      </div>

      {/* 剩余空间全给 ChatPanel */}
      <div className="w-1/2 flex-1">
        <ChatPanel ref={chatPanelRef} />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </main>
  );
}
