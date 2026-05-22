import React from 'react';

interface DynamicAvatarProps {
  firstName?: string;
  gender?: 'male' | 'female';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const DynamicAvatar: React.FC<DynamicAvatarProps> = ({
  firstName = '',
  gender = 'male',
  size = 'md',
  className = ''
}) => {
  const initial = firstName ? firstName.charAt(0).toUpperCase() : '?';
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
    xl: 'w-16 h-16 text-4xl'
  };
  
  const bgColor = gender === 'female' 
    ? 'bg-gradient-to-br from-pink-500 to-rose-600' 
    : 'bg-gradient-to-br from-blue-600 to-indigo-700';
  
  return (
    <div className={`rounded-full flex items-center justify-center text-white font-bold ${sizeClasses[size]} ${bgColor} ${className}`} style={{ fontFamily: 'Montserrat, Open Sans, sans-serif' }}>
      {initial}
    </div>
  );
};

export default DynamicAvatar;
