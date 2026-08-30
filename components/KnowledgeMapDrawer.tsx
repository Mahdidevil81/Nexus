import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Sparkles, 
  Network, 
  BookOpen, 
  Compass, 
  ExternalLink, 
  Zap, 
  Layers, 
  History, 
  Atom, 
  Flame, 
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Share2,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { KnowledgeNode, KnowledgeCategory, AiResponse } from '../types';
import { extractKnowledgeMapFromSession } from '../utils/knowledgeExtractor';

interface KnowledgeMapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AiResponse[];
  currentResponse: AiResponse | null;
  language: 'fa' | 'en' | 'auto';
  onExploreConcept: (prompt: string) => void;
}

const CATEGORY_META: Record<KnowledgeCategory, { labelFa: string; labelEn: string; color: string; bg: string; border: string; glow: string; icon: React.ReactNode }> = {
  PHILOSOPHY: {
    labelFa: 'فلسفه و آگاهی',
    labelEn: 'Philosophy & Mind',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    glow: 'shadow-violet-500/30',
    icon: <Sparkles size={14} className="text-violet-400" />
  },
  SCIENCE: {
    labelFa: 'علوم و فناوری',
    labelEn: 'Science & Tech',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/30',
    icon: <Atom size={14} className="text-cyan-400" />
  },
  HISTORY: {
    labelFa: 'تاریخ و اسناد',
    labelEn: 'History & Archives',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/30',
    icon: <History size={14} className="text-amber-400" />
  },
  SESSION_INSIGHT: {
    labelFa: 'بینش‌های جلسه جاری',
    labelEn: 'Session Discoveries',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/30',
    icon: <Zap size={14} className="text-emerald-400" />
  }
};

