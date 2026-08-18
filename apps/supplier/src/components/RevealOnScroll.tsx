"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // in ms
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  blur?: boolean;
}

export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
  blur = true,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  const getHiddenStyles = () => {
    switch (direction) {
      case "up":
        return "translate-y-8 scale-[0.98]";
      case "down":
        return "-translate-y-8 scale-[0.98]";
      case "left":
        return "translate-x-8 scale-[0.98]";
      case "right":
        return "-translate-x-8 scale-[0.98]";
      case "scale":
        return "scale-90";
      case "fade":
      default:
        return "scale-100";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: "800ms",
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`transition-all will-change-[transform,opacity,filter] ${
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0 scale-100 blur-0"
          : `opacity-0 ${getHiddenStyles()} ${blur ? "blur-[6px]" : ""}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
