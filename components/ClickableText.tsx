
import React, { useState, useEffect, useRef } from 'react';

const ClickableText: React.FC<{ children: any; onWordClick: (word: string) => void }> = ({ children, onWordClick }) => {
  const processNode = (node: any): any => {
    if (typeof node === 'string') {
      return node.split(/(\s+)/).map((part, i) => {
        if (part.trim().length === 0) return part;
        const cleanWord = part.replace(/[.,!?;:()]/g, '');
        if (cleanWord.length < 2) return part;
        return (
          <span 
            key={i} 
            role="button"
            tabIndex={0}
            aria-label={`Get neural context for ${cleanWord}`}
            className="hover:text-cyan-400 cursor-help transition-colors border-b border-transparent hover:border-cyan-400/30 outline-none focus:text-cyan-400 focus:border-cyan-400/30"
            onClick={(e) => {
              e.stopPropagation();
              onWordClick(cleanWord);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onWordClick(cleanWord);
              }
            }}
          >
            {part}
          </span>
        );
      });
    }
    if (React.isValidElement(node)) {
      return React.cloneElement(node as React.ReactElement, {}, React.Children.map((node.props as any).children, processNode));
    }
    return node;
  };

  return <>{React.Children.map(children, processNode)}</>;
};

export default React.memo(ClickableText);
