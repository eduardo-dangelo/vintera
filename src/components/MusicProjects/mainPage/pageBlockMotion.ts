export const PAGE_BLOCK_MOTION_MS = 200;

const pageBlockEntering = new Set<number>();

export function markPageBlockEntering(pos: number) {
  pageBlockEntering.add(pos);
}

export function isPageBlockEntering(pos: number) {
  return pageBlockEntering.has(pos);
}

export function clearPageBlockEntering(pos: number) {
  pageBlockEntering.delete(pos);
}

const pageBlockExiting = new Set<number>();
let pageBlockExitVersion = 0;
const pageBlockExitListeners = new Set<() => void>();

function emitPageBlockExit() {
  pageBlockExitVersion += 1;
  pageBlockExitListeners.forEach(listener => listener());
}

export function subscribePageBlockExit(listener: () => void) {
  pageBlockExitListeners.add(listener);
  return () => {
    pageBlockExitListeners.delete(listener);
  };
}

export function getPageBlockExitVersion() {
  return pageBlockExitVersion;
}

export function isPageBlockExiting(pos: number) {
  return pageBlockExiting.has(pos);
}

export function requestPageBlockExit(positions: number[], remove: () => void) {
  const fresh = positions.filter(pos => !pageBlockExiting.has(pos));
  if (fresh.length === 0) {
    return;
  }
  fresh.forEach(pos => pageBlockExiting.add(pos));
  emitPageBlockExit();
  window.setTimeout(() => {
    fresh.forEach(pos => pageBlockExiting.delete(pos));
    emitPageBlockExit();
    remove();
  }, PAGE_BLOCK_MOTION_MS);
}
