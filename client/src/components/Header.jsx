import { Heart, Sparkles } from "lucide-react";

export default function Header() {
  return (
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

        <div className="text-xs font-semibold text-gray-500">YOUR CAMPUS WORLD</div>
      </div>
    </header>
  );
}
