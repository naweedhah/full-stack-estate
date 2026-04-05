import prisma from "../src/shared/lib/prisma.js";
import jwt from "jsonwebtoken";
import {
  createNotification,
  maybeCreateSmartReminder,
  notifyDemandSpike,
  notifyLowAvailability,
  notifyPriceDrop,
  notifyWatchlistAndSearchMatches,
} from "../src/shared/services/notification.service.js";

const ACTIVE_BOOKING_STATUSES = ["pending", "approved", "paymentPending", "confirmed"];

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        area: query.area || undefined,
        boardingType: query.boardingType || undefined,
        preferredTenantGender: query.preferredTenantGender || undefined,
        status: query.status || undefined,
        capacity: parseInt(query.capacity) || undefined,
        rent: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const postsWithRemainingSlots = await Promise.all(
      posts.map(async (post) => {
        const activeRequestsCount = await prisma.bookingRequest.count({
          where: {
            postId: post.id,
            status: {
              in: ACTIVE_BOOKING_STATUSES,
            },
          },
        });

        return {
          ...post,
          remainingSlots: Math.max(0, post.capacity - activeRequestsCount),
        };
      })
    );

    res.status(200).json(postsWithRemainingSlots);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        owner: {
          select: {
            username: true,
            avatar: true,
            phone: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const token = req.cookies?.token;
    let isSaved = false;
    let bookingRequestStatus = null;
    let bookingRequestId = null;

    const activeRequestsCount = await prisma.bookingRequest.count({
      where: {
        postId: id,
        status: {
          in: ACTIVE_BOOKING_STATUSES,
        },
      },
    });

    const remainingSlots = Math.max(0, post.capacity - activeRequestsCount);

    if (token) {
      const payload = await new Promise((resolve) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
          if (err) {
            resolve(null);
            return;
          }
          resolve(decoded);
        });
      });

      if (payload?.id) {
        const [saved, bookingRequest] = await Promise.all([
          prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          }),
          prisma.bookingRequest.findFirst({
            where: {
              postId: id,
              studentId: payload.id,
            },
            orderBy: {
              createdAt: "desc",
            },
          }),
        ]);
        isSaved = Boolean(saved);
        bookingRequestStatus = bookingRequest?.status || null;
        bookingRequestId = bookingRequest?.id || null;
      }
    }

    res.status(200).json({
      ...post,
      isSaved,
      remainingSlots,
      bookingRequestStatus,
      bookingRequestId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        ownerId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });

    await notifyWatchlistAndSearchMatches({
      ...newPost,
      postDetail: body.postDetail,
    });
    await notifyDemandSpike({
      ...newPost,
      postDetail: body.postDetail,
    });

    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
      },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (existingPost.ownerId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(body.postData || {}),
        ...(body.postDetail
          ? {
              postDetail: {
                update: body.postDetail,
              },
            }
          : {}),
      },
      include: {
        postDetail: true,
      },
    });

    await notifyPriceDrop({
      post: updatedPost,
      previousRent: existingPost.rent,
    });
    await notifyWatchlistAndSearchMatches(updatedPost);

    res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update posts" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (post.ownerId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const createBookingRequest = async (req, res) => {
  const postId = req.params.id;
  const tokenUserId = req.userId;

  try {
    const [user, post] = await Promise.all([
      prisma.user.findUnique({
        where: { id: tokenUserId },
        select: {
          id: true,
          role: true,
          fullName: true,
          username: true,
        },
      }),
      prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          title: true,
          ownerId: true,
          status: true,
          capacity: true,
        },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!post) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (user.role !== "student") {
      return res.status(403).json({ message: "Only students can send booking requests" });
    }

    if (post.ownerId === tokenUserId) {
      return res.status(400).json({ message: "You cannot book your own listing" });
    }

    if (post.status !== "available") {
      return res.status(400).json({ message: "This boarding is not available right now" });
    }

    const activeRequestsCount = await prisma.bookingRequest.count({
      where: {
        postId,
        status: {
          in: ACTIVE_BOOKING_STATUSES,
        },
      },
    });

    const remainingSlots = Math.max(0, post.capacity - activeRequestsCount);

    if (remainingSlots < 1) {
      return res.status(400).json({ message: "No remaining slots available" });
    }

    const existingRequest = await prisma.bookingRequest.findFirst({
      where: {
        postId,
        studentId: tokenUserId,
        status: {
          in: ["pending", "approved", "paymentPending", "confirmed"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingRequest) {
      return res.status(200).json({
        message: "Booking request already sent",
        bookingRequest: existingRequest,
      });
    }

    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        studentId: tokenUserId,
        ownerId: post.ownerId,
        postId,
        status: "pending",
      },
    });

    await createNotification({
      userId: post.ownerId,
      type: "bookingRequested",
      title: "New booking request received",
      message: `${user.fullName || user.username} requested to book "${post.title}".`,
      metadata: {
        bookingRequestId: bookingRequest.id,
        postId: post.id,
        studentId: tokenUserId,
      },
    });

    await createNotification({
      userId: tokenUserId,
      type: "bookingRequested",
      title: "Booking request sent",
      message: `Your booking request for "${post.title}" has been sent to the owner.`,
      metadata: {
        bookingRequestId: bookingRequest.id,
        postId: post.id,
        ownerId: post.ownerId,
      },
    });

    const remainingSlotsAfterBooking = Math.max(0, remainingSlots - 1);

    await notifyLowAvailability({
      post,
      remainingSlots: remainingSlotsAfterBooking,
    });

    if (remainingSlotsAfterBooking < 1) {
      await maybeCreateSmartReminder({
        userId: post.ownerId,
        title: "A listing just filled up",
        message: `"${post.title}" has no remaining slots. Review pending bookings and availability.`,
        metadata: {
          postId,
          remainingSlots: remainingSlotsAfterBooking,
        },
        recentHours: 6,
      });
    }

    res.status(201).json({
      message: "Booking request sent",
      bookingRequest,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create booking request" });
  }
};
