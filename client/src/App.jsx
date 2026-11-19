import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { getFeed, getMatches, sendSwipe } from "./api";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import DiscoverView from "./components/DiscoverView";
import MatchesList from "./components/MatchesList";
import MatchModal from "./components/MatchModal";

function App() {
  const [activeTab, setActiveTab] = useState("discover");
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [newMatch, setNewMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [error, setError] = useState("");

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProfiles(await getFeed());
    } catch {
      setError("Couldn't load profiles. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      setMatches(await getMatches());
    } catch (err) {
      console.error("Couldn't load matches", err);
    }
  }, []);

  // Initial load. `loading` already starts as true, so state is only set
  // once the requests come back.
  useEffect(() => {
    getFeed()
      .then(setProfiles)
      .catch(() => setError("Couldn't load profiles. Is the backend running?"))
      .finally(() => setLoading(false));
    getMatches()
      .then(setMatches)
      .catch((err) => console.error("Couldn't load matches", err));
  }, []);

  const handleSwipe = async (profile, action) => {
    if (swiping) return;

    // Remove the card straight away so the swipe feels instant; the request
    // runs while the exit animation plays.
    setLastAction(action);
    setSwiping(true);
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));

    try {
      const result = await sendSwipe(profile.id, action);
      if (result.matchCreated) {
        setNewMatch(result.match);
        loadMatches();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save that swipe. Try again.");
      loadFeed();
    } finally {
      setSwiping(false);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    if (tab === "matches") loadMatches();
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] pb-20 text-[#25221f]">
      <Header />

      <main className="mx-auto min-h-[calc(100vh-140px)] max-w-6xl px-4 py-6 sm:px-6">
        {activeTab === "home" && <section className="min-h-[70vh]" aria-label="Home" />}

        {activeTab === "discover" && (
          <DiscoverView
            profiles={profiles}
            loading={loading}
            error={error}
            swiping={swiping}
            lastAction={lastAction}
            onSwipe={handleSwipe}
            onReload={loadFeed}
          />
        )}

        {activeTab === "matches" && (
          <MatchesList matches={matches} onDiscover={() => changeTab("discover")} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onChange={changeTab} />

      <AnimatePresence>
        {newMatch && (
          <MatchModal
            profile={newMatch}
            onClose={() => setNewMatch(null)}
            onViewMatches={() => {
              setNewMatch(null);
              changeTab("matches");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
