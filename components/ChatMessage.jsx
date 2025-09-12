'use client';

import { Bot, User, AlertCircle, Database } from 'lucide-react';

const ChatMessage = ({ message, isUser, timestamp, isError, hasRealTimeData }) => {
  // Format bot responses to be more professional
  const formatBotMessage = (text) => {
    if (isUser) return text;
    
    // Remove asterisks and format the content professionally
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-red-700 dark:text-red-300">$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em class="font-medium text-gray-700 dark:text-gray-300">$1</em>') // Italic text
      .replace(/^[\*\-\+]\s+/gm, '• ') // Convert asterisk/dash/plus bullets to proper bullets
      .replace(/^\d+\.\s+/gm, (match) => `<span class="font-medium text-red-600 dark:text-red-400">${match}</span>`) // Number lists
      .replace(/\n\n/g, '<br><br>') // Double line breaks
      .replace(/\n/g, '<br>'); // Single line breaks
    
    // Add proper spacing and structure for blood type information
    if (formatted.includes('Type A') || formatted.includes('Type B') || formatted.includes('Type AB') || formatted.includes('Type O')) {
      formatted = formatted
        .replace(/(Type [ABO]+[\+\-]*:)/g, '<div class="mt-3 mb-2"><span class="inline-block bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded-md text-sm font-semibold">$1</span></div>')
        .replace(/Rh factor/g, '<span class="font-semibold text-blue-600 dark:text-blue-400">Rh factor</span>');
    }
    
    return formatted;
  };

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isError 
            ? 'bg-red-100 dark:bg-red-900' 
            : 'bg-gradient-to-br from-red-500 to-red-600 shadow-md'
        }`}>
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
      )}
      
      <div className={`max-w-[85%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-xl px-4 py-3 relative shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white ml-auto shadow-md'
              : isError
              ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm'
          }`}
        >
          {hasRealTimeData && !isUser && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mb-3 pb-2 border-b border-green-200 dark:border-green-800">
              <Database className="w-3 h-3" />
              <span className="font-medium">Real-time data included</span>
            </div>
          )}
          
          {!isUser ? (
            <div 
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatBotMessage(message) }}
            />
          ) : (
            <div className="text-sm leading-relaxed">
              {message}
            </div>
          )}
          
          {/* Message tail */}
          <div className={`absolute top-4 ${
            isUser 
              ? 'right-0 transform translate-x-full' 
              : 'left-0 transform -translate-x-full'
          }`}>
            <div className={`w-0 h-0 ${
              isUser
                ? 'border-l-8 border-red-600 border-t-4 border-b-4 border-t-transparent border-b-transparent'
                : isError
                ? 'border-r-8 border-white dark:border-gray-800 border-t-4 border-b-4 border-t-transparent border-b-transparent'
                : 'border-r-8 border-white dark:border-gray-800 border-t-4 border-b-4 border-t-transparent border-b-transparent'
            }`}></div>
          </div>
        </div>
        
        {timestamp && (
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1 ${
            isUser ? 'text-right justify-end' : 'text-left justify-start'
          }`}>
            <span>
              {new Date(timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {hasRealTimeData && !isUser && (
              <span className="text-green-500 font-medium">• Live data</span>
            )}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
