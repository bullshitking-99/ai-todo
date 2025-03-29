"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTaskStore } from "@/lib/store";
import { getAIResponse } from "@/lib/llm/api";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  isStreaming?: boolean;
  fullContent?: string;
  streamedChars?: number;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      content: "Hello! How can I help you with your tasks today?",
      sender: "ai",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { tasks, addTask, deleteTask, setTasks } = useTaskStore();

  const handleAIResponse = async (userMessage: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    const responseId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: responseId,
        content: "",
        sender: "ai",
        isStreaming: true,
        fullContent: "",
        streamedChars: 0,
      },
    ]);

    try {
      const availableActions = {
        addTask: addTask.toString(),
        deleteTask: deleteTask.toString(),
        setTasks: setTasks.toString(),
      };

      await getAIResponse(
        userMessage,
        tasks,
        availableActions,
        messages,
        // Stream message
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === responseId
                ? {
                    ...msg,
                    fullContent: (msg.fullContent || "") + chunk,
                    content: (msg.fullContent || "") + chunk,
                    streamedChars: (msg.streamedChars || 0) + chunk.length,
                    isStreaming: true,
                  }
                : msg
            )
          );
        },
        // Handle action
        (action) => {
          const { name, params } = action;
          switch (name) {
            case "addTask":
              addTask(params);
              break;
            case "deleteTask":
              deleteTask(params.id);
              break;
            case "setTasks":
              setTasks(params.tasks);
              break;
          }
        }
      );

      // Finalize message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === responseId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === responseId
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
      console.error("AI Response Error:", error);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    handleAIResponse(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">Assistant</h1>
        <p className="text-muted-foreground">Chat with your AI assistant</p>
      </div>

      {/* 修复滚动问题：外层容器必须 overflow-hidden */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 py-4 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.sender === "user" ? "flex justify-end" : "block"
                } animate-message-fade-in`}
              >
                {message.sender === "user" ? (
                  <div className="max-w-[80%] rounded-lg p-4 shadow-sm message-gradient text-primary-foreground">
                    <p>{message.content}</p>
                  </div>
                ) : (
                  <div className="text-foreground pr-4">
                    <p className="leading-relaxed">
                      {message.content}
                      {message.isStreaming && (
                        <span className="ml-1 inline-block w-1.5 h-4 bg-foreground/70 animate-pulse" />
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === ""}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
