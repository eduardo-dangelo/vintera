export const MUSIC_LIST_VIRTUALIZATION_THRESHOLD = 150;
export const MUSIC_LIST_ROW_ESTIMATE_PX = 68;
export const MUSIC_LIST_VIRTUAL_OVERSCAN = 8;

// Baseline sizes for manual perf checks in local/prod-like environments.
export const MUSIC_LIST_PERF_BASELINE_SIZES = [100, 300, 1000] as const;

export function shouldVirtualizeMusicList(
  rowCount: number,
  threshold = MUSIC_LIST_VIRTUALIZATION_THRESHOLD,
) {
  return rowCount >= threshold;
}
