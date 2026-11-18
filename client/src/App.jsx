
import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Compass,
  Heart,
  X,
  MapPin,
  GraduationCap,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [activeTab, setActiveTab] = useState("discover");
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState("");

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_URL}/feed`);
      setProfiles(response.data.profiles);
    } catch {
      setError("Unable to load profiles. Please check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await axios.get(`${API_URL}/matches`);
      setMatches(response.data.matches);
    } catch (err) {
      console.error("Unable to load matches:", err);
    }
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/feed`)
      .then((response) => {
        setProfiles(response.data.profiles);
      })
      .catch(() => {
        setError("Unable to load profiles. Please check your backend server.");
      })
      .finally(() => {
        setLoading(false);
      });

    axios
      .get(`${API_URL}/matches`)
      .then((response) => {
        setMatches(response.data.matches);
      })
      .catch((err) => {
        console.error("Unable to load matches:", err);
      });
  }, []);

  const handleSwipe = async (profile, action) => {
    if (swiping || !profile) return;

    try {
      setSwiping(true);
      setError("");

      const response = await axios.post(`${API_URL}/swipe`, {
        profileId: profile.id,
        action,
      });

      setProfiles((previous) =>
        previous.filter((item) => item.id !== profile.id)
      );

      if (response.data.matchCreated) {
        setCurrentMatch(response.data.match);
        await loadMatches();
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
      await loadFeed();
    } finally {
      setSwiping(false);
    }
  };

  const handleDragEnd = (event, info, profile) => {
    if (info.offset.x > 110) {
      handleSwipe(profile, "LIKE");
    } else if (info.offset.x < -110) {
      handleSwipe(profile, "PASS");
    }
  };

  const currentProfile = profiles[0];

  return (
    <div className="min-h-screen bg-[#faf8f6] text-[#25221f]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#eee9e4] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f15b67] text-white">
              <Heart size={20} fill="currentColor" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              coy<span className="text-[#f15b67]">.</span>
            </span>
          </div>

          <div className="hidden items-center gap-2 text-sm text-gray-500 sm:flex">
            <Sparkles size={16} className="text-[#f15b67]" />
            Discover genuine connections
          </div>

          <div className="text-xs font-semibold text-gray-500">
            YOUR CAMPUS WORLD
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto min-h-[calc(100vh-140px)] max-w-6xl px-4 py-6 sm:px-6">
        {activeTab === "home" && (
          <section className="min-h-[70vh]" aria-label="Home">
            {/* Intentionally blank Home tab as required */}
          </section>
        )}

        {activeTab === "discover" && (
          <section className="mx-auto flex max-w-md flex-col items-center">
            <div className="mb-5 w-full text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f15b67]">
                Find your person
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Discover
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Meet interesting people from your campus world.
              </p>
            </div>

            {error && (
              <div className="mb-4 w-full rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
                {error}
                <button
                  onClick={loadFeed}
                  className="ml-2 font-bold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <RefreshCw className="animate-spin text-[#f15b67]" size={32} />
              </div>
            ) : currentProfile ? (
              <>
                <div className="relative w-full">
                  <AnimatePresence mode="wait">
                    <motion.article
                      key={currentProfile.id}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, x: 100 }}
                      transition={{ duration: 0.25 }}
                      drag={swiping ? false : "x"}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.8}
                      onDragEnd={(event, info) =>
                        handleDragEnd(event, info, currentProfile)
                      }
                      className="relative h-[490px] w-full cursor-grab overflow-hidden rounded-[28px] bg-gray-200 shadow-xl active:cursor-grabbing sm:h-[540px]"
                    >
                      <img
                        src={currentProfile.photo}
                        alt={currentProfile.name}
                        draggable="false"
                        className="absolute inset-0 h-full w-full select-none object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/5" />

                      <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-800">
                        <Sparkles size={13} className="mr-1 inline text-[#f15b67]" />
                        Discover profile
                      </div>

                      <div className="absolute bottom-0 w-full p-6 text-white">
                        <h2 className="text-3xl font-extrabold">
                          {currentProfile.name}, {currentProfile.age}
                        </h2>

                        <p className="mt-2 flex items-center gap-2 text-sm text-white/90">
                          <MapPin size={16} />
                          {currentProfile.city}
                        </p>

                        {currentProfile.college && (
                          <p className="mt-1 flex items-center gap-2 text-sm text-white/90">
                            <GraduationCap size={16} />
                            {currentProfile.college}
                          </p>
                        )}

                        <p className="mt-4 text-sm leading-relaxed text-white/95">
                          {currentProfile.bio}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {currentProfile.interests
                            ?.split(",")
                            .map((interest) => (
                              <span
                                key={interest}
                                className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                              >
                                {interest.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                  Swipe right to like · Swipe left to pass
                </p>

                <div className="mt-5 flex items-center justify-center gap-7">
                  <button
                    onClick={() => handleSwipe(currentProfile, "PASS")}
                    disabled={swiping}
                    aria-label="Pass profile"
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition hover:scale-110 hover:border-red-200 hover:text-red-500 disabled:opacity-50"
                  >
                    <X size={30} />
                  </button>

                  <button
                    onClick={() => handleSwipe(currentProfile, "LIKE")}
                    disabled={swiping}
                    aria-label="Like profile"
                    className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#f15b67] text-white shadow-lg shadow-pink-200 transition hover:scale-110 hover:bg-[#e64c5b] disabled:opacity-50"
                  >
                    <Heart size={34} fill="currentColor" />
                  </button>
                </div>

                {swiping && (
                  <p className="mt-3 text-xs text-gray-400">
                    Saving your choice...
                  </p>
                )}
              </>
            ) : (
              <div className="flex min-h-[420px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-[#f15b67]">
                  <Heart size={30} />
                </div>
                <h2 className="text-xl font-bold">You've seen everyone!</h2>
                <p className="mt-2 text-sm text-gray-500">
                  There are no more profiles to discover right now.
                </p>
                <button
                  onClick={loadFeed}
                  className="mt-5 flex items-center gap-2 rounded-full bg-[#f15b67] px-5 py-3 text-sm font-bold text-white hover:bg-[#e64c5b]"
                >
                  <RefreshCw size={16} />
                  Refresh feed
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === "matches" && (
          <section className="mx-auto max-w-2xl">
            <div className="mb-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f15b67]">
                Mutual connections
              </p>
              <h1 className="mt-2 text-3xl font-extrabold">Your Matches</h1>
              <p className="mt-2 text-sm text-gray-500">
                People who liked you back.
              </p>
            </div>

            {matches.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <Heart size={36} className="mx-auto text-[#f15b67]" />
                <h2 className="mt-4 text-lg font-bold">No matches yet</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Keep discovering. Your next connection might be around the corner.
                </p>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="mt-5 rounded-full bg-[#f15b67] px-5 py-3 text-sm font-bold text-white"
                >
                  Discover people
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {matches.map((item) => (
                  <article
                    key={item.matchId}
                    className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <img
                      src={item.profile.photo}
                      alt={item.profile.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <div>
                      <h2 className="font-bold">
                        {item.profile.name}, {item.profile.age}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.profile.city}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#f15b67]">
                        <Heart size={12} fill="currentColor" />
                        It's a match!
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 z-30 w-full border-t border-[#eee9e4] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-lg items-center justify-around px-5">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              activeTab === "home" ? "text-[#f15b67]" : "text-gray-400"
            }`}
          >
            <Home size={22} />
            Home
          </button>

          <button
            onClick={() => setActiveTab("discover")}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              activeTab === "discover" ? "text-[#f15b67]" : "text-gray-400"
            }`}
          >
            <Compass size={22} />
            Discover
          </button>

          <button
            onClick={() => {
              setActiveTab("matches");
              loadMatches();
            }}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              activeTab === "matches" ? "text-[#f15b67]" : "text-gray-400"
            }`}
          >
            <Heart size={22} />
            Matches
          </button>
        </div>
      </nav>

      {/* Mutual match popup */}
      <AnimatePresence>
        {currentMatch && (
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
                onClick={() => setCurrentMatch(null)}
                aria-label="Close match popup"
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-800"
              >
                <X size={22} />
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-[#f15b67]">
                <Heart size={34} fill="currentColor" />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#f15b67]">
                It's mutual!
              </p>
              <h2 className="mt-2 text-3xl font-extrabold">
                It's a match!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                You and {currentMatch.name} liked each other.
              </p>

              <img
                src={currentMatch.photo}
                alt={currentMatch.name}
                className="mx-auto mt-5 h-32 w-32 rounded-full border-4 border-pink-100 object-cover"
              />

              <h3 className="mt-3 text-xl font-bold">
                {currentMatch.name}
              </h3>

              <button
                onClick={() => {
                  setCurrentMatch(null);
                  setActiveTab("matches");
                  loadMatches();
                }}
                className="mt-6 w-full rounded-full bg-[#f15b67] px-5 py-3 font-bold text-white transition hover:bg-[#e64c5b]"
              >
                View your matches
              </button>

              <button
                onClick={() => setCurrentMatch(null)}
                className="mt-3 text-sm font-semibold text-gray-500"
              >
                Keep discovering
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Space for fixed bottom navigation */}
      <div className="h-20" />
    </div>
  );
}

export default App;
