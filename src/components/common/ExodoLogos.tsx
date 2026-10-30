import React from 'react';

interface LogoProps {
  className?: string;
  color?: string; // default #0D253A or currentColor
  size?: number;
}

/**
 * Official Logo 1: Emblem (Σ with street wings/flames)
 */
export const ExodoEmblemLogo: React.FC<LogoProps> = ({ 
  className = "w-10 h-10", 
  color = "#0D253A" 
}) => {
  return (
    <svg
      viewBox="0 0 1000 1000"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Central stylized Greek Sigma (Σ) */}
      <path d="M320 120 H670 C685 120 690 135 680 145 L460 380 L680 615 C690 625 685 640 670 640 H320 C305 640 300 625 310 615 L480 430 L310 245 C300 235 305 220 320 220 Z" />
      {/* Left wing flame */}
      <path d="M210 50 C210 50 80 180 80 400 C80 650 250 850 400 950 C380 880 320 780 340 670 C360 560 280 480 200 420 C140 370 120 280 180 160 C200 120 210 50 210 50 Z" />
      {/* Left inner wing accent */}
      <path d="M300 850 C240 760 180 650 180 500 C180 390 220 300 260 240 C220 310 200 400 220 500 C240 600 320 720 370 790 Z" />
      {/* Right wing flame */}
      <path d="M790 50 C790 50 920 180 920 400 C920 650 750 850 600 950 C620 880 680 780 660 670 C640 560 720 480 800 420 C860 370 880 280 820 160 C800 120 790 50 790 50 Z" />
      {/* Right inner wing accent */}
      <path d="M700 850 C760 760 820 650 820 500 C820 390 780 300 740 240 C780 310 800 400 780 500 C760 600 680 720 630 790 Z" />
    </svg>
  );
};

/**
 * Official Logo 2: Wordmark ("ΣXODO" bold geometric typography)
 */
export const ExodoWordmarkLogo: React.FC<LogoProps> = ({ 
  className = "h-8 w-auto", 
  color = "#0D253A" 
}) => {
  return (
    <svg
      viewBox="0 0 1000 250"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Σ (Sigma) */}
      <path d="M40 25 H170 C185 25 190 35 180 45 L110 125 L180 205 C190 215 185 225 170 225 H40 C25 225 20 215 30 205 L80 145 L30 45 C20 35 25 25 40 25 Z" />
      
      {/* X */}
      <path d="M210 25 H255 L325 125 L395 25 H440 L350 140 L445 225 H400 L325 155 L250 225 H205 L300 140 Z" />
      
      {/* O (First O) */}
      <path d="M525 20 C585 20 635 65 635 125 C635 185 585 230 525 230 C465 230 415 185 415 125 C415 65 465 20 525 20 Z M525 65 C490 65 465 92 465 125 C465 158 490 185 525 185 C560 185 585 158 585 125 C585 92 560 65 525 65 Z" />
      
      {/* D */}
      <path d="M660 25 H740 C800 25 845 65 845 125 C845 185 800 225 740 225 H660 Z M710 70 V180 H740 C775 180 795 155 795 125 C795 95 775 70 740 70 Z" />
      
      {/* O (Second O) */}
      <path d="M910 20 C970 20 1020 65 1020 125 C1020 185 970 230 910 230 C850 230 800 185 800 125 C800 65 850 20 910 20 Z M910 65 C875 65 850 92 850 125 C850 158 875 185 910 185 C945 185 970 158 970 125 C970 92 945 65 910 65 Z" />
    </svg>
  );
};

/**
 * Official Logo 3: Horizontal Sword Logo (Sword hilt with wings, ΣXODO wordmark, sword tip)
 */
