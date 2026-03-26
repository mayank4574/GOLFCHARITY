export default function StatsSection() {
  const stats = [
    { value: "$2.4M", label: "TOTAL DISTRIBUTED", color: "text-green-400" },
    { value: "12", label: "GLOBAL PARTNERS" },
    { value: "45k", label: "LIVES IMPACTED" },
    { value: "100%", label: "TRANSPARENCY", color: "text-yellow-300" },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 mb-20 grid grid-cols-2 md:grid-cols-4 gap-4">
      
      {stats.map((item, i) => (
        <div key={i} className="bg-[#131b2e] p-6 rounded-xl">
          <h2 className={`text-2xl font-bold ${item.color || "text-white"}`}>
            {item.value}
          </h2>
          <p className="text-xs text-gray-400">{item.label}</p>
        </div>
      ))}

    </section>
  );
}