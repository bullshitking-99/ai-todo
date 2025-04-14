"use client";

import type React from "react";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTaskStore } from "@/lib/store";
import { getTaskAIResponse } from "@/lib/request/apis";
import { dispatchAction, StoreFunctionKeys } from "@/lib/dispatcher";
import { chatWithAgent } from "@/lib/request/chatWithAgent";
import { resumeAgent } from "@/lib/request/resumeAgent";
import { typeText } from "@/lib/utils";

export type AgentStep = {
  type: "tool_call" | "tool_result";
  toolName: string;
  displayText: string;
};

export interface Message {
  id: string;
  sender: "user" | "ai";
  /** 最终显示的正文内容（对 AI 来说是回答） */
  content: string;
  /** 是否正在流式更新 */
  isStreaming?: boolean;
  /** 仅 AI 消息：过程步骤（工具调用轨迹） */
  steps?: AgentStep[];
}

export default forwardRef(function ChatPanel(props, ref) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      content: "你好呀，今天有什么可以帮你的~",
      sender: "ai",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { tasks } = useTaskStore();

  // ✅ 抽离 chunk 统一处理逻辑
  const handleAgentStreamChunk = async (chunk: any, responseId: string) => {
    if (chunk.type === "ai" && chunk.content) {
      const fullContent = chunk.content;
      // 模拟打字机效果
      typeText({
        fullText: fullContent,
        onUpdate: (partial) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === responseId
                ? { ...msg, content: partial, isStreaming: true }
                : msg
            )
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === responseId ? { ...msg, isStreaming: false } : msg
            )
          );
        },
      });
    }

    if (chunk.type === "tool_call" || chunk.type === "tool_result") {
      const newStep = {
        type: chunk.type,
        toolName: chunk.toolName,
        displayText: "", // 逐字打印用
      };

      // 先插入空 step（带 displayText）
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === responseId
            ? {
                ...msg,
                steps: [...(msg.steps || []), newStep],
              }
            : msg
        )
      );

      const fullText =
        chunk.type === "tool_call"
          ? `🛠️ 正在调用工具：${chunk.toolName}`
          : `✅ 调用完成`;

      // 再通过 typeText 逐字更新 displayText
      typeText({
        fullText,
        onUpdate: (partial) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === responseId
                ? {
                    ...msg,
                    steps: (msg.steps || []).map((s, i, arr) =>
                      i === arr.length - 1 ? { ...s, displayText: partial } : s
                    ),
                  }
                : msg
            )
          );
        },
      });
    }

    if (chunk.type === "tool_result") {
      try {
        dispatchAction(chunk.result);
      } catch (err) {
        console.warn("⚠️ dispatchAction failed:", err);
      }

      // ✅ 自动 resume，递归调用本函数，添加流式内容
      await resumeAgent({
        onStream: (nextChunk) => {
          handleAgentStreamChunk(nextChunk, responseId);
        },
      });
    }
  };

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
        steps: [],
      },
    ]);

    try {
      await chatWithAgent({
        input: userMessage,
        tasks,
        onStream: (chunk) => {
          handleAgentStreamChunk(chunk, responseId);
        },
      });

      // Finalize
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

  const handleManualTaskAction = async ({
    type,
    params,
  }: {
    type: StoreFunctionKeys;
    params: any;
  }) => {
    const responseId = Date.now().toString();

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
      await getTaskAIResponse({ type, params }, tasks, messages, (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === responseId
              ? {
                  ...msg,
                  content: (msg.content || "") + chunk,
                  isStreaming: true,
                }
              : msg
          )
        );
      });

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
      console.error("Task AI Response Error:", error);
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

  useImperativeHandle(ref, () => ({
    handleManualTaskAction,
  }));

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
                <div
                  className={`${
                    message.sender === "user"
                      ? "max-w-[80%] rounded-lg p-4 shadow-sm message-gradient text-primary-foreground"
                      : "text-foreground pr-4"
                  }`}
                >
                  {/* 显示处理过程 steps */}
                  {message.steps?.map((step, i) => (
                    <p
                      key={i + step.toolName}
                      className="opacity-60 leading-relaxed mb-1"
                    >
                      {step.displayText}
                    </p>
                  ))}

                  {/* 显示最终内容 */}
                  <p className="leading-relaxed">
                    {message.content}
                    {message.isStreaming && (
                      <span className="ml-1 inline-block w-1.5 h-4 bg-foreground/70 animate-pulse" />
                    )}
                  </p>
                </div>
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
});