export const ExodoSwordLogo: React.FC<LogoProps> = ({ 
  className = "h-12 w-auto", 
  color = "#0D253A" 
}) => {
  return (
    <svg
      viewBox="0 0 1200 300"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Hilt & Wings */}
      <path d="M50 150 L10 125 L35 150 L10 175 Z M60 110 C80 60 130 30 190 20 C160 50 150 90 170 130 C130 110 80 120 60 110 Z M60 190 C80 240 130 270 190 280 C160 250 150 210 170 170 C130 190 80 180 60 190 Z" />
      <path d="M160 70 C200 40 250 20 310 10 C270 40 240 80 240 130 C200 90 170 80 160 70 Z M160 230 C200 260 250 280 310 290 C270 260 240 220 240 170 C200 210 170 220 160 230 Z" />
      
      {/* Central ΣXODO Wordmark */}
      <g transform="translate(250, 45) scale(0.65)">
        {/* Σ */}
        <path d="M40 25 H170 C185 25 190 35 180 45 L110 125 L180 205 C190 215 185 225 170 225 H40 C25 225 20 215 30 205 L80 145 L30 45 C20 35 25 25 40 25 Z" />
        {/* X */}
        <path d="M210 25 H255 L325 125 L395 25 H440 L350 140 L445 225 H400 L325 155 L250 225 H205 L300 140 Z" />
        {/* O */}
        <path d="M525 20 C585 20 635 65 635 125 C635 185 585 230 525 230 C465 230 415 185 415 125 C415 65 465 20 525 20 Z M525 65 C490 65 465 92 465 125 C465 158 490 185 525 185 C560 185 585 158 585 125 C585 92 560 65 525 65 Z" />
        {/* D */}
        <path d="M660 25 H740 C800 25 845 65 845 125 C845 185 800 225 740 225 H660 Z M710 70 V180 H740 C775 180 795 155 795 125 C795 95 775 70 740 70 Z" />
        {/* O */}
        <path d="M910 20 C970 20 1020 65 1020 125 C1020 185 970 230 910 230 C850 230 800 185 800 125 C800 65 850 20 910 20 Z M910 65 C875 65 850 92 850 125 C850 158 875 185 910 185 C945 185 970 158 970 125 C970 92 945 65 910 65 Z" />
      </g>

      {/* Right Sword Tip Blade */}
      <path d="M980 140 H1100 L1150 150 L1100 160 H980 Z" />
      <path d="M1000 100 C1030 110 1060 130 1080 150 C1060 170 1030 190 1000 200 C1020 180 1040 160 1040 150 C1040 140 1020 120 1000 100 Z" />
      <path d="M1090 110 L1180 150 L1090 190 L1120 150 Z" />
    </svg>
  );
};

/**
 * Official Logo 4: Circular Seal / Crest ("DIOS FUERA DEL TEMPLO • CARACAS • 2024")
 */
export const ExodoBadgeLogo: React.FC<LogoProps> = ({
  className = "w-12 h-12",
  color = "#0D253A"
}) => {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circular borders */}
      <circle cx="200" cy="200" r="190" stroke={color} strokeWidth="6" strokeDasharray="10 5" />
      <circle cx="200" cy="200" r="172" stroke={color} strokeWidth="3" />
      <circle cx="200" cy="200" r="120" stroke={color} strokeWidth="2" />

      {/* Central stylized Sigma + Cross */}
      <path
        d="M160 140 H240 L190 200 L240 260 H160"
        stroke={color}
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="200" y1="120" x2="200" y2="280" stroke={color} strokeWidth="4" strokeDasharray="4 4" />

      {/* Circular text simulation: Top & Bottom badges */}
      <text
        x="200"
        y="65"
        textAnchor="middle"
        fill={color}
        fontSize="20"
        fontWeight="900"
        letterSpacing="6"
        fontFamily="sans-serif"
      >
        DIOS FUERA DEL TEMPLO
      </text>
      <text
        x="200"
        y="350"
        textAnchor="middle"
        fill={color}
        fontSize="16"
        fontWeight="800"
        letterSpacing="8"
        fontFamily="sans-serif"
      >
        CARACAS • EST. 2024
      </text>

      {/* Stars on sides */}
      <polygon points="50,200 55,208 65,208 57,215 60,225 50,218 40,225 43,215 35,208 45,208" fill={color} />
      <polygon points="350,200 355,208 365,208 357,215 360,225 350,218 340,225 343,215 335,208 345,208" fill={color} />
    </svg>
  );
};

/**
 * Unified Logo Dispatcher Component
 */
export const ExodoBrandLogo: React.FC<{
  variant?: 'emblem' | 'wordmark' | 'sword' | 'badge';
  className?: string;
  color?: string;
}> = ({ variant = 'emblem', className, color = '#C8C3B3' }) => {
  switch (variant) {
    case 'wordmark':
      return <ExodoWordmarkLogo className={className || 'h-8 w-auto'} color={color} />;
    case 'sword':
      return <ExodoSwordLogo className={className || 'h-10 w-auto'} color={color} />;
    case 'badge':
      return <ExodoBadgeLogo className={className || 'w-10 h-10'} color={color} />;
    case 'emblem':
    default:
      return <ExodoEmblemLogo className={className || 'w-10 h-10'} color={color} />;
  }
};
