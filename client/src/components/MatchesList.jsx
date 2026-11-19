import { Heart } from "lucide-react";

export default function MatchesList({ matches, onDiscover }) {
  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f15b67]">
          Mutual connections
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Your Matches</h1>
        <p className="mt-2 text-sm text-gray-500">People who liked you back.</p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <Heart size={36} className="mx-auto text-[#f15b67]" />
          <h2 className="mt-4 text-lg font-bold">No matches yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Keep discovering. Your next connection might be around the corner.
          </p>
          <button
            onClick={onDiscover}
            className="mt-5 rounded-full bg-[#f15b67] px-5 py-3 text-sm font-bold text-white"
          >
            Discover people
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {matches.map(({ matchId, profile }) => (
            <article
              key={matchId}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
            >
              <img
                src={profile.photo}
                alt={profile.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div>
                <h2 className="font-bold">
                  {profile.name}, {profile.age}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{profile.city}</p>
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
  );
}
