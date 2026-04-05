import express from "express";
import {
  createInquiry,
  acceptInquiry,
  getInquiries,
  updateStatus
} from "./inquiry.controller.js";
import { verifyToken } from "../../shared/middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createInquiry);
router.get("/", verifyToken, getInquiries);
router.patch("/:id", verifyToken, updateStatus);
router.patch("/:id/accept", verifyToken, acceptInquiry);

export default router;
