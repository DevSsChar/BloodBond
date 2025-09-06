'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Enhanced quick action buttons with more interactive options
  const quickActions = [
    { text: '🩸 How to donate?', action: 'I want to donate blood but I\'m not sure how to start. Can you guide me through the process?' },
    { text: '🚨 Emergency help', action: 'I need help with an emergency blood request. This is urgent!' },
    { text: '📝 Register as donor', action: 'I\'d like to register as a blood donor. What do I need to know?' },
    { text: '📍 Find blood banks', action: 'Can you help me find nearby blood banks and donation centers?' },
    { text: '🧬 Blood types info', action: 'I want to learn about blood types and compatibility' },
    { text: '😰 First time nervous', action: 'I\'ve never donated blood before and I\'m a bit nervous. Can you help?' }
  ];

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      {/* Quick Actions */}
      <div className="mb-3 flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(action.action)}
            disabled={isLoading || disabled}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {action.text}
          </button>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about BloodBond..."
            disabled={isLoading || disabled}
            rows="1"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              minHeight: '40px',
              maxHeight: '120px',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[48px]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
      
      {/* Typing indicator */}
      {isLoading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>BloodBond assistant is typing...</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
