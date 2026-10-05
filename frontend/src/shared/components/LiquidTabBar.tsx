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

// Physics constants
const GLIDE = { type: "spring", stiffness: 320, damping: 23, mass: 0.9 } as const;
const GLIDE_CALM = { type: "spring", stiffness: 500, damping: 45 } as const;
const BLEED_X = 4;
const DRAG_SLOP_PX = 4;
const LENS_ZOOM = 1.22;
const RIM_ZOOM = 1.42;

function tabFace(tab: LiquidTab, highlighted: boolean, inLens = false) {
  const face = (
    <>
      <span className="relative">
        <tab.icon className="size-5" strokeWidth={highlighted ? 2.35 : 2} />
        {tab.locked && <Lock className="absolute -right-1.5 -top-1 size-2.5" />}
        {Boolean(tab.badge) && (
          <span className="absolute -top-1 -right-1.5 h-2.5 w-2.5 rounded-full bg-pink-500 border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />
        )}
      </span>
      <span>{tab.label}</span>
    </>
  );
  if (!inLens) return face;
  return (
    <span
      className={cn(
        "liquid-face relative flex w-full flex-col items-center gap-1 py-2",
        highlighted ? "text-[var(--color-primary,#ec4899)] font-bold" : "text-[var(--color-muted,#64748B)]"
      )}
    >
      {face}
    </span>
  );
}

function activeIndexFor(tabs: LiquidTab[], pathname: string): number {
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
  return best;
}

export function LiquidTabBar({
  tabs,
  testId = "mobile-nav",
  ariaLabel = "Navigation",
  onLockedPress,
  slideTransition = false,
  className = "mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 lg:hidden",
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
  const [shellBox, setShellBox] = useState({ width: 0, height: 0 });

  const x = useMotionValue(0);
  const width = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(activeIndex);

  // Velocity-based physical liquid stretch & squash
  const velocity = useVelocity(x);
  const smoothVelocity = useSpring(velocity, { stiffness: 420, damping: 20 });
  const stretch = useTransform(smoothVelocity, [-2200, 0, 2200], reduceMotion ? [1, 1, 1] : [1.4, 1, 1.4]);
  const squash = useTransform(stretch, (s) => 1 / Math.sqrt(s));
  const lift = useSpring(1, { stiffness: 460, damping: 13 });
  const liftY = useSpring(0, { stiffness: 380, damping: 15 });
  const hop = useTransform(smoothVelocity, (v) => (reduceMotion ? 0 : -Math.min(5, Math.abs(v) / 450)));

  const scaleX = useTransform(() => stretch.get() * lift.get());
  const scaleY = useTransform(() => squash.get() * lift.get());
  const y = useTransform(() => hop.get() + liftY.get());
  const lensX = useTransform(x, (v) => -v);
  const lensY = useTransform(y, (v) => -v);

  const lensLayer = (zoom: number, layerClassName: string) => (
    <span className={cn("liquid-lens-zoom", layerClassName)} style={{ transform: `scale(${zoom})` }}>
      <motion.span className="liquid-lens-row" style={{ width: shellBox.width, height: shellBox.height, x: lensX, y: lensY }}>
        {tabs.map((tab, i) => (
          <span
            key={tab.to}
            className="mobile-bottom-nav-item relative flex flex-1 items-stretch justify-stretch rounded-2xl text-[10px] font-medium"
          >
            {tabFace(tab, i === (dragging ? hoverIndex : activeIndex), true)}
          </span>
        ))}
      </motion.span>
    </span>
  );

  const pillX = (slot: { left: number }) => slot.left - BLEED_X;
  const pillW = (slot: { width: number }) => slot.width + BLEED_X * 2;

  const measure = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    setSlots(itemRefs.current.map((el) => (el ? { left: el.offsetLeft, width: el.offsetWidth } : { left: 0, width: 0 })));
    setShellBox({ width: shell.clientWidth, height: shell.clientHeight });
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
    const slot = slots[activeIndex];
    if (!slot || dragging) return;
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

  // Drag interaction
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
    if (!reduceMotion) lift.set(0.93);
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
        lift.set(1.16);
        liftY.set(-5);
      }
      shellRef.current?.setPointerCapture(e.pointerId);
    }
    const first = slots[0] ? pillX(slots[0]) : 0;
    const last = slots[slots.length - 1] ? pillX(slots[slots.length - 1]) : 0;
    let next = d.originLeft + dx;
    if (next < first) next = first - Math.sqrt(first - next) * 3;
    if (next > last) next = last + Math.sqrt(next - last) * 3;
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
      className={cn("mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 lg:hidden", className)}
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
        {activeIndex >= 0 && (
          <motion.span
            aria-hidden
            className={cn("mobile-bottom-nav-active liquid-pill absolute", dragging && "is-dragging")}
            style={{
              left: 0,
              top: "-0.3rem",
              bottom: "-0.3rem",
              x,
              y,
              width,
              scaleX,
              scaleY,
            }}
          >
            <span className="liquid-lens">
              {lensLayer(LENS_ZOOM, "liquid-lens-core")}
              {lensLayer(RIM_ZOOM, "liquid-lens-rim")}
              {lensLayer(RIM_ZOOM, "liquid-lens-fringe liquid-lens-fringe-warm")}
              {lensLayer(RIM_ZOOM, "liquid-lens-fringe liquid-lens-fringe-cool")}
            </span>
            <span className="liquid-rim" />
          </motion.span>
        )}

        {tabs.map((tab, i) => {
          const highlighted = i === (dragging ? hoverIndex : activeIndex);
          const content = (
            <motion.span
              className="relative z-10 flex w-full flex-col items-center gap-1 py-2"
              whileTap={dragging ? undefined : { scale: 0.9 }}
              animate={{ scale: dragging && highlighted ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {tabFace(tab, highlighted)}
            </motion.span>
          );
          const itemClassName = cn(
            "mobile-bottom-nav-item relative flex flex-1 items-stretch justify-stretch rounded-2xl text-[10px] font-medium transition-colors",
            highlighted ? "text-[var(--color-primary,#ec4899)] font-bold" : "text-[var(--color-muted,#64748B)]",
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
