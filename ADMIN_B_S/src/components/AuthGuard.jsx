import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../utils/api';

const AuthGuard = () => {
  if (!api.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
