export default function Footer() {
  return (
    <footer className="border-t border-gray-700 py-10">
      
      {/* 🔥 MAIN CONTAINER FIX */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">

        {/* LOGO */}
        <h1 className="text-white font-bold">
          KINETICHORIZON
        </h1>

        {/* LINKS */}
        <div className="flex flex-wrap gap-6 mt-4 md:mt-0">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer">Terms</span>
          <span className="hover:text-white cursor-pointer">Charity Partners</span>
          <span className="hover:text-white cursor-pointer">Support</span>
        </div>

      </div>

    </footer>
  );
}