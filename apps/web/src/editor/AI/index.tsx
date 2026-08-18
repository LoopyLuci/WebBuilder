'use client';

import React, { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can help you build your page. Try saying "Add a hero section" or "Change the primary color to purple".' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "I'll help you with that! ";

      if (userMessage.toLowerCase().includes('hero')) {
        response += 'I can add a hero section for you. Click "Hero Section" in the component library, or I can generate one automatically.';
      } else if (userMessage.toLowerCase().includes('color')) {
        response += 'I can update the color scheme. Which specific color would you like to change — primary, secondary, or background?';
      } else if (userMessage.toLowerCase().includes('add')) {
        response += 'I can add components to your page. Which component would you like to add?';
      } else {
        response += 'I can help you build, style, and deploy your web page. What would you like to do?';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">🤖 AI Assistant</h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg text-sm ${
              msg.role === 'user'
                ? 'bg-blue-100 text-blue-900 ml-8'
                : 'bg-gray-100 text-gray-800 mr-8'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isTyping && (
          <div className="p-3 rounded-lg bg-gray-100 text-gray-500 text-sm mr-8">
            Typing...
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI to build..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIPanel;
