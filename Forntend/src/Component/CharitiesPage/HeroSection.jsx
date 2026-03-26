export default function HeroSection() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-20 pb-16">
      
      <p className="text-green-400 text-xs tracking-widest mb-4">
        IMPACT PARTNERS
      </p>

      <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
        Powering the{" "}
        <span className="text-green-400">Sanctuary</span> through Global Change.
      </h1>

      <p className="text-gray-400 max-w-2xl mb-10">
        We’ve curated a network of high-impact partners dedicated to change.
      </p>

      <div className="flex gap-4">
        <button className="bg-green-500 text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">
          Explore Impact
        </button>

        <button className="border border-gray-600 px-6 py-3 rounded-xl text-yellow-300">
          Become a Partner
        </button>
      </div>

    </section>
  );
}