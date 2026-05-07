import { useScroll, useMotionValueEvent, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';

export function useScrollCollapse(distance = 80) {
  const { scrollY } = useScroll();
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, { stiffness: 400, damping: 40 });
  const lastY = useRef(0);
  const accumulated = useRef(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useMotionValueEvent(scrollY, 'change', (current) => {
    const delta = current - lastY.current;
    lastY.current = current;

    if (current <= 5) {
      accumulated.current = 0;
    } else {
      accumulated.current = Math.max(0, Math.min(distance, accumulated.current + delta));
    }
    progress.set(accumulated.current / distance);
  });

  useMotionValueEvent(smoothProgress, 'change', (v) => {
    setIsCollapsed(v >= 0.95);
  });

  return { scrollProgress: smoothProgress, isCollapsed };
}
