export default function FilterTabs() {
  const tabs = ["All Stories", "Winner Stories", "Partner Impact", "Community Praise"];

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-wrap gap-4 mb-10">

      {tabs.map((tab, i) => (
        <button
          key={i}
          className={`px-5 py-2 rounded-full text-sm transition 
          ${i === 0 
            ? "bg-green-500 text-black" 
            : "bg-white/10 hover:bg-white/20"
          }`}
        >
          {tab}
        </button>
      ))}

    </div>
  );
}