export const KnowledgeMapDrawer: React.FC<KnowledgeMapDrawerProps> = ({
  isOpen,
  onClose,
  history,
  currentResponse,
  language,
  onExploreConcept
}) => {
  const isFa = language !== 'en';
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'GRAPH' | 'CARDS'>('GRAPH');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Extract nodes dynamically from history + current session
  const nodes = useMemo(() => {
    return extractKnowledgeMapFromSession(history, currentResponse);
  }, [history, currentResponse]);

  // Set default selected node
  useEffect(() => {
    if (!selectedNodeId && nodes.length > 0) {
      setSelectedNodeId(nodes[0].id);
    }
  }, [nodes, selectedNodeId]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchCategory = selectedCategory === 'ALL' || n.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery = !query || 
        n.title.toLowerCase().includes(query) || 
        n.titleFa.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query) ||
        n.descriptionFa.toLowerCase().includes(query) ||
        (n.historicalFact && n.historicalFact.toLowerCase().includes(query)) ||
        (n.historicalFactFa && n.historicalFactFa.toLowerCase().includes(query));
      return matchCategory && matchQuery;
    });
  }, [nodes, selectedCategory, searchQuery]);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || nodes[0] || null;
  }, [nodes, selectedNodeId]);

  // Find connected nodes
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const directConnections = new Set(selectedNode.connections);
    // Also include reverse connections
    nodes.forEach(n => {
      if (n.connections.includes(selectedNode.id)) {
        directConnections.add(n.id);
      }
    });
    return nodes.filter(n => directConnections.has(n.id) && n.id !== selectedNode.id);
  }, [selectedNode, nodes]);

  // Active highlighted links for SVG canvas
  const edges = useMemo(() => {
    const edgeList: { from: KnowledgeNode; to: KnowledgeNode; isHighlighted: boolean }[] = [];
    const drawn = new Set<string>();

    nodes.forEach(source => {
      source.connections.forEach(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (!target) return;
        const key = [source.id, target.id].sort().join('---');
        if (drawn.has(key)) return;
        drawn.add(key);

        const isHighlighted = 
          selectedNodeId === source.id || 
          selectedNodeId === target.id ||
          hoveredNodeId === source.id ||
          hoveredNodeId === target.id;

        edgeList.push({ from: source, to: target, isHighlighted });
      });
    });

    return edgeList;
  }, [nodes, selectedNodeId, hoveredNodeId]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[65]" 
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Main Drawer Overlay */}
      <div 
        className={`fixed top-0 bottom-0 right-0 w-full md:w-[820px] lg:w-[980px] bg-[#090b10]/95 backdrop-blur-3xl border-l border-white/10 z-[70] transform transition-transform duration-500 ease-out flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-950/20 via-zinc-950 to-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Network size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-violet-300 uppercase">
                  {isFa ? 'نقشه دانش و حقایق نکسوس' : 'Nexus Knowledge Map'}
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono border border-blue-500/30 uppercase tracking-widest">
                  {nodes.length} {isFa ? 'گره آگاهی' : 'Nodes'}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                {isFa ? 'کاوش مفاهیم متصل، حقایق تاریخی و رشد دوشادوش هوش نکسوس' : 'Explore interconnected concepts, historical facts & co-evolve with Nexus'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('GRAPH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'GRAPH' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title={isFa ? 'نمای گراف تعاملی' : 'Interactive Graph'}
              >
                <Compass size={14} />
                <span className="hidden sm:inline">{isFa ? 'گراف عصبی' : 'Graph'}</span>
              </button>
              <button
                onClick={() => setViewMode('CARDS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'CARDS' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title={isFa ? 'نمای کارت‌ها' : 'Cards View'}
              >
                <Layers size={14} />
                <span className="hidden sm:inline">{isFa ? 'کارت‌ها' : 'Cards'}</span>
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 border-b border-white/5 bg-black/40 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجو در مفاهیم و حقایق تاریخی...' : 'Search concepts, facts, or insights...'}
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-9 pl-4 py-2 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-cyan-500/50 transition-all font-light"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-white/15 text-white border border-white/30 shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {isFa ? 'همه مفاهیم' : 'All Categories'}
            </button>

            {(Object.keys(CATEGORY_META) as KnowledgeCategory[]).map(cat => {
              const meta = CATEGORY_META[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                    isSelected
                      ? `${meta.bg} ${meta.color} ${meta.border} shadow-sm`
                      : 'bg-white/5 text-gray-400 hover:text-white border-transparent'
                  }`}
                >
                  {meta.icon}
                  <span>{isFa ? meta.labelFa : meta.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
          
          {/* Main Visualizer Area (Graph or Cards) */}
          <div className="flex-1 overflow-y-auto p-4 relative flex flex-col items-center justify-center bg-radial from-blue-950/10 via-transparent to-transparent">
            {viewMode === 'GRAPH' ? (
              <div className="relative w-full h-full min-h-[380px] max-h-[580px] md:max-h-full rounded-2xl bg-zinc-950/70 border border-white/10 overflow-hidden flex items-center justify-center select-none shadow-inner">
                
                {/* Background Grid Lines & Nebula Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
                <div className="absolute w-72 h-72 rounded-full bg-cyan-600/5 blur-3xl pointer-events-none animate-pulse"></div>

                {/* SVG Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="edge-gradient-dim" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#334155" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1e293b" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>
                  {edges.map((edge, idx) => {
                    const x1 = `${edge.from.x || 50}%`;
                    const y1 = `${edge.from.y || 50}%`;
                    const x2 = `${edge.to.x || 50}%`;
                    const y2 = `${edge.to.y || 50}%`;

                    return (
                      <g key={idx}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={edge.isHighlighted ? 'url(#edge-gradient)' : 'url(#edge-gradient-dim)'}
                          strokeWidth={edge.isHighlighted ? 2.5 : 1}
                          strokeDasharray={edge.isHighlighted ? '4,4' : undefined}
                          className={edge.isHighlighted ? 'animate-pulse' : ''}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes on Graph */}
                <div className="absolute inset-0 z-10 p-6 pointer-events-auto">
                  {filteredNodes.map(node => {
                    const isSelected = selectedNode?.id === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const meta = CATEGORY_META[node.category];

                    return (
                      <motion.div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                        style={{
                          left: `${node.x || 50}%`,
                          top: `${node.y || 50}%`
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Outer Glow Ring */}
                        <div 
                          className={`relative flex items-center justify-center rounded-full transition-all duration-500 ${
                            isSelected 
                              ? `w-12 h-12 md:w-14 md:h-14 ${meta.bg} ${meta.border} border-2 shadow-[0_0_25px_rgba(6,182,212,0.6)] ring-4 ring-cyan-400/20` 
                              : isHovered 
                                ? `w-11 h-11 md:w-13 md:h-13 bg-white/10 border ${meta.border} shadow-[0_0_15px_rgba(255,255,255,0.2)]` 
                                : `w-9 h-9 md:w-11 md:h-11 bg-zinc-900/90 border border-white/20 hover:border-cyan-400/50`
                          }`}
                        >
                          <div className={`${meta.color} text-center`}>
                            {meta.icon}
                          </div>

                          {/* Level indicator dot */}
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/30 flex items-center justify-center text-[8px] font-bold text-white">
                            {node.level}
                          </div>
                        </div>

                        {/* Node Label Badge */}
                        <div 
                          className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-medium tracking-wide transition-all ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-lg shadow-cyan-500/20 z-30 font-bold'
                              : 'bg-black/80 text-gray-300 border border-white/10 group-hover:border-white/30 group-hover:text-white z-20'
                          }`}
                        >
                          {isFa ? node.titleFa : node.title}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Graph Helper Legend */}
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] text-gray-400 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    {isFa ? 'برای جزئیات روی گره کلیک کنید' : 'Click node for deep insight'}
                  </span>
                </div>
              </div>
            ) : (
              /* CARDS VIEW */
              <div className="w-full h-full overflow-y-auto pr-1 space-y-3">
                {filteredNodes.map(node => {
                  const isSelected = selectedNode?.id === node.id;
                  const meta = CATEGORY_META[node.category];

                  return (
                    <motion.div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? `${meta.bg} ${meta.border} shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30`
                          : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                      }`}
                      whileHover={{ x: isFa ? -4 : 4 }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg ${meta.bg} ${meta.color} border ${meta.border}`}>
                            {meta.icon}
                          </span>
                          <h3 className="text-sm font-bold text-white">
                            {isFa ? node.titleFa : node.title}
                          </h3>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-mono border border-white/10">
                          Lvl {node.level}
                        </span>
                      </div>

                      <p className="text-xs text-gray-300 font-light line-clamp-2 leading-relaxed mb-3">
                        {isFa ? node.descriptionFa : node.description}
                      </p>

                      {node.historicalFact && (
                        <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2 text-[11px] text-amber-300/90 font-light">
                          <History size={13} className="text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{isFa ? node.historicalFactFa : node.historicalFact}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right/Bottom Inspection & Growth Panel */}
          {selectedNode && (
            <div className="w-full md:w-[360px] border-t md:border-t-0 md:border-r border-white/10 bg-zinc-950/90 p-5 overflow-y-auto flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Category & Level Badge */}
                <div className="flex items-center justify-between">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${CATEGORY_META[selectedNode.category].bg} ${CATEGORY_META[selectedNode.category].color} border ${CATEGORY_META[selectedNode.category].border}`}>
                    {CATEGORY_META[selectedNode.category].icon}
                    <span>{isFa ? CATEGORY_META[selectedNode.category].labelFa : CATEGORY_META[selectedNode.category].labelEn}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                    <span>عمق آگاهی:</span>
                    <span className="text-cyan-400 font-bold">سطح {selectedNode.level}/۵</span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base md:text-lg font-black text-white leading-snug">
                    {isFa ? selectedNode.titleFa : selectedNode.title}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(selectedNode.timestamp).toLocaleDateString(isFa ? 'fa-IR' : 'en-US')}
                  </span>
                </div>

                {/* Conceptual Summary */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-300">
                    <BookOpen size={13} className="text-cyan-400" />
                    <span>{isFa ? 'جوهر و تبیین مفهوم' : 'Core Concept'}</span>
                  </div>
                  <p className="text-xs text-gray-300 font-light leading-relaxed">
                    {isFa ? selectedNode.descriptionFa : selectedNode.description}
                  </p>
                </div>

                {/* Historical Fact / Archive Reference */}
                {(selectedNode.historicalFact || selectedNode.historicalFactFa) && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                      <History size={13} className="text-amber-400" />
                      <span>{isFa ? 'حقیقت و سند تاریخی' : 'Historical Fact & Archive'}</span>
                    </div>
                    <p className="text-xs text-amber-200/90 font-light leading-relaxed">
                      {isFa ? selectedNode.historicalFactFa : selectedNode.historicalFact}
                    </p>
                  </div>
                )}

                {/* Interconnected Concepts */}
                {connectedNodes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
                      {isFa ? 'پیوندهای مفهومی (همگرایی)' : 'Interconnected Nodes'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {connectedNodes.map(cn => (
                        <button
                          key={cn.id}
                          onClick={() => setSelectedNodeId(cn.id)}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-[10px] text-gray-300 hover:text-cyan-200 transition-all flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          <span>{isFa ? cn.titleFa : cn.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Grow with Nexus */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    onExploreConcept(selectedNode.reflectionPrompt);
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] active:scale-98 transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                  <span>{isFa ? 'کاوش عمیق و رشد با نکسوس' : 'Explore & Grow with Nexus'}</span>
                  <ArrowRight size={14} className={`group-hover:translate-x-1 transition-transform ${isFa ? 'rotate-180' : ''}`} />
                </button>
                <p className="text-[9px] text-gray-500 text-center mt-2 font-light">
                  {isFa ? 'این مفهوم مستقیماً در جلسه جاری با نکسوس به تحلیل و شهود گذاشته می‌شود' : 'Sends this conceptual reflection prompt directly to the Nexus session'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KnowledgeMapDrawer;
