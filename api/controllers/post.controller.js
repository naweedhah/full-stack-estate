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

const normalizeAreaKey = (city, area) =>
  `${(city || "unknown").trim().toLowerCase()}::${(area || city || "unknown").trim().toLowerCase()}`;

const buildDemandLabel = (score) => {
  if (score >= 12) return "high";
  if (score >= 6) return "medium";
  return "low";
};

const buildPostDemandData = async (postIds = []) => {
  if (!postIds.length) {
    return new Map();
  }

  const [savedPosts, inquiries, bookingRequests] = await Promise.all([
    prisma.savedPost.findMany({
      where: {
        postId: {
          in: postIds,
        },
      },
      select: {
        postId: true,
      },
    }),
    prisma.inquiry.findMany({
      where: {
        postId: {
          in: postIds,
        },
      },
      select: {
        postId: true,
      },
    }),
    prisma.bookingRequest.findMany({
      where: {
        postId: {
          in: postIds,
        },
      },
      select: {
        postId: true,
      },
    }),
  ]);

  const demandMap = new Map(
    postIds.map((postId) => [
      postId,
      {
        savedCount: 0,
        inquiryCount: 0,
        bookingCount: 0,
      },
    ]),
  );

  savedPosts.forEach(({ postId }) => {
    const current = demandMap.get(postId);
    if (current) current.savedCount += 1;
  });

  inquiries.forEach(({ postId }) => {
    const current = demandMap.get(postId);
    if (current) current.inquiryCount += 1;
  });

  bookingRequests.forEach(({ postId }) => {
    const current = demandMap.get(postId);
    if (current) current.bookingCount += 1;
  });

  demandMap.forEach((value, postId) => {
    const demandScore = value.savedCount * 2 + value.inquiryCount * 3 + value.bookingCount * 4;
    demandMap.set(postId, {
      ...value,
      demandScore,
      demandLevel: buildDemandLabel(demandScore),
    });
  });

  return demandMap;
};

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const city = query.city?.trim();
    const area = query.area?.trim();
    const boardingType = query.boardingType?.trim();
    const preferredTenantGender = query.preferredTenantGender?.trim();
    const status = query.status?.trim();
    const parsedCapacity = Number.parseInt(query.capacity, 10);
    const parsedMinPrice = Number.parseInt(query.minPrice, 10);
    const parsedMaxPrice = Number.parseInt(query.maxPrice, 10);

    const where = {
      ...(city
        ? {
            OR: [{ city }, { area: city }],
          }
        : {}),
      ...(area
        ? {
            ...(city
              ? {
                  AND: [{ OR: [{ area }, { city: area }] }],
                }
              : {
                  OR: [{ area }, { city: area }],
                }),
          }
        : {}),
      ...(boardingType ? { boardingType } : {}),
      ...(preferredTenantGender && preferredTenantGender !== "any"
        ? { preferredTenantGender }
        : {}),
      ...(status ? { status } : {}),
      ...(Number.isFinite(parsedCapacity) && parsedCapacity > 0
        ? { capacity: parsedCapacity }
        : {}),
    };

    const rent = {
      ...(Number.isFinite(parsedMinPrice) && parsedMinPrice > 0
        ? { gte: parsedMinPrice }
        : {}),
      ...(Number.isFinite(parsedMaxPrice) && parsedMaxPrice > 0
        ? { lte: parsedMaxPrice }
        : {}),
    };

    const posts = await prisma.post.findMany({
      where: {
        ...where,
        ...(Object.keys(rent).length ? { rent } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const demandMap = await buildPostDemandData(posts.map((post) => post.id));

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
          ...(demandMap.get(post.id) || {
            savedCount: 0,
            inquiryCount: 0,
            bookingCount: 0,
            demandScore: 0,
            demandLevel: "low",
          }),
        };
      })
    );

    res.status(200).json(postsWithRemainingSlots);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getDemandOverview = async (req, res) => {
  try {
    const [posts, searches, bookingRequests, inquiries] = await Promise.all([
      prisma.post.findMany({
        where: { status: "available" },
        select: {
          id: true,
          title: true,
          city: true,
          area: true,
          latitude: true,
          longitude: true,
          rent: true,
        },
      }),
      prisma.watchlist.findMany({
        where: {
          isActive: true,
          postId: null,
        },
        select: {
          city: true,
          area: true,
        },
      }),
      prisma.bookingRequest.findMany({
        select: {
          post: {
            select: {
              city: true,
              area: true,
            },
          },
        },
      }),
      prisma.inquiry.findMany({
        select: {
          post: {
            select: {
              city: true,
              area: true,
            },
          },
        },
      }),
    ]);

    const areaMap = new Map();

    const ensureArea = (city, area) => {
      const key = normalizeAreaKey(city, area);

      if (!areaMap.has(key)) {
        areaMap.set(key, {
          key,
          city: city || "Unknown",
          area: area || city || "Unknown",
          latitudeValues: [],
          longitudeValues: [],
          listings: 0,
          searches: 0,
          bookings: 0,
          inquiries: 0,
          samplePosts: [],
        });
      }

      return areaMap.get(key);
    };

    posts.forEach((post) => {
      const entry = ensureArea(post.city, post.area);
      entry.listings += 1;

      const lat = Number(post.latitude);
      const lng = Number(post.longitude);

      if (!Number.isNaN(lat)) entry.latitudeValues.push(lat);
      if (!Number.isNaN(lng)) entry.longitudeValues.push(lng);
      if (entry.samplePosts.length < 3) {
        entry.samplePosts.push({
          id: post.id,
          title: post.title,
          rent: post.rent,
        });
      }
    });

    searches.forEach((search) => {
      const entry = ensureArea(search.city, search.area);
      entry.searches += 1;
    });

    bookingRequests.forEach((booking) => {
      const city = booking.post?.city;
      const area = booking.post?.area;
      const entry = ensureArea(city, area);
      entry.bookings += 1;
    });

    inquiries.forEach((inquiry) => {
      const city = inquiry.post?.city;
      const area = inquiry.post?.area;
      const entry = ensureArea(city, area);
      entry.inquiries += 1;
    });

    const allAreas = [...areaMap.values()]
      .map((entry) => {
        const score = entry.searches * 2 + entry.inquiries * 3 + entry.bookings * 4;
        const demandLevel = buildDemandLabel(score);
        const avgLatitude =
          entry.latitudeValues.length > 0
            ? entry.latitudeValues.reduce((sum, value) => sum + value, 0) / entry.latitudeValues.length
            : null;
        const avgLongitude =
          entry.longitudeValues.length > 0
            ? entry.longitudeValues.reduce((sum, value) => sum + value, 0) / entry.longitudeValues.length
            : null;

        return {
          key: entry.key,
          city: entry.city,
          area: entry.area,
          listings: entry.listings,
          searches: entry.searches,
          bookings: entry.bookings,
          inquiries: entry.inquiries,
          demandScore: score,
          demandLevel,
          latitude: avgLatitude,
          longitude: avgLongitude,
          samplePosts: entry.samplePosts,
        };
      })
      .filter((entry) => entry.listings > 0)
      .sort((a, b) => b.demandScore - a.demandScore);

    const highDemandAreas = allAreas.filter((entry) => entry.demandLevel === "high").slice(0, 5);
    const mediumDemandAreas = allAreas.filter((entry) => entry.demandLevel === "medium").slice(0, 5);
    const lowDemandAreas = [...allAreas]
      .sort((a, b) => a.demandScore - b.demandScore || b.listings - a.listings)
      .slice(0, 5);

    res.status(200).json({
      summary: {
        totalAreasTracked: allAreas.length,
        highDemandCount: highDemandAreas.length,
        mediumDemandCount: mediumDemandAreas.length,
        lowDemandCount: lowDemandAreas.length,
      },
      highDemandAreas,
      lowDemandAreas,
      allAreas,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load demand overview" });
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

    const demandMap = await buildPostDemandData([id]);
    const demandData = demandMap.get(id) || {
      savedCount: 0,
      inquiryCount: 0,
      bookingCount: 0,
      demandScore: 0,
      demandLevel: "low",
    };

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
      ...demandData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

// --- NEW: Backend Gatekeeper Validation ---
const validatePostPayload = (postData, postDetail, isUpdate = false) => {
  const errors = [];

  // 1. Title Rules
  if (!isUpdate || postData?.title !== undefined) {
    const title = postData?.title || "";
    if (title.trim().length < 5 || title.trim().length > 60) {
      errors.push("Title must be between 5 and 60 characters.");
    }
  }

  // 2. Location Rules (Checking city/area)
  if (!isUpdate || postData?.city !== undefined || postData?.area !== undefined) {
    const location = postData?.city || postData?.area || "";
    if (location.trim().length < 3) {
      errors.push("Location must be at least 3 characters long.");
    }
  }

  // 3. Price (Rent) Rules
  if (!isUpdate || postData?.rent !== undefined) {
    const rent = Number(postData?.rent);
    if (isNaN(rent) || rent <= 0) {
      errors.push("Monthly price (rent) must be greater than Rs. 0.");
    }
  }

  // 4. Capacity (Slots) Rules
  if (!isUpdate || postData?.capacity !== undefined) {
    const capacity = Number(postData?.capacity);
    if (isNaN(capacity) || capacity < 1 || !Number.isInteger(capacity)) {
      errors.push("Available slots (capacity) must be a valid whole number of at least 1.");
    }
  }

  // 5. Description Rules
  if (!isUpdate || postDetail?.desc !== undefined) {
    const desc = postDetail?.desc || "";
    const wordCount = desc.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 10) {
      errors.push("Description must be at least 10 words.");
    }
  }

  return errors;
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    // 🚨 RUN VALIDATION FIRST
    const validationErrors = validatePostPayload(body.postData, body.postDetail, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }

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
    // 🚨 RUN VALIDATION FIRST
    const validationErrors = validatePostPayload(body.postData, body.postDetail, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }

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
  const { applicantName, applicantPhone, applicantAddress, applicantNIC } = req.body;

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
        applicantName: applicantName || null,
        applicantPhone: applicantPhone || null,
        applicantAddress: applicantAddress || null,
        applicantNIC: applicantNIC || null,
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