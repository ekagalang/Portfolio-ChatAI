"use client";

import { useState, useCallback } from "react";
import { ToastData } from "@/components/Toast";

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((
    message: string,
    type: ToastData["type"] = "success",
    duration = 3000
  ) => {
    const id = crypto.randomUUID();

    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove setelah duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}