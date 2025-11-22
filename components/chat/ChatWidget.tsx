
import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { X, Send, MessageCircle, ChevronLeft, Maximize2, Minimize2, Image as ImageIcon, Trash2, Pencil, MoreVertical, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';

export const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const { 
    isOpen, 
    setIsOpen, 
    activeChatUser, 
    openChatWith, 
    messages, 
    sendMessage, 
    deleteMessage,
    editMessage,
    unreadCount,
    contacts 
  } = useChat();

  const [inputText, setInputText] = useState('');
  
  // Changed to container ref to prevent global scroll jumping
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const [notification, setNotification] = useState<{from: string, text: string} | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // New states for features
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (!editingId && activeChatUser && messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        // Use scrollTo on container to keep scrolling localized to the chat widget
        // This prevents the "side glider" (main window) from scrolling down
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages, isOpen, activeChatUser, isExpanded]);

  // Handle Notifications
  useEffect(() => {
      if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.toId === user?.id && !lastMsg.read && !isOpen) {
              // Find sender name
              const sender = contacts.find(c => c.id === lastMsg.fromId);
              if (sender) {
                  setNotification({ from: sender.name, text: lastMsg.text });
                  // Auto hide after 5s
                  setTimeout(() => setNotification(null), 5000);
              }
          }
      }
  }, [messages, user, isOpen, contacts]);

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if ((!inputText.trim() && attachedImages.length === 0)) return;

      if (editingId) {
          await editMessage(editingId, inputText);
          setEditingId(null);
      } else {
          await sendMessage(inputText, attachedImages);
      }
      
      setInputText('');
      setAttachedImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        const promises = files.map((file: File) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(base64Images => {
            setAttachedImages(prev => [...prev, ...base64Images]);
        });
    }
  };

  const removeAttachedImage = (index: number) => {
      setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const startEditing = (msg: any) => {
      setEditingId(msg.id);
      setInputText(msg.text);
      setActiveMenuId(null);
  };

  const cancelEditing = () => {
      setEditingId(null);
      setInputText('');
      setAttachedImages([]);
  };

  const handleDelete = async (id: string) => {
      await deleteMessage(id);
      setActiveMenuId(null);
  };

  // Helper to format message text with clickable links
  const formatMessage = (text: string, isOwnMessage: boolean) => {
    const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
        if (part.match(urlRegex)) {
            const href = part.startsWith('www.') ? `https://${part}` : part;
            const linkClass = isOwnMessage 
                ? "text-white underline decoration-white/50 hover:text-zinc-200" 
                : "text-blue-400 hover:text-blue-300 underline decoration-blue-400/50";
            
            return (
                <a 
                    key={i} 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`${linkClass} underline-offset-2 break-all transition-colors font-medium relative z-50 cursor-pointer`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return <span key={i}>{part}</span>;
    });
  };

  // Filter conversation for active chat
  const conversation = activeChatUser 
    ? messages.filter(m => 
        (m.fromId === user?.id && m.toId === activeChatUser.id) || 
        (m.fromId === activeChatUser.id && m.toId === user?.id)
      )
    : [];

  if (!user) return null;

  return (
    <>
      {/* Notification Toast with 3D Tilt */}
      <AnimatePresence>
        {notification && (
            <motion.div
                initial={{ x: 100, opacity: 0, rotateY: -25 }}
                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                exit={{ x: 100, opacity: 0, rotateY: 25 }}
                className="fixed top-24 right-6 z-[100] cursor-pointer perspective-1000"
                onClick={() => {
                    const sender = contacts.find(c => c.name === notification.from);
                    if (sender) openChatWith(sender.id);
                    setNotification(null);
                }}
            >
                <div className="bg-zinc-900/95 backdrop-blur-xl border border-red-500/40 rounded-2xl p-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.4)] flex items-center gap-4 transform transition-transform hover:scale-105 hover:rotate-x-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white shadow-inner border border-white/10">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white font-display">{notification.from}</h4>
                        <p className="text-xs text-zinc-400 truncate max-w-[150px]">{notification.text}</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent rounded-2xl pointer-events-none" />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button (Floating) with Pulse */}
      <div className="fixed bottom-6 right-6 z-[90] perspective-500">
          <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20 duration-1000"></div>
          <motion.button
            whileHover={{ scale: 1.1, rotateZ: 15, rotateX: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-14 h-14 bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-full shadow-[0_10px_25px_rgba(220,38,38,0.5),inset_0_2px_5px_rgba(255,255,255,0.3)] flex items-center justify-center text-white border border-red-400/30 transform-style-preserve-3d"
          >
            <MessageCircle size={28} className="drop-shadow-md" />
            {unreadCount > 0 && (
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-white text-red-600 text-xs font-bold rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-lg"
                >
                    {unreadCount}
                </motion.span>
            )}
          </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, rotateX: 10 }}
            className="fixed bottom-24 right-6 z-[90] w-96 perspective-1000"
            style={{ height: isExpanded ? '80vh' : '500px' }}
          >
            <Card noTilt className="w-full h-full flex flex-col p-0 overflow-hidden bg-[#080808]/95 border-zinc-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] rounded-2xl">
                {/* Header */}
                <div className="p-4 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-white/5 flex justify-between items-center relative z-20">
                    {activeChatUser ? (
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => { openChatWith(''); cancelEditing(); }} 
                                className="w-8 h-8 rounded-full bg-zinc-800/50 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-white/5"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div>
                                <h3 className="font-bold text-white font-display text-base">{activeChatUser.name}</h3>
                                <span className="text-[10px] text-green-500 flex items-center gap-1.5 font-bold uppercase tracking-wider bg-green-900/10 px-1.5 py-0.5 rounded">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                <MessageCircle size={18} className="text-red-500" />
                            </div>
                            <h3 className="font-bold text-white font-display text-lg tracking-tight">Messages</h3>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                         <button 
                           onClick={() => setIsExpanded(!isExpanded)} 
                           className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                           title={isExpanded ? "Collapse" : "Expand History"}
                         >
                            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-500 hover:text-white hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#030303] relative"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                    
                    {!activeChatUser ? (
                        // Contact List - 3D Rows
                        <div className="space-y-3 relative z-10">
                            {contacts.map(contact => {
                                const lastMsg = messages.filter(m => 
                                    (m.fromId === contact.id && m.toId === user.id) || 
                                    (m.fromId === user.id && m.toId === contact.id)
                                ).pop();
                                const unread = messages.filter(m => m.fromId === contact.id && m.toId === user.id && !m.read).length;

                                return (
                                    <motion.div 
                                        key={contact.id} 
                                        whileHover={{ scale: 1.02, z: 10, translateY: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => openChatWith(contact.id)}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 cursor-pointer transition-all border border-white/5 hover:border-red-500/20 shadow-sm hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-zinc-400 font-bold border border-white/5 shadow-inner">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="text-sm font-bold text-white font-display">{contact.name}</h4>
                                                {lastMsg && <span className="text-[10px] text-zinc-600 font-mono">{new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                                            </div>
                                            <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-white font-medium' : 'text-zinc-500'}`}>
                                                {lastMsg ? lastMsg.text : 'Start a conversation...'}
                                            </p>
                                        </div>
                                        {unread > 0 && (
                                            <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_red]">
                                                {unread}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        // Conversation View - 3D Bubbles
                        <div className="space-y-4 py-2 relative z-10">
                            {conversation.map(msg => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    key={msg.id} 
                                    className={`flex group ${msg.fromId === user.id ? 'justify-end' : 'justify-start'}`}
                                    onMouseLeave={() => setActiveMenuId(null)}
                                >
                                    <div className="relative max-w-[80%]">
                                        {msg.fromId === user.id && (
                                            <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                                                    }}
                                                    className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white"
                                                >
                                                    <MoreVertical size={14} />
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {activeMenuId === msg.id && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="absolute top-0 right-full mr-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 z-50 min-w-[100px]"
                                                        >
                                                            <button 
                                                                onClick={() => startEditing(msg)}
                                                                className="w-full px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
                                                            >
                                                                <Pencil size={12} /> Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(msg.id)}
                                                                className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-zinc-800 hover:text-red-300 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={12} /> Delete
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        <div className={`p-3.5 rounded-2xl text-sm relative shadow-lg border overflow-hidden ${
                                            msg.fromId === user.id 
                                            ? 'bg-gradient-to-br from-red-700 to-red-900 text-white rounded-br-none border-red-500/30' 
                                            : 'bg-zinc-800 text-zinc-200 rounded-bl-none border-white/5'
                                        }`}>
                                            {/* Image Grid */}
                                            {msg.images && msg.images.length > 0 && (
                                                <div className={`grid gap-1 mb-2 ${msg.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                    {msg.images.map((img, idx) => (
                                                        <img key={idx} src={img} alt="attachment" className="rounded-lg w-full h-full object-cover max-h-40 border border-black/20" />
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {formatMessage(msg.text, msg.fromId === user.id)}
                                            
                                            <div className="flex justify-end items-center gap-1.5 mt-1.5">
                                                {msg.edited && <span className="text-[8px] italic opacity-70"> (edited)</span>}
                                                <div className={`text-[9px] font-bold opacity-60`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div className="h-1" />
                        </div>
                    )}
                </div>

                {/* Input - Sunk In Depth Effect */}
                {activeChatUser && (
                    <div className="p-4 bg-zinc-950 border-t border-white/5 relative z-20">
                        {/* Editing Indicator */}
                        <AnimatePresence>
                            {editingId && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex justify-between items-center mb-2 px-2 text-xs text-yellow-500"
                                >
                                    <span className="flex items-center gap-2"><Pencil size={12}/> Editing message...</span>
                                    <button onClick={cancelEditing} className="hover:text-white"><X size={12} /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Attachment Previews */}
                        <AnimatePresence>
                            {attachedImages.length > 0 && !editingId && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar"
                                >
                                    {attachedImages.map((img, idx) => (
                                        <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-lg border border-zinc-700 overflow-hidden group">
                                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => removeAttachedImage(idx)}
                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSend} className="flex gap-3 items-end">
                            <div className="flex-1 relative group">
                                <div className="absolute inset-0 bg-black rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-white/5 group-focus-within:border-red-500/50 transition-colors" />
                                <textarea 
                                    className="relative w-full bg-transparent rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none z-10 resize-none min-h-[46px] max-h-24 custom-scrollbar"
                                    placeholder={editingId ? "Update your message..." : "Type your message..."}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e);
                                        }
                                    }}
                                    rows={1}
                                />
                            </div>
                            
                            {!editingId && (
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        onChange={handleImageUpload}
                                    />
                                    <button type="button" className="p-3 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl shadow-lg border border-white/5 transition-colors">
                                        <ImageIcon size={18} />
                                    </button>
                                </div>
                            )}

                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit" 
                                disabled={!inputText.trim() && attachedImages.length === 0}
                                className="p-3 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-xl shadow-[0_4px_0_rgb(120,0,0),0_5px_10px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-[4px] transition-all border border-red-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </motion.button>
                        </form>
                    </div>
                )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
