// lib/llm/chatModel.ts
import { ChatOpenAI } from "@langchain/openai";
import { HttpsProxyAgent } from "https-proxy-agent";

const isDev = process.env.NODE_ENV === "development";
const proxy = isDev ? process.env.OPENAI_PROXY : undefined;
const httpAgent = proxy ? new HttpsProxyAgent(proxy) : undefined;

const OpenAI = new ChatOpenAI({
  temperature: 0.7,
  timeout: 10000,
  modelName: "gpt-4o-mini",
  streaming: true,
  configuration: {
    apiKey: process.env.OPENAI_API_KEY!,
    httpAgent,
  },
});

const QianWen = new ChatOpenAI({
  temperature: 0.7,
  timeout: 10000,
  modelName: "qwen-max",
  streaming: true,
  configuration: {
    apiKey: process.env.TONGYI_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    httpAgent,
  },
});

export const chatModel = QianWen;
