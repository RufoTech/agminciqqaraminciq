// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.userSlice);

  // user?.user?.role — çünki setUser({ user: data.user }) formatı ilə saxlanılır
  if (!isAuthenticated || user?.user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;