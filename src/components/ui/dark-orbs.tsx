"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface DarkOrbsProps {
  className?: string;
  orbCount?: number;
}

export const DarkOrbs = ({
  className,
  orbCount = 6,
}: DarkOrbsProps) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {Array.from({ length: orbCount }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 200 + 100}px`,
            height: `${Math.random() * 200 + 100}px`,
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 30%, transparent 70%)`,
            animation: `darkOrb${i} ${Math.random() * 20 + 15}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      
      {/* Floating dark particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle${i % 4} ${Math.random() * 8 + 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes darkOrb0 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          25% { transform: translate(30px, -40px) scale(1.1); opacity: 0.3; }
          50% { transform: translate(-20px, 30px) scale(0.9); opacity: 0.1; }
          75% { transform: translate(40px, 20px) scale(1.05); opacity: 0.25; }
        }
        @keyframes darkOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          33% { transform: translate(-40px, 30px) scale(1.2); opacity: 0.25; }
          66% { transform: translate(25px, -35px) scale(0.8); opacity: 0.1; }
        }
        @keyframes darkOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          20% { transform: translate(35px, 25px) scale(1.1); opacity: 0.3; }
          40% { transform: translate(-30px, -20px) scale(0.9); opacity: 0.15; }
          60% { transform: translate(20px, 40px) scale(1.05); opacity: 0.25; }
          80% { transform: translate(-25px, 15px) scale(0.95); opacity: 0.1; }
        }
        @keyframes darkOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.18; }
          50% { transform: translate(-35px, -30px) scale(1.15); opacity: 0.28; }
        }
        @keyframes darkOrb4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.22; }
          25% { transform: translate(20px, 35px) scale(0.85); opacity: 0.12; }
          75% { transform: translate(-30px, -25px) scale(1.1); opacity: 0.3; }
        }
        @keyframes darkOrb5 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.16; }
          40% { transform: translate(45px, -20px) scale(1.2); opacity: 0.26; }
          80% { transform: translate(-20px, 30px) scale(0.9); opacity: 0.1; }
        }
        
        @keyframes floatParticle0 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
        }
        @keyframes floatParticle1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(15px) translateX(-8px); opacity: 0.6; }
        }
        @keyframes floatParticle2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          50% { transform: translateY(-15px) translateX(-12px); opacity: 0.8; }
        }
        @keyframes floatParticle3 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.25; }
          50% { transform: translateY(25px) translateX(15px); opacity: 0.65; }
        }
      `}</style>
    </div>
  );
};