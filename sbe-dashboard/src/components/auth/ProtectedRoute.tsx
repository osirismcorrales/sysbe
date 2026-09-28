import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUserRole } from '../../features/auth/utils/authUtils';

export function ProtectedRoute() {
    const token = localStorage.getItem('token');
    const role = getUserRole();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    
    if (role !== 'ADMINISTRADOR' && role !== 'EMPLEADO') {
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;