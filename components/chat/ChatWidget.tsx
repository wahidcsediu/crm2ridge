import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { 
  X, Send, MessageCircle, ChevronLeft, Maximize2, Minimize2, 
  Image as ImageIcon, Trash2, Pencil, ExternalLink, Search, 
  CheckCheck, Sparkles, Phone, Radio, Megaphone,
  BellRing, Calendar, Flame, AlertCircle, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, TeamChatMessage } from '../../types';

export const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const { 
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
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [syncWithWhatsApp, setSyncWithWhatsApp] = useState(true);
  const [selectedTemplateType, setSelectedTemplateType] = useState<'text' | 'dar_reminder' | 'deal_alert' | 'urgent_ping' | 'broadcast' | 'milestone'>('text');
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [broadcastText, setBroadcastText] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when messages update or conversation opens
  useEffect(() => {
    if (!editingId && (activeChatUser || activeChannel) && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isOpen, activeChatUser, activeChannel, isExpanded]);

  // Filter messages for current view
  const currentMessages = messages.filter(m => {
    if (activeChannel) {
      return m.channelId === activeChannel;
    }
    if (activeChatUser && user) {
      return !m.channelId && (
        (m.fromId === user.id && m.toId === activeChatUser.id) ||
        (m.fromId === activeChatUser.id && m.toId === user.id)
      );
    }
    return false;
  });

  // Filter contacts by search
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery)) ||
    (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && attachedImages.length === 0) return;

    if (editingId) {
      await editMessage(editingId, inputText);
      setEditingId(null);
    } else {
      await sendMessage(inputText, {
        images: attachedImages,
        viaWhatsApp: syncWithWhatsApp,
        messageType: selectedTemplateType,
        channelId: activeChannel || undefined
      });
    }

    setInputText('');
    setAttachedImages([]);
    setSelectedTemplateType('text');
    setShowTemplates(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setAttachedImages(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyTemplate = (type: 'dar_reminder' | 'deal_alert' | 'urgent_ping' | 'milestone', templateText: string) => {
    setInputText(templateText);
    setSelectedTemplateType(type);
    setShowTemplates(false);
  };

  const handleSendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    await sendTeamBroadcast(broadcastText, 'general');
    setBroadcastText('');
    setShowBroadcastModal(false);
  };

  const channelsList = [
    { 
      id: 'general', 
      name: 'General Discussion', 
      desc: 'Company announcements & general staff coordination', 
      badge: 'Company-Wide', 
      icon: Megaphone 
    },
    { 
      id: 'deals', 
      name: 'Deals & Celebrations', 
      desc: 'Real-time deal closings, commissions & revenue wins', 
      badge: 'Revenue Alerts', 
      icon: Flame 
    },
    { 
      id: 'dar_reminders', 
      name: 'DAR & Activity Pings', 
      desc: 'Daily Activity Report notifications & schedule coordination', 
      badge: 'Operations', 
      icon: Calendar 
    },
  ];

  return (
    <>
      {/* Floating Widget Trigger Button */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      >
        {/* Toast Notification if chat is closed */}
        <AnimatePresence>
          {!isOpen && notification && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => {
                if (notification.userId) openChatWith(notification.userId);
                else setIsOpen(true);
              }}
              className="bg-zinc-900/95 backdrop-blur-md border border-emerald-500/40 text-white px-4 py-3 rounded-xl shadow-2xl max-w-xs cursor-pointer flex items-start gap-3 hover:border-emerald-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                <MessageCircle size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-emerald-400 truncate">{notification.from}</p>
                  <span className="text-[10px] text-zinc-500">via WhatsApp</span>
                </div>
                <p className="text-xs text-zinc-300 truncate mt-0.5">{notification.text}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); dismissNotification(); }}
                className="text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 transition-all flex items-center justify-center border border-emerald-400/40"
          title="Team Chat & WhatsApp Bridge"
          id="team-chat-widget-trigger"
        >
          <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
          
          {/* WhatsApp Sync Indicator Dot */}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-zinc-950 rounded-full" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-rose-600 text-white text-[11px] font-bold rounded-full border-2 border-zinc-950 shadow-md animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* Main Chat Widget Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-24 right-6 z-50 bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all ${
              isExpanded 
                ? 'w-[calc(100vw-3rem)] md:w-[760px] h-[82vh]' 
                : 'w-[calc(100vw-3rem)] sm:w-[440px] h-[640px]'
            }`}
          >
            {/* Top Widget Header */}
            <div className="bg-[#121215] border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {(activeChatUser || activeChannel) && (
                  <button 
                    onClick={closeActiveConversation}
                    className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Back to Directory"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                {activeChatUser ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-sm shrink-0 border border-emerald-400/30">
                      {activeChatUser.name.charAt(0)}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-zinc-900 rounded-full" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-white truncate">{activeChatUser.name}</h4>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          activeChatUser.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {activeChatUser.role === 'admin' ? 'Admin' : 'Agent'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Radio size={10} className="animate-pulse" /> WhatsApp Bridge
                        </span>
                        <span>•</span>
                        <span>{activeChatUser.whatsappNumber || activeChatUser.phone || '+1 (555) 007-0007'}</span>
                      </div>
                    </div>
                  </div>
                ) : activeChannel ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Megaphone size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        #{channelsList.find(c => c.id === activeChannel)?.name || activeChannel}
                      </h4>
                      <p className="text-[11px] text-emerald-400/90 flex items-center gap-1">
                        <span>⚡ WhatsApp Broadcast Channel</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        Team Chat & WhatsApp Bridge
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Internal team messages integrated with WhatsApp
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {activeChatUser && (
                  <button
                    onClick={() => openWhatsAppDirectWithColleague(activeChatUser)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors mr-1"
                    title="Open 1-on-1 in WhatsApp Web / App"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">WhatsApp Web</span>
                  </button>
                )}

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            {activeChatUser || activeChannel ? (
              /* ================= Active Chat Thread ================= */
              <div className="flex-1 flex flex-col min-h-0 bg-[#09090b]">
                
                {/* WhatsApp Bridge Banner */}
                <div className="bg-emerald-950/40 border-b border-emerald-800/30 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {activeChannel 
                        ? 'Broadcasting to all registered team WhatsApp numbers' 
                        : `Live Bridge Active: Messages auto-synced to ${activeChatUser?.name}'s WhatsApp`}
                    </span>
                  </div>
                  {activeChatUser && (
                    <span className="font-mono text-[10px] text-emerald-400/80">
                      {activeChatUser.whatsappNumber || activeChatUser.phone}
                    </span>
                  )}
                </div>

                {/* Messages Container */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800"
                >
                  {currentMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                        <MessageCircle size={22} />
                      </div>
                      <p className="text-sm font-medium text-zinc-300">No messages in this thread yet</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                        Start the conversation. Any message sent will be securely bridged to WhatsApp in real-time.
                      </p>
                    </div>
                  ) : (
                    currentMessages.map((msg: TeamChatMessage) => {
                      const isMe = msg.fromId === user?.id;

                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
                          onMouseLeave={() => setActiveMenuId(null)}
                        >
                          {/* Sender name for channel messages */}
                          {(!isMe || activeChannel) && (
                            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-zinc-400">
                              <span className="font-semibold text-zinc-300">{msg.fromName}</span>
                              {msg.fromRole && (
                                <span className="text-[9px] px-1 py-0.2 bg-zinc-800 rounded text-zinc-400">
                                  {msg.fromRole}
                                </span>
                              )}
                              <span className="text-[10px] text-zinc-500">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}

                          {/* Contextual Badge (e.g. DAR reminder, deal alert) */}
                          {msg.messageType && msg.messageType !== 'text' && (
                            <div className={`mb-1 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                              msg.messageType === 'dar_reminder' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : msg.messageType === 'deal_alert'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : msg.messageType === 'urgent_ping'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : msg.messageType === 'milestone'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {msg.messageType === 'dar_reminder' && <Calendar size={11} />}
                              {msg.messageType === 'deal_alert' && <Flame size={11} />}
                              {msg.messageType === 'urgent_ping' && <AlertCircle size={11} />}
                              {msg.messageType === 'milestone' && <Sparkles size={11} />}
                              {msg.messageType === 'broadcast' && <Megaphone size={11} />}
                              <span>
                                {msg.messageType === 'dar_reminder' && 'Daily Activity Report (DAR) Reminder'}
                                {msg.messageType === 'deal_alert' && 'Pipeline Deal Alert'}
                                {msg.messageType === 'urgent_ping' && 'Urgent Action Request'}
                                {msg.messageType === 'milestone' && 'Performance Milestone'}
                                {msg.messageType === 'broadcast' && 'Team WhatsApp Broadcast'}
                              </span>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div 
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm relative transition-all shadow-md ${
                              isMe 
                                ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-br-none border border-emerald-500/30' 
                                : 'bg-zinc-900 text-zinc-100 rounded-bl-none border border-zinc-800'
                            }`}
                          >
                            {/* Text */}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                            {/* Attached images */}
                            {msg.images && msg.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-1.5 mt-2">
                                {msg.images.map((img, idx) => (
                                  <img 
                                    key={idx} 
                                    src={img} 
                                    alt="attachment" 
                                    className="rounded-lg object-cover w-full h-24 border border-white/10" 
                                  />
                                ))}
                              </div>
                            )}

                            {/* Linked Lead Metadata */}
                            {msg.linkedLeadName && (
                              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-300">
                                <span>Lead: <strong className="text-white">{msg.linkedLeadName}</strong></span>
                                {msg.linkedLeadStage && (
                                  <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-emerald-300">
                                    {msg.linkedLeadStage}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Footer info & WhatsApp status */}
                            <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                              isMe ? 'text-emerald-200/80' : 'text-zinc-400'
                            }`}>
                              {msg.edited && <span>(edited)</span>}
                              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                              {/* WhatsApp Bridge Icon */}
                              {msg.viaWhatsApp && (
                                <span 
                                  className="flex items-center gap-0.5 text-emerald-300 font-medium" 
                                  title={`Synced to WhatsApp (${msg.whatsAppDeliveryPhone || 'Team'})`}
                                >
                                  <CheckCheck size={13} className="text-emerald-300" />
                                  <span>WhatsApp</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Message Actions Toolbar (on hover) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1">
                            <button
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 text-[10px] flex items-center gap-1"
                              title="Copy text"
                            >
                              {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>

                            {/* Open this message directly in WhatsApp Web */}
                            {activeChatUser && (
                              <button
                                onClick={() => openWhatsAppDirectWithColleague(activeChatUser, msg.text)}
                                className="p-1 rounded text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-[10px] flex items-center gap-1"
                                title="Open in WhatsApp Web"
                              >
                                <ExternalLink size={11} />
                              </button>
                            )}

                            {isMe && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(msg.id);
                                    setInputText(msg.text);
                                  }}
                                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                                  title="Edit"
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  onClick={() => deleteMessage(msg.id)}
                                  className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
                                  title="Delete"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Action Templates Bar */}
                <div className="px-3 pt-2 pb-1 bg-[#101014] border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 transition-colors ${
                      showTemplates 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Sparkles size={13} className="text-emerald-400" />
                    <span>WhatsApp Templates</span>
                  </button>

                  <button
                    onClick={() => handleApplyTemplate(
                      'dar_reminder', 
                      `Hi ${activeChatUser?.name || 'Agent'}, reminder to submit your Daily Activity Report (DAR) for today with your client site visit logs.`
                    )}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <Calendar size={12} className="text-amber-400" />
                    <span>DAR Reminder</span>
                  </button>

                  <button
                    onClick={() => handleApplyTemplate(
                      'deal_alert', 
                      `Deal Alert: Please confirm earnest deposit and client contract signing timeline.`
                    )}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <Flame size={12} className="text-emerald-400" />
                    <span>Deal Alert</span>
                  </button>

                  <button
                    onClick={() => handleApplyTemplate(
                      'urgent_ping', 
                      `Urgent WhatsApp Ping: Inbound high-intent luxury buyer assigned to your portfolio. Please follow up.`
                    )}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <AlertCircle size={12} className="text-rose-400" />
                    <span>Urgent Ping</span>
                  </button>
                </div>

                {/* Templates Flyout Panel */}
                <AnimatePresence>
                  {showTemplates && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-[#141418] border-t border-zinc-800 px-4 py-3 space-y-2 shrink-0"
                    >
                      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Quick WhatsApp Team Templates
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => handleApplyTemplate('dar_reminder', `Hi ${activeChatUser?.name || 'Agent'}, please submit today's DAR before 7:00 PM.`)}
                          className="p-2 text-left rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200"
                        >
                          <span className="font-medium text-amber-400 block">📋 DAR Submission Prompt</span>
                          <span className="text-[11px] text-zinc-400">Request daily activity and visit report</span>
                        </button>
                        <button
                          onClick={() => handleApplyTemplate('deal_alert', `Congratulations! Deal booked and pipeline credit updated.`)}
                          className="p-2 text-left rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200"
                        >
                          <span className="font-medium text-emerald-400 block">🎯 Quota & Deal Celebration</span>
                          <span className="text-[11px] text-zinc-400">Praise deal closing and commission points</span>
                        </button>
                        <button
                          onClick={() => handleApplyTemplate('urgent_ping', `Urgent site visit action required today.`)}
                          className="p-2 text-left rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200"
                        >
                          <span className="font-medium text-rose-400 block">⚡ Site Visit Coordination</span>
                          <span className="text-[11px] text-zinc-400">Request property inspection update</span>
                        </button>
                        <button
                          onClick={() => handleApplyTemplate('milestone', `Team Meeting at 4:00 PM in Executive Boardroom / Zoom.`)}
                          className="p-2 text-left rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200"
                        >
                          <span className="font-medium text-purple-400 block">📣 Office & Shift Alignment</span>
                          <span className="text-[11px] text-zinc-400">Broadcast meeting time to team</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Image Attachments Preview */}
                {attachedImages.length > 0 && (
                  <div className="px-4 py-2 bg-[#101014] border-t border-zinc-800 flex items-center gap-2 overflow-x-auto">
                    {attachedImages.map((img, idx) => (
                      <div key={idx} className="relative group shrink-0">
                        <img src={img} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-zinc-700" />
                        <button
                          onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit Message Indicator */}
                {editingId && (
                  <div className="px-4 py-1.5 bg-amber-950/40 border-t border-amber-800/40 text-amber-300 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Pencil size={12} /> Editing message...
                    </span>
                    <button 
                      onClick={() => { setEditingId(null); setInputText(''); }}
                      className="text-amber-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Input Bar */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-3 bg-[#121215] border-t border-zinc-800 flex flex-col gap-2 shrink-0"
                >
                  {/* WhatsApp Sync Toggle */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-200">
                      <input 
                        type="checkbox"
                        checked={syncWithWhatsApp}
                        onChange={(e) => setSyncWithWhatsApp(e.target.checked)}
                        className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-400 bg-zinc-800"
                      />
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCheck size={13} /> Bridge to WhatsApp
                      </span>
                    </label>

                    {activeChatUser && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Target: {activeChatUser.whatsappNumber || activeChatUser.phone}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Hidden file input */}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handleImageSelect}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Attach image"
                    >
                      <ImageIcon size={18} />
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        editingId 
                          ? 'Edit your message...' 
                          : activeChannel 
                          ? `Message #${activeChannel} & sync to staff WhatsApp...` 
                          : `Message ${activeChatUser?.name} via internal chat & WhatsApp...`
                      }
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim() && attachedImages.length === 0}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 transition-all"
                      title="Send"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>

              </div>
            ) : (
              /* ================= Team Directory & Channels View ================= */
              <div className="flex-1 flex flex-col min-h-0 bg-[#09090b]">
                
                {/* Search & Tabs Header */}
                <div className="p-3.5 bg-[#121215] border-b border-zinc-800/80 space-y-3">
                  {/* Mode switcher: Direct Chats vs Channels */}
                  <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => setChatMode('direct')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        chatMode === 'direct'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <MessageCircle size={14} />
                      <span>Direct Staff Chats ({contacts.length})</span>
                    </button>

                    <button
                      onClick={() => setChatMode('channels')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        chatMode === 'channels'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Megaphone size={14} />
                      <span>Channels & Broadcast</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  {chatMode === 'direct' && (
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search team by name, title, or phone..."
                        className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  )}
                </div>

                {/* Directory Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800">
                  {chatMode === 'direct' ? (
                    /* Direct Staff Contacts */
                    filteredContacts.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-xs">
                        No team members found matching "{searchQuery}"
                      </div>
                    ) : (
                      filteredContacts.map(contact => {
                        // Find latest direct message with this contact
                        const lastMsg = messages
                          .filter(m => !m.channelId && (
                            (m.fromId === user?.id && m.toId === contact.id) ||
                            (m.fromId === contact.id && m.toId === user?.id)
                          ))
                          .pop();

                        const unreadFromContact = messages.filter(
                          m => m.fromId === contact.id && m.toId === user?.id && !m.read
                        ).length;

                        return (
                          <div
                            key={contact.id}
                            onClick={() => openChatWith(contact.id)}
                            className="group p-3 rounded-xl bg-[#121215] hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-sm shrink-0 border border-emerald-400/30">
                                {contact.name.charAt(0)}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-zinc-900 rounded-full" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-white truncate">{contact.name}</h4>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                    contact.role === 'admin' 
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}>
                                    {contact.role === 'admin' ? 'Admin' : 'Agent'}
                                  </span>
                                </div>

                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                  {lastMsg ? (
                                    <span>
                                      {lastMsg.fromId === user?.id ? 'You: ' : ''}
                                      {lastMsg.text}
                                    </span>
                                  ) : (
                                    <span className="text-zinc-500 italic">No messages yet</span>
                                  )}
                                </p>

                                <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-400/90 font-mono">
                                  <span className="flex items-center gap-1">
                                    <Phone size={10} /> {contact.whatsappNumber || contact.phone || '+1 (555) 007-0007'}
                                  </span>
                                  <span>•</span>
                                  <span className="text-zinc-500">WhatsApp Synced</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Action Icons */}
                            <div className="flex items-center gap-2 shrink-0">
                              {unreadFromContact > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-zinc-950 font-bold text-[11px] rounded-full">
                                  {unreadFromContact}
                                </span>
                              )}

                              {/* WhatsApp Quick Launch */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openWhatsAppDirectWithColleague(contact);
                                }}
                                className="p-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition-colors"
                                title="Open in WhatsApp Web"
                              >
                                <ExternalLink size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : (
                    /* Channels List */
                    <div className="space-y-3">
                      {/* Admin Team Broadcast Action */}
                      {user?.role === 'admin' && (
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-emerald-950/40 border border-purple-500/30 flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Megaphone size={14} className="text-purple-400" />
                              WhatsApp Broadcast to All Staff
                            </h4>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              Dispatch an instant company-wide notification to all agents' WhatsApp.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowBroadcastModal(true)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-md"
                          >
                            Broadcast
                          </button>
                        </div>
                      )}

                      {channelsList.map(ch => {
                        const channelMsgs = messages.filter(m => m.channelId === ch.id);
                        const lastMsg = channelMsgs[channelMsgs.length - 1];
                        const Icon = ch.icon;

                        return (
                          <div
                            key={ch.id}
                            onClick={() => openChannel(ch.id)}
                            className="p-3.5 rounded-xl bg-[#121215] hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-emerald-500/40 transition-all cursor-pointer flex items-start justify-between gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                                <Icon size={20} />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-white">#{ch.name}</h4>
                                  <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">
                                    {ch.badge}
                                  </span>
                                </div>

                                <p className="text-xs text-zinc-400 mt-0.5">{ch.desc}</p>

                                {lastMsg && (
                                  <p className="text-[11px] text-emerald-400/90 truncate mt-1">
                                    <strong>{lastMsg.fromName}:</strong> {lastMsg.text}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span className="text-[11px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full shrink-0">
                              {channelMsgs.length} msgs
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="p-3 bg-[#121215] border-t border-zinc-800 text-center text-[11px] text-zinc-500">
                  <span>Logged in as </span>
                  <strong className="text-zinc-300">{user?.name}</strong>
                  <span> ({user?.role === 'admin' ? 'System Admin' : 'Agent'}) • </span>
                  <span className="text-emerald-400 font-mono">{user?.whatsappNumber || user?.phone || '+1 (555) 000-1122'}</span>
                </div>

              </div>
            )}

            {/* Broadcast Modal for Admins */}
            <AnimatePresence>
              {showBroadcastModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-purple-500/40 rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Megaphone size={16} className="text-purple-400" />
                        Send WhatsApp Broadcast to All Agents
                      </h4>
                      <button 
                        onClick={() => setShowBroadcastModal(false)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400">
                      This broadcast will be delivered simultaneously to the team's internal chat channel and dispatched to every agent's registered WhatsApp phone number.
                    </p>

                    <textarea
                      value={broadcastText}
                      onChange={(e) => setBroadcastText(e.target.value)}
                      placeholder="Type company-wide announcement or emergency briefing..."
                      rows={4}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowBroadcastModal(false)}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendBroadcast}
                        disabled={!broadcastText.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-40"
                      >
                        Send WhatsApp Broadcast
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
