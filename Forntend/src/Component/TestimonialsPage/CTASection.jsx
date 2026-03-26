export default function CTASection() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 mt-20 mb-16">
      
      <div className="bg-white/5 backdrop-blur border border-white/10 p-10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">

        <div>
          <h2 className="text-2xl font-bold mb-2">
            Want to create your own story?
          </h2>

          <p className="text-gray-400 text-sm">
            Join the sanctuary and start your journey.
          </p>
        </div>

        <div className="flex gap-4">
          <button className="bg-green-500 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition">
            Enter the Vault
          </button>

          <button className="border border-gray-600 px-6 py-2 rounded-full">
            Learn More
          </button>
        </div>

      </div>

    </section>
  );
}