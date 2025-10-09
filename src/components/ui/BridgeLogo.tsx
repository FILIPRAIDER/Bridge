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

  const textColor = {
    default: '#000000',
    gradient: '#000000',
    white: '#ffffff'
  };

  return (
    <svg 
      viewBox="0 0 32 32" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizes[size]} ${className}`}
    >
      <text 
        x="16" 
        y="24" 
        fontFamily="Arial, sans-serif" 
        fontSize="20" 
        fontWeight="bold" 
        fill={textColor[variant]} 
        textAnchor="middle"
      >
        B
      </text>
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
