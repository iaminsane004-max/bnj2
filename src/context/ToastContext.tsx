'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full p-4 sm:p-0">
        {toasts.map((toast) => {
          let bgClass = '';
          let icon = null;

          switch (toast.type) {
            case 'success':
              bgClass = 'bg-[#3B1F0E] text-[#FDF6EC] border-[#D97706]';
              icon = <CheckCircle className="w-5 h-5 text-[#D97706] shrink-0" />;
              break;
            case 'info':
              bgClass = 'bg-[#FDF6EC] text-[#3B1F0E] border-[#3B1F0E]';
              icon = <Info className="w-5 h-5 text-[#D97706] shrink-0" />;
              break;
            case 'warning':
              bgClass = 'bg-amber-50 text-amber-900 border-amber-300';
              icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
              break;
            case 'error':
              bgClass = 'bg-rose-50 text-rose-900 border-rose-300';
              icon = <X className="w-5 h-5 text-rose-600 shrink-0" />;
              break;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between p-4 rounded-2xl border shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <p className="text-sm font-semibold">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-opacity-80 hover:text-opacity-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
