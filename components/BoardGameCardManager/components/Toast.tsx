// components/Toast.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ToastProps {
  messages: string[];
}

export const Toast: React.FC<ToastProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50">
      {messages.map((msg, i) => (
        <div
          key={i}
          className="bg-indigo-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse"
        >
          <AlertCircle className="w-6 h-6" />
          <span className="font-semibold">{msg}</span>
        </div>
      ))}
    </div>
  );
};
