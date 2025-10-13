"use client";
import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface CountUpAnimationProps {
  target: string;
  duration?: number;
}

export const CountUpAnimation = ({ target, duration = 2000 }: CountUpAnimationProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Extract numeric value and suffix from target
  const parseTarget = (target: string) => {
    const match = target.match(/(\d+(?:\.\d+)?)([KMB%\/]*)/);
    if (!match) return { value: 0, suffix: "" };
    
    const value = parseFloat(match[1]);
    const suffix = match[2];
    
    // Handle different suffixes
    let multiplier = 1;
    if (suffix.includes("K")) multiplier = 1000;
    if (suffix.includes("M")) multiplier = 1000000;
    if (suffix.includes("B")) multiplier = 1000000000;
    
    return { value: value * multiplier, suffix };
  };

  const { value: targetValue, suffix } = parseTarget(target);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * targetValue);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, targetValue, duration]);

  const formatCount = (num: number) => {
    if (suffix.includes("K")) return (num / 1000).toFixed(0) + "K";
    if (suffix.includes("M")) return (num / 1000000).toFixed(0) + "M";
    if (suffix.includes("B")) return (num / 1000000000).toFixed(0) + "B";
    if (suffix.includes("%")) return num.toFixed(0) + "%";
    if (suffix.includes("/")) return num.toFixed(0) + "/7";
    return num.toFixed(0);
  };

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {formatCount(count)}
    </motion.span>
  );
};
