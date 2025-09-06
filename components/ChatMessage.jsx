'use client';

import { Bot, User, AlertCircle, Database } from 'lucide-react';

const ChatMessage = ({ message, isUser, timestamp, isError, hasRealTimeData }) => {
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isError 
            ? 'bg-red-100 dark:bg-red-900' 
            : 'bg-red-100 dark:bg-red-900'
        }`}>
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          ) : (
            <Bot className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-lg px-4 py-3 relative ${
            isUser
              ? 'bg-red-600 text-white ml-auto'
              : isError
              ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
        >
          {hasRealTimeData && !isUser && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mb-2">
              <Database className="w-3 h-3" />
              <span>Real-time data included</span>
            </div>
          )}
          
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </div>
          
          {/* Message tail */}
          <div className={`absolute top-3 ${
            isUser 
              ? 'right-0 transform translate-x-full' 
              : 'left-0 transform -translate-x-full'
          }`}>
            <div className={`w-0 h-0 ${
              isUser
                ? 'border-l-8 border-red-600 border-t-4 border-b-4 border-t-transparent border-b-transparent'
                : isError
                ? 'border-r-8 border-red-50 dark:border-red-900/20 border-t-4 border-b-4 border-t-transparent border-b-transparent'
                : 'border-r-8 border-gray-100 dark:border-gray-800 border-t-4 border-b-4 border-t-transparent border-b-transparent'
            }`}></div>
          </div>
        </div>
        
        {timestamp && (
          <div className={`text-xs text-gray-500 mt-1 flex items-center gap-1 ${
            isUser ? 'text-right justify-end' : 'text-left justify-start'
          }`}>
            <span>
              {new Date(timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {hasRealTimeData && !isUser && (
              <span className="text-green-500">• Live data</span>
            )}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
