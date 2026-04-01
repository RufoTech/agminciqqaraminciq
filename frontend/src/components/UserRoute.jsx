// src/components/UserRoute.jsx
// Giriş etmiş istənilən istifadəçi üçün (müştəri + admin)

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.userSlice);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return children;
};

export default UserRoute;