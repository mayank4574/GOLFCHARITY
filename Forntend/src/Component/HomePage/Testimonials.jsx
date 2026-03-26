export default function Testimonials() {
  const data = [
    {
      name: "Marcus Chen",
      text: "Kinetic Horizon transformed my weekends.",
    },
    {
      name: "Sarah Jenkins",
      text: "Winning the tech bundle was incredible.",
    },
    {
      name: "Robert Langdon",
      text: "Feels more like a premium experience.",
    },
  ];

  return (
    <section className="py-20">
      
      {/* 🔥 MAIN CONTAINER FIX */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center mb-12">
          Voices of the Sanctuary
        </h2>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {data.map((item, i) => (
            <div
              key={i}
              className="bg-[#0f172a] p-6 rounded-xl hover:scale-105 transition duration-300"
            >
              <p className="text-gray-400 text-sm">
                "{item.text}"
              </p>

              <p className="mt-4 font-semibold text-white">
                {item.name}
              </p>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}