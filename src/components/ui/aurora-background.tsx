"use client";
import { cn } from "@/lib/utils";
import { isTelegramWebApp } from "@/lib/telegram";
import React, { ReactNode, memo, useEffect, useState } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  const [isInTelegram, setIsInTelegram] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Проверяем, запущено ли приложение в Telegram Web App
    setIsInTelegram(isTelegramWebApp());
  }, []);

  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col min-h-screen items-center justify-start bg-black text-white transition-bg",
          className
        )}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          contain: 'layout style paint',
          overflow: mounted && isInTelegram ? 'visible' : 'auto',
          height: mounted && isInTelegram ? '100%' : 'auto'
        }}
        {...props}
      >
        <div 
          className="absolute inset-0 overflow-hidden aurora-optimized"
          style={{
            transform: 'translateZ(0)',
            contain: 'layout style paint'
          }}
        >
          <div
            className={cn(
              ` 
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] 
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] 
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] 
            [background-image:var(--dark-gradient),var(--aurora)] 
            [background-position:50%_50%,50%_50%] 
            [background-size:300%,_200%] 
            pointer-events-none 
            absolute -inset-[10px] aurora-optimized
            filter blur-[10px] opacity-50 
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)] 
            after:[background-size:200%,_100%]
            after:animate-aurora after:mix-blend-difference
            sm:[background-size:300%,_200%] sm:blur-[10px] sm:opacity-50
            md:[background-size:300%,_200%] md:blur-[10px] md:opacity-50`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              willChange: 'transform',
              contain: 'layout style paint'
            }}
          ></div>
        </div>
        <div 
          style={{
            transform: 'translateZ(0)',
            contain: 'layout style paint'
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
};

const MemoizedAuroraBackground = memo(AuroraBackground);
MemoizedAuroraBackground.displayName = 'AuroraBackground';

export default MemoizedAuroraBackground;
export { MemoizedAuroraBackground as AuroraBackground };