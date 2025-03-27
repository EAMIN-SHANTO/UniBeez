import React from 'react';

interface LogoProps {
  className?: string;
  dark?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", dark = false }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="10" fill={dark ? "#1E40AF" : "#3B82F6"} />
      <path 
        d="M30 30 L30 70 M50 30 L50 70 M70 30 L70 70 M30 50 L70 50" 
        stroke="white" 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
      <path 
        d="M20 80 L80 80" 
        stroke={dark ? "#FBBF24" : "#FCD34D"} 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

export default Logo; 