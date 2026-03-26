export default function SplitSection() {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 p-8 rounded-2xl grid md:grid-cols-2 gap-10 items-center">

      <div>
        <h2 className="text-3xl font-bold mb-4">
          Prize Split Architecture
        </h2>

        <div className="space-y-4">
          <div>
            <p>Prize Pool (60%)</p>
            <div className="bg-gray-700 h-2 rounded-full">
              <div className="bg-yellow-400 w-[60%] h-2 rounded-full"></div>
            </div>
          </div>

          <div>
            <p>Charity (25%)</p>
            <div className="bg-gray-700 h-2 rounded-full">
              <div className="bg-green-400 w-[25%] h-2 rounded-full"></div>
            </div>
          </div>

          <div>
            <p>Fund (15%)</p>
            <div className="bg-gray-700 h-2 rounded-full">
              <div className="bg-white w-[15%] h-2 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-40 h-40 rounded-full border-[10px] border-green-400 flex items-center justify-center text-2xl font-bold hover:rotate-6 transition">
          9.8
        </div>
      </div>

    </div>
  );
}