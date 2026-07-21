import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Reactive hook that returns `true` when the viewport width is ≤ 768 px.
 * Updates automatically on window resize.
 */
export function useMobileDetect(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth <= MOBILE_BREAKPOINT
      : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    // Set initial state in case SSR value differs
    setIsMobile(mql.matches);

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
