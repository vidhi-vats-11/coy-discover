import { motion } from "framer-motion";
import { Heart, X } from "lucide-react";

export default function MatchModal({ profile, onClose, onViewMatches }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        className="relative w-full max-w-sm rounded-[30px] bg-white p-8 text-center shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-[#f15b67]">
          <Heart size={34} fill="currentColor" />
        </div>

        <h2 className="mt-5 text-3xl font-extrabold">It's a match!</h2>
        <p className="mt-2 text-sm text-gray-500">
          You and {profile.name} liked each other.
        </p>

        <img
          src={profile.photo}
          alt={profile.name}
          className="mx-auto mt-5 h-32 w-32 rounded-full border-4 border-pink-100 object-cover"
        />

        <h3 className="mt-3 text-xl font-bold">{profile.name}</h3>

        <button
          onClick={onViewMatches}
          className="mt-6 w-full rounded-full bg-[#f15b67] px-5 py-3 font-bold text-white transition hover:bg-[#e64c5b]"
        >
          View your matches
        </button>

        <button onClick={onClose} className="mt-3 text-sm font-semibold text-gray-500">
          Keep discovering
        </button>
      </motion.div>
    </motion.div>
  );
}
