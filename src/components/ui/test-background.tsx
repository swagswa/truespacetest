"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface TestBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

export const TestBackground = ({
  className,
  children,
  ...props
}: TestBackgroundProps) => {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};