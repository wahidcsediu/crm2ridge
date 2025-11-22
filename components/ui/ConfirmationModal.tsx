import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm perspective-1000"
          >
            <div className="relative group">
              {/* 3D Depth Shadow */}
              <div className="absolute inset-2 bg-red-900/20 blur-xl rounded-2xl translate-y-4" />
              
              <Card title={title} noTilt className="bg-zinc-900 border border-red-500/30 shadow-2xl relative z-10">
                <div className="flex flex-col items-center text-center space-y-4 pt-2">
                  <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                    <AlertTriangle className="text-red-500" size={32} />
                  </div>
                  
                  <p className="text-zinc-300 text-sm leading-relaxed px-4">
                    {message}
                  </p>

                  <div className="flex gap-3 w-full pt-4 mt-4 border-t border-white/5">
                    <Button 
                      variant="ghost" 
                      onClick={onCancel} 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {cancelText}
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={onConfirm} 
                      className="flex-1"
                      isLoading={isLoading}
                    >
                      {confirmText}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
