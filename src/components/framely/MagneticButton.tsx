import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";

type CommonProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

type ButtonProps = CommonProps & {
  as?: "button";
  onClick?: () => void;
  type?: "button" | "submit";
};
type AnchorProps = CommonProps & {
  as: "a";
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
};

type Props = ButtonProps | AnchorProps;

/** Cursor-following button/link with subtle magnetism and click squish. */
export function MagneticButton(props: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (props.as === "a") {
    const { children, className, href, target, rel, onClick, ...rest } = props;
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileTap={{ scale: 0.97 }}
        style={{ x, y }}
        className={className}
        aria-label={rest["aria-label"]}
      >
        {children}
      </motion.a>
    );
  }

  const { children, className, onClick, type = "button", ...rest } = props;
  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.97 }}
      style={{ x, y }}
      className={className}
      aria-label={rest["aria-label"]}
    >
      {children}
    </motion.button>
  );
}
