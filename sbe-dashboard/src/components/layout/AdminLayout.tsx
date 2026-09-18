import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SocioFormModal from '../../features/socios/components/SocioFormModal';

export function AdminLayout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewSocioOpen, setIsNewSocioOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on navigation (for mobile drawer)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Determine page title based on path
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/usuarios':
        return 'Gestión de Usuarios';
      case '/socios':
        return 'Gestión de Socios';
      case '/reservas':
        return 'Gestión de Reservas';
      case '/servicios':
        return 'Gestión de Servicios';
      case '/accesos':
        return 'Registro de Ingresos y Egresos';
      case '/finanzas':
        return 'Finanzas y Reportes';
      case '/encuestas':
        return 'Encuestas de Satisfacción';
      case '/empleados':
        return 'Gestión de Empleados';
      case '/puntos':
        return 'Sistema de Puntos y Promociones';
      default:
        return 'SBE Admin';
    }
  };

  const showSearchAndSocio = ['/', '/socios'].includes(location.pathname);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans antialiased">
      {/* Sidebar (Left) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Area (Right) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <Header
          title={getPageTitle(location.pathname)}
          onNewSocioClick={showSearchAndSocio ? () => setIsNewSocioOpen(true) : undefined}
          searchQuery={showSearchAndSocio ? searchQuery : undefined}
          onSearchChange={showSearchAndSocio ? setSearchQuery : undefined}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>

      {/* Global Modals */}
      <SocioFormModal
        open={isNewSocioOpen}
        onOpenChange={setIsNewSocioOpen}
      />
    </div>
  );
}
export default AdminLayout;
