import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Search,
  X,
  Navigation,
  Layers,
  Compass,
  Key,
  Globe,
  Radio,
  ExternalLink,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface GoogleMapsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'fa';
}

interface PlaceNode {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
}

const DEFAULT_NODES: PlaceNode[] = [
  {
    id: 'cern',
    name: 'CERN Quantum Hub',
    category: 'Quantum Computing & Particle Physics',
    lat: 46.2330,
    lng: 6.0557,
    description: 'European Organization for Nuclear Research. Large Hadron Collider particle acceleration center.'
  },
  {
    id: 'silicon_valley',
    name: 'Nexus Research Nexus - Pacific',
    category: 'Artificial Intelligence Innovation',
    lat: 37.4220,
    lng: -122.0841,
    description: 'Palo Alto & Mountain View research nexus for decentralized machine cognition.'
  },
  {
    id: 'tokyo_tech',
    name: 'Tokyo Neural Node',
    category: 'Cybernetics & Robotics',
    lat: 35.6895,
    lng: 139.6917,
    description: 'High-density computational robotics and holographic intelligence node.'
  },
  {
    id: 'mendel_uni',
    name: 'Mendel University (Scientific Shield)',
    category: 'European Horizon Research',
    lat: 49.2100,
    lng: 16.6167,
    description: 'Dr. Sergiy Yekimov consortium research institute under Horizon Europe framework.'
  },
  {
    id: 'tehran_core',
    name: 'Tehran Aware Sanctuary',
    category: 'Philosophy & Conscious Resonance',
    lat: 35.7219,
    lng: 51.3347,
    description: 'Spiritual and philosophical roots of the AWARE protocol and sacred geometry.'
  }
];

