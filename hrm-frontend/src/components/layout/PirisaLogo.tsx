import React from "react";

interface PirisaLogoProps {
  /** Show only the icon (no text) */
  iconOnly?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Variant for different backgrounds */
  variant?: "default" | "white";
}

const sizeMap = {
  sm: { icon: 28, text: 16 },
  md: { icon: 36, text: 20 },
  lg: { icon: 44, text: 24 },
};

export const PirisaLogo: React.FC<PirisaLogoProps> = ({
  iconOnly = false,
  size = "md",
  className = "",
  variant = "default",
}) => {
  const { icon, text } = sizeMap[size];
  const textColor = variant === "white" ? "#FFFFFF" : "#0F172A";

  if (iconOnly) {
    return (
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect x="0" y="0" width="50" height="50" rx="12" fill="url(#iconGradient)"/>
        <path
          d="M14 15H27C31.4 15 35 18.6 35 23C35 27.4 31.4 31 27 31H21V38H14V15ZM21 24H27C27.6 24 28 23.6 28 23C28 22.4 27.6 22 27 22H21V24Z"
          fill="white"
        />
        <circle cx="39" cy="38" r="3" fill="#FBBF24"/>
        <defs>
          <linearGradient id="iconGradient" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0EA5E9"/>
            <stop offset="1" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  const textWidth = text * 5.2;
  const totalWidth = icon + textWidth + 20;

  return (
    <svg
      width={totalWidth}
      height={icon}
      viewBox={`0 0 ${totalWidth} ${icon}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Icon */}
      <rect
        x="0"
        y={icon * 0.1}
        width={icon * 0.8}
        height={icon * 0.8}
        rx={icon * 0.22}
        fill="url(#logoGradient)"
      />
      <path
        d={`M${icon * 0.22} ${icon * 0.28}H${icon * 0.43}C${icon * 0.53} ${icon * 0.28} ${icon * 0.6} ${icon * 0.35} ${icon * 0.6} ${icon * 0.45}C${icon * 0.6} ${icon * 0.55} ${icon * 0.53} ${icon * 0.62} ${icon * 0.43} ${icon * 0.62}H${icon * 0.35}V${icon * 0.78}H${icon * 0.22}V${icon * 0.28}ZM${icon * 0.35} ${icon * 0.5}H${icon * 0.43}C${icon * 0.45} ${icon * 0.5} ${icon * 0.47} ${icon * 0.48} ${icon * 0.47} ${icon * 0.45}C${icon * 0.47} ${icon * 0.42} ${icon * 0.45} ${icon * 0.4} ${icon * 0.43} ${icon * 0.4}H${icon * 0.35}V${icon * 0.5}Z`}
        fill="white"
      />
      <circle cx={icon * 0.72} cy={icon * 0.78} r={icon * 0.06} fill="#FBBF24"/>

      {/* Text: Pirisa */}
      <text
        x={icon + 8}
        y={icon * 0.68}
        fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
        fontSize={text}
        fontWeight="800"
        fill={textColor}
        letterSpacing="-0.5"
      >
        Pirisa
      </text>

      {/* Text: HR */}
      <text
        x={icon + 8 + text * 3.4}
        y={icon * 0.68}
        fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
        fontSize={text}
        fontWeight="800"
        fill="#0EA5E9"
        letterSpacing="-0.5"
      >
        HR
      </text>

      <defs>
        <linearGradient
          id="logoGradient"
          x1="0"
          y1={icon * 0.1}
          x2={icon * 0.8}
          y2={icon * 0.9}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0EA5E9"/>
          <stop offset="1" stopColor="#2563EB"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default PirisaLogo;