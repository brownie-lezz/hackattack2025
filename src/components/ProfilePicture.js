import React from 'react';

/**
 * ProfilePicture component that displays either the user's profile image or a fallback with initials
 * 
 * @param {Object} props
 * @param {string} props.url - URL of the profile picture
 * @param {string} props.name - User's name (for fallback and alt text)
 * @param {string} props.size - Size of the profile picture (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
const ProfilePicture = ({ 
  url, 
  name = 'User', 
  size = 'md', 
  className = '' 
}) => {
  // Determine the size in pixels
  const sizeMap = {
    xs: 32,
    sm: 64,
    md: 100,
    lg: 150,
    xl: 200
  };
  
  const pixelSize = sizeMap[size] || sizeMap.md;
  const fontSize = `${pixelSize / 2.5}px`;
  
  // Get the initials from the name
  const getInitials = () => {
    if (!name) return '?';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return url ? (
    <img 
      src={url} 
      alt={`${name}'s profile`} 
      className={`rounded-circle ${className}`}
      style={{ width: pixelSize, height: pixelSize, objectFit: 'cover' }}
    />
  ) : (
    <div 
      className={`rounded-circle bg-secondary d-flex align-items-center justify-content-center ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <span 
        className="text-white"
        style={{ fontSize: fontSize }}
      >
        {getInitials()}
      </span>
    </div>
  );
};

export default ProfilePicture; 