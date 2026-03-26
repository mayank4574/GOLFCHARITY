import { useState } from "react";

export default function ImpactGrid() {
  const [selected, setSelected] = useState(null);

  const data = [
    {
      title: "Gaia Roots",
      img: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
      desc: "Reforestation using drone technology.",
      full: "Detailed info about Gaia Roots project.",
    },
    {
      title: "Blue Horizon",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      desc: "Ocean cleanup initiative.",
      full: "Detailed info about Blue Horizon.",
    },
    {
      title: "Urban Lift",
      img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
      desc: "City development programs.",
      full: "Detailed info about Urban Lift.",
    },
  ];

  return (
    <>
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-6">

        {data.map((item, i) => (
          <div
            key={i}
            onClick={() => setSelected(item)}
            className="bg-[#131b2e] rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition"
          >
            <img src={item.img} className="h-48 w-full object-cover" />

            <div className="p-5">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{item.desc}</p>
            </div>
          </div>
        ))}

      </section>

      {/* MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#0f172a] p-6 rounded-2xl w-[90%] md:w-[500px] animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.img}
              className="h-48 w-full object-cover rounded-xl"
            />

            <h2 className="text-xl font-bold mt-4">{selected.title}</h2>

            <p className="text-gray-400 mt-2">{selected.full}</p>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 bg-green-500 text-black px-5 py-2 rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}