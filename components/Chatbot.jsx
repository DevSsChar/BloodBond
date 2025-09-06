'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, RotateCcw, ExternalLink, Minimize2, Maximize2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: "👋 Hello! I'm your BloodBond assistant. I can help you with:\n\n🩸 **Blood donation** - Process, requirements, and scheduling\n🏥 **Registration** - For donors, blood banks, and hospitals\n🚨 **Emergency requests** - Urgent blood needs\n📍 **Find locations** - Nearby blood banks and donation centers\n🩺 **Blood types** - Compatibility and information\n🎯 **Navigation** - Getting around our platform\n📊 **Real-time data** - Current blood availability and statistics\n\nWhat would you like to know? You can also use the quick action buttons below!",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Handle unread messages when minimized
  useEffect(() => {
    if (isMinimized && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isUser) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isMinimized]);

  // Clear unread count when expanded
  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0);
    }
  }, [isMinimized]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: conversationHistory.slice(-10) // Keep last 10 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        timestamp: data.timestamp,
        intent: data.intent,
        entities: data.entities,
        hasRealTimeData: !!data.contextData
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment, or visit our help section for immediate assistance.\n\n🔗 **Quick links:**\n• 🚨 Emergency: `/emergency`\n• 📝 Register: `/register`\n• 🏥 Find Blood Banks: `/bloodbanks`\n• 📞 Support: Contact our team\n\nI'll be back online shortly!",
        isUser: false,
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-6 z-50 mb-2">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-300 group floating-btn-pulse"
          aria-label="Open BloodBond Assistant"
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            💬 Need help? I'm here to assist!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-50 mb-2">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 chatbot-slide-in chatbot-container ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px] max-h-[calc(100vh-120px)]'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-red-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="font-semibold">BloodBond Assistant</h3>
            {unreadCount > 0 && isMinimized && (
              <span className="bg-yellow-400 text-red-900 text-xs px-2 py-1 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMinimize}
              className="p-1.5 hover:bg-red-700 rounded transition-colors"
              aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={resetChat}
              className="p-1.5 hover:bg-red-700 rounded transition-colors"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-red-700 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 chatbot-messages bg-gray-50 dark:bg-gray-800" style={{
              height: 'calc(100% - 140px)',
              maxHeight: 'calc(100vh - 260px)'
            }}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center chatbot-fade-in">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Start a conversation!</p>
                    <p className="text-xs mt-2 opacity-75">I'm here to help with all BloodBond services</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div key={message.id} className="message-enter">
                      <ChatMessage
                        message={message.text}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                        isError={message.isError}
                        hasRealTimeData={message.hasRealTimeData}
                      />
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0">
              <ChatInput
                onSendMessage={sendMessage}
                isLoading={isLoading}
                disabled={false}
              />
            </div>
          </>
        )}

        {isMinimized && (
          <div className="flex items-center justify-between p-4 h-full">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Chat minimized
              </span>
              {unreadCount > 0 && (
                <span className="text-xs text-red-600 font-medium">
                  ({unreadCount} new)
                </span>
              )}
            </div>
            <button
              onClick={toggleMinimize}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Expand
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
