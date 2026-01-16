"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { toast: (props: ToastProps) => console.log("Toast:", props) };
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

  const toast = (props: ToastProps) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...props, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-md shadow-lg max-w-sm animate-in slide-in-from-bottom-5 ${
              t.variant === "destructive"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-900 border"
            }`}
            onClick={() => dismissToast(t.id)}
          >
            {t.title && <p className="font-semibold">{t.title}</p>}
            {t.description && (
              <p className="text-sm opacity-90">{t.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
