# Feature inventory

Status: `locked` = must not regress · `evolving` = still iterating

<!-- Newest first -->

### Sidebar section View more
- Status: evolving
- What: Each sidebar recents section has a header chevron (collapse body), a title link to the list page, hover MoreHoriz (Duplicate/Delete), and View more/less that expands the list in place (preview 5 vs all via sidebar recents `limit`).
- Paths: `src/components/Sidebar.tsx`, `src/services/sidebarService.ts`, `src/app/[locale]/api/sidebar/recents/route.ts`, `src/queries/hooks/sidebar/useGetSidebarRecents.ts`
- Invariants: Title navigates to list page; View more/less does not navigate; chevron toggles section body; hover `⋯` opens Duplicate + Delete; shallow duplicate via POST `…/duplicate`
- Updated: 2026-10-03
