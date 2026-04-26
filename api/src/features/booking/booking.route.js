import express from "express";
import { verifyToken } from "../../shared/middleware/verifyToken.js";
import {
  getBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getOrCreateBookingChat,
} from "./booking.controller.js";

const router = express.Router();

router.get("/", verifyToken, getBookings);
router.put("/:id/approve", verifyToken, approveBooking);
router.put("/:id/reject", verifyToken, rejectBooking);
router.put("/:id/cancel", verifyToken, cancelBooking);
router.post("/:id/chat", verifyToken, getOrCreateBookingChat);

export default router;
