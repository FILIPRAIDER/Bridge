import React from 'react';

interface BridgeLogoProps {
  className?: string;
  variant?: 'default' | 'gradient' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export const BridgeLogo = ({ 
  className = '', 
  variant = 'white',
  size = 'md' 
}: BridgeLogoProps) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  const colors = {
    default: '#1f2937', // gray-800
    gradient: 'url(#bridgeGradient)',
    white: '#ffffff'
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizes[size]} ${className}`}
    >
      {variant === 'gradient' && (
        <defs>
          <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
        </defs>
      )}
      
      {/* Letter B with bridge concept */}
      <path
        d="M6 4C6 3.44772 6.44772 3 7 3H13.5C15.9853 3 18 5.01472 18 7.5C18 8.77254 17.4851 9.92023 16.6477 10.75C17.4851 11.5798 18 12.7275 18 14C18 16.4853 15.9853 18.5 13.5 18.5H7C6.44772 18.5 6 18.0523 6 17.5V4Z"
        fill={colors[variant]}
        fillOpacity="0.9"
      />
      <path
        d="M8.5 5.5V9.5H13C14.1046 9.5 15 8.60457 15 7.5C15 6.39543 14.1046 5.5 13 5.5H8.5Z"
        fill={variant === 'white' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}
      />
      <path
        d="M8.5 12V16H13C14.1046 16 15 15.1046 15 14C15 12.8954 14.1046 12 13 12H8.5Z"
        fill={variant === 'white' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}
      />
      
      {/* Bridge connection line - decorative element */}
      <path
        d="M19 10.75C19.5523 10.75 20 11.1977 20 11.75C20 12.3023 19.5523 12.75 19 12.75H18.5C18.2239 12.75 18 12.5261 18 12.25V11.25C18 10.9739 18.2239 10.75 18.5 10.75H19Z"
        fill={colors[variant]}
        fillOpacity="0.6"
      />
      <circle cx="21" cy="11.75" r="1.5" fill={colors[variant]} fillOpacity="0.4" />
    </svg>
  );
};

// Alternative minimalist version - just the "B"
export const BridgeLogoSimple = ({ 
  className = '', 
  size = 'md' 
}: { className?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-2xl'
  };

  return (
    <div className={`font-black ${sizes[size]} ${className}`}>
      B
    </div>
  );
};
