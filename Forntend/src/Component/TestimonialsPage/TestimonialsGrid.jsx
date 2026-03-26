export default function TestimonialsGrid() {
  const data = [
    {
      name: "Marcus Thorne",
      text: "Winning changed my life. Real impact matters.",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Sarah Chen",
      text: "Transparency and real results impressed me.",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Jameson Reed",
      text: "Best platform I’ve ever used.",
      img: "https://randomuser.me/api/portraits/men/52.jpg",
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-6">

      {data.map((item, i) => (
        <div
          key={i}
          className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/10"
        >
          <div className="flex items-center gap-4 mb-4">
            <img src={item.img} className="w-12 h-12 rounded-full" />
            <h3 className="font-semibold">{item.name}</h3>
          </div>

          <p className="text-gray-400 text-sm">
            "{item.text}"
          </p>

        </div>
      ))}

    </section>
  );
}