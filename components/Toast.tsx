// components/Toast.tsx
import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ToastProps {
  messages: string[];
}

export const Toast: React.FC<ToastProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  const getIcon = (message: string) => {
    if (message.startsWith('✅'))
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (message.startsWith('❌'))
      return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertCircle className="w-5 h-5 text-amber-600" />;
  };

  return (
    <div className="fixed bottom-6 right-6 space-y-2 z-50 max-w-sm">
      {messages.map((msg, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 shadow-lg px-4 py-3 rounded-lg flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
        >
          {getIcon(msg)}
          <span className="text-sm text-gray-900 flex-1">{msg}</span>
        </div>
      ))}
    </div>
  );
};
