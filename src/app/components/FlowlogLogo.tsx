import React from 'react';

interface FlowlogLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export function FlowlogLogo({ 
  variant = 'full', 
  size = 'md',
  className = '',
  animated = false 
}: FlowlogLogoProps) {
  const sizes = {
    sm: { height: 24, iconSize: 24, fontSize: 16 },
    md: { height: 32, iconSize: 32, fontSize: 20 },
    lg: { height: 48, iconSize: 48, fontSize: 28 },
    xl: { height: 64, iconSize: 64, fontSize: 36 }
  };

  const { height, iconSize, fontSize } = sizes[size];

  // Icon component - flowing circular timer symbol
  const FlowIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'animate-spin-slow' : ''}
      style={{ animationDuration: animated ? '20s' : undefined }}
    >
      {/* Outer ring - Indigo */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="url(#gradient1)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="87.96"
        strokeDashoffset={animated ? "21.99" : "0"}
        className={animated ? 'animate-dash' : ''}
      />
      
      {/* Inner flow lines - creating a flowing effect */}
      <path
        d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16"
        stroke="#4B5CFB"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Center dot - Aqua accent */}
      <circle
        cx="16"
        cy="16"
        r="3"
        fill="url(#gradient2)"
        className={animated ? 'animate-pulse' : ''}
      />
      
      {/* Flowing arc segments - Aqua */}
      <path
        d="M 23.3 8.7 A 10 10 0 0 1 23.3 23.3"
        stroke="#00C7B7"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4B5CFB" />
          <stop offset="100%" stopColor="#00C7B7" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C7B7" />
          <stop offset="100%" stopColor="#4B5CFB" />
        </linearGradient>
      </defs>
    </svg>
  );

  // Wordmark component
  const Wordmark = () => (
    <svg
      height={fontSize}
      viewBox="0 0 120 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height: fontSize }}
    >
      <text
        x="0"
        y="15"
        fontFamily="Urbanist, sans-serif"
        fontSize="16"
        fontWeight="700"
        letterSpacing="0.5"
        fill="currentColor"
      >
        FLOWLOG
      </text>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={className}>
        <FlowIcon />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={className}>
        <Wordmark />
      </div>
    );
  }

  // Full logo - icon + wordmark
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ height }}>
      <FlowIcon />
      <div className="flex flex-col justify-center">
        <span 
          style={{ 
            fontFamily: 'Urbanist, sans-serif',
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            letterSpacing: '0.02em',
            lineHeight: 1
          }}
          className="text-white"
        >
          FLOWLOG
        </span>
      </div>
    </div>
  );
}

// Add custom animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dashoffset: 87.96;
    }
    50% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -87.96;
    }
  }

  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }

  .animate-dash {
    animation: dash 3s ease-in-out infinite;
  }
`;

if (typeof document !== 'undefined' && !document.querySelector('#flowlog-logo-styles')) {
  style.id = 'flowlog-logo-styles';
  document.head.appendChild(style);
}
