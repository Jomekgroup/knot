
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Match, User, Message } from '../types';
import { generateConversationStarters } from '../services/geminiService';
import { generateAIReply } from '../services/matchingService';
import { db } from '../services/databaseService';
import { SparklesIcon } from './icons/SparklesIcon';
import SendIcon from './icons/SendIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { useToast } from './feedback/useToast';

interface ChatScreenProps {
  match: Match;
  user: User;
  onBack: () => void;
  onStartCall: (match: Match) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ match, user, onBack, onStartCall }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [starters, setStarters] = useState<string[]>([]);
  const [isLoadingStarters, setIsLoadingStarters] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
        const history = await db.getMessages(match.id);
        if (history.length === 0) {
            const initialMsg: Message = { id: '1', senderId: match.id, text: `Hey ${user.name}! It's great to connect.`, timestamp: new Date() };
            setMessages([initialMsg]);
            db.sendMessage(match.id, initialMsg);
        } else {
            setMessages(history);
        }
    };
    loadHistory();
  }, [match.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGenerateStarters = useCallback(async () => {
    setIsLoadingStarters(true);
    try {
      const newStarters = await generateConversationStarters(user, match);
      setStarters(newStarters);
    } catch (error) {
      console.error("Failed to generate starters:", error);
      setStarters(["What's one value you hold that has shaped who you are today?"]);
    } finally {
      setIsLoadingStarters(false);
    }
  }, [user, match]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    const message: Message = {
      id: String(Date.now()),
      senderId: user.id,
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    await db.sendMessage(match.id, message);

    // Backend Simulation: Auto-reply
    setIsTyping(true);
    const historyStrings = [...messages, message].map(m => `${m.senderId === user.id ? user.name : match.name}: ${m.text}`);
    
    setTimeout(async () => {
        const replyText = await generateAIReply(match, historyStrings);
        const replyMsg: Message = {
            id: String(Date.now() + 1),
            senderId: match.id,
            text: replyText,
            timestamp: new Date()
        };
        setIsTyping(false);
        setMessages(prev => [...prev, replyMsg]);
        await db.sendMessage(match.id, replyMsg);
    }, 2500);
  };

  const handleStarterClick = (starter: string) => {
    setNewMessage(starter);
    setStarters([]);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="text-gray-600 mr-3 p-1 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img src={match.profileImageUrls[0]} alt={match.name} className="w-10 h-10 rounded-full object-cover" />
        <div className="ml-3 flex-1">
          <h2 className="font-bold text-lg text-brand-dark">{match.name}</h2>
          <p className="text-xs text-gray-500">{isTyping ? 'Typing...' : 'Online'}</p>
        </div>
        <button onClick={() => onStartCall(match)} className="p-2 text-brand-primary hover:bg-brand-light rounded-full">
            <VideoCameraIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-brand-light/30 pb-44">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
              {msg.senderId !== user.id && <img src={match.profileImageUrls[0]} alt={match.name} className="w-6 h-6 rounded-full self-start" />}
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  msg.senderId === user.id
                    ? 'bg-brand-primary text-white rounded-br-none'
                    : 'bg-white text-brand-text border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex items-center gap-2">
                <img src={match.profileImageUrls[0]} alt={match.name} className="w-6 h-6 rounded-full" />
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
             </div>
          )}
        </div>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-3 fixed bottom-20 left-0 right-0 max-w-md mx-auto">
        {starters.length > 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {starters.map((starter, index) => (
              <button 
                key={index} 
                onClick={() => handleStarterClick(starter)} 
                className="flex-shrink-0 text-sm bg-brand-light border border-brand-primary/20 p-2 px-3 rounded-full text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
              >
                {starter}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
            <button onClick={handleGenerateStarters} disabled={isLoadingStarters} className="p-2 text-brand-secondary hover:bg-gray-100 rounded-full disabled:opacity-50">
                {isLoadingStarters ? <div className="w-5 h-5 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-6 h-6" />}
            </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-secondary bg-gray-50"
          />
          <button onClick={handleSendMessage} className="bg-brand-primary text-white rounded-full p-2.5 hover:bg-brand-secondary transition-transform active:scale-95">
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
