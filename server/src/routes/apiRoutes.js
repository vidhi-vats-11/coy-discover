
const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// Temporary demo user (assignment assumes one logged-in user)
const USER_ID = "demo-user";

// Fields safe to show on the frontend
const publicProfileFields = {
  id: true,
  name: true,
  age: true,
  photo: true,
  bio: true,
  city: true,
  college: true,
  interests: true,
};

// Return profiles the user has not swiped yet.
router.get("/feed", async (req, res) => {
  try {
    const swipedProfiles = await prisma.swipe.findMany({
      where: { userId: USER_ID },
      select: { profileId: true },
    });

    const swipedIds = swipedProfiles.map((swipe) => swipe.profileId);

    const profiles = await prisma.profile.findMany({
      where: {
        id: { notIn: swipedIds },
      },
      select: publicProfileFields,
      orderBy: { createdAt: "asc" },
    });

    res.json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load feed.",
    });
  }
});

// Save a like/pass and create a match only for mutual likes.
router.post("/swipe", async (req, res) => {
  try {
    const { profileId, action } = req.body;

    if (!profileId || !["LIKE", "PASS"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Valid profileId and action (LIKE or PASS) are required.",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        userId_profileId: {
          userId: USER_ID,
          profileId,
        },
      },
    });

    if (existingSwipe) {
      return res.status(409).json({
        success: false,
        message: "You have already swiped on this profile.",
      });
    }

    await prisma.swipe.create({
      data: {
        userId: USER_ID,
        profileId,
        action,
      },
    });

    let matchCreated = false;

    if (action === "LIKE" && profile.likedYou) {
      await prisma.match.create({
        data: {
          userId: USER_ID,
          profileId,
        },
      });

      matchCreated = true;
    }

    res.json({
      success: true,
      message: matchCreated
        ? "It's a match!"
        : "Swipe recorded successfully.",
      matchCreated,
      match: matchCreated
        ? {
            id: profile.id,
            name: profile.name,
            age: profile.age,
            photo: profile.photo,
            bio: profile.bio,
            city: profile.city,
            college: profile.college,
            interests: profile.interests,
          }
        : null,
    });
  } catch (error) {
    console.error("Swipe error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to record swipe.",
    });
  }
});

// Return confirmed mutual matches only.
router.get("/matches", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: { userId: USER_ID },
      include: {
        profile: {
          select: publicProfileFields,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: matches.length,
      matches: matches.map((item) => ({
        matchId: item.id,
        matchedAt: item.createdAt,
        profile: item.profile,
      })),
    });
  } catch (error) {
    console.error("Matches error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load matches.",
    });
  }
});

module.exports = router;
