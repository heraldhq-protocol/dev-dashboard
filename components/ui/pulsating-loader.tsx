"use client";

import { motion } from "framer-motion";

export function PulsatingDots() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex space-x-2">
        <motion.div
          className="h-3 w-3 rounded-full bg-teal"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.div
          className="h-3 w-3 rounded-full bg-teal"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.3,
          }}
        />
        <motion.div
          className="h-3 w-3 rounded-full bg-teal"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.6,
          }}
        />
      </div>
    </div>
  );
}

export function RippleWaveLoader() {
  return (
    <div className="flex items-center justify-center space-x-1">
      {[...Array(7)].map((_, index) => (
        <motion.div
          key={index}
          className="h-8 w-2 rounded-full bg-teal"
          animate={{
            scaleY: [0.5, 1.5, 0.5],
            scaleX: [1, 0.8, 1],
            translateY: ["0%", "-15%", "0%"],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
}
