/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronLeft, FaChevronUp, FaCircle } from "react-icons/fa";
import { navItems } from "../config/navigation";
import { TranslatableText } from "../languages/TranslatableText";

interface SidebarProps {
  isVisible: boolean;
  userRole: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isVisible, userRole, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedTabs, setExpandedTabs] = useState(() => {
    const currentMainPath = location.pathname.split("/")[1];
    return new Set([currentMainPath]);
  });
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);

  const isEditPath = location.pathname.includes('/employee/edit/');
  const isMakeSalaryPath = location.pathname.includes('/payrole/makesalary/');
  const isPaySlipsPath = location.pathname.includes('/payrole/payslips/');

  useEffect(() => {
    const newExpandedTabs = new Set(expandedTabs);

    if (isEditPath && !newExpandedTabs.has('employee')) {
      newExpandedTabs.add('employee');
    }

    if ((isMakeSalaryPath || isPaySlipsPath) && !newExpandedTabs.has('payrole')) {
      newExpandedTabs.add('payrole');
    }

    if (newExpandedTabs.size !== expandedTabs.size) {
      setExpandedTabs(newExpandedTabs);
    }
  }, [location.pathname, isEditPath, isMakeSalaryPath, isPaySlipsPath]);

  const toggleExpanded = (tabId: string) => {
    setExpandedTabs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tabId)) {
        newSet.delete(tabId);
      } else {
        newSet.add(tabId);
      }
      return newSet;
    });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(userRole);
  };

  const isSubItemActive = (path: string) => {
    if (path.includes(':id') || path.includes(':employeeId')) {
      const pathSegments = path.split('/');
      const currentSegments = location.pathname.split('/');

      if (pathSegments.length !== currentSegments.length) return false;

      for (let i = 0; i < pathSegments.length; i++) {
        if (pathSegments[i].startsWith(':')) continue;
        if (pathSegments[i] !== currentSegments[i]) return false;
      }
      return true;
    }
    return location.pathname === path;
  };

  const filteredNavItems = navItems.filter(item => hasAccess(item.roles));

  return (
    <div
      className={`fixed left-0 top-0 z-50 h-dvh overflow-y-auto bg-gray-50 border-r border-slate-200 shadow-xl transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      } ${isVisible ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div className="flex items-center justify-between px-3 py-6">
        <div className={`flex items-center justify-center ${isCollapsed ? "w-full" : "w-28"}`}> 
          <img src="/logo.png" alt="PirisaHR" className={`${isCollapsed ? "w-8 h-8" : "w-28 h-10"}`} />
        </div>
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onToggleCollapse}
          className={`hidden lg:flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-sky-50 hover:text-sky-600 ${isCollapsed ? "ml-0" : ""}`}
        >
          <FaChevronLeft className={`transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="mt-2">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const filteredSubItems = item.subItems.filter(subItem => hasAccess(subItem.roles));

            if (item.subItems.length > 0 && filteredSubItems.length === 0 && !item.path) {
              return null;
            }

            const itemActive = location.pathname.startsWith(item.path) || location.pathname === item.path;
            const iconOnly = isCollapsed;
            const showFlyout = iconOnly && filteredSubItems.length > 0 && activeFlyout === item.id;

            return (
              <li key={item.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (filteredSubItems.length === 0) {
                      handleNavigation(item.path);
                      return;
                    }

                    if (isCollapsed) {
                      setActiveFlyout(activeFlyout === item.id ? null : item.id);
                      return;
                    }

                    if (expandedTabs.has(item.id)) {
                      toggleExpanded(item.id);
                    } else {
                      toggleExpanded(item.id);
                    }
                  }}
                  onMouseEnter={() => {
                    if (isCollapsed && filteredSubItems.length > 0) {
                      setActiveFlyout(item.id);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isCollapsed && filteredSubItems.length > 0) {
                      setActiveFlyout(null);
                    }
                  }}
                  className={`group flex w-full items-center rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                    iconOnly ? "justify-center" : "justify-between px-6"
                  } ${itemActive ? "bg-sky-500 text-white hover:bg-sky-500" : "text-gray-700 hover:bg-sky-100"}`}
                  title={iconOnly ? item.label : undefined}
                >
                  <span className="flex items-center">
                    <item.icon className={`text-lg ${iconOnly ? "mr-0" : "mr-4"}`} />
                    {!iconOnly && (
                      <span className="truncate">
                        <TranslatableText text={item.label} />
                      </span>
                    )}
                  </span>

                  {!iconOnly && filteredSubItems.length > 0 && (
                    expandedTabs.has(item.id) ? (
                      <FaChevronUp className="text-sm" />
                    ) : (
                      <FaChevronDown className="text-sm" />
                    )
                  )}
                </button>

                {isCollapsed && filteredSubItems.length > 0 && showFlyout && (
                  <div className="absolute left-[calc(100%+12px)] top-0 z-[70] min-w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                    <div className="mb-2 border-b border-slate-100 px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <TranslatableText text={item.label} />
                    </div>
                    <ul className="space-y-1">
                      {filteredSubItems.map((subItem) => {
                        let shouldShow = true;

                        if (subItem.id === 'edit-employee') shouldShow = isEditPath;
                        else if (subItem.id === 'makesalary') shouldShow = isMakeSalaryPath;
                        else if (subItem.id === 'payslips') shouldShow = isPaySlipsPath;

                        return shouldShow ? (
                          <li key={subItem.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveFlyout(null);
                                if (!subItem.path.includes(':id') && !subItem.path.includes(':employeeId')) {
                                  handleNavigation(subItem.path);
                                }
                              }}
                              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-sky-50 ${
                                isSubItemActive(subItem.path) ? "bg-sky-50 text-sky-600 font-semibold" : "text-slate-600"
                              }`}
                            >
                              <span className="flex items-center">
                                <FaCircle className="mr-2 h-1.5 w-1.5 text-sky-500" />
                                <TranslatableText text={subItem.label} />
                              </span>
                            </button>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}

                {!isCollapsed && expandedTabs.has(item.id) && filteredSubItems.length > 0 && (
                  <ul className="ml-12 mt-2 space-y-2">
                    {filteredSubItems.map((subItem) => {
                      let shouldShow = true;

                      if (subItem.id === 'edit-employee') shouldShow = isEditPath;
                      else if (subItem.id === 'makesalary') shouldShow = isMakeSalaryPath;
                      else if (subItem.id === 'payslips') shouldShow = isPaySlipsPath;

                      return shouldShow ? (
                        <li key={subItem.id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!subItem.path.includes(':id') && !subItem.path.includes(':employeeId')) {
                                handleNavigation(subItem.path);
                              }
                            }}
                            className={`w-full rounded-lg px-4 py-2 text-left text-sm ${
                              isSubItemActive(subItem.path)
                                ? "bg-sky-100 font-medium text-sky-600"
                                : "text-gray-600 hover:bg-sky-100"
                            }`}
                          >
                            <div className="flex flex-row">
                              <FaCircle className={`mr-2.5 mt-1 w-1.5 text-gray-600 ${isSubItemActive(subItem.path) ? "text-sky-600" : ""}`} />
                              <span>
                                <TranslatableText text={subItem.label} />
                              </span>
                            </div>
                          </button>
                        </li>
                      ) : null;
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
