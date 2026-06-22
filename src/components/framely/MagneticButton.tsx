import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
  "aria-label"?: string;
  type?: "button" | "submit";
};

/** Cursor-following button with subtle magnetism and click squish. */
export function MagneticButton({ children, className = "", onClick, as = "button", href, ...rest }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height / 2;
    x.set(mx * 0.25);
    y.set(my * 0.25);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Comp: typeof motion.button = as === "a" ? (motion.a as never) : motion.button;
  return (
    <Comp
      ref={ref as never}
      href={href}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.97 }}
      style={{ x, y }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}
