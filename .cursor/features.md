# Feature inventory

Status: `locked` = must not regress · `evolving` = still iterating

<!-- Newest first -->

### Music item context menu (Notion-like)
- Status: evolving
- What: Item more-menu is Copy link → Duplicate → Rename (popover) → Delete; Copy link writes the public share URL and shows brief copied feedback.
- Paths: `src/components/MusicProjects/useMusicItemContextMenu.tsx`, `src/components/MusicProjects/MusicItemContextMenuPopover.tsx`, `src/components/MusicProjects/MusicItemRenamePopover.tsx`, `src/utils/shareUrls.ts`, `src/utils/glassPaperStyles.ts`
- Invariants: Menu order fixed as above; Delete icon uses error color; glass popovers use mode-aware paper alpha (~0.82 light / ~0.78 dark) + 10px blur; rename prefills from `MusicItemMenuTarget.name`; share popover is not opened from this menu
- Updated: 2026-10-03

### Discreet scrollbar (sidebar + main)
- Status: evolving
- What: Thin capsule scrollbar with transparent track on sidebar drawer list and main content scroll area.
- Paths: `src/utils/discreetScrollbarStyles.ts`, `src/components/Sidebar.tsx`
- Invariants: ~6px thumb; no red debug border; sidebar uses light-on-dark thumb
- Updated: 2026-10-03

### Music item Share + light-card embed
- Status: evolving
- What: Public `/share/{kind}/{id}` shows a light card with login/signup for guests (signed-in users redirect to the item); `/embed/{kind}/{id}` is the iframe light card. Share URL is what Copy link copies.
- Paths: `src/components/Share/ShareLightCard.tsx`, `src/services/shareService.ts`, `src/app/[locale]/share/[kind]/[id]/page.tsx`, `src/app/[locale]/embed/[kind]/[id]/page.tsx`, `src/utils/shareUrls.ts`
- Invariants: Public teaser only (name/cover/color); guests prompted to log in/sign up with redirect to item; embed allows framing via CSP `frame-ancestors *`
- Updated: 2026-10-03

### Sidebar section View more
- Status: evolving
- What: Each sidebar recents section has a header chevron (collapse body), a title link to the list page, hover MoreHoriz (Notion menu), and View more/less that expands the list in place (preview 5 vs all via sidebar recents `limit`). Squared sidebar header icon buttons (avatar stays circular).
- Paths: `src/components/Sidebar.tsx`, `src/components/TopbarActions.tsx`, `src/services/sidebarService.ts`, `src/app/[locale]/api/sidebar/recents/route.ts`, `src/queries/hooks/sidebar/useGetSidebarRecents.ts`
- Invariants: Title navigates to list page; View more/less does not navigate; chevron toggles section body; shallow duplicate via POST `…/duplicate`
- Updated: 2026-10-03
