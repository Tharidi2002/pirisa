import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import Header from "./Header";
import TabHeader from "./TabHeader";

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = () => {
  const location = useLocation();
  const userRole = localStorage.getItem("role") || "EMPLOYEE";

  // Mobile sidebar visibility (slide-in overlay)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Desktop sidebar collapsed state (persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("hrmSidebarCollapsed");
    return saved ? saved === "true" : false;
  });

  // Detect screen size
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  // ============ Effects ============
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      // Auto-close mobile sidebar when resizing to desktop
      if (desktop) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem("hrmSidebarCollapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen && !isDesktop) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen, isDesktop]);

  // ============ Handlers ============
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const toggleSidebarMode = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Calculate content padding based on sidebar state
  const contentPadding = isDesktop
    ? isSidebarCollapsed
      ? "lg:pl-20"
      : "lg:pl-64"
    : "pl-0";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ============ SIDEBAR ============ */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        userRole={userRole}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarMode}
        isDesktop={isDesktop}
      />

      {/* ============ MOBILE BACKDROP ============ */}
      {isMobileSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ============ MAIN CONTENT ============ */}
      <div
        className={`
          min-w-0 min-h-screen
          transition-[padding] duration-300 ease-in-out
          ${contentPadding}
        `}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30">
          <Header toggleSidebar={toggleMobileSidebar} />
        </div>

        {/* Breadcrumb Tab Header */}
        <TabHeader pathname={location.pathname} />

        {/* Page Content */}
        <main className="p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};