"use client";

import { motion } from "motion/react";
import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface Card3DProps {
  className?: string;
}

export function Card3D({ children, className = "" }: PropsWithChildren<Card3DProps>) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn("relative rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md", className)}
    >
      <div className="w-full h-full relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
