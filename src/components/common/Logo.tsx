import React from 'react';
import logo from '../../assets/images/logo1.png'; // <-- Updated import

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', light = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <img 
      src={logo} 
      alt="Engiversee Logo" 
      className={`${sizeClasses[size]} ${light ? 'filter brightness-150' : ''}`}
    />
  );
};

export default Logo;
