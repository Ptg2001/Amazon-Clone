import React from 'react';

const LoadingSkeleton = ({ 
  height = '20px', 
  width = '100%', 
  className = '',
  lines = 1,
  circle = false 
}) => {
  if (circle) {
    return (
      <div
        className={`skeleton rounded-full ${className}`}
        style={{ height, width }}
      />
    );
  }

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(lines)].map((_, index) => (
          <div
            key={index}
            className="skeleton rounded"
            style={{ 
              height: index === lines - 1 ? '12px' : height,
              width: index === lines - 1 ? '60%' : width 
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton rounded ${className}`}
      style={{ height, width }}
    />
  );
};

export default LoadingSkeleton;
