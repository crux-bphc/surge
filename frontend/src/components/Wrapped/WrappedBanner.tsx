import { ArrowRight } from "lucide-react";

const PHRASE = "work hard bro one day 7* codechamp international grandmaster codeforces your cp skill beat Sundar Pichai you become next CEO google";

const BACKGROUND_TEXT = PHRASE.repeat(100)

export default function WrappedBanner() {
  return (
    <>
      <div className="relative flex flex-col md:flex-row md:items-center w-full bg-[#1C4D8D]/90 text-white py-4 px-6 rounded-lg mb-6 overflow-hidden">
        <div className="absolute bg-linear-155 from-black/40 to-black/5 z-2 inset-0"></div>
        <div className="absolute text-white/20 origin-top top-0 left-1/2 -translate-x-1/2 w-[128rem] -rotate-10 animate-scroll-code pointer-events-none select-none">
          <div>
            {BACKGROUND_TEXT}
            {BACKGROUND_TEXT}
            {BACKGROUND_TEXT}
          </div>
        </div>
        <div className="mb-4 md:m-0 flex flex-col md:block items-center z-3">
          <h2 className="text-2xl font-semibold text-center md:text-left">
            Surge Wrapped 2025
          </h2>
          <p className="mt-3 md:text-lg text-xs text-center text-white/90 md:text-left px-8 md:p-0">
            Take a look back at your CC journey in 2025!
          </p>
        </div>
        <button className="z-3 mt-4 md:m-0 md:ml-auto bg-white text-[#1C4D8D] text-sm md:text-md font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition">
          View Your Wrapped{" "}
          <ArrowRight className="inline-block p-0 m-0" strokeWidth={2.5} />
        </button>
      </div>
      <style>
        {`
          @keyframes scroll-code {
            0% { transform: translateY(-90%); }
            100% { transform: translateY(0%); }
          }

          .animate-scroll-code {
            animation: scroll-code 60s linear infinite;
          }
        `}
      </style>
    </>
  );
}
