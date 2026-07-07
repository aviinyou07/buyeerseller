import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

const SplashScreen = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => {
      setVisible(true);
    });

    const fadeOutTimer = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(fadeOutTimer);
    };
  }, []);

  return (
    <div
      className={`min-h-screen w-full bg-[#c0bdff] flex items-center justify-center px-5 transition-all duration-700 ease-in-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
      }`}
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        {/* Logo */}
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white sm:h-28 sm:w-28 sm:rounded-[32px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4d49b9] sm:h-16 sm:w-16">
            <ShoppingBag size={32} className="text-white sm:size-9" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="mt-6 text-3xl font-black tracking-tight text-[#102a43] sm:text-4xl">
          Marketplace
        </h1>

        <p className="mt-2 text-sm font-semibold text-[#102a43]/70 sm:text-base">
          Loading your panel...
        </p>

        {/* Progress Loader */}
        <div className="mt-8 flex w-full max-w-[230px] flex-col items-center gap-3">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/40">
            <div className="absolute inset-0 rounded-full bg-white/25" />

            <div className="h-full w-20 animate-[progressMove_1.4s_ease-in-out_infinite] rounded-full bg-white" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:300ms]" />
          </div>
        </div>

        <style>
          {`
            @keyframes progressMove {
              0% {
                transform: translateX(-90px);
                opacity: 0.45;
              }

              50% {
                opacity: 1;
              }

              100% {
                transform: translateX(230px);
                opacity: 0.45;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default SplashScreen;