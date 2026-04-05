import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { validateBookingPayload } from "../utils/validators.js";
import { getBoardingById } from "../data/boardings.js";

const router = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    cb(null, ok);
  },
});

async function resolveOwnerForBoarding() {
  const owner = await User.findOne({
    email: "owner@gmail.com",
    role: "owner",
  });
  return owner;
}

router.post(
  "/",
  authMiddleware,
  requireRole("student"),
  upload.single("attachment"),
  async (req, res) => {
    try {
      const boarding = getBoardingById(req.body.boardingId);
      if (!boarding) {
        return res.status(404).json({ message: "Boarding not found." });
      }

      const roomType = req.body.roomType;
      if (roomType === "single" && !boarding.singleAvailable) {
        return res.status(400).json({ message: "Single room not available." });
      }
      if (roomType === "sharing" && !boarding.sharingAvailable) {
        return res.status(400).json({ message: "Sharing room not available." });
      }

      const payload = {
        fullName: req.body.fullName,
        gmail: req.body.gmail,
        gender: req.body.gender,
        phone: req.body.phone,
        nic: req.body.nic,
        address: req.body.address,
        monthsStay: req.body.monthsStay,
        age: req.body.age,
        rulesAcknowledgement: req.body.rulesAcknowledgement,
        roomType,
      };

      const errors = validateBookingPayload(payload);
      if (!req.file) errors.push("Image attachment is required.");
      if (errors.length) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ message: errors.join(" ") });
      }

      const owner = await resolveOwnerForBoarding();
      if (!owner) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({
          message: "No property owner account is linked yet. Ask admin to register owners.",
        });
      }

      const attachmentUrl = `/uploads/${req.file.filename}`;
      const booking = await Booking.create({
        student: req.user._id,
        owner: owner._id,
        boardingId: boarding.id,
        boardingTitle: boarding.title,
        roomType,
        fullName: payload.fullName.trim(),
        gmail: payload.gmail.trim().toLowerCase(),
        gender: payload.gender,
        phone: payload.phone.trim(),
        nic: String(payload.nic).trim().replace(/\s+/g, ""),
        address: payload.address.trim(),
        monthsStay: Number(payload.monthsStay),
        age: Number(payload.age),
        rulesAcknowledgement: payload.rulesAcknowledgement.trim(),
        attachmentUrl,
      });

      const io = req.app.get("io");
      io.to(`user:${owner._id}`).emit("notification", {
        type: "new_booking",
        message: `New reservation request for ${boarding.title} from ${payload.fullName}.`,
        bookingId: String(booking._id),
      });
      io.to(`user:${req.user._id}`).emit("notification", {
        type: "booking_submitted",
        message: `Your request for ${boarding.title} was sent to the owner.`,
        bookingId: String(booking._id),
      });

      res.status(201).json(booking);
    } catch (e) {
      console.error(e);
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/student", authMiddleware, requireRole("student"), async (req, res) => {
  const list = await Booking.find({ student: req.user._id })
    .populate("owner", "name email")
    .sort({ createdAt: -1 });
  res.json(list);
});

router.get("/owner", authMiddleware, requireRole("owner"), async (req, res) => {
  const list = await Booking.find({ owner: req.user._id })
    .populate("student", "name email")
    .sort({ createdAt: -1 });
  res.json(list);
});

router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("owner"),
  async (req, res) => {
    try {
      const { status, phone } = req.body;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status." });
      }

      const booking = await Booking.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });

      if (!booking) {
        return res.status(404).json({ message: "Not found." });
      }

      booking.status = status;

      // ✅ Save owner phone ONLY when accepted
      if (status === "accepted") {
        if (!phone || !/^07\d{8}$/.test(phone)) {
          return res.status(400).json({
            message: "Valid owner phone required (07XXXXXXXX)",
          });
        }
        booking.ownerPhone = phone;
      }

      await booking.save();

      const io = req.app.get("io");

      io.to(`booking:${booking._id}`).emit("booking:status", {
        bookingId: String(booking._id),
        status: booking.status,
        ownerPhone: booking.ownerPhone,
      });

      io.to(`user:${booking.student}`).emit("notification", {
        type: "booking_status",
        message:
          status === "accepted"
            ? `Your booking for ${booking.boardingTitle} was accepted. Owner contact shared.`
            : `Your booking for ${booking.boardingTitle} was rejected.`,
        bookingId: String(booking._id),
        status,
      });

      res.json(booking);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/:id/pdf",
  authMiddleware,
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate("student", "name email")
        .populate("owner", "name email");

      if (!booking) return res.status(404).json({ message: "Not found." });

      const canStudent =
        req.user.role === "student" &&
        String(booking.student._id) === String(req.user._id);
      const canOwner =
        req.user.role === "owner" &&
        String(booking.owner._id) === String(req.user._id);
      const canAdmin = req.user.role === "admin";

      if (!canStudent && !canOwner && !canAdmin) {
        return res.status(403).json({ message: "Forbidden." });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="booking-${booking._id}.pdf"`
      );

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);

      doc.fontSize(20).text("Boarding reservation request", { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Boarding: ${booking.boardingTitle}`);
      doc.text(`Room type: ${booking.roomType}`);
      doc.text(`Status: ${booking.status}`);
      doc.moveDown();
      doc.text(`Student name (account): ${booking.student.name}`);
      doc.text(`Student email: ${booking.student.email}`);
      doc.moveDown();
      doc.text(`Full name (form): ${booking.fullName}`);
      doc.text(`Gmail: ${booking.gmail}`);
      doc.text(`Gender: ${booking.gender}`);
      doc.text(`Phone: ${booking.phone}`);
      doc.text(`NIC: ${booking.nic}`);
      doc.text(`Address: ${booking.address}`);
      doc.text(`Months stay: ${booking.monthsStay}`);
      doc.text(`Age: ${booking.age}`);
      doc.moveDown();
      doc.text("Rules acknowledgement:");
      doc.text(booking.rulesAcknowledgement, { width: 500 });
      doc.moveDown();
      doc.text(`Owner: ${booking.owner.name} (${booking.owner.email})`);
      doc.text(`Submitted: ${booking.createdAt?.toISOString?.() || ""}`);

      doc.end();
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "PDF error" });
    }
  }
);

router.get("/:id/messages", authMiddleware, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Not found." });
  const allowed =
    String(booking.student) === String(req.user._id) ||
    String(booking.owner) === String(req.user._id) ||
    req.user.role === "admin";
  if (!allowed) return res.status(403).json({ message: "Forbidden." });
  const messages = await Message.find({ booking: booking._id })
    .populate("sender", "name role")
    .sort({ createdAt: 1 });
  res.json(messages);
});

router.post("/:id/messages", authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text || !String(text).trim()) {
    return res.status(400).json({ message: "Message required." });
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Not found." });
  const allowed =
    String(booking.student) === String(req.user._id) ||
    String(booking.owner) === String(req.user._id);
  if (!allowed) return res.status(403).json({ message: "Forbidden." });
  const msg = await Message.create({
    booking: booking._id,
    sender: req.user._id,
    text: String(text).trim(),
  });
  const populated = await msg.populate("sender", "name role");
  const io = req.app.get("io");
  io.to(`booking:${booking._id}`).emit("chat:message", populated);
  res.status(201).json(populated);
});

export default router;