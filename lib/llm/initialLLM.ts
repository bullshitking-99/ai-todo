// lib/llm/chatModel.ts
import { ChatOpenAI } from "@langchain/openai";
import { HttpsProxyAgent } from "https-proxy-agent";

const isDev = process.env.NODE_ENV === "development";
const proxy = isDev ? process.env.OPENAI_PROXY : undefined;
const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

export const chatModel = new ChatOpenAI({
  temperature: 0.7,
  timeout: 10000,
  modelName: "gpt-4-turbo",
  configuration: {
    apiKey: process.env.OPENAI_API_KEY!,
    httpAgent: agent,
  },
});
