const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/prisma");

let likesUser;
let doesNotLikeUser;

beforeEach(async () => {
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.profile.deleteMany();

  const base = {
    age: 22,
    photo: "https://example.com/photo.jpg",
    bio: "Test bio",
    city: "Delhi",
    interests: "Music,Travel",
  };

  likesUser = await prisma.profile.create({
    data: { ...base, name: "Asha", likedYou: true },
  });
  doesNotLikeUser = await prisma.profile.create({
    data: { ...base, name: "Rohan", likedYou: false },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /feed", () => {
  it("returns every profile when nothing has been swiped", async () => {
    const res = await request(app).get("/feed");

    expect(res.status).toBe(200);
    expect(res.body.profiles).toHaveLength(2);
  });

  it("leaves out profiles that were already swiped on", async () => {
    await request(app)
      .post("/swipe")
      .send({ profileId: doesNotLikeUser.id, action: "PASS" });

    const res = await request(app).get("/feed");
    const ids = res.body.profiles.map((p) => p.id);

    expect(ids).toEqual([likesUser.id]);
  });

  it("never exposes whether a profile liked the user", async () => {
    const res = await request(app).get("/feed");

    for (const profile of res.body.profiles) {
      expect(profile).not.toHaveProperty("likedYou");
    }
  });
});

describe("POST /swipe", () => {
  it("rejects an unknown action", async () => {
    const res = await request(app)
      .post("/swipe")
      .send({ profileId: likesUser.id, action: "SUPERLIKE" });

    expect(res.status).toBe(400);
  });

  it("rejects a missing profileId", async () => {
    const res = await request(app).post("/swipe").send({ action: "LIKE" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a profile that does not exist", async () => {
    const res = await request(app)
      .post("/swipe")
      .send({ profileId: "nope", action: "LIKE" });

    expect(res.status).toBe(404);
  });

  it("creates a match when the like is mutual", async () => {
    const res = await request(app)
      .post("/swipe")
      .send({ profileId: likesUser.id, action: "LIKE" });

    expect(res.status).toBe(200);
    expect(res.body.matchCreated).toBe(true);
    expect(res.body.match.id).toBe(likesUser.id);
    expect(res.body.match).not.toHaveProperty("likedYou");
  });

  it("does not create a match for a one-sided like", async () => {
    const res = await request(app)
      .post("/swipe")
      .send({ profileId: doesNotLikeUser.id, action: "LIKE" });

    expect(res.body.matchCreated).toBe(false);
    expect(res.body.match).toBeNull();
    expect(await prisma.match.count()).toBe(0);
  });

  it("does not create a match when passing someone who liked the user", async () => {
    const res = await request(app)
      .post("/swipe")
      .send({ profileId: likesUser.id, action: "PASS" });

    expect(res.body.matchCreated).toBe(false);
    expect(await prisma.match.count()).toBe(0);
  });

  it("gives the same response for a pass and a one-sided like", async () => {
    // If these differed, the client could work out who liked the user
    // just by passing on them.
    const pass = await request(app)
      .post("/swipe")
      .send({ profileId: likesUser.id, action: "PASS" });
    const oneSidedLike = await request(app)
      .post("/swipe")
      .send({ profileId: doesNotLikeUser.id, action: "LIKE" });

    expect(pass.body).toEqual(oneSidedLike.body);
  });

  it("rejects swiping on the same profile twice", async () => {
    await request(app)
      .post("/swipe")
      .send({ profileId: doesNotLikeUser.id, action: "PASS" });

    const res = await request(app)
      .post("/swipe")
      .send({ profileId: doesNotLikeUser.id, action: "LIKE" });

    expect(res.status).toBe(409);
    expect(await prisma.swipe.count()).toBe(1);
  });

  it("only stores one swipe when two arrive at the same time", async () => {
    const [a, b] = await Promise.all([
      request(app).post("/swipe").send({ profileId: likesUser.id, action: "LIKE" }),
      request(app).post("/swipe").send({ profileId: likesUser.id, action: "LIKE" }),
    ]);

    expect([a.status, b.status].sort()).toEqual([200, 409]);
    expect(await prisma.swipe.count()).toBe(1);
    expect(await prisma.match.count()).toBe(1);
  });
});

describe("GET /matches", () => {
  it("is empty before any mutual like", async () => {
    const res = await request(app).get("/matches");

    expect(res.body.matches).toEqual([]);
  });

  it("lists only mutual matches", async () => {
    await request(app)
      .post("/swipe")
      .send({ profileId: likesUser.id, action: "LIKE" });
    await request(app)
      .post("/swipe")
      .send({ profileId: doesNotLikeUser.id, action: "LIKE" });

    const res = await request(app).get("/matches");

    expect(res.body.matches).toHaveLength(1);
    expect(res.body.matches[0].profile.id).toBe(likesUser.id);
    expect(res.body.matches[0].profile).not.toHaveProperty("likedYou");
  });
});
