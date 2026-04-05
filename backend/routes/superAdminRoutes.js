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

// Blogger controller-dən lazım olan funksiyalar
import {
  getAllBloggers,
  getBloggerById,
  createBlogger,
  updateBlogger,
  deleteBlogger,
  updateBloggerCommission,
  payBloggerCommission,
} from "../controller/bloggerController.js";

import {
    isAuthenticatedUser,
    authorizeRoles,
    isApprovedSeller,
    isSuperAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// ===================== SUPERADMIN AUTENTİFİKASİYA =====================
router.post("/register",              registerSuperAdmin);
router.post("/login",                 superAdminLogin);
router.get("/logout",                 superAdminLogout);
router.post("/password/forgot",       superAdminForgotPassword);
router.put("/password/reset/:token",  superAdminResetPassword);

// ===================== ADMİN İDARƏETMƏ =====================
router.get("/admins",                          isAuthenticatedUser, isSuperAdmin, getAllAdmins);
router.get("/admins/:id",                      isAuthenticatedUser, isSuperAdmin, getAdminById);
router.post("/admins",                         isAuthenticatedUser, isSuperAdmin, createAdminBySuperAdmin);
router.put("/admins/:id",                      isAuthenticatedUser, isSuperAdmin, updateAdminBySuperAdmin);
router.delete("/admins/:id",                   isAuthenticatedUser, isSuperAdmin, deleteAdminBySuperAdmin);
router.patch("/admins/:id/status",             isAuthenticatedUser, isSuperAdmin, updateAdminStatus);
router.patch("/admins/:id/block",              isAuthenticatedUser, isSuperAdmin, blockAdmin);
router.patch("/admins/:id/unblock",            isAuthenticatedUser, isSuperAdmin, unblockAdmin);
router.patch("/admins/:id/product-limit",      isAuthenticatedUser, isSuperAdmin, setAdminProductLimit);

// ===================== İSTİFADƏÇİ İDARƏETMƏ =====================
router.get("/users",                           isAuthenticatedUser, isSuperAdmin, getAllUsers);
router.get("/users/:id",                       isAuthenticatedUser, isSuperAdmin, getUserById);
router.patch("/users/:id/block",               isAuthenticatedUser, isSuperAdmin, blockUser);
router.patch("/users/:id/unblock",             isAuthenticatedUser, isSuperAdmin, unblockUser);
router.delete("/users/:id",                    isAuthenticatedUser, isSuperAdmin, deleteUser);

// ===================== BLOGGER İDARƏETMƏ =====================
// Sıra vacibdir: /bloggers/create → /bloggers/:id-dən ƏVVƏL gəlməlidir
router.get("/bloggers",                        isAuthenticatedUser, isSuperAdmin, getAllBloggers);
router.post("/bloggers/create",                isAuthenticatedUser, isSuperAdmin, createBlogger);
router.get("/bloggers/:id",                    isAuthenticatedUser, isSuperAdmin, getBloggerById);
router.put("/bloggers/:id",                    isAuthenticatedUser, isSuperAdmin, updateBlogger);
router.delete("/bloggers/:id",                 isAuthenticatedUser, isSuperAdmin, deleteBlogger);
router.put("/bloggers/:id/commission",         isAuthenticatedUser, isSuperAdmin, updateBloggerCommission);
router.post("/bloggers/:id/pay-commission",    isAuthenticatedUser, isSuperAdmin, payBloggerCommission);
router.patch("/bloggers/:id/toggle-status",    isAuthenticatedUser, isSuperAdmin, toggleBloggerStatus);

// ===================== SUPERADMİN SİYAHISI =====================
router.get("/superadmins",                     isAuthenticatedUser, isSuperAdmin, getAllSuperAdmins);

export default router;