
import React, { useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Particles } from './ui/Particles';
import { ChatWidget } from './chat/ChatWidget';
import { AIReportModal } from './ui/AIReportModal';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X,
  Briefcase,
  Sparkles,
  Calculator,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { unreadCount, setIsOpen, isOpen, notification } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Scroll Effects
  const { scrollY } = useScroll({ container: containerRef });
  const bgY1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const bgY2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const bgRotate = useTransform(scrollY, [0, 1000], [0, 45]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBellClick = () => {
      setIsOpen(!isOpen);
  };

  const isAdmin = user?.role === 'admin';

  const navItems = [
    ...(isAdmin ? [{ path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> }] : []),
    ...(isAdmin ? [{ path: '/agents', label: 'Agents', icon: <UserCircle size={20} /> }] : []),
    { path: '/customers', label: 'Customers', icon: <Users size={20} /> },
    { path: '/products', label: 'Properties', icon: <ShoppingBag size={20} /> },
    ...(isAdmin ? [{ path: '/accounts', label: 'Accounts', icon: <Calculator size={20} /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-200 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {isAdmin && <AIReportModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />}

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 z-50 relative">
        <div className="flex items-center gap-3">
            <span className="text-xl font-bold font-display tracking-tight text-white">
            RIDGE PARK
            </span>
            {/* Mobile Bell */}
            <button onClick={handleBellClick} className="relative p-2 text-zinc-400 hover:text-white">
                <Bell size={20} className={notification ? 'animate-wiggle' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-zinc-950">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence mode='wait'>
        {(isMobileMenuOpen || window.innerWidth >= 768) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed md:relative inset-y-0 left-0 w-72 bg-[#080808] border-r border-zinc-900/50 z-40 flex flex-col ${isMobileMenuOpen ? 'block' : 'hidden md:flex'}`}
          >
            <div className="p-8 flex items-center gap-4">
              <motion.div 
                whileHover={{ rotateY: 180, rotateZ: 10 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(220,20,60,0.4)] border border-white/10 perspective-1000 cursor-pointer"
              >
                <Briefcase className="text-white" size={20} />
              </motion.div>
              <div>
                <h1 className="font-bold font-display text-lg leading-none text-white tracking-wide">RIDGE PARK</h1>
                <p className="text-[10px] text-red-500 font-bold tracking-[0.2em] mt-1 uppercase">Real Estate</p>
              </div>
            </div>

            <div className="px-6 mb-8">
              <div className="p-4 bg-zinc-900/30 rounded-2xl border border-white/5 backdrop-blur-sm flex items-center justify-between group">
                <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Current Session</p>
                    <p className="font-medium text-white truncate font-display text-lg max-w-[140px]">{user?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-xs text-zinc-400 capitalize">{user?.role}</p>
                    </div>
                </div>
                
                {/* Desktop Bell inside User Card */}
                <button 
                    onClick={handleBellClick}
                    className="relative p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all border border-white/5 shadow-lg"
                >
                    <Bell size={18} className={notification ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-900 shadow-md">
                            {unreadCount}
                        </span>
                    )}
                </button>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden perspective-1000 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent border-l-2 border-red-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      <motion.span 
                        className={`relative z-10 ${isActive ? 'text-red-500' : ''}`}
                        whileHover={{ rotateY: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.span>
                      <span className={`relative z-10 font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="p-6 border-t border-zinc-900 space-y-2">
              {isAdmin && (
                <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="flex items-center gap-3 px-4 py-3 w-full text-blue-400 bg-blue-900/10 hover:bg-blue-900/20 hover:text-blue-300 rounded-xl transition-all duration-200 group border border-blue-500/10"
                >
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-bold text-sm font-display">AI Report</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-zinc-500 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all duration-200 group"
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        ref={containerRef}
        className="flex-1 overflow-y-auto h-screen bg-[#030303] relative perspective-1000 scroll-smooth"
      >
        {/* Background Elements with Parallax */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <Particles />
            
            <motion.div 
              style={{ y: bgY1, rotate: bgRotate }}
              className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px]" 
            />
            
            <motion.div 
              style={{ y: bgY2 }}
              className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-[100px]" 
            />

            {/* Noise Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>
        </div>
        
        <div className="relative z-10 max-w-8xl mx-auto p-6 md:p-10 pb-32">
           <motion.div
             key={location.pathname}
             initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ duration: 0.5, ease: "easeOut" }}
           >
             {children}
           </motion.div>
        </div>

        {/* Global Chat Widget */}
        <ChatWidget />
      </main>
    </div>
  );
};
