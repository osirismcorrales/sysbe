import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from '../context/DataContext';
import AdminLayout from '../components/layout/AdminLayout';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import UsuariosPage from '../features/usuarios/pages/UsuariosPage';
import SociosPage from '../features/socios/pages/SociosPage';
import ReservasPage from '../features/reservas/pages/ReservasPage';
import ServiciosPage from '../features/servicios/pages/ServiciosPage';
import AccesosPage from '../features/accesos/pages/AccesosPage';
import FinanzasPage from '../features/finanzas/pages/FinanzasPage';
import EncuestasPage from '../features/encuestas/pages/EncuestasPage';
import EmpleadosPage from '../features/empleados/pages/EmpleadosPage';
import PuntosPage from '../features/puntos/pages/PuntosPage';

export function AppRoutes() {
  return (
    <DataProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/socios" element={<SociosPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/accesos" element={<AccesosPage />} />
            <Route path="/finanzas" element={<FinanzasPage />} />
            <Route path="/encuestas" element={<EncuestasPage />} />
            <Route path="/empleados" element={<EmpleadosPage />} />
            <Route path="/puntos" element={<PuntosPage />} />

            {/* Redirects from old routes */}
            <Route path="/pagos" element={<Navigate to="/finanzas" replace />} />
            <Route path="/mantenimiento" element={<Navigate to="/finanzas" replace />} />
            <Route path="/reportes" element={<Navigate to="/finanzas" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
export default AppRoutes;

