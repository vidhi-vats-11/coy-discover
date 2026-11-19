import { Compass, Heart, Home } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "matches", label: "Matches", icon: Heart },
];

export default function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 z-30 w-full border-t border-[#eee9e4] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-lg items-center justify-around px-5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              activeTab === id ? "text-[#f15b67]" : "text-gray-400"
            }`}
          >
            <Icon size={22} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
