
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { SendIcon } from '../../components/Icons';
import Button from '../../components/shared/Button';
import Spinner from '../../components/shared/Spinner';
import { getFinancialInsight, getChatSuggestions } from '../../services/geminiService';
import { useData } from '../../hooks/useData';
import { calculateCashFlow } from '../../utils/helpers';
import type { ChatMessage } from '../../types';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: "Hello! I'm FinancioAI, your AI financial assistant. How can I help you today?", sender: 'ai', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialPromptProcessed = useRef(false);

  // FIX: Changed 'clients' to 'customers' to match the useData hook.
  const { transactions, customers, budgets, isLoading: isDataLoading } = useData();
  const cashFlow = calculateCashFlow(transactions);

  const location = useLocation();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const fetchSuggestions = useCallback(async (currentMessages: ChatMessage[]) => {
    if (isDataLoading) return;
    setIsLoadingSuggestions(true);
    // FIX: Passed 'customers' instead of 'clients'.
    const newSuggestions = await getChatSuggestions(currentMessages, transactions, customers, budgets, cashFlow);
    setSuggestions(newSuggestions);
    setIsLoadingSuggestions(false);
  }, [isDataLoading, transactions, customers, budgets, cashFlow]);
  
  const handleSend = useCallback(async (prompt?: string) => {
    const userMessageText = prompt || input;
    if (!userMessageText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setSuggestions([]);

    try {
        // FIX: Passed 'customers' instead of 'clients'.
        const aiResponseText = await getFinancialInsight(userMessageText, transactions, customers, budgets, cashFlow);
        const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            sender: 'ai',
            timestamp: Date.now(),
        };
        const finalMessages = [...newMessages, aiMessage];
        setMessages(finalMessages);
        fetchSuggestions(finalMessages);
    } catch(e) {
        const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I encountered an error. Please try again.",
            sender: 'ai',
            timestamp: Date.now(),
        };
        const finalMessages = [...newMessages, errorMessage];
        setMessages(finalMessages);
        fetchSuggestions(finalMessages);
    } finally {
        setIsLoading(false);
    }
  }, [input, messages, transactions, customers, budgets, cashFlow, fetchSuggestions]);

  useEffect(() => {
    // Only fetch initial suggestions if not handling a navigated prompt and data is loaded.
    if (!isDataLoading && !location.state?.prompt && messages.length === 1) {
      fetchSuggestions(messages);
    }
  }, [isDataLoading, location.state, messages, fetchSuggestions]);
  
  useEffect(() => {
    const initialPrompt = location.state?.prompt;
    if (initialPrompt && !initialPromptProcessed.current) {
        initialPromptProcessed.current = true;
        handleSend(initialPrompt);
        navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate, handleSend]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white dark:bg-primary-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="space-y-6">
            <AnimatePresence>
          {messages.map((message) => (
            <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold flex-shrink-0">F</div>
              )}
              <div className={`px-4 py-3 rounded-2xl max-w-xs sm:max-w-md ${message.sender === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
              {message.sender === 'user' && (
                <img src="https://i.pravatar.cc/150?u=admin" alt="User" className="w-8 h-8 rounded-full flex-shrink-0" />
              )}
            </motion.div>
          ))}
          </AnimatePresence>
          {isLoading && (
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 justify-start"
            >
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold flex-shrink-0">F</div>
                <div className="px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <Spinner className="w-4 h-4 text-primary-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                    </div>
                </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
         <div className="flex flex-wrap gap-2 mb-4 h-8 items-center">
              {!isLoading && (isLoadingSuggestions || isDataLoading) && <Spinner className="w-4 h-4 text-primary-500" />}
              {!isLoading && !isLoadingSuggestions && suggestions.map((chip, index) => (
                <Button key={index} variant="secondary" size="sm" onClick={() => handleSend(chip)} disabled={isLoading}>
                    {chip}
                </Button>
              ))}
          </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a financial question..."
            disabled={isLoading || isDataLoading}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition"
          />
          <Button type="submit" variant="primary" disabled={isLoading || !input.trim() || isDataLoading}>
            {isLoading ? <Spinner /> : <SendIcon className="w-5 h-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;