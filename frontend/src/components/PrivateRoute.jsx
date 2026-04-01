// src/components/PrivateRoute.jsx
// Yalnız admin üçün — mövcud komponent dəyişmədi
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.userSlice);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.user?.role !== 'admin') {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  return children;
};

export default PrivateRoute;