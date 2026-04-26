import prisma from "../../shared/lib/prisma.js";

export const getPostReviews = async (req, res) => {
  const { postId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { postId },
      include: {
        user: { select: { id: true, username: true, fullName: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    res.status(200).json({ reviews, avgRating, count: reviews.length });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

export const upsertReview = async (req, res) => {
  const { postId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.userId;

  const parsedRating = Number(rating);
  if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  if (req.userRole !== "student") {
    return res.status(403).json({ message: "Only students can leave reviews" });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return res.status(404).json({ message: "Listing not found" });

    const review = await prisma.review.upsert({
      where: { userId_postId: { userId, postId } },
      update: { rating: parsedRating, comment: comment || null },
      create: { userId, postId, rating: parsedRating, comment: comment || null },
      include: {
        user: { select: { id: true, username: true, fullName: true, avatar: true } },
      },
    });

    res.status(200).json({ message: "Review saved", review });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save review" });
  }
};

export const deleteReview = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    const review = await prisma.review.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (!review) return res.status(404).json({ message: "Review not found" });

    await prisma.review.delete({ where: { id: review.id } });
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
