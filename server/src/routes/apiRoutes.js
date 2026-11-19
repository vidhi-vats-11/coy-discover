
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

    // The swipe and the match are written together, so we never end up with
    // a LIKE saved but the match missing. A second swipe on the same profile
    // hits the @@unique([userId, profileId]) constraint and is rejected.
    const isMutual = action === "LIKE" && profile.likedYou;

    await prisma.$transaction(async (tx) => {
      await tx.swipe.create({
        data: { userId: USER_ID, profileId, action },
      });

      if (isMutual) {
        await tx.match.create({
          data: { userId: USER_ID, profileId },
        });
      }
    });

    // Only send profile details back when it's mutual. For a pass or a
    // one-sided like the response is identical, so it can't be used to
    // find out who liked the user.
    let match = null;
    if (isMutual) {
      match = await prisma.profile.findUnique({
        where: { id: profileId },
        select: publicProfileFields,
      });
    }

    res.json({
      success: true,
      matchCreated: isMutual,
      match,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "You have already swiped on this profile.",
      });
    }

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
