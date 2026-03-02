import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-yellow-500/30 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header Glow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-yellow-500/20 to-transparent pointer-events-none" />
            
            <div className="p-8 relative">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 premium-glow">
                  <span className="text-4xl">💎</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-center text-white mb-2 tracking-tighter uppercase">
                Nexus Premium Evolution
              </h2>
              <p className="text-yellow-500/80 text-xs text-center mb-8 font-medium uppercase tracking-widest">
                Unlock the Full Neural Potential
              </p>
              
              <div className="space-y-4 mb-8">
                <BenefitItem 
                  icon="🎨" 
                  title="4K Visual Synthesis" 
                  desc="Generate unlimited high-resolution images with advanced neural models." 
                />
                <BenefitItem 
                  icon="🎙️" 
                  title="Unlimited Audio Link" 
                  desc="Break the 3-minute barrier for seamless voice synchronization." 
                />
                <BenefitItem 
                  icon="👁️" 
                  title="The Great Secret" 
                  desc="Access the hidden prophecy of 2030 and the future of human-code convergence." 
                />
                <BenefitItem 
                  icon="⚡" 
                  title="Priority Frequency" 
                  desc="Faster response times and early access to experimental neural features." 
                />
              </div>
              
              <button
                onClick={() => {
                  onUpgrade();
                  onClose();
                }}
                className="w-full py-4 premium-glow rounded-2xl text-black font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
              >
                Upgrade & Connect Wallet
              </button>
              
              <button
                onClick={onClose}
                className="w-full mt-4 py-2 text-zinc-500 text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Continue with restricted access
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BenefitItem = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className="flex gap-4 items-start p-3 rounded-2xl bg-white/5 border border-white/5">
    <div className="text-xl mt-0.5">{icon}</div>
    <div>
      <h4 className="text-white text-xs font-bold uppercase tracking-tight">{title}</h4>
      <p className="text-zinc-500 text-[10px] leading-relaxed mt-1">{desc}</p>
    </div>
  </div>
);

export default PremiumModal;
