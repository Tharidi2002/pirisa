import React from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarCTAProps {
  onDismiss?: () => void;
  isDismissible?: boolean;
  isCollapsed?: boolean;
}

export const SidebarCTA: React.FC<SidebarCTAProps> = ({
  onDismiss,
  isDismissible = true,
  isCollapsed = false,
}) => {
  const navigate = useNavigate();

  // Don't show in collapsed mode
  if (isCollapsed) return null;

  return (
    <div className="mx-3 mb-3 relative">
      {/* Dismiss Button */}
      {isDismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="
            absolute top-2 right-2 z-10
            p-1 rounded-md
            text-white/60 hover:text-white hover:bg-white/10
            transition-colors
          "
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>
      )}

      {/* CTA Card */}
      <div
        className="
          relative overflow-hidden
          rounded-2xl
          bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700
          p-4
          shadow-lg shadow-sky-500/25
        "
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/10 blur-lg" />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div
            className="
              w-9 h-9 rounded-xl
              bg-white/20 backdrop-blur-sm
              flex items-center justify-center
              mb-3
            "
          >
            <Sparkles size={18} className="text-white" />
          </div>

          {/* Title */}
          <h3 className="text-white font-bold text-sm mb-1 leading-tight">
            Upgrade to Pro
          </h3>

          {/* Description */}
          <p className="text-sky-100 text-[11px] leading-relaxed mb-3">
            Unlock advanced features, unlimited employees, and priority support.
          </p>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => navigate("/company-settings")}
            className="
              group w-full
              inline-flex items-center justify-between
              bg-white text-sky-700
              px-3 py-2
              rounded-lg
              text-xs font-bold
              hover:bg-sky-50
              transition-all duration-200
              shadow-sm
            "
          >
            <span>Explore Plans</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarCTA;