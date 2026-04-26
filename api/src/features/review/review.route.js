import express from "express";
import { verifyToken } from "../../shared/middleware/verifyToken.js";
import { getPostReviews, upsertReview, deleteReview } from "./review.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", getPostReviews);
router.post("/", verifyToken, upsertReview);
router.delete("/", verifyToken, deleteReview);

export default router;
