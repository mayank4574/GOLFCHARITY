export default function ImpactPartners() {
  const cards = [
    {
      img: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
      title: "Gaia Roots",
      desc: "Restoring ecosystems and planting trees globally.",
      amount: "$420k+",
    },
    {
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      title: "Blue Horizon",
      desc: "Ocean cleanup and marine conservation.",
      amount: "$315k+",
    },
    {
      img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
      title: "Urban Lift",
      desc: "Empowering underprivileged communities.",
      amount: "$180k+",
    },
  ];

  return (
    <section className="py-20">
      
      {/* 🔥 MAIN CONTAINER FIX */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Impact Partners</h2>

          {/* 🔥 BUTTON STYLE FIX */}
          <button className="text-green-400 text-sm hover:underline">
            View All Partners →
          </button>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-[#0f172a] rounded-2xl overflow-hidden hover:scale-105 transition duration-300"
            >
              
              {/* IMAGE */}
              <img
                src={card.img}
                alt={card.title}
                className="h-48 w-full object-cover"
              />

              {/* CONTENT */}
              <div className="p-5">
                <h3 className="font-semibold text-lg">
                  {card.title}
                </h3>

                <p className="text-gray-400 text-sm mt-2">
                  {card.desc}
                </p>

                <p className="text-green-400 text-sm mt-4 font-semibold">
                  TOTAL IMPACT {card.amount}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>

    </section>
  );
}