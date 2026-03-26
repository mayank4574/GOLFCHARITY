import { useState } from "react";

export default function PrizeCards() {
  const [selected, setSelected] = useState(null);

  const data = [
    {
      title: "The Horizon Escape",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      price: "$45,000",
      desc: "7-Day Private Jet Experience",
      full: "Luxury private jet journey with curated destinations and elite experience.",
    },
    {
      title: "Tech Sanctum Bundle",
      img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f",
      price: "$8,500",
      desc: "Premium hardware ecosystem",
      full: "Top-tier workstation with high-end components.",
    },
  ];

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">

        {data.map((item, i) => (
          <div
            key={i}
            onClick={() => setSelected(item)}
            className="group bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10"
          >
            <img
              src={item.img}
              className="h-60 w-full object-cover group-hover:scale-105 transition duration-500"
            />

            <div className="p-6">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-gray-400 text-sm mt-2">{item.desc}</p>
              <p className="mt-4 text-green-400 font-semibold">{item.price}</p>
            </div>
          </div>
        ))}

      </div>

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#0f172a]/90 border border-white/10 rounded-2xl w-[90%] md:w-[520px] p-6 animate-scaleFade shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.img}
              className="h-52 w-full object-cover rounded-xl"
            />

            <h2 className="text-2xl font-semibold mt-4">{selected.title}</h2>

            <p className="text-gray-400 mt-2">{selected.full}</p>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 bg-green-500 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}