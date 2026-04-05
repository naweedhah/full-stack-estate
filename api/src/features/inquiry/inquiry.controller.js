import prisma from "../../shared/lib/prisma.js";
import {
  createNotification,
  maybeCreateSmartReminder,
} from "../../shared/services/notification.service.js";

const inquiryInclude = {
  post: {
    select: {
      id: true,
      title: true,
      address: true,
      city: true,
      area: true,
      ownerId: true,
    },
  },
  student: {
    select: {
      id: true,
      username: true,
      fullName: true,
      avatar: true,
    },
  },
  owner: {
    select: {
      id: true,
      username: true,
      fullName: true,
      avatar: true,
    },
  },
  chat: {
    select: {
      id: true,
      lastMessage: true,
      createdAt: true,
    },
  },
};

const validInquiryTypes = new Set(["view", "book"]);
const validInquiryStatuses = new Set(["pending", "accepted", "rejected", "cancelled"]);

const getInquiryWhereClause = (req) => {
  if (req.userRole === "admin") {
    return {};
  }

  if (req.userRole === "boardingOwner") {
    return { ownerId: req.userId };
  }

  return { studentId: req.userId };
};

export const createInquiry = async (req, res) => {
  const { postId, type = "view" } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post id is required" });
  }

  if (!validInquiryTypes.has(type)) {
    return res.status(400).json({ message: "Invalid inquiry type" });
  }

  if (req.userRole !== "student") {
    return res.status(403).json({ message: "Only students can create inquiries" });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        ownerId: true,
        status: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (post.ownerId === req.userId) {
      return res.status(400).json({ message: "You cannot create an inquiry for your own listing" });
    }

    const existingInquiry = await prisma.inquiry.findFirst({
      where: {
        postId,
        studentId: req.userId,
        status: {
          in: ["pending", "accepted"],
        },
      },
      include: inquiryInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingInquiry) {
      return res.status(200).json({
        message: "You already have an active inquiry for this listing",
        inquiry: existingInquiry,
      });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        postId,
        ownerId: post.ownerId,
        studentId: req.userId,
        type,
      },
      include: inquiryInclude,
    });

    await createNotification({
      userId: post.ownerId,
      type: "bookingRequested",
      title: "New inquiry received",
      message: `${inquiry.student.fullName || inquiry.student.username} sent an inquiry about "${post.title}".`,
      metadata: {
        inquiryId: inquiry.id,
        postId,
        studentId: req.userId,
      },
    });

    await createNotification({
      userId: req.userId,
      type: "inquiryReply",
      title: "Inquiry sent successfully",
      message: `Your inquiry for "${post.title}" was sent to the owner. We'll let you know when they reply.`,
      metadata: {
        inquiryId: inquiry.id,
        postId,
        status: "pending",
      },
    });

    res.status(201).json({
      message: "Inquiry created successfully",
      inquiry,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create inquiry" });
  }
};

export const getInquiries = async (req, res) => {
  try {
    if (req.userRole === "boardingOwner") {
      const staleInquiry = await prisma.inquiry.findFirst({
        where: {
          ownerId: req.userId,
          status: "pending",
          createdAt: {
            lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (staleInquiry) {
        await maybeCreateSmartReminder({
          userId: req.userId,
          title: "You have unanswered inquiries",
          message: "One or more student inquiries have been waiting for over 24 hours.",
          metadata: {
            inquiryId: staleInquiry.id,
          },
          recentHours: 12,
        });
      }
    }

    const inquiries = await prisma.inquiry.findMany({
      where: getInquiryWhereClause(req),
      include: inquiryInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(inquiries);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load inquiries" });
  }
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!validInquiryStatuses.has(status) || status === "accepted") {
    return res.status(400).json({ message: "Invalid inquiry status" });
  }

  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: inquiryInclude,
    });

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    const isOwner = inquiry.ownerId === req.userId;
    const isStudent = inquiry.studentId === req.userId;
    const isAdmin = req.userRole === "admin";

    if (!(isOwner || isStudent || isAdmin)) {
      return res.status(403).json({ message: "Not authorized to update this inquiry" });
    }

    if (status === "rejected" && !(isOwner || isAdmin)) {
      return res.status(403).json({ message: "Only the owner can reject inquiries" });
    }

    if (status === "cancelled" && !(isStudent || isAdmin)) {
      return res.status(403).json({ message: "Only the student can cancel inquiries" });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
      include: inquiryInclude,
    });

    if (status === "rejected") {
      await createNotification({
        userId: inquiry.studentId,
        type: "inquiryReply",
        title: "Your inquiry was updated",
        message: `${inquiry.owner.fullName || inquiry.owner.username} rejected your inquiry for ${inquiry.post?.title || "the listing"}.`,
        metadata: {
          inquiryId: inquiry.id,
          postId: inquiry.postId,
          status,
        },
      });
    }

    if (status === "cancelled") {
      await createNotification({
        userId: inquiry.ownerId,
        type: "inquiryReply",
        title: "An inquiry was cancelled",
        message: `${inquiry.student.fullName || inquiry.student.username} cancelled their inquiry for ${inquiry.post?.title || "your listing"}.`,
        metadata: {
          inquiryId: inquiry.id,
          postId: inquiry.postId,
          status,
        },
      });
    }

    res.status(200).json({
      message: "Inquiry updated successfully",
      inquiry: updatedInquiry,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update inquiry" });
  }
};

export const acceptInquiry = async (req, res) => {
  const { id } = req.params;

  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: inquiryInclude,
    });

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    const canModerate = inquiry.ownerId === req.userId || req.userRole === "admin";

    if (!canModerate) {
      return res.status(403).json({ message: "Only the owner can accept this inquiry" });
    }

    let chat = inquiry.chat;

    if (!chat) {
      chat = await prisma.chat.findFirst({
        where: {
          userIDs: {
            hasEvery: [inquiry.studentId, inquiry.ownerId],
          },
        },
      });
    }

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userIDs: [inquiry.studentId, inquiry.ownerId],
          seenBy: [req.userId],
        },
      });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        status: "accepted",
        chatId: chat.id,
      },
      include: inquiryInclude,
    });

    await createNotification({
      userId: inquiry.studentId,
      type: "inquiryReply",
      title: "Inquiry accepted",
      message: `${inquiry.owner.fullName || inquiry.owner.username} accepted your inquiry and opened a chat.`,
      metadata: {
        inquiryId: inquiry.id,
        chatId: chat.id,
        postId: inquiry.postId,
        status: "accepted",
      },
    });

    res.status(200).json({
      message: "Inquiry accepted and chat opened",
      inquiry: updatedInquiry,
      chat,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to accept inquiry" });
  }
};
