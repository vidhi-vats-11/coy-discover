import { motion, useMotionValue, useTransform } from "framer-motion";
import { GraduationCap, MapPin } from "lucide-react";

// How far (px) the card has to be dragged before it counts as a swipe.
const SWIPE_THRESHOLD = 110;

// The card leaves the screen in the direction of the swipe.
const cardVariants = {
  enter: { opacity: 0, scale: 0.95, y: 15 },
  center: { opacity: 1, scale: 1, x: 0, y: 0 },
  exit: (direction) => ({
    opacity: 0,
    x: direction === "LIKE" ? 400 : -400,
    rotate: direction === "LIKE" ? 15 : -15,
    transition: { duration: 0.3 },
  }),
};

export default function ProfileCard({ profile, disabled, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe("LIKE");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("PASS");
  };

  const interests = profile.interests
    ? profile.interests.split(",").map((item) => item.trim())
    : [];

  return (
    <motion.article
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25 }}
      style={{ x, rotate }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab overflow-hidden rounded-[28px] bg-gray-200 shadow-xl active:cursor-grabbing"
    >
      <img
        src={profile.photo}
        alt={profile.name}
        draggable="false"
        className="absolute inset-0 h-full w-full select-none object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/5" />

      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute left-6 top-8 -rotate-12 rounded-lg border-4 border-green-400 px-3 py-1 text-3xl font-extrabold text-green-400"
      >
        LIKE
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute right-6 top-8 rotate-12 rounded-lg border-4 border-red-400 px-3 py-1 text-3xl font-extrabold text-red-400"
      >
        NOPE
      </motion.div>

      <div className="absolute bottom-0 w-full p-6 text-white">
        <h2 className="text-3xl font-extrabold">
          {profile.name}, {profile.age}
        </h2>

        <p className="mt-2 flex items-center gap-2 text-sm text-white/90">
          <MapPin size={16} />
          {profile.city}
        </p>

        {profile.college && (
          <p className="mt-1 flex items-center gap-2 text-sm text-white/90">
            <GraduationCap size={16} />
            {profile.college}
          </p>
        )}

        <p className="mt-4 text-sm leading-relaxed text-white/95">{profile.bio}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
