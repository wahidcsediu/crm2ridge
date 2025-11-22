
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Message, User, Agent } from '../types';
import { db } from '../services/mockDb';
import { useAuth } from './AuthContext';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeChatUser: User | null;
  openChatWith: (userId: string) => void;
  messages: Message[];
  sendMessage: (text: string, images?: string[]) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  editMessage: (id: string, newText: string) => Promise<void>;
  unreadCount: number;
  contacts: Agent[] | User[];
  notification: {from: string, text: string} | null; // Exposed for Layout Bell
  dismissNotification: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Agent[] | User[]>([]);
  const [notification, setNotification] = useState<{from: string, text: string} | null>(null);
  
  // State Management & Polling
  useEffect(() => {
    // CRITICAL: Reset all state when user changes (e.g. Admin logs out, Agent logs in)
    // This prevents the "James Bond" showing "James Bond" header bug.
    setActiveChatUser(null);
    setIsOpen(false);
    setMessages([]);
    setContacts([]);
    setNotification(null);

    if (!user) return;

    const fetchMessages = async () => {
      const msgs = await db.getMessages(user.id);
      setMessages(msgs);
    };

    const fetchContacts = async () => {
        if (user.role === 'admin') {
            const agents = await db.getAgents();
            setContacts(agents);
        } else {
            const admin = await db.getUser('admin-1');
            if (admin) setContacts([admin]);
        }
    }

    fetchContacts();
    fetchMessages();
    
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [user?.id]); // Dependency on user.id ensures reset happens on login switching

  // Notification Logic
  useEffect(() => {
      if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          // If message is for me, unread, and chat not open (or open with someone else)
          if (lastMsg.toId === user?.id && !lastMsg.read) {
              // Only notify if chat is closed OR if chatting with someone else
              if (!isOpen || (activeChatUser && activeChatUser.id !== lastMsg.fromId)) {
                  const sender = contacts.find(c => c.id === lastMsg.fromId);
                  if (sender) {
                      setNotification({ from: sender.name, text: lastMsg.text });
                      // Auto hide toast after 5s, but Bell badge stays
                      setTimeout(() => setNotification(null), 5000);
                  }
              }
          }
      }
  }, [messages, user, isOpen, activeChatUser, contacts]);

  const unreadCount = messages.filter(m => m.toId === user?.id && !m.read).length;

  const openChatWith = async (userId: string) => {
      const contact = contacts.find(c => c.id === userId);
      if (contact) {
          setActiveChatUser(contact);
          setIsOpen(true);
          setNotification(null);
          
          const unreadIds = messages
            .filter(m => m.fromId === userId && m.toId === user?.id && !m.read)
            .map(m => m.id);
            
          if (unreadIds.length > 0) {
              await db.markAsRead(unreadIds);
          }
      }
  };

  const sendMessage = async (text: string, images?: string[]) => {
      if (!user || !activeChatUser) return;
      const newMsg = await db.sendMessage(user.id, activeChatUser.id, text, images);
      setMessages(prev => [...prev, newMsg]);
  };

  const deleteMessage = async (id: string) => {
    await db.deleteMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const editMessage = async (id: string, newText: string) => {
    await db.updateMessage(id, newText);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: newText, edited: true } : m));
  };

  const dismissNotification = () => setNotification(null);

  return (
    <ChatContext.Provider value={{ 
        isOpen, 
        setIsOpen, 
        activeChatUser, 
        openChatWith, 
        messages, 
        sendMessage,
        deleteMessage,
        editMessage,
        unreadCount, 
        contacts,
        notification,
        dismissNotification
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
