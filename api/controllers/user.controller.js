import prisma from "../src/shared/lib/prisma.js";
import bcrypt from "bcrypt";
import {
  canSendEmail,
  getOrCreateNotificationPreference,
  markNotificationAsReadForUser,
  maybeCreateSmartReminder,
  notifyRoommateMatches,
} from "../src/shared/services/notification.service.js";
import { sendNotificationEmail } from "../src/shared/services/email.service.js";

const ROOMMATE_WEIGHTS = {
  budget: 25,
  location: 20,
  sleepSchedule: 10,
  cleanlinessLevel: 10,
  studyHabit: 10,
  smokingAllowed: 10,
  foodPreference: 5,
  sociabilityLevel: 5,
  petsAllowed: 5,
};

const ROOMMATE_CITIES = [
  "Colombo",
  "Kandy",
  "Galle",
  "Jaffna",
  "Kurunegala",
  "Matara",
  "Negombo",
  "Anuradhapura",
  "Ratnapura",
  "Badulla",
];

const ROOMMATE_UNIVERSITIES = [
  "University of Peradeniya",
  "University of Colombo",
  "University of Moratuwa",
  "University of Kelaniya",
  "University of Sri Jayewardenepura",
  "University of Ruhuna",
  "University of Jaffna",
  "Rajarata University of Sri Lanka",
  "Sabaragamuwa University of Sri Lanka",
  "Wayamba University of Sri Lanka",
  "Eastern University, Sri Lanka",
  "South Eastern University of Sri Lanka",
  "Uva Wellassa University",
  "NSBM Green University",
  "SLIIT",
  "IIT Sri Lanka",
];

const ROOMMATE_SLEEP_SCHEDULES = [
  "Sleeps before midnight",
  "Late sleeper",
  "Early riser",
];

const ROOMMATE_STUDY_HABITS = [
  "Quiet evenings",
  "Group study",
  "Flexible",
];

const ROOMMATE_FOOD_PREFERENCES = [
  "Vegetarian-friendly",
  "No special preference",
  "Halal-friendly",
  "Vegan-friendly",
];

const WATCHLIST_GENDER_OPTIONS = ["male", "female", "any"];
const WATCHLIST_BOARDING_TYPES = [
  "singleRoom",
  "sharedRoom",
  "annex",
  "hostel",
  "houseShare",
];

const buildReasonList = (reasons) =>
  reasons.filter(Boolean).slice(0, 4);

const normalizeScaleDifference = (a, b, maxDifference) => {
  if (a == null || b == null) return 0.4;
  return Math.max(0, 1 - Math.abs(a - b) / maxDifference);
};

const scoreExactOrUnknown = (a, b) => {
  if (!a || !b) return 0.4;
  return a === b ? 1 : 0;
};

const scoreBooleanPreference = (a, b) => {
  if (a == null || b == null) return 0.4;
  return a === b ? 1 : 0;
};

const scoreBudgetOverlap = (source, candidate) => {
  if (
    source.budgetMin == null ||
    source.budgetMax == null ||
    candidate.budgetMin == null ||
    candidate.budgetMax == null
  ) {
    return 0.35;
  }

  const overlapStart = Math.max(source.budgetMin, candidate.budgetMin);
  const overlapEnd = Math.min(source.budgetMax, candidate.budgetMax);
  const overlap = Math.max(0, overlapEnd - overlapStart);
  const totalSpan =
    Math.max(source.budgetMax, candidate.budgetMax) -
    Math.min(source.budgetMin, candidate.budgetMin);

  if (totalSpan <= 0) return 0;
  return overlap / totalSpan;
};

const scoreLocation = (source, candidate) => {
  const sourceArea = source.preferredArea?.trim().toLowerCase();
  const candidateArea = candidate.preferredArea?.trim().toLowerCase();
  const sourceCity = source.preferredCity?.trim().toLowerCase();
  const candidateCity = candidate.preferredCity?.trim().toLowerCase();

  if (sourceArea && candidateArea && sourceArea === candidateArea) return 1;
  if (sourceCity && candidateCity && sourceCity === candidateCity) return 0.7;
  if ((sourceCity && candidateArea && sourceCity === candidateArea) || (candidateCity && sourceArea && candidateCity === sourceArea)) {
    return 0.4;
  }
  return 0;
};

