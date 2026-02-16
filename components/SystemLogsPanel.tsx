import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface SystemLogsPanelProps {
  logs: LogEntry[];
}

const SystemLogsPanel: React.FC<SystemLogsPanelProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getColorClass = (color: LogEntry['color']) => {
    switch (color) {
      case 'green': return 'text-green-400';
      case 'cyan': return 'text-cyan-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-500';
      default: return 'text-white';
    }
  };

  return (
    <div className="border border-gray-600 bg-gray-900/80 h-full flex flex-col shadow-lg">
      <div className="bg-gray-800 px-3 py-1 border-b border-gray-600">
        <span className="text-yellow-400 font-bold text-sm tracking-wide">CORE_LOGS</span>
      </div>
      <div 
        ref={scrollRef}
        className="p-3 font-mono text-xs md:text-sm overflow-y-auto h-64 md:h-80 space-y-1"
      >
        {logs.map((log) => (
          <div key={log.id} className={`${getColorClass(log.color)}`}>
            <span className="text-gray-500 opacity-60 mr-2">[{log.timestamp}]</span>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemLogsPanel;