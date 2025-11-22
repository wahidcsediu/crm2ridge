import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/mockDb';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Particles } from '../components/ui/Particles';
import { Building2, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await db.login(email, password);
      if (user) {
        login(user);
        navigate('/');
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@user.com');
    setPassword('123456');
  }

  const fillAgentJames = () => {
    setEmail('agent@bond.com');
    setPassword('123456');
  }
  
  const fillAgentSarah = () => {
    setEmail('agent@sarah.com');
    setPassword('123456');
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030303] overflow-hidden relative">
      <Particles />
      
      {/* Animated 3D Background Elements */}
      <motion.div 
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-red-900/30 to-transparent blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-red-600/20 to-transparent blur-[120px] pointer-events-none" 
      />
      
      {/* Grid Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 p-6">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-12"
        >
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-red-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <motion.div 
                whileHover={{ rotateY: 180 }}
                transition={{ duration: 0.8 }}
                className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-700 to-black rounded-2xl mb-6 shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-red-500/30"
            >
              <Building2 size={48} className="text-white drop-shadow-lg" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter font-display text-white mb-2 drop-shadow-2xl">RIDGE PARK</h1>
          <p className="text-zinc-400 font-light tracking-widest text-sm uppercase">Premium Real Estate Intelligence</p>
        </motion.div>

        <div className="perspective-1000">
          <Card className="bg-zinc-900/60 border-zinc-800/50">
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="bg-zinc-950/50"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="bg-zinc-950/50"
              />

              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Enter Dashboard
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-center gap-4 text-xs text-zinc-500 font-medium uppercase tracking-wider">
              <button onClick={fillAdmin} className="hover:text-red-400 transition-colors flex items-center gap-2">
                <Box size={12} /> Admin
              </button>
              <span className="text-zinc-700">|</span>
              <button onClick={fillAgentJames} className="hover:text-red-400 transition-colors flex items-center gap-2">
                <Box size={12} /> James Bond
              </button>
              <span className="text-zinc-700">|</span>
              <button onClick={fillAgentSarah} className="hover:text-red-400 transition-colors flex items-center gap-2">
                <Box size={12} /> Sarah Connor
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};