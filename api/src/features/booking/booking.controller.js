import prisma from "../../shared/lib/prisma.js";
import { createNotification } from "../../shared/services/notification.service.js";

const bookingInclude = {
  post: {
    select: {
      id: true,
      title: true,
      address: true,
      city: true,
      area: true,
      rent: true,
      images: true,
    },
  },
  student: {
    select: {
      id: true,
      username: true,
      fullName: true,
      avatar: true,
      phone: true,
    },
  },
  owner: {
    select: {
      id: true,
      username: true,
      fullName: true,
    },
  },
};

const findOrCreateChat = async (studentId, ownerId) => {
  const existing = await prisma.chat.findFirst({
    where: { userIDs: { hasEvery: [studentId, ownerId] } },
  });
  if (existing) return existing;
  return prisma.chat.create({
    data: { userIDs: [studentId, ownerId], seenBy: [ownerId] },
  });
};

export const getBookings = async (req, res) => {
  try {
    const where =
      req.userRole === "boardingOwner"
        ? { ownerId: req.userId }
        : { studentId: req.userId };

    const bookings = await prisma.bookingRequest.findMany({
      where,
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(bookings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load bookings" });
  }
};

export const approveBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id },
      include: bookingInclude,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.ownerId !== req.userId)
      return res.status(403).json({ message: "Not authorized" });
    if (booking.status !== "pending")
      return res.status(400).json({ message: "Only pending bookings can be approved" });

    const chat = await findOrCreateChat(booking.studentId, booking.ownerId);

    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: { status: "approved", approvedAt: new Date() },
      include: bookingInclude,
    });

    await createNotification({
      userId: booking.studentId,
      type: "bookingApproved",
      title: "Booking request approved!",
      message: `Your booking for "${booking.post.title}" has been approved. You can now chat with the owner to finalise details.`,
      metadata: { bookingRequestId: id, postId: booking.postId, chatId: chat.id },
    });

    res.status(200).json({ message: "Booking approved", booking: updated, chatId: chat.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to approve booking" });
  }
};

export const rejectBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id },
      include: bookingInclude,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.ownerId !== req.userId)
      return res.status(403).json({ message: "Not authorized" });
    if (booking.status !== "pending")
      return res.status(400).json({ message: "Only pending bookings can be rejected" });

    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: { status: "rejected", rejectedAt: new Date() },
      include: bookingInclude,
    });

    await createNotification({
      userId: booking.studentId,
      type: "bookingRejected",
      title: "Booking request rejected",
      message: `Your booking request for "${booking.post.title}" was not accepted by the owner.`,
      metadata: { bookingRequestId: id, postId: booking.postId },
    });

    res.status(200).json({ message: "Booking rejected", booking: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to reject booking" });
  }
};

export const cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id },
      include: bookingInclude,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isStudent = booking.studentId === req.userId;
    const isOwner = booking.ownerId === req.userId;

    if (!isStudent && !isOwner)
      return res.status(403).json({ message: "Not authorized" });

    const cancellableByStudent = ["pending", "approved"];
    const cancellableByOwner = ["pending", "approved", "confirmed"];

    const allowed = isStudent ? cancellableByStudent : cancellableByOwner;
    if (!allowed.includes(booking.status))
      return res.status(400).json({ message: "Cannot cancel at this stage" });

    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: { status: "cancelled" },
      include: bookingInclude,
    });

    const notifyUserId = isStudent ? booking.ownerId : booking.studentId;
    const actorName = isStudent
      ? (booking.student.fullName || booking.student.username)
      : (booking.owner.fullName || booking.owner.username);

    await createNotification({
      userId: notifyUserId,
      type: "bookingRejected",
      title: "Booking cancelled",
      message: `${actorName} cancelled the booking for "${booking.post.title}".`,
      metadata: { bookingRequestId: id, postId: booking.postId },
    });

    res.status(200).json({ message: "Booking cancelled", booking: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

export const getOrCreateBookingChat = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id },
      select: { studentId: true, ownerId: true },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isParticipant = booking.studentId === req.userId || booking.ownerId === req.userId;
    if (!isParticipant) return res.status(403).json({ message: "Not authorized" });

    const chat = await findOrCreateChat(booking.studentId, booking.ownerId);
    res.status(200).json({ chatId: chat.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat" });
  }
};
