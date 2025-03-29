import { TaskStore, useTaskStore } from "@/lib/store";

/**
 * 通用 dispatcher，可被 todo/chat 等组件调用
 * 所有操作通过 type + params 统一执行，支持回调
 */

// 提取除 tasks 属性以外的所有函数名作为操作类型
export type StoreFunctionKeys = {
  [K in keyof TaskStore]: TaskStore[K] extends (...args: any) => any
    ? K
    : never;
}[keyof TaskStore];

export type DispatcherAction = {
  type: StoreFunctionKeys;
  params: Parameters<TaskStore[DispatcherAction["type"]]>[0];
  callback?: () => void;
};

export async function dispatchAction({
  type,
  params,
  callback,
}: DispatcherAction) {
  const { tasks: _, ...storeFns } = useTaskStore.getState();
  const fn = storeFns[type];

  if (typeof fn === "function") {
    // @ts-expect-error: 已确保 type 是函数名
    fn(params);
  } else {
    console.warn("⚠️ Unknown action:", type);
    return;
  }

  callback?.();
}
