import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'issue' | 'suggestion' | 'other', comment: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [type, setType] = useState<'issue' | 'suggestion' | 'other'>('suggestion');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900 border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-4">Provide Feedback</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Feedback Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                aria-label="Select feedback type"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
              >
                <option value="suggestion">Suggestion</option>
                <option value="issue">Report Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Comment</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                aria-label="Feedback comment"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 h-32 resize-none"
                placeholder="Tell us what you think..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={onClose}
              aria-label="Cancel feedback"
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => { onSubmit(type, comment); onClose(); }}
              aria-label="Submit feedback"
              className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-all"
            >
              Submit
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeedbackModal;
