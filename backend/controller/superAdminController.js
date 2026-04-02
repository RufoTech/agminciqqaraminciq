import express from "express";
import {
  registerSuperAdmin,
  superAdminLogin,
  superAdminLogout,
  getAllAdmins,
  getAdminById,
  createAdminBySuperAdmin,
  updateAdminBySuperAdmin,
  deleteAdminBySuperAdmin,
  updateAdminStatus,
  superAdminForgotPassword,
  superAdminResetPassword,
} from "../controller/superAdminController.js";

import {
  isAuthenticatedUser,
  isSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ===================== SUPERADMIN AUTENTİFİKASİYA =====================
// NOT: /register route-u yalnız bir dəfə istifadə edilməlidir
router.post("/register", registerSuperAdmin);
router.post("/login", superAdminLogin);
router.get("/logout", superAdminLogout);
router.post("/password/forgot", superAdminForgotPassword);
router.put("/password/reset/:token", superAdminResetPassword);

// ===================== ADMİN İDARƏETMƏ (yalnız superadmin) =====================
router.get("/admins", isAuthenticatedUser, isSuperAdmin, getAllAdmins);
router.get("/admins/:id", isAuthenticatedUser, isSuperAdmin, getAdminById);
router.post(
  "/admins",
  isAuthenticatedUser,
  isSuperAdmin,
  createAdminBySuperAdmin,
);
router.put(
  "/admins/:id",
  isAuthenticatedUser,
  isSuperAdmin,
  updateAdminBySuperAdmin,
);
router.delete(
  "/admins/:id",
  isAuthenticatedUser,
  isSuperAdmin,
  deleteAdminBySuperAdmin,
);
router.patch(
  "/admins/:id/status",
  isAuthenticatedUser,
  isSuperAdmin,
  updateAdminStatus,
);

export default router;
