"use client";

import { useMemo } from "react";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#7C3AED", "#6366F1"];

export function ConfettiOverlay() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 2.5 + Math.random() * 1.5,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        rotate: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confetti-fall rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
