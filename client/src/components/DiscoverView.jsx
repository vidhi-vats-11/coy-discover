import { AnimatePresence } from "framer-motion";
import { Heart, RefreshCw, X } from "lucide-react";
import ProfileCard from "./ProfileCard";

export default function DiscoverView({
  profiles,
  loading,
  error,
  swiping,
  lastAction,
  onSwipe,
  onReload,
}) {
  const current = profiles[0];

  return (
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
          <button onClick={onReload} className="ml-2 font-bold underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center">
          <RefreshCw className="animate-spin text-[#f15b67]" size={32} />
        </div>
      ) : current ? (
        <>
          <div className="relative h-[490px] w-full sm:h-[540px]">
            <AnimatePresence custom={lastAction}>
              <ProfileCard
                key={current.id}
                profile={current}
                disabled={swiping}
                onSwipe={(action) => onSwipe(current, action)}
              />
            </AnimatePresence>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            Swipe right to like · Swipe left to pass
          </p>

          <div className="mt-5 flex items-center justify-center gap-7">
            <button
              onClick={() => onSwipe(current, "PASS")}
              disabled={swiping}
              aria-label="Pass"
              className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition hover:scale-110 hover:border-red-200 hover:text-red-500 disabled:opacity-50"
            >
              <X size={30} />
            </button>

            <button
              onClick={() => onSwipe(current, "LIKE")}
              disabled={swiping}
              aria-label="Like"
              className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#f15b67] text-white shadow-lg shadow-pink-200 transition hover:scale-110 hover:bg-[#e64c5b] disabled:opacity-50"
            >
              <Heart size={34} fill="currentColor" />
            </button>
          </div>
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
            onClick={onReload}
            className="mt-5 flex items-center gap-2 rounded-full bg-[#f15b67] px-5 py-3 text-sm font-bold text-white hover:bg-[#e64c5b]"
          >
            <RefreshCw size={16} />
            Check again
          </button>
        </div>
      )}
    </section>
  );
}
