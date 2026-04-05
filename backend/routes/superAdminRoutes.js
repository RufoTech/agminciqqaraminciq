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
  getAllUsers,
  getUserById,
  blockAdmin,
  unblockAdmin,
  setAdminProductLimit,
  getAllSuperAdmins,
  blockUser,
  unblockUser,
  deleteUser,
  toggleBloggerStatus,
} from "../controller/superAdminController.js";

import {
    isAuthenticatedUser,
    authorizeRoles,
    isApprovedSeller,
    isSuperAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// ===================== SUPERADMIN AUTENTİFİKASİYA =====================
router.post("/register", registerSuperAdmin);
router.post("/login", superAdminLogin);
router.get("/logout", superAdminLogout);
router.post("/password/forgot", superAdminForgotPassword);
router.put("/password/reset/:token", superAdminResetPassword);

// ===================== ADMİN İDARƏETMƏ =====================
router.get("/admins",     isAuthenticatedUser, isSuperAdmin, getAllAdmins);
router.get("/admins/:id", isAuthenticatedUser, isSuperAdmin, getAdminById);
router.post("/admins",    isAuthenticatedUser, isSuperAdmin, createAdminBySuperAdmin);
router.put("/admins/:id", isAuthenticatedUser, isSuperAdmin, updateAdminBySuperAdmin);
router.delete("/admins/:id", isAuthenticatedUser, isSuperAdmin, deleteAdminBySuperAdmin);
router.patch("/admins/:id/status",        isAuthenticatedUser, isSuperAdmin, updateAdminStatus);
router.patch("/admins/:id/block",         isAuthenticatedUser, isSuperAdmin, blockAdmin);
router.patch("/admins/:id/unblock",       isAuthenticatedUser, isSuperAdmin, unblockAdmin);
router.patch("/admins/:id/product-limit", isAuthenticatedUser, isSuperAdmin, setAdminProductLimit);

// ===================== İSTİFADƏÇİ İDARƏETMƏ =====================
router.get("/users",              isAuthenticatedUser, isSuperAdmin, getAllUsers);
router.get("/users/:id",          isAuthenticatedUser, isSuperAdmin, getUserById);
router.patch("/users/:id/block",  isAuthenticatedUser, isSuperAdmin, blockUser);
router.patch("/users/:id/unblock",isAuthenticatedUser, isSuperAdmin, unblockUser);
router.delete("/users/:id",       isAuthenticatedUser, isSuperAdmin, deleteUser);

// ===================== BLOGGER İDARƏETMƏ (SuperAdmin) =====================
router.patch("/bloggers/:id/toggle-status", isAuthenticatedUser, isSuperAdmin, toggleBloggerStatus);

// ===================== SUPERADMİN SİYAHISI =====================
router.get("/superadmins", isAuthenticatedUser, isSuperAdmin, getAllSuperAdmins);

export default router;
