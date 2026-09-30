# Feature inventory

Status: `locked` = must not regress · `evolving` = still iterating

<!-- Newest first -->

### Sidebar section View more
- Status: evolving
- What: Each sidebar recents section has a header chevron (expand/collapse via TransitionGroup + Collapse), a hover MoreHoriz that opens Duplicate/Delete, and a View more row linking to the full list.
- Paths: `src/components/Sidebar.tsx`, `src/components/MusicProjects/useMusicItemContextMenu.tsx`, `src/components/MusicProjects/MusicItemContextMenuPopover.tsx`, `src/services/{musicProject,song,album}Service.ts`
- Invariants: Section title is not a link; chevron toggles expand/collapse; hover `⋯` opens shared menu with Duplicate + Delete; shallow duplicate via POST `…/duplicate`; View more is last list row; same list hrefs (`/{locale}/projects|songs|albums`)
- Updated: 2026-09-30
