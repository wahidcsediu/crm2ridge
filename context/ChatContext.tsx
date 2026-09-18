import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeamChatMessage, User, Agent } from '../types';
import { db } from '../services/mockDb';
import { useAuth } from './AuthContext';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  chatMode: 'direct' | 'channels';
  setChatMode: (mode: 'direct' | 'channels') => void;
  activeChatUser: User | null;
  activeChannel: string | null;
  openChatWith: (userId: string) => void;
  openChannel: (channelId: string) => void;
  closeActiveConversation: () => void;
  messages: TeamChatMessage[];
  sendMessage: (
    text: string, 
    options?: { 
      images?: string[]; 
      viaWhatsApp?: boolean; 
      messageType?: 'text' | 'dar_reminder' | 'deal_alert' | 'urgent_ping' | 'broadcast' | 'milestone'; 
      channelId?: string;
      linkedLeadId?: string;
      linkedLeadName?: string;
      linkedLeadStage?: string;
    }
  ) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  editMessage: (id: string, newText: string) => Promise<void>;
  sendTeamBroadcast: (text: string, channelId?: string) => Promise<void>;
  openWhatsAppDirectWithColleague: (targetUser: User, customText?: string) => void;
  unreadCount: number;
  contacts: User[];
  notification: { from: string; text: string; userId?: string } | null;
  dismissNotification: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'direct' | 'channels'>('direct');
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [notification, setNotification] = useState<{ from: string; text: string; userId?: string } | null>(null);

  // Refresh messages & staff directory
  useEffect(() => {
    setActiveChatUser(null);
    setActiveChannel(null);
    setIsOpen(false);
    setMessages([]);
    setContacts([]);
    setNotification(null);

    if (!user) return;

    const fetchAllData = async () => {
      // 1. Fetch team messages
      const msgs = await db.getTeamMessages();
      setMessages(msgs);

      // 2. Fetch contacts (all staff members except current user)
      const allUsers = await db.getAllUsers();
      const otherStaff = allUsers.filter(u => u.id !== user.id);
      setContacts(otherStaff);
    };

    fetchAllData();

    const interval = setInterval(async () => {
      const msgs = await db.getTeamMessages();
      setMessages(msgs);
    }, 3000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Incoming Notification Logic for 1-on-1 direct messages
  useEffect(() => {
    if (messages.length > 0 && user) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.toId === user.id && !lastMsg.read) {
        if (!isOpen || (activeChatUser && activeChatUser.id !== lastMsg.fromId)) {
          const sender = contacts.find(c => c.id === lastMsg.fromId);
          if (sender) {
            setNotification({ 
              from: sender.name, 
              text: lastMsg.text,
              userId: sender.id
            });
            setTimeout(() => setNotification(null), 6000);
          }
        }
      }
    }
  }, [messages, user, isOpen, activeChatUser, contacts]);

  const unreadCount = messages.filter(m => m.toId === user?.id && !m.read).length;

  const openChatWith = async (userId: string) => {
    if (!userId) {
      setActiveChatUser(null);
      return;
    }
    setChatMode('direct');
    setActiveChannel(null);
    const contact = contacts.find(c => c.id === userId);
    if (contact) {
      setActiveChatUser(contact);
      setIsOpen(true);
      setNotification(null);

      // Mark incoming messages as read
      const unreadIds = messages
        .filter(m => m.fromId === userId && m.toId === user?.id && !m.read)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await db.markAsRead(unreadIds);
        setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, read: true } : m));
      }
    }
  };

  const openChannel = (channelId: string) => {
    setChatMode('channels');
    setActiveChatUser(null);
    setActiveChannel(channelId);
    setIsOpen(true);
    setNotification(null);
  };

  const closeActiveConversation = () => {
    setActiveChatUser(null);
    setActiveChannel(null);
  };

  const sendMessage = async (
    text: string, 
    options?: { 
      images?: string[]; 
      viaWhatsApp?: boolean; 
      messageType?: 'text' | 'dar_reminder' | 'deal_alert' | 'urgent_ping' | 'broadcast' | 'milestone'; 
      channelId?: string;
      linkedLeadId?: string;
      linkedLeadName?: string;
      linkedLeadStage?: string;
    }
  ) => {
    if (!user) return;
    const cleanText = text.trim();
    if (!cleanText && (!options?.images || options.images.length === 0)) return;

    const channel = options?.channelId || activeChannel;
    const targetRecipient = !channel ? activeChatUser : null;

    const newMsg = await db.sendTeamMessage({
      channelId: channel || undefined,
      fromId: user.id,
      fromName: user.name,
      fromRole: user.role,
      toId: targetRecipient?.id,
      toName: targetRecipient?.name,
      toPhone: targetRecipient?.phone || targetRecipient?.whatsappNumber,
      text: cleanText,
      images: options?.images,
      viaWhatsApp: options?.viaWhatsApp ?? true,
      whatsAppStatus: 'synced',
      whatsAppDeliveryPhone: targetRecipient?.phone || targetRecipient?.whatsappNumber || '+1 (555) 007-0007',
      messageType: options?.messageType || 'text',
      linkedLeadId: options?.linkedLeadId,
      linkedLeadName: options?.linkedLeadName,
      linkedLeadStage: options?.linkedLeadStage
    });

    setMessages(prev => [...prev, newMsg]);
  };

  const sendTeamBroadcast = async (text: string, channelId = 'general') => {
    if (!user) return;
    const cleanText = text.trim();
    if (!cleanText) return;

    const newMsg = await db.sendTeamMessage({
      channelId,
      fromId: user.id,
      fromName: user.name,
      fromRole: user.role,
      text: cleanText,
      viaWhatsApp: true,
      whatsAppStatus: 'synced',
      messageType: 'broadcast',
      pinned: true
    });

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

  const openWhatsAppDirectWithColleague = (targetUser: User, customText?: string) => {
    const rawPhone = (targetUser.whatsappNumber || targetUser.phone || '').replace(/[^0-9]/g, '');
    const defaultText = customText || `Hello ${targetUser.name}, this is ${user?.name || 'Admin'} from Ridge Park CRM internal team.`;
    const encoded = encodeURIComponent(defaultText);
    window.open(`https://wa.me/${rawPhone || '15550070007'}?text=${encoded}`, '_blank');
  };

  const dismissNotification = () => setNotification(null);

  return (
    <ChatContext.Provider value={{
      isOpen,
      setIsOpen,
      chatMode,
      setChatMode,
      activeChatUser,
      activeChannel,
      openChatWith,
      openChannel,
      closeActiveConversation,
      messages,
      sendMessage,
      deleteMessage,
      editMessage,
      sendTeamBroadcast,
      openWhatsAppDirectWithColleague,
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
