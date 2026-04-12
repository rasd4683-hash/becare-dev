import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const THRESHOLD = 80;

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pullY = useMotionValue(0);
  const opacity = useTransform(pullY, [0, THRESHOLD], [0, 1]);
  const rotate = useTransform(pullY, [0, THRESHOLD], [0, 360]);
  const scale = useTransform(pullY, [0, THRESHOLD * 0.5, THRESHOLD], [0.5, 0.8, 1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    const el = containerRef.current;
    if (el && el.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    // Dampen the pull distance
    const dampened = Math.min(delta * 0.45, THRESHOLD * 1.5);
    pullY.set(dampened);
  }, [pulling, refreshing, pullY]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);

    if (pullY.get() >= THRESHOLD) {
      setRefreshing(true);
      animate(pullY, THRESHOLD * 0.6, { duration: 0.2 });
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        animate(pullY, 0, { duration: 0.3 });
      }
    } else {
      animate(pullY, 0, { duration: 0.25 });
    }
  }, [pulling, pullY, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity, y: useTransform(pullY, [0, THRESHOLD], [-40, 8]) }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none md:hidden"
      >
        <motion.div
          style={{ scale }}
          className="w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center"
        >
          <motion.div style={{ rotate: refreshing ? undefined : rotate }}>
            <RefreshCw className={`w-5 h-5 text-primary ${refreshing ? "animate-spin" : ""}`} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content with pull offset */}
      <motion.div style={{ y: useTransform(pullY, (v) => Math.min(v, THRESHOLD)) }} className="md:!transform-none">
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
