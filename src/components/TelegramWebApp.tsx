'use client';

import { useEffect, useState } from 'react';



export default function TelegramWebApp() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run on client side after component mounts
    if (typeof window !== 'undefined' && window.Telegram?.WebApp && !isInitialized) {
      const tg = window.Telegram.WebApp;
      
      // Initialize Telegram WebApp
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      
      // Optimize scrolling for Telegram Web App
      const optimizeScrolling = () => {
        // Settings for body
        document.body.style.overflow = 'auto';
        document.body.style.height = '100%';
        document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');
        document.body.style.setProperty('overscroll-behavior', 'contain');
        document.body.style.setProperty('touch-action', 'pan-y');
        document.body.style.setProperty('scroll-behavior', 'smooth');
        document.body.style.setProperty('transform', 'translateZ(0)');
        document.body.style.setProperty('backface-visibility', 'hidden');
        document.body.style.setProperty('-webkit-backface-visibility', 'hidden');
        document.body.style.setProperty('will-change', 'scroll-position');
        
        // Settings for html
        document.documentElement.style.overflow = 'auto';
        document.documentElement.style.height = '100%';
        document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
        document.documentElement.style.setProperty('scroll-behavior', 'smooth');
      };
      
      // Apply optimizations
      optimizeScrolling();
      
      // Set CSS custom properties to prevent hydration mismatch
      // These properties are set by Telegram WebApp and need to be consistent
      document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
      document.documentElement.style.setProperty('--tg-viewport-stable-height', `${tg.viewportStableHeight}px`);
      
      console.log('Telegram WebApp initialized:', {
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe
      });
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  return null; // This component doesn't render anything
}