import prisma from "../../shared/lib/prisma.js";

const TARGET_USER_LOADERS = {
  user: async (targetId) => targetId,
  message: async (targetId) => {
    const message = await prisma.message.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });

    return message?.userId || null;
  },
  bookingRequest: async (targetId) => {
    const bookingRequest = await prisma.bookingRequest.findUnique({
      where: { id: targetId },
      select: { studentId: true, ownerId: true },
    });

    return bookingRequest?.studentId || bookingRequest?.ownerId || null;
  },
  boarding: async (targetId) => {
    const post = await prisma.post.findUnique({
      where: { id: targetId },
      select: { ownerId: true },
    });

    return post?.ownerId || null;
  },
};

export const resolveReportedUserId = async (report) => {
  const loadTargetUserId = TARGET_USER_LOADERS[report.targetType];

  if (!loadTargetUserId) {
    return null;
  }

  return loadTargetUserId(report.targetId);
};

export const getUserReportSummary = async (userId) => {
  if (!userId) {
    return {
      openCount: 0,
      resolvedCount: 0,
      dismissedCount: 0,
    };
  }

  const reports = await prisma.report.findMany({
    where: {
      OR: [
        {
          targetType: "user",
          targetId: userId,
        },
        {
          targetType: "message",
          targetId: {
            in: (
              await prisma.message.findMany({
                where: { userId },
                select: { id: true },
              })
            ).map((message) => message.id),
          },
        },
      ],
    },
    select: {
      status: true,
    },
  });

  return reports.reduce(
    (summary, report) => {
      if (report.status === "open" || report.status === "underReview") {
        summary.openCount += 1;
      } else if (report.status === "resolved") {
        summary.resolvedCount += 1;
      } else if (report.status === "dismissed") {
        summary.dismissedCount += 1;
      }

      return summary;
    },
    {
      openCount: 0,
      resolvedCount: 0,
      dismissedCount: 0,
    },
  );
};
