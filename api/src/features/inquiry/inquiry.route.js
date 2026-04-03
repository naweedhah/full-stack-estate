import express from "express";
import {
  createInquiry,
  acceptInquiry,
  getInquiries,
  updateStatus
} from "./inquiry.controller.js";

const router = express.Router();

router.post("/", createInquiry);
router.get("/", getInquiries);
router.patch("/:id", updateStatus);
router.patch("/:id/accept", acceptInquiry);

export default router;