const calculateRoommateMatch = (sourceUser, sourcePref, candidateUser, candidatePref) => {
  const budgetScore = scoreBudgetOverlap(sourcePref, candidatePref);
  const locationScore = scoreLocation(sourcePref, candidatePref);
  const sleepScore = scoreExactOrUnknown(sourcePref.sleepSchedule, candidatePref.sleepSchedule);
  const cleanlinessScore = normalizeScaleDifference(
    sourcePref.cleanlinessLevel,
    candidatePref.cleanlinessLevel,
    4
  );
  const studyHabitScore = scoreExactOrUnknown(sourcePref.studyHabit, candidatePref.studyHabit);
  const smokingScore = scoreBooleanPreference(
    sourcePref.smokingAllowed,
    candidatePref.smokingAllowed
  );
  const foodScore = scoreExactOrUnknown(
    sourcePref.foodPreference,
    candidatePref.foodPreference
  );
  const sociabilityScore = normalizeScaleDifference(
    sourcePref.sociabilityLevel,
    candidatePref.sociabilityLevel,
    4
  );
  const petsScore = scoreBooleanPreference(sourcePref.petsAllowed, candidatePref.petsAllowed);

  const weightedScore =
    budgetScore * ROOMMATE_WEIGHTS.budget +
    locationScore * ROOMMATE_WEIGHTS.location +
    sleepScore * ROOMMATE_WEIGHTS.sleepSchedule +
    cleanlinessScore * ROOMMATE_WEIGHTS.cleanlinessLevel +
    studyHabitScore * ROOMMATE_WEIGHTS.studyHabit +
    smokingScore * ROOMMATE_WEIGHTS.smokingAllowed +
    foodScore * ROOMMATE_WEIGHTS.foodPreference +
    sociabilityScore * ROOMMATE_WEIGHTS.sociabilityLevel +
    petsScore * ROOMMATE_WEIGHTS.petsAllowed;

  const reasons = buildReasonList([
    budgetScore >= 0.55 ? "Budget ranges overlap well" : null,
    locationScore >= 0.7
      ? `Both prefer ${sourcePref.preferredArea || sourcePref.preferredCity}`
      : locationScore >= 0.4
        ? "Location preferences are reasonably close"
        : null,
    cleanlinessScore >= 0.75 ? "Similar cleanliness expectations" : null,
    studyHabitScore === 1 ? "Matching study habits" : null,
    sleepScore === 1 ? "Compatible sleep schedules" : null,
    smokingScore === 1 ? "Same smoking preference" : null,
    petsScore === 1 ? "Same pet preference" : null,
  ]);

  return {
    user: {
      id: candidateUser.id,
      username: candidateUser.username,
      fullName: candidateUser.fullName,
      avatar: candidateUser.avatar,
      gender: candidateUser.gender,
      university: candidatePref.university,
      faculty: candidatePref.faculty,
      yearOfStudy: candidatePref.yearOfStudy,
      preferredCity: candidatePref.preferredCity,
      preferredArea: candidatePref.preferredArea,
      budgetMin: candidatePref.budgetMin,
      budgetMax: candidatePref.budgetMax,
    },
    score: Math.round(weightedScore),
    reasons,
  };
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user!" });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update users!" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Listing removed from saved list" });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Listing saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where: { ownerId: tokenUserId },
      orderBy: {
        createdAt: "desc",
      },
    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    const savedPosts = saved.map((item) => item.post);
    const pendingBookings = await prisma.bookingRequest.findMany({
      where: {
        studentId: tokenUserId,
        status: {
          in: ["pending", "approved", "paymentPending"],
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 5,
    });

    const staleBooking = pendingBookings.find(
      (booking) => booking.createdAt <= new Date(Date.now() - 24 * 60 * 60 * 1000),
    );

    if (staleBooking) {
      await maybeCreateSmartReminder({
        userId: tokenUserId,
        title: "Booking still pending",
        message: "One of your bookings has been waiting for over 24 hours. Check for updates or follow up with the owner.",
        metadata: {
          bookingRequestId: staleBooking.id,
          postId: staleBooking.postId,
        },
        recentHours: 12,
      });
    }

    res.status(200).json({ userPosts, savedPosts, pendingBookings });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

export const getNotificationNumber = async (req, res) => {
  const tokenUserId = req.userId;
  try {
    const number = await prisma.notification.count({
      where: {
        userId: tokenUserId,
        isRead: false,
      },
    });
    res.status(200).json(number);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

export const getNotifications = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const [unseenCount, notifications, preferences] = await Promise.all([
      prisma.notification.count({
        where: {
          userId: tokenUserId,
          isRead: false,
        },
      }),
      prisma.notification.findMany({
        where: {
          userId: tokenUserId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
      getOrCreateNotificationPreference(tokenUserId),
    ]);

    res.status(200).json({ unseenCount, notifications, preferences });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get notifications!" });
  }
};

export const markNotificationRead = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const notification = await markNotificationAsReadForUser(
      tokenUserId,
      req.params.id,
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found!" });
    }

    res.status(200).json(notification);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update notification!" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    await prisma.notification.updateMany({
      where: {
        userId: tokenUserId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update notifications!" });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const preferences = await getOrCreateNotificationPreference(req.userId);
    res.status(200).json(preferences);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get notification preferences!" });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const preferences = await getOrCreateNotificationPreference(req.userId);

    const allowedKeys = [
      "emailEnabled",
      "inAppEnabled",
      "pushEnabled",
      "smsEnabled",
      "bookingUpdates",
      "watchlistAlerts",
      "searchAlerts",
      "priceAlerts",
      "demandAlerts",
      "inquiryAlerts",
      "roommateAlerts",
      "safetyAlerts",
      "moderationAlerts",
      "accountSecurityAlerts",
    ];

    const nextData = Object.fromEntries(
      allowedKeys
        .filter((key) => key in req.body)
        .map((key) => [key, Boolean(req.body[key])]),
    );

    const updated = await prisma.notificationPreference.update({
      where: { id: preferences.id },
      data: nextData,
    });

    res.status(200).json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update notification preferences!" });
  }
};

export const sendTestNotificationEmail = async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "Test email helpers are disabled in production." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
      },
    });

    if (!user?.email) {
      return res.status(400).json({ message: "Your account does not have an email address." });
    }

    if (!canSendEmail()) {
      return res.status(400).json({
        message: "SMTP is not configured yet. Add SMTP settings in api/.env and restart the backend.",
      });
    }

    const result = await sendNotificationEmail({
      to: user.email,
      recipientName: user.fullName || user.username,
      title: "Test email from BoardingFinder",
      message:
        "This is a development test email to confirm that your SMTP notification setup is working.",
      metadata: {
        kind: "test-email",
        sentAt: new Date().toISOString(),
      },
    });

    if (!result.delivered) {
      return res.status(400).json({
        message: "SMTP is configured but the email could not be delivered.",
        reason: result.reason,
      });
    }

    res.status(200).json({
      message: `Test email sent to ${user.email}`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message || "Failed to send test email.",
      code: err.code || null,
    });
  }
};

