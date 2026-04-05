import express from "express";
import {
  createReport,
  createDevSeedReport,
  getReports,
  resolveReport,
  warnUser,
} from "./report.controller.js";
import { verifyToken } from "../../shared/middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createReport);
router.post("/dev-seed", verifyToken, createDevSeedReport);
router.get("/", verifyToken, getReports);
router.patch("/:id", verifyToken, resolveReport);
router.post("/warn", verifyToken, warnUser);

export default router;
