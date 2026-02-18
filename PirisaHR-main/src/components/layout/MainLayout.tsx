import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import Header from "./Header";
import TabHeader from "./TabHeader";

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const location = useLocation();
const userRole = localStorage.getItem("role") || "EMPLOYEE";
  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isVisible={isSidebarVisible} userRole={userRole}/>
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarVisible ? "lg:ml-72 ml-0" : "lg:ml-36 md:ml-1 ml-0"
        }`}
      >
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarVisible={isSidebarVisible}
        />
        <TabHeader pathname={location.pathname} />
        <main className="p-6">
          <Outlet />
          {location.pathname === "/companyProfile"}
        </main>
      </div>
    </div>
  );
};
