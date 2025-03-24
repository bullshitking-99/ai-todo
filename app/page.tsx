import TodoPanel from "@/components/todo-panel"
import ChatPanel from "@/components/chat-panel"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="flex h-screen">
      <TodoPanel />
      <ChatPanel />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
    </main>
  )
}