export const GoogleMapsDrawer: React.FC<GoogleMapsDrawerProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('nexus_gmp_api_key') || envKey || '';
  });
  const [keyInput, setKeyInput] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  const [selectedNode, setSelectedNode] = useState<PlaceNode | null>(DEFAULT_NODES[0]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_NODES[0].lat,
    lng: DEFAULT_NODES[0].lng
  });
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [userCustomMarker, setUserCustomMarker] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Sync apiKey with env
  useEffect(() => {
    if (!apiKey && envKey) {
      setApiKey(envKey);
    }
  }, [envKey, apiKey]);

  // Quota event listener
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const handleSelectNode = (node: PlaceNode) => {
    setSelectedNode(node);
    setMapCenter({ lat: node.lat, lng: node.lng });
    setZoom(14);
  };

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim()) {
      const cleanKey = keyInput.trim();
      setApiKey(cleanKey);
      localStorage.setItem('nexus_gmp_api_key', cleanKey);
      setShowKeyModal(false);
      setQuotaExceeded(false);
    }
  };

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      setUserCustomMarker({
        lat,
        lng,
        label: `Custom Coordinate (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-0 md:p-6 bg-black/70 backdrop-blur-md transition-all">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 240 }}
        className="relative z-10 w-full max-w-6xl h-full md:h-[90vh] bg-zinc-950 border border-blue-500/30 rounded-none md:rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col overflow-hidden text-gray-200"
      >
        {/* Quota Exceeded Banner (Section 8 of GMP Skill) */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Compass size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
                {language === 'en' ? 'Geospatial Neural Matrix' : 'ماتریس مکانی نکسوس'}
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Google Maps Platform
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                {language === 'en'
                  ? 'Interactive global grid, advanced markers & research coordinates'
                  : 'شبکه جهانی، نشانگرهای پیشرفته و مختصات مراکز پژوهشی'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1.5 transition-all"
              title="Configure Maps API Key"
            >
              <Key size={14} className="text-blue-400" />
              <span className="hidden sm:inline">{apiKey ? (language === 'en' ? 'API Key Active' : 'کلید فعال') : (language === 'en' ? 'Add API Key' : 'تنظیم کلید')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Left / Sidebar Controls */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-zinc-950/70 p-4 flex flex-col gap-4 overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                {language === 'en' ? 'Strategic Global Nodes' : 'گره‌های استراتژیک جهانی'}
              </span>
              <div className="space-y-2">
                {DEFAULT_NODES.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => handleSelectNode(node)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      selectedNode?.id === node.id
                        ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{node.name}</span>
                      <MapPin size={13} className={selectedNode?.id === node.id ? 'text-blue-400' : 'text-gray-500'} />
                    </div>
                    <span className="text-[10px] text-blue-300 font-mono">{node.category}</span>
                    <span className="text-[9px] text-gray-400 line-clamp-2">{node.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinates Telemetry HUD */}
            <div className="mt-auto p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 font-mono text-[10px]">
              <div className="flex items-center justify-between text-gray-400">
                <span>LATITUDE:</span>
                <span className="text-blue-400">{mapCenter.lat.toFixed(5)}° N</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>LONGITUDE:</span>
                <span className="text-blue-400">{mapCenter.lng.toFixed(5)}° E</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>ZOOM LEVEL:</span>
                <span className="text-cyan-400">{zoom}x</span>
              </div>
              <div className="text-[9px] text-gray-500 pt-1 border-t border-white/5">
                {language === 'en' ? 'Click anywhere on map to drop custom markers.' : 'با کلیک روی نقشه، نشانگر سفارشی قرار دهید.'}
              </div>
            </div>
          </div>

          {/* Right Map Viewport Container */}
          <div className="flex-1 relative h-[450px] md:h-full w-full bg-zinc-900">
            {apiKey ? (
              <APIProvider apiKey={apiKey} libraries={['marker', 'places']}>
                <div className="w-full h-full relative">
                  <Map
                    mapId="DEMO_MAP_ID"
                    defaultCenter={mapCenter}
                    defaultZoom={zoom}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                    onClick={handleMapClick}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  >
                    {/* Pre-defined Research Nodes */}
                    {DEFAULT_NODES.map((node) => (
                      <AdvancedMarker
                        key={node.id}
                        position={{ lat: node.lat, lng: node.lng }}
                        onClick={() => handleSelectNode(node)}
                        title={node.name}
                      >
                        <div className="relative group cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-blue-600/80 border-2 border-white flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.8)] group-hover:scale-125 transition-transform">
                            <Radio size={14} className="animate-pulse" />
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-black/90 backdrop-blur-md border border-blue-500/40 rounded-lg px-2.5 py-1 text-[10px] text-white shadow-xl z-30">
                            {node.name}
                          </div>
                        </div>
                      </AdvancedMarker>
                    ))}

                    {/* Custom User Clicked Marker */}
                    {userCustomMarker && (
                      <AdvancedMarker
                        position={{ lat: userCustomMarker.lat, lng: userCustomMarker.lng }}
                        title={userCustomMarker.label}
                      >
                        <div className="relative cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-fuchsia-600 border-2 border-white flex items-center justify-center text-white shadow-[0_0_20px_rgba(217,70,239,0.8)] animate-bounce">
                            <MapPin size={16} />
                          </div>
                        </div>
                      </AdvancedMarker>
                    )}
                  </Map>
                </div>
              </APIProvider>
            ) : (
              /* No Key Provided Fallback UI */
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <Globe size={32} />
                </div>
                <h3 className="text-base md:text-lg font-bold text-white mb-2">
                  {language === 'en' ? 'Google Maps Platform Key Required' : 'کلید گوگل مپس الزامی است'}
                </h3>
                <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
                  {language === 'en'
                    ? 'To render the interactive 3D satellite and vector maps via @vis.gl/react-google-maps, enter your Google Maps Platform API key below.'
                    : 'برای رندر نقشه ماهواره‌ای و برداری تعاملی، کلید Google Maps Platform خود را وارد نمایید.'}
                </p>
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <Key size={14} />
                  <span>{language === 'en' ? 'Configure Google Maps API Key' : 'تنظیم کلید API'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal: API Key Setup */}
        <AnimatePresence>
          {showKeyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center"
            >
              <div className="w-full max-w-md bg-zinc-900 border border-blue-500/40 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Key size={16} className="text-blue-400" />
                    {language === 'en' ? 'Configure Google Maps Key' : 'تنظیم کلید Google Maps'}
                  </h3>
                  <button onClick={() => setShowKeyModal(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSaveCustomKey} className="space-y-3">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {language === 'en'
                      ? 'Enter your Google Maps Platform API key. The key is securely stored in local session for map rendering.'
                      : 'کلید Google Maps Platform خود را وارد کنید. این کلید برای بارگذاری نقشه استفاده خواهد شد.'}
                  </p>
                  <div>
                    <input
                      type="text"
                      placeholder="AIzaSy..."
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowKeyModal(false)}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs"
                    >
                      {language === 'en' ? 'Cancel' : 'انصراف'}
                    </button>
                    <button
                      type="submit"
                      disabled={!keyInput.trim()}
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50"
                    >
                      {language === 'en' ? 'Apply Key' : 'اعمال کلید'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GoogleMapsDrawer;
