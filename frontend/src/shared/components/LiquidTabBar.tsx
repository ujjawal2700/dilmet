import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { Link, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { Lock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { wasNativeBack } from "../lib/nativeBack";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type LiquidTab = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
  end?: boolean;
  locked?: boolean;
  badge?: boolean | number | string;
  matchPaths?: string[];
  matches?: (pathname: string) => boolean;
};

// Physics constants for under-damped liquid momentum overshoot
const GLIDE = { type: "spring", stiffness: 360, damping: 24, mass: 0.85 } as const;
const GLIDE_CALM = { type: "spring", stiffness: 500, damping: 45 } as const;
const BLEED_X = 2;
const DRAG_SLOP_PX = 4;

function activeIndexFor(tabs: LiquidTab[], pathname: string): number {
  if (!pathname) return 0;
  const path = pathname.replace(/\/+$/, "") || "/";
  let best = -1;
  let bestLen = -1;
  tabs.forEach((t, i) => {
    let hit = false;
    if (t.matches) {
      hit = t.matches(path);
    } else if (t.matchPaths) {
      hit = t.matchPaths.some((p) => path === p || path.startsWith(`${p}/`));
    } else {
      hit = t.end ? path === t.to : path === t.to || path.startsWith(`${t.to}/`);
    }
    if (hit && (t.to.length > bestLen || t.matches || t.matchPaths)) {
      best = i;
      bestLen = t.to.length;
    }
  });
  return best >= 0 ? best : 0;
}

export function LiquidTabBar({
  tabs,
  testId = "mobile-nav",
  ariaLabel = "Navigation",
  onLockedPress,
  slideTransition = false,
  className = "mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 lg:hidden",
}: {
  tabs: LiquidTab[];
  testId?: string;
  ariaLabel?: string;
  onLockedPress?: (to: string) => void;
  slideTransition?: boolean;
  className?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const activeIndex = activeIndexFor(tabs, location.pathname);

  // If entering via native OS gesture back / Android hardware back, skip slide-in
  const navigationType = useNavigationType();
  const [enterInPlace] = useState(() => navigationType === "POP" && wasNativeBack());

  const shellRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [slots, setSlots] = useState<{ left: number; width: number }[]>([]);

  const x = useMotionValue(0);
  const width = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(activeIndex);

  // Velocity-based physical liquid stretch & squash with volume conservation
  const velocity = useVelocity(x);
  const smoothVelocity = useSpring(velocity, { stiffness: 420, damping: 20 });
  const stretch = useTransform(smoothVelocity, [-2200, 0, 2200], reduceMotion ? [1, 1, 1] : [1.38, 1, 1.38]);
  const squash = useTransform(stretch, (s) => 1 / Math.sqrt(Math.max(0.1, s)));
  const lift = useSpring(1, { stiffness: 460, damping: 13 });
  const liftY = useSpring(0, { stiffness: 380, damping: 15 });
  const hop = useTransform(smoothVelocity, (v) => (reduceMotion ? 0 : -Math.min(6, Math.abs(v) / 400)));

  const scaleX = useTransform(() => stretch.get() * lift.get());
  const scaleY = useTransform(() => squash.get() * lift.get());
  const y = useTransform(() => hop.get() + liftY.get());

  const pillX = (slot: { left: number }) => Math.max(0, slot.left - BLEED_X);
  const pillW = (slot: { width: number }) => slot.width + BLEED_X * 2;

  const measure = useCallback(() => {
    if (typeof window === "undefined") return;
    const shell = shellRef.current;
    if (!shell) return;
    const measuredSlots = itemRefs.current.map((el) =>
      el ? { left: el.offsetLeft, width: el.offsetWidth } : { left: 0, width: 0 }
    );
    if (measuredSlots.length > 0 && measuredSlots.some((s) => s.width > 0)) {
      setSlots(measuredSlots);
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    const shell = shellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(shell);
    return () => ro.disconnect();
  }, [measure, tabs.length]);

  const placed = useRef(false);
  const pendingIndex = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex < 0) return;
    const slot = slots[activeIndex];
    if (!slot || slot.width === 0 || dragging) return;
    if (pendingIndex.current !== null && pendingIndex.current !== activeIndex) return;
    pendingIndex.current = null;
    setHoverIndex(activeIndex);

    if (!placed.current) {
      x.jump(pillX(slot));
      width.jump(pillW(slot));
      placed.current = true;
      return;
    }

    if (Math.abs(x.get() - pillX(slot)) < 0.5 && Math.abs(width.get() - pillW(slot)) < 0.5) return;
    animate(x, pillX(slot), reduceMotion ? GLIDE_CALM : GLIDE);
    animate(width, pillW(slot), reduceMotion ? GLIDE_CALM : GLIDE);
  }, [activeIndex, slots, dragging, reduceMotion, x, width]);

  // Drag interaction with boundary rubber-banding & optical magnification
  const drag = useRef<{ id: number; startX: number; originLeft: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const nearestIndex = (left: number) => {
    let best = 0;
    let bestDist = Infinity;
    slots.forEach((s, i) => {
      const d = Math.abs(pillX(s) - left);
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    });
    return best;
  };

  const onPointerDown = (e: React.PointerEvent, index: number) => {
    if (index !== activeIndex || !slots[index]) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { id: e.pointerId, startX: e.clientX, originLeft: x.get(), moved: false };
    if (!reduceMotion) lift.set(0.92);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_SLOP_PX) return;
      d.moved = true;
      x.stop();
      width.stop();
      setDragging(true);
      if (!reduceMotion) {
        lift.set(1.18);
        liftY.set(-6);
      }
      try {
        shellRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // Fallback if pointer capture unsupported
      }
    }
    const first = slots[0] ? pillX(slots[0]) : 0;
    const last = slots[slots.length - 1] ? pillX(slots[slots.length - 1]) : 0;
    let next = d.originLeft + dx;
    if (next < first) next = first - Math.sqrt(Math.max(0, first - next)) * 3.5;
    if (next > last) next = last + Math.sqrt(Math.max(0, next - last)) * 3.5;
    x.set(next);
    const i = nearestIndex(next);
    setHoverIndex(i);
    if (slots[i]) width.set(pillW(slots[i]));
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    lift.set(1);
    liftY.set(0);

    try {
      if (shellRef.current?.hasPointerCapture(e.pointerId)) {
        shellRef.current?.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }

    if (!d.moved) return;
    suppressClick.current = true;
    setDragging(false);
    const i = nearestIndex(x.get());
    const slot = slots[i];
    if (slot) {
      animate(x, pillX(slot), reduceMotion ? GLIDE_CALM : GLIDE);
      animate(width, pillW(slot), reduceMotion ? GLIDE_CALM : GLIDE);
    }
    const tab = tabs[i];
    if (!tab || i === activeIndex) return;
    if (tab.locked) {
      onLockedPress?.(tab.to);
      return;
    }
    pendingIndex.current = i;
    navigate(tab.to);
  };

  return (
    <motion.nav
      data-testid={testId}
      aria-label={ariaLabel}
      className={cn("mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 lg:hidden", className)}
      initial={slideTransition && !enterInPlace ? { y: "110%" } : false}
      animate={{ y: 0 }}
      exit={slideTransition ? { y: "110%" } : undefined}
      transition={reduceMotion ? { duration: 0.12 } : { type: "spring", stiffness: 360, damping: 34 }}
    >
      <motion.div
        ref={shellRef}
        className="mobile-bottom-nav-shell no-callout mx-auto flex max-w-md items-center justify-around"
        initial={enterInPlace ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.75 }}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Floating Liquid-Glass Sliding Capsule */}
        {slots.length > 0 && slots[activeIndex]?.width > 0 && (
          <motion.span
            aria-hidden
            className={cn("mobile-bottom-nav-active liquid-pill absolute pointer-events-none", dragging && "is-dragging")}
            style={{
              left: 0,
              top: 4,
              bottom: 4,
              x,
              y,
              width,
              scaleX,
              scaleY,
            }}
          >
            {dragging ? (
              <>
                {/* Dynamic Prismatic Chromatic Aberration Halo & Magnifier Lens when Dragging */}
                <span className="liquid-prismatic-halo" />
                <span className="liquid-drag-lens" />
              </>
            ) : (
              /* Low-transparency frosted liquid glass pill when static */
              <span className="liquid-pill-static" />
            )}
          </motion.span>
        )}

        {/* Tab Items with Optical Magnification & Light Bend Physics */}
        {tabs.map((tab, i) => {
          const isTarget = i === (dragging ? hoverIndex : activeIndex);
          const Icon = tab.icon;

          // Calculate optical magnification and elevation bend based on distance to dragging pill
          const content = (
            <motion.span
              className="relative z-10 flex w-full flex-col items-center justify-center gap-0.5 py-1.5"
              whileTap={dragging ? undefined : { scale: 0.92 }}
              animate={
                dragging
                  ? isTarget
                    ? { scale: 1.28, y: -6, filter: "brightness(1.2)" }
                    : { scale: 0.94, y: 0, opacity: 0.65 }
                  : isTarget
                    ? { scale: 1.05, y: -0.5, filter: "brightness(1.05)", opacity: 1 }
                    : { scale: 1, y: 0, filter: "brightness(1)", opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 450, damping: 26 }}
            >
              <span className="relative flex items-center justify-center">
                {Icon && (
                  <Icon
                    className={cn(
                      "size-5 transition-all duration-200",
                      isTarget
                        ? "text-pink-600 dark:text-pink-400 scale-110 drop-shadow-[0_2px_8px_rgba(236,72,153,0.35)]"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    )}
                    strokeWidth={isTarget ? 2.4 : 1.9}
                  />
                )}
                {tab.locked && <Lock className="absolute -right-2 -top-1 size-2.5 text-slate-400 dark:text-slate-500" />}
                {Boolean(tab.badge) && (
                  <span
                    className={cn(
                      "absolute rounded-full bg-pink-500 border-2 border-white dark:border-slate-900 shadow-xs animate-pulse flex items-center justify-center text-white font-black text-[8px]",
                      typeof tab.badge === "number" || typeof tab.badge === "string"
                        ? "-top-1.5 -right-2.5 h-4 min-w-[1rem] px-1 leading-none"
                        : "-top-1 -right-1.5 h-2.5 w-2.5"
                    )}
                  >
                    {typeof tab.badge === "number" || typeof tab.badge === "string" ? tab.badge : ""}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-tight leading-none transition-all duration-200 select-none",
                  isTarget
                    ? "font-black text-pink-600 dark:text-pink-400 drop-shadow-[0_1px_4px_rgba(236,72,153,0.25)]"
                    : "font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                {tab.label}
              </span>
            </motion.span>
          );

          const itemClassName = cn(
            "mobile-bottom-nav-item group relative flex flex-1 items-stretch justify-stretch rounded-2xl text-[10px] font-medium transition-colors select-none",
            i === activeIndex && "touch-none"
          );

          const shared = {
            ref: (el: HTMLElement | null) => {
              itemRefs.current[i] = el;
            },
            className: itemClassName,
            draggable: false,
            onPointerDown: (e: React.PointerEvent) => onPointerDown(e, i),
          };

          return tab.locked ? (
            <button
              key={tab.to}
              type="button"
              {...shared}
              onClick={() => onLockedPress?.(tab.to)}
              aria-label={`${tab.label} — login required`}
            >
              {content}
            </button>
          ) : (
            <Link key={tab.to} to={tab.to} {...shared} aria-current={i === activeIndex ? "page" : undefined}>
              {content}
            </Link>
          );
        })}
      </motion.div>
    </motion.nav>
  );
}
export default LiquidTabBar;
