import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuthStore } from '../lib/firebase';
import { sendChatMessage, subscribeToChatMessages } from '../lib/api';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      const unsubscribe = subscribeToChatMessages(user.uid, setMessages);
      return () => unsubscribe();
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    const text = message;
    setMessage('');
    try {
      await sendChatMessage(user.uid, user.displayName || user.email?.split('@')[0] || 'User', text);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null; // Chat only for logged-in users in this demo

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50 focus:outline-none"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200" style={{ height: '500px', maxHeight: '80vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Support</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <div className="text-center text-xs text-gray-400 my-2">Chat started</div>
            {messages.map((msg, idx) => {
              const isMe = msg.userId === user.uid && !msg.isAdmin;
              return (
                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${isMe ? 'bg-gray-900 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t bg-white rounded-b-lg">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-gray-900"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!message.trim()}
                className="h-10 w-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
