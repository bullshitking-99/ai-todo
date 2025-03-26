"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, useTaskStore } from "@/lib/store";
import { getAIResponse } from "@/lib/llm/api";

interface Message {
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
      id: "1",
      content: "Hello! How can I help you with your tasks today?",
      sender: "ai",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { tasks, addTask, deleteTask, completeTask, updateTaskStatus } =
    useTaskStore();

  // Handle AI response and task operations
  const handleAIResponse = async (userMessage: string) => {
    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    // Add initial AI message with loading state
    const responseId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: responseId,
        content: "",
        sender: "ai",
        isStreaming: true,
      },
    ]);

    try {
      // Get AI response
      const availableActions = {
        addTask: addTask.toString(),
        deleteTask: deleteTask.toString(),
        completeTask: completeTask.toString(),
        updateTaskStatus: updateTaskStatus.toString(),
      };
      const response = await getAIResponse(
        userMessage,
        tasks,
        availableActions
      );

      // Update AI message with response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === responseId
            ? {
                ...msg,
                content: response.message,
                isStreaming: false,
              }
            : msg
        )
      );

      // Execute action if provided
      if (response.action) {
        const { name, params } = response.action;
        switch (name) {
          case "addTask":
            addTask(params);
            break;
          case "deleteTask":
            deleteTask(params.id);
            break;
          case "completeTask":
            completeTask(params.id);
            break;
          case "updateTaskStatus":
            updateTaskStatus(params.id, params.status);
            break;
        }
      }
    } catch (error) {
      // Update AI message with error
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

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="w-1/2 flex flex-col h-full bg-background">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">Assistant</h1>
        <p className="text-muted-foreground">Chat with your AI assistant</p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${
                message.sender === "user" ? "flex justify-end" : "block"
              } animate-message-fade-in`}
            >
              {message.sender === "user" ? (
                // User message (bubble on right)
                <div className="max-w-[80%] rounded-lg p-4 shadow-sm message-gradient text-primary-foreground">
                  <p>{message.content}</p>
                </div>
              ) : (
                // AI message (full width)
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
