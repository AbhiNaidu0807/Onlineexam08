import React from 'react';

const Logo = ({ size = 60, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform hover:scale-110 duration-500 drop-shadow-xl"
      >
        <defs>
          <linearGradient id="eagleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#FF6A00" />
          </linearGradient>
        </defs>
        
        {/* Modern Minimalist Eagle Shape */}
        <path 
          d="M50 15L62 38H75L50 85L25 38H38L50 15Z" 
          fill="url(#eagleGradient)" 
        />
        
        {/* Dynamic Wings */}
        <path 
          d="M50 35L10 30L35 55L15 65L50 50L85 65L65 55L90 30L50 35Z" 
          fill="url(#eagleGradient)"
          fillOpacity="0.8"
        />

        {/* Sharp Beak/Head Focus */}
        <path 
          d="M50 15L55 25L50 30L45 25L50 15Z" 
          fill="white" 
          opacity="0.4"
        />

        {/* Speed lines or abstract tail */}
        <path 
          d="M40 70H60L50 85L40 70Z" 
          fill="url(#eagleGradient)"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};

export default Logo;
