import { motion } from "framer-motion";
import { useMemo } from "react";

/** Decorative floating particles for the hero. Pure CSS via framer-motion loops. */
export function HeroParticles({ count = 14 }: { count?: number }) {
  const seeds = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 4 + Math.random() * 10,
        delay: Math.random() * 4,
        duration: 6 + Math.random() * 6,
      })),
    [count],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {seeds.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-accent/30 blur-[2px]"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ y: [-10, -40, -10], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