export const getSavedSearchAlerts = async (req, res) => {
  try {
    const alerts = await prisma.watchlist.findMany({
      where: {
        userId: req.userId,
        postId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(alerts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get saved alerts!" });
  }
};

export const createSavedSearchAlert = async (req, res) => {
  const normalizeNullableString = (value) =>
    value == null || value === "" ? null : String(value).trim();
  const normalizeNullableNumber = (value) =>
    value == null || value === "" ? null : Number(value);
  const normalizeNullableBoolean = (value) => {
    if (value == null || value === "") return null;
    if (typeof value === "boolean") return value;
    return value === "true";
  };

  const city = normalizeNullableString(req.body.city);
  const area = normalizeNullableString(req.body.area);
  const minBudget = normalizeNullableNumber(req.body.minBudget);
  const maxBudget = normalizeNullableNumber(req.body.maxBudget);
  const preferredTenantGender = normalizeNullableString(
    req.body.preferredTenantGender,
  );
  const boardingType = normalizeNullableString(req.body.boardingType);
  const minCapacity = normalizeNullableNumber(req.body.minCapacity);
  const wifiRequired = normalizeNullableBoolean(req.body.wifiRequired);
  const mealsRequired = normalizeNullableBoolean(req.body.mealsRequired);
  const attachedBathroomNeeded = normalizeNullableBoolean(
    req.body.attachedBathroomNeeded,
  );

  if (!city) {
    return res.status(400).json({ message: "Preferred city is required." });
  }

  if (minBudget != null && maxBudget != null && maxBudget < minBudget) {
    return res.status(400).json({ message: "Max budget must be greater than min budget." });
  }

  if (
    preferredTenantGender &&
    !WATCHLIST_GENDER_OPTIONS.includes(preferredTenantGender)
  ) {
    return res.status(400).json({ message: "Invalid preferred tenant gender." });
  }

  if (boardingType && !WATCHLIST_BOARDING_TYPES.includes(boardingType)) {
    return res.status(400).json({ message: "Invalid boarding type." });
  }

  try {
    const alert = await prisma.watchlist.create({
      data: {
        userId: req.userId,
        city,
        area,
        minBudget,
        maxBudget,
        preferredTenantGender,
        boardingType,
        minCapacity,
        wifiRequired,
        mealsRequired,
        attachedBathroomNeeded,
      },
    });

    await createNotification({
      userId: req.userId,
      type: "searchMatch",
      title: "Search alert saved",
      message: `We'll notify you about matching boardings in ${area || city}.`,
      metadata: {
        watchlistId: alert.id,
        city,
        area,
      },
    });

    res.status(201).json(alert);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save search alert!" });
  }
};

export const deleteSavedSearchAlert = async (req, res) => {
  try {
    const alert = await prisma.watchlist.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
        postId: null,
      },
    });

    if (!alert) {
      return res.status(404).json({ message: "Saved alert not found." });
    }

    await prisma.watchlist.delete({
      where: { id: alert.id },
    });

    res.status(200).json({ message: "Saved alert deleted." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete saved alert!" });
  }
};

export const getRoommateProfile = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const profile = await prisma.roommatePreference.findUnique({
      where: { userId: tokenUserId },
    });

    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get roommate profile!" });
  }
};

export const upsertRoommateProfile = async (req, res) => {
  const tokenUserId = req.userId;
  const payload = req.body;

  const normalizeNullableString = (value) =>
    value === "" || value == null ? null : value;
  const normalizeNullableNumber = (value) =>
    value === "" || value == null ? null : Number(value);
  const normalizeNullableBoolean = (value) => {
    if (value === "" || value == null) return null;
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
  };

  const normalizedAge = normalizeNullableNumber(payload.age);
  const normalizedUniversity = normalizeNullableString(payload.university);
  const normalizedFaculty = normalizeNullableString(payload.faculty);
  const normalizedYearOfStudy = normalizeNullableString(payload.yearOfStudy);
  const normalizedBudgetMin = normalizeNullableNumber(payload.budgetMin);
  const normalizedBudgetMax = normalizeNullableNumber(payload.budgetMax);
  const normalizedPreferredCity = normalizeNullableString(payload.preferredCity);
  const normalizedPreferredArea = normalizeNullableString(payload.preferredArea);
  const normalizedSleepSchedule = normalizeNullableString(payload.sleepSchedule);
  const normalizedCleanlinessLevel = normalizeNullableNumber(
    payload.cleanlinessLevel
  );
  const normalizedStudyHabit = normalizeNullableString(payload.studyHabit);
  const normalizedSmokingAllowed = normalizeNullableBoolean(
    payload.smokingAllowed
  );
  const normalizedPetsAllowed = normalizeNullableBoolean(payload.petsAllowed);
  const normalizedFoodPreference = normalizeNullableString(
    payload.foodPreference
  );
  const normalizedSociabilityLevel = normalizeNullableNumber(
    payload.sociabilityLevel
  );
  const normalizedNotes = normalizeNullableString(payload.notes);

  if (normalizedAge == null || normalizedAge < 16 || normalizedAge > 60) {
    return res
      .status(400)
      .json({ message: "Age must be between 16 and 60." });
  }

  if (!normalizedUniversity || !ROOMMATE_UNIVERSITIES.includes(normalizedUniversity)) {
    return res.status(400).json({ message: "Select a valid university." });
  }

  if (!normalizedFaculty || normalizedFaculty.length < 2) {
    return res
      .status(400)
      .json({ message: "Faculty must be at least 2 characters long." });
  }

  if (!normalizedYearOfStudy) {
    return res.status(400).json({ message: "Select your year of study." });
  }

  if (
    normalizedBudgetMin == null ||
    normalizedBudgetMax == null ||
    normalizedBudgetMin < 5000 ||
    normalizedBudgetMax < normalizedBudgetMin
  ) {
    return res.status(400).json({
      message: "Enter a valid budget range with max budget above min budget.",
    });
  }

  if (
    !normalizedPreferredCity ||
    !ROOMMATE_CITIES.includes(normalizedPreferredCity)
  ) {
    return res.status(400).json({ message: "Select a valid preferred city." });
  }

  if (!normalizedPreferredArea || normalizedPreferredArea.length < 2) {
    return res
      .status(400)
      .json({ message: "Preferred area must be at least 2 characters long." });
  }

  if (
    !normalizedSleepSchedule ||
    !ROOMMATE_SLEEP_SCHEDULES.includes(normalizedSleepSchedule)
  ) {
    return res.status(400).json({ message: "Select a valid sleep schedule." });
  }

  if (
    normalizedCleanlinessLevel == null ||
    normalizedCleanlinessLevel < 1 ||
    normalizedCleanlinessLevel > 5
  ) {
    return res
      .status(400)
      .json({ message: "Cleanliness level must be between 1 and 5." });
  }

  if (!normalizedStudyHabit || !ROOMMATE_STUDY_HABITS.includes(normalizedStudyHabit)) {
    return res.status(400).json({ message: "Select a valid study habit." });
  }

  if (normalizedSmokingAllowed == null) {
    return res.status(400).json({ message: "Select a smoking preference." });
  }

  if (normalizedPetsAllowed == null) {
    return res.status(400).json({ message: "Select a pets preference." });
  }

  if (
    !normalizedFoodPreference ||
    !ROOMMATE_FOOD_PREFERENCES.includes(normalizedFoodPreference)
  ) {
    return res.status(400).json({ message: "Select a valid food preference." });
  }

  if (
    normalizedSociabilityLevel == null ||
    normalizedSociabilityLevel < 1 ||
    normalizedSociabilityLevel > 5
  ) {
    return res
      .status(400)
      .json({ message: "Sociability level must be between 1 and 5." });
  }

  if (normalizedNotes && normalizedNotes.length > 300) {
    return res
      .status(400)
      .json({ message: "Notes must stay within 300 characters." });
  }

  try {
    const profile = await prisma.roommatePreference.upsert({
      where: { userId: tokenUserId },
      update: {
        age: normalizedAge,
        university: normalizedUniversity,
        faculty: normalizedFaculty,
        yearOfStudy: normalizedYearOfStudy,
        budgetMin: normalizedBudgetMin,
        budgetMax: normalizedBudgetMax,
        preferredCity: normalizedPreferredCity,
        preferredArea: normalizedPreferredArea,
        sleepSchedule: normalizedSleepSchedule,
        cleanlinessLevel: normalizedCleanlinessLevel,
        studyHabit: normalizedStudyHabit,
        smokingAllowed: normalizedSmokingAllowed,
        petsAllowed: normalizedPetsAllowed,
        foodPreference: normalizedFoodPreference,
        sociabilityLevel: normalizedSociabilityLevel,
        notes: normalizedNotes,
      },
      create: {
        userId: tokenUserId,
        age: normalizedAge,
        university: normalizedUniversity,
        faculty: normalizedFaculty,
        yearOfStudy: normalizedYearOfStudy,
        budgetMin: normalizedBudgetMin,
        budgetMax: normalizedBudgetMax,
        preferredCity: normalizedPreferredCity,
        preferredArea: normalizedPreferredArea,
        sleepSchedule: normalizedSleepSchedule,
        cleanlinessLevel: normalizedCleanlinessLevel,
        studyHabit: normalizedStudyHabit,
        smokingAllowed: normalizedSmokingAllowed,
        petsAllowed: normalizedPetsAllowed,
        foodPreference: normalizedFoodPreference,
        sociabilityLevel: normalizedSociabilityLevel,
        notes: normalizedNotes,
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: { id: tokenUserId },
      include: {
        roommatePreference: true,
      },
    });

    const candidates = await prisma.user.findMany({
      where: {
        id: { not: tokenUserId },
        role: "student",
        gender: currentUser.gender || undefined,
        isActive: true,
      },
      include: {
        roommatePreference: true,
      },
    });

    const matches = candidates
      .filter((candidate) => candidate.roommatePreference)
      .map((candidate) =>
        calculateRoommateMatch(
          currentUser,
          profile,
          candidate,
          candidate.roommatePreference,
        ),
      )
      .filter((item) => item.score > 35)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    for (const match of matches.slice(0, 5)) {
      const [userAId, userBId] = [tokenUserId, match.user.id].sort();
      await prisma.roommateMatch.upsert({
        where: {
          userAId_userBId: {
            userAId,
            userBId,
          },
        },
        update: {
          score: match.score,
          reasons: match.reasons,
          isActive: true,
        },
        create: {
          userAId,
          userBId,
          score: match.score,
          reasons: match.reasons,
        },
      });
    }

    await notifyRoommateMatches({
      userId: tokenUserId,
      matches,
    });

    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save roommate profile!" });
  }
};

export const getRoommateMatches = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: tokenUserId },
      include: {
        roommatePreference: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!currentUser.roommatePreference) {
      return res.status(200).json([]);
    }

    const candidates = await prisma.user.findMany({
      where: {
        id: { not: tokenUserId },
        role: "student",
        gender: currentUser.gender || undefined,
        isActive: true,
      },
      include: {
        roommatePreference: true,
      },
    });

    const matches = candidates
      .filter((candidate) => candidate.roommatePreference)
      .map((candidate) =>
        calculateRoommateMatch(
          currentUser,
          currentUser.roommatePreference,
          candidate,
          candidate.roommatePreference
        )
      )
      .filter((item) => item.score > 35)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    res.status(200).json(matches);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get roommate matches!" });
  }
};
