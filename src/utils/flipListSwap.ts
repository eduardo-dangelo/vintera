const DEFAULT_DURATION_MS = 220;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** FLIP a single element from a pre-measured `firstTop` to its current layout top. */
export function flipFromFirstTop(
  element: HTMLElement | null,
  firstTop: number | null,
  durationMs = DEFAULT_DURATION_MS,
): void {
  if (!element || firstTop == null || prefersReducedMotion()) {
    return;
  }

  const lastTop = element.getBoundingClientRect().top;
  const delta = firstTop - lastTop;
  if (Math.abs(delta) < 0.5) {
    return;
  }

  element.style.transition = 'none';
  element.style.transform = `translateY(${delta}px)`;
  // Force layout so the browser applies the inverted transform before animating.
  void element.getBoundingClientRect();

  element.style.transition = `transform ${durationMs}ms ease`;
  element.style.transform = '';

  const cleanup = (event: TransitionEvent) => {
    if (event.propertyName !== 'transform') {
      return;
    }
    element.style.transition = '';
    element.removeEventListener('transitionend', cleanup);
  };
  element.addEventListener('transitionend', cleanup);
}

export function readElementTop(element: HTMLElement | null): number | null {
  if (!element) {
    return null;
  }
  return element.getBoundingClientRect().top;
}
