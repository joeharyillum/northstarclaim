"use client";

import React, { useState } from 'react';
import { generateLeads, AVAILABLE_INDUSTRIES, AVAILABLE_LOCATIONS } from '@/lib/lead-generator';
import { useLeadStore } from '@/store/useLeadStore';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeneratorModal({ isOpen, onClose }: Props) {
  const { addLeads } = useLeadStore();
  const [industry, setIndustry] = useState(AVAILABLE_INDUSTRIES[0]);
  const [location, setLocation] = useState('Nationwide');
  const [count, setCount] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerated(0);

    // Process in batches for UI responsiveness
    const batchSize = 1000;
    let remaining = count;

    while (remaining > 0) {
      const batchCount = Math.min(batchSize, remaining);
      const leads = generateLeads({ industry, location, count: batchCount });
      addLeads(leads);
      remaining -= batchCount;
      setGenerated(count - remaining);

      // Yield to UI thread
      await new Promise(r => setTimeout(r, 10));
    }

    setIsGenerating(false);
  };

  const presets = [
    { label: '50', value: 50 },
    { label: '500', value: 500 },
    { label: '5K', value: 5000 },
    { label: '50K', value: 50000 },
    { label: '500K', value: 500000 },
    { label: '1M', value: 1000000 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-lg mx-4 glass rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/20">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Lead Generator</h2>
                  <p className="text-xs text-slate-500">Create leads instantly — zero cost</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Industry */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Industry</label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  {AVAILABLE_INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Location</label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  {AVAILABLE_LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Count */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Number of Leads</label>
                <div className="flex items-center gap-2">
                  {presets.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setCount(p.value)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${count === p.value
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={count}
                  onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mt-2"
                  placeholder="Custom amount..."
                />
              </div>

              {/* Progress */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Generating leads...</span>
                    <span className="text-indigo-400 font-mono">{generated.toLocaleString()} / {count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(generated / count) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                ~{(count * 0.0001).toFixed(1)}s estimated
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {count.toLocaleString()} Leads
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
