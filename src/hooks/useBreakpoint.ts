import { useWindowDimensions } from "react-native";
import { isNative } from "@/lib/platform";

/** Shortest side (in dp) at/above which a native device is treated as a tablet. */
const TABLET_MIN_SIDE = 600;

export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = "base" | keyof typeof BREAKPOINTS;

export type BreakpointInfo = {
  width: number;
  height: number;

  active: Breakpoint;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  /**
   * True for a physical tablet (native, shortest side >= 600dp), regardless of
   * orientation or split-view width. Use this for device-shaped layout choices
   * (an iPad mini in portrait is 744dp wide — a phone by width, a tablet here).
   */
  isTabletDevice: boolean;
  /** Sensible default grid column count for lists/cards. */
  columns: number;
  /** True once the viewport is at least the given breakpoint. */
  atLeast: (bp: keyof typeof BREAKPOINTS) => boolean;
};

export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();

  const active: Breakpoint = width >= BREAKPOINTS.xl
    ? "xl"
    : width >= BREAKPOINTS.lg
    ? "lg"
    : width >= BREAKPOINTS.md
    ? "md"
    : width >= BREAKPOINTS.sm
    ? "sm"
    : "base";

  const isPhone = width < BREAKPOINTS.md;
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;

  return {
    width,
    height,
    active,
    isPhone,
    isTablet,
    isDesktop,
    isLandscape: width > height,
    isTabletDevice: isNative && Math.min(width, height) >= TABLET_MIN_SIDE,
    columns: isDesktop ? 3 : isTablet ? 2 : 1,
    atLeast: (bp) => width >= BREAKPOINTS[bp],
  };
}
