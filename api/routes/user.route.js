import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  savePost,
  profilePosts,
  getNotificationNumber,
  getNotifications,
  getNotificationPreferences,
  markNotificationRead,
  markAllNotificationsRead,
  getRoommateProfile,
  upsertRoommateProfile,
  getRoommateMatches,
  updateNotificationPreferences,
  sendTestNotificationEmail,
  getSavedSearchAlerts,
  createSavedSearchAlert,
  deleteSavedSearchAlert,
} from "../controllers/user.controller.js";
import {verifyToken} from "../src/shared/middleware/verifyToken.js";

const router = express.Router();

router.get("/", getUsers);
// router.get("/search/:id", verifyToken, getUser);
router.get("/notification", verifyToken, getNotificationNumber);
router.get("/notifications", verifyToken, getNotifications);
router.get("/notifications/preferences", verifyToken, getNotificationPreferences);
router.put("/notifications/:id/read", verifyToken, markNotificationRead);
router.put("/notifications/read-all", verifyToken, markAllNotificationsRead);
router.put("/notifications/preferences", verifyToken, updateNotificationPreferences);
router.post("/notifications/test-email", verifyToken, sendTestNotificationEmail);
router.get("/watchlists/searches", verifyToken, getSavedSearchAlerts);
router.post("/watchlists/searches", verifyToken, createSavedSearchAlert);
router.delete("/watchlists/searches/:id", verifyToken, deleteSavedSearchAlert);
router.get("/roommate-profile", verifyToken, getRoommateProfile);
router.put("/roommate-profile", verifyToken, upsertRoommateProfile);
router.get("/roommate-matches", verifyToken, getRoommateMatches);
router.post("/save", verifyToken, savePost);
router.get("/profilePosts", verifyToken, profilePosts);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;
