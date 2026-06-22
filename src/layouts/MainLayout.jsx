import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">

      <Navbar
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex">

        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 md:ml-64 h-[calc(100vh-64px)] overflow-y-auto p-4 md:p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default MainLayout;