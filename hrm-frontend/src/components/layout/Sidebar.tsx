import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { navItems } from "../config/navigation";
import { NavItem, SubNavItem } from "../../types/navigation";


interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  userRole: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDesktop: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  userRole,
  isCollapsed,
  onToggleCollapse,
  isDesktop,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Expanded items tracking
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const currentPath = location.pathname;
    const activeParent = navItems.find(
      (item) =>
        currentPath === item.path ||
        currentPath.startsWith(item.path + "/") ||
        item.subItems.some(
          (sub) =>
            currentPath === sub.path ||
            (sub.path.includes(":") &&
              currentPath.startsWith(sub.path.split(":")[0]))
        )
    );
    return activeParent ? new Set([activeParent.id]) : new Set();
  });

  // Hover flyout state (collapsed desktop mode)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============ Auto-expand active parent on route change ============
  useEffect(() => {
    const currentPath = location.pathname;
    const activeParent = navItems.find(
      (item) =>
        currentPath === item.path ||
        currentPath.startsWith(item.path + "/") ||
        item.subItems.some(
          (sub) =>
            currentPath === sub.path ||
            (sub.path.includes(":") &&
              currentPath.startsWith(sub.path.split(":")[0]))
        )
    );

    if (activeParent) {
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        newSet.add(activeParent.id);
        return newSet;
      });
    }
  }, [location.pathname]);

  // Cleanup hover timeout
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // ============ Helpers ============
  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(userRole);
  };

  const isSubItemActive = (subPath: string): boolean => {
    const currentPath = location.pathname;
    if (subPath.includes(":")) {
      const pathPrefix = subPath.split(":")[0];
      return currentPath.startsWith(pathPrefix);
    }
    return currentPath === subPath;
  };

  const isParentActive = (item: NavItem): boolean => {
    const currentPath = location.pathname;
    if (item.subItems.length === 0) {
      return currentPath === item.path;
    }
    return (
      currentPath === item.path ||
      currentPath.startsWith(item.path + "/") ||
      item.subItems.some((sub) => isSubItemActive(sub.path))
    );
  };

  // ============ Handlers ============
  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleParentClick = (item: NavItem) => {
    if (item.subItems.length === 0) {
      navigate(item.path);
      if (!isDesktop) onMobileClose();
      return;
    }

    // Collapsed desktop mode: navigate to first sub item
    if (isCollapsed && isDesktop) {
      const firstSub = item.subItems.find((sub) => !sub.path.includes(":"));
      if (firstSub) {
        navigate(firstSub.path);
      }
      return;
    }

    // Normal mode: toggle expand
    toggleExpand(item.id);
  };

  const handleSubItemClick = (subItem: SubNavItem) => {
    if (subItem.path.includes(":")) return;
    navigate(subItem.path);
    if (!isDesktop) onMobileClose();
  };

  const handleMouseEnter = (itemId: string, hasSubItems: boolean) => {
    if (!isCollapsed || !isDesktop || !hasSubItems) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredItem(itemId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 150);
  };

  const filteredNavItems = navItems.filter((item) => hasAccess(item.roles));

  // ============ Determine layout states ============
  // On mobile: always full width (w-64), controlled by isMobileOpen
  // On desktop: width depends on isCollapsed
  const sidebarWidth = isDesktop
    ? isCollapsed
      ? "lg:w-20"
      : "lg:w-64"
    : "w-72";

  const sidebarTransform = isDesktop
    ? "lg:translate-x-0"
    : isMobileOpen
      ? "translate-x-0"
      : "-translate-x-full";

  const showCollapsedStyle = isDesktop && isCollapsed;

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-50 h-dvh
          bg-white
          border-r border-slate-200
          shadow-lg lg:shadow-none
          transition-all duration-300 ease-in-out
          flex flex-col
          ${sidebarWidth}
          ${sidebarTransform}
        `}
      >
        {/* ============ HEADER ============ */}
        <div className="relative flex items-center justify-between h-16 px-4 border-b border-slate-200 flex-shrink-0">
          {/* Logo */}
          <div
            className={`
              flex items-center gap-2 transition-opacity duration-200
              ${showCollapsedStyle ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
            `}
          >
            <img
              src="/logo.png"
              alt="PirisaHR"
              className="w-8 h-8 object-contain flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-bold text-slate-800 text-lg tracking-tight whitespace-nowrap">
              PirisaHR
            </span>
          </div>

          {/* Collapsed logo (centered) */}
          {showCollapsedStyle && (
            <img
              src="/logo.png"
              alt="PirisaHR"
              className="w-8 h-8 object-contain mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          {/* ===== Mobile Close Button ===== */}
          {!isDesktop && (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Close sidebar"
            >
              <FaTimes size={16} />
            </button>
          )}

          {/* ===== Desktop Collapse Toggle ===== */}
          {isDesktop && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`
                flex items-center justify-center
                h-7 w-7 rounded-full
                bg-white border border-slate-200
                text-slate-500 hover:text-sky-600 hover:border-sky-300
                shadow-sm transition-all duration-200
                ${
                  showCollapsedStyle
                    ? "absolute -right-3.5 top-4 z-10"
                    : "flex-shrink-0"
                }
              `}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <FaChevronRight size={10} />
              ) : (
                <FaChevronLeft size={10} />
              )}
            </button>
          )}
        </div>

        {/* ============ NAVIGATION ============ */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 sidebar-scroll">
          <ul className={`space-y-1 ${showCollapsedStyle ? "px-2" : "px-3"}`}>
            {filteredNavItems.map((item) => {
              const filteredSubItems = item.subItems.filter((sub) =>
                hasAccess(sub.roles)
              );

              if (
                item.subItems.length > 0 &&
                filteredSubItems.length === 0 &&
                !item.path
              ) {
                return null;
              }

              const isActive = isParentActive(item);
              const isExpanded = expandedItems.has(item.id);
              const Icon = item.icon;
              const showFlyout =
                showCollapsedStyle &&
                hoveredItem === item.id &&
                filteredSubItems.length > 0;

              return (
                <li
                  key={item.id}
                  className="relative"
                  onMouseEnter={() =>
                    handleMouseEnter(item.id, filteredSubItems.length > 0)
                  }
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Parent Button */}
                  <button
                    type="button"
                    onClick={() => handleParentClick(item)}
                    title={showCollapsedStyle ? item.label : undefined}
                    className={`
                      group w-full flex items-center
                      rounded-xl transition-all duration-200
                      ${
                        showCollapsedStyle
                          ? "justify-center px-0 py-3"
                          : "justify-between px-3 py-2.5"
                      }
                      text-sm font-medium
                      ${
                        isActive
                          ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                          : "text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                      }
                    `}
                  >
                    <span
                      className={`flex items-center ${
                        showCollapsedStyle ? "" : "gap-3"
                      }`}
                    >
                      <Icon
                        className={`
                          text-base flex-shrink-0 transition-all duration-200
                          ${
                            isActive
                              ? "text-white"
                              : "text-slate-500 group-hover:text-sky-600 group-hover:scale-110"
                          }
                        `}
                      />
                      {!showCollapsedStyle && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </span>

                    {!showCollapsedStyle && filteredSubItems.length > 0 && (
                      <FaChevronDown
                        size={10}
                        className={`
                          flex-shrink-0 transition-transform duration-200
                          ${isExpanded ? "rotate-180" : "rotate-0"}
                        `}
                      />
                    )}
                  </button>

                  {/* ===== Expanded Sub Menu (normal mode) ===== */}
                  {!showCollapsedStyle &&
                    isExpanded &&
                    filteredSubItems.length > 0 && (
                      <ul className="mt-1 ml-3 pl-3 border-l-2 border-slate-100 space-y-0.5">
                        {filteredSubItems.map((subItem) => {
                          const isDynamic = subItem.path.includes(":");
                          if (isDynamic) {
                            const isDynamicActive = isSubItemActive(
                              subItem.path
                            );
                            if (!isDynamicActive) return null;
                          }

                          const subActive = isSubItemActive(subItem.path);
                          return (
                            <li key={subItem.id}>
                              <button
                                type="button"
                                onClick={() => handleSubItemClick(subItem)}
                                disabled={isDynamic}
                                className={`
                                  w-full flex items-center gap-2
                                  rounded-lg px-3 py-2
                                  text-xs font-medium text-left
                                  transition-all duration-150
                                  ${
                                    subActive
                                      ? "bg-sky-50 text-sky-600"
                                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                  }
                                  ${isDynamic ? "cursor-default" : ""}
                                `}
                              >
                                <span
                                  className={`
                                    w-1.5 h-1.5 rounded-full flex-shrink-0
                                    ${
                                      subActive
                                        ? "bg-sky-500"
                                        : "bg-slate-300"
                                    }
                                  `}
                                />
                                <span className="truncate">
                                  {subItem.label}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                  {/* ===== Flyout Sub Menu (collapsed desktop mode) ===== */}
                  {showFlyout && (
                    <div
                      onMouseEnter={() => handleMouseEnter(item.id, true)}
                      onMouseLeave={handleMouseLeave}
                      className="
                        absolute left-full top-0 ml-2 z-[60]
                        min-w-[210px]
                        bg-white rounded-xl
                        border border-slate-200
                        shadow-xl shadow-slate-300/30
                        p-2
                        animate-in fade-in slide-in-from-left-1 duration-150
                      "
                    >
                      <div className="px-3 py-2 mb-1 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {item.label}
                        </p>
                      </div>
                      <ul className="space-y-0.5">
                        {filteredSubItems.map((subItem) => {
                          const isDynamic = subItem.path.includes(":");
                          if (isDynamic) {
                            const isDynamicActive = isSubItemActive(
                              subItem.path
                            );
                            if (!isDynamicActive) return null;
                          }

                          const subActive = isSubItemActive(subItem.path);
                          return (
                            <li key={subItem.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  handleSubItemClick(subItem);
                                  setHoveredItem(null);
                                }}
                                disabled={isDynamic}
                                className={`
                                  w-full flex items-center gap-2
                                  rounded-lg px-3 py-2
                                  text-xs font-medium text-left
                                  transition-all duration-150
                                  ${
                                    subActive
                                      ? "bg-sky-50 text-sky-600"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                  }
                                  ${isDynamic ? "cursor-default" : ""}
                                `}
                              >
                                <span
                                  className={`
                                    w-1.5 h-1.5 rounded-full flex-shrink-0
                                    ${
                                      subActive
                                        ? "bg-sky-500"
                                        : "bg-slate-300"
                                    }
                                  `}
                                />
                                <span className="truncate">
                                  {subItem.label}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ============ FOOTER ============ */}
        {!showCollapsedStyle && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200">
            <p className="text-[10px] text-slate-400 text-center font-medium">
              © {new Date().getFullYear()} PirisaHR
            </p>
          </div>
        )}
      </aside>
    </>
  );
};