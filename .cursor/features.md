# Feature inventory

Status: `locked` = must not regress · `evolving` = still iterating

<!-- Newest first -->

### Project main sections
- Status: evolving
- What: Overview and custom tabs are TipTap pages. A collection is a song list (recent or custom). The Collections tab stacks those collections. Album pages and album creation are gone; existing albums are copied into collections once.
- Paths: `src/components/MusicProjects/MainPageEditor.tsx`, `src/components/MusicProjects/mainPage/pageMusicBlocks.tsx`, `src/utils/projectMainPage.ts`, `src/components/MusicProjects/ProjectDetailTabs.tsx`, `src/components/common/IconPickerPopover.tsx`
- Invariants: No empty-project screen; no hover insert bar; top bar stays until lock; song/event buttons on the bar; the event toolbar offers a new event or an existing event, inserted at the cursor, and an event already on the page cannot be added again; an event block stays until it ends, and removing that block leaves the calendar event; collections are optional and their title is part of the block; removing a collection leaves the songs in the project; the song toolbar offers a new song, an existing song, or a recent or custom collection, inserted at the cursor; recent can be added once per page; the first menu stays open until an existing song or a collection type is chosen; the New menu does not insert a page block and does not create albums; custom tabs insert the same song and collection blocks at the cursor; a just-inserted block stays on the page if project data reloads; a new block fades in, and Remove or Backspace fades it out; cards added to or removed from a list collapse like rows; bullets, numbers, and checkbox lists visible; a new checklist adds a heading 3 titled “✔️ Checklist”, a “N% completed” subtitle, and a faded progress bar as wide as that subtitle; page lines, headings, and the checklist sit tightly; the bar eases when the percentage changes; checklist More menu can hide completed items, and those rows collapse; checkboxes use the project accent; markdown shortcuts; the toolbar link button inserts a link embed at the cursor; paste a URL embeds it; the tab bar is always present, with Overview as the only pinned tab until a song or a collection exists; Overview first, then Songs as soon as the project has a song, then Collections as soon as any page has a collection; the Collections tab shows one live Recent section, then each custom collection in page order; those tabs cannot be renamed, moved, or deleted; custom tabs after them can be created, renamed, reordered, and deleted; drag and remove controls fade and expand in from the left; pinned tabs stay fixed during drag; add control is an icon button with a tooltip; delete confirm is a glass popover; custom tab icons come from the shared picker; collections switch between row and card with the view toggle, and a single song switches from its More menu to the other view; those page rows and cards hide the item more menu, and the block More button stays visible and its page action says Remove; page card titles are not underlined; an empty custom collection offers a button to select songs; adding one opens that picker from the collection menu, which stays open until a click outside or Escape dismisses every open menu together; a recent collection stays live, its View all opens the Songs tab, and a custom collection picks existing project songs; the collection icon sits before each collection title; members/calendar sidebar-only
- Updated: 2026-10-10

### Calendar event form (rich text + inline reminders)
- Status: evolving
- What: Create/edit event form uses rich text for description; reminder rows sit inline on the form (not a nested popover).
- Paths: `src/components/Calendar/CreateEventForm.tsx`, `src/components/Calendar/EventDetailsPopover.tsx`, `src/utils/sanitizeRichTextHtml.ts`
- Invariants: Description sanitized HTML on save; details/ICS render or plain-text export accordingly; max 5 reminder rows; AUTO tax/MOT markers stay hidden in details
- Updated: 2026-10-07

### Project calendar ICS subscribe
- Status: evolving
- What: Project calendars expose a secret ICS feed URL so Google/Apple/Outlook can subscribe (one-way export from Vintera).
- Paths: `src/services/calendarFeedService.ts`, `src/app/api/calendar-feeds/[token]/route.ts`, `src/components/MusicProjects/CalendarSubscribePopover.tsx`, `src/utils/icsCalendarFeed.ts`
- Invariants: One token per project; unauthenticated feed at `/api/calendar-feeds/{token}` (Arcjet skipped); view+ can copy; edit+ can rotate; Vintera remains source of truth
- Updated: 2026-10-06

### App sidebar recents skeleton
- Status: evolving
- What: Left nav shows a light-on-dark skeleton for Projects/Songs/Albums while sidebar recents are loading.
- Paths: `src/components/SidebarRecentsSkeleton.tsx`, `src/components/Sidebar.tsx`
- Invariants: Shown only while `isRecentsLoading`; 3 sections × 5 compact rows; empty sections stay hidden after load
- Updated: 2026-10-03

### Project sidebar sections
- Status: evolving
- What: Project detail sidebar (below general info) is a metadata-driven list of sections: members, calendar, video, link, text — add via divider +, MoreHoriz for edit/move/hide-or-delete; list animates enter/exit and move.
- Paths: `src/components/MusicProjects/ProjectDetailSidebar.tsx`, `src/utils/projectSidebarSections.ts`, `src/utils/flipListSwap.ts`, `src/utils/musicProjectMetadata.ts`
- Invariants: Members/calendar hide-only; video/link/text deletable; untitled content sections show no kind label; create form one shared title + URL-only rows for video/link; divider + menu uses glass MenuItems (Sidebar New pattern); no project-color gradient on sidebar container; Collapse enter/exit; FLIP move up/down (skipped when reduced-motion); legacy `externalLinks` migrate on read
- Updated: 2026-10-04

### Project general info inline field edit
- Status: evolving
- What: Genre and description edit one field at a time via click-to-edit; genre is multi-chip (comma/Enter commits tags, stored comma-joined); no MoreHoriz on the section; project delete stays on the app sidebar item menu.
- Paths: `src/components/MusicProjects/ProjectDetailGeneralInfoSection.tsx`, `src/components/MusicProjects/ProjectDetailSidebar.tsx`
- Invariants: Only one field open; Cancel/Save per field; active editors use `primary.main`; genre read mode shows one chip per tag; read-only skips click-to-edit
- Updated: 2026-10-03

### Music item context menu (Notion-like)
- Status: evolving
- What: Item more-menu is Copy link → Duplicate → Rename (popover) → Delete; Copy link writes the public share URL and shows brief copied feedback.
- Paths: `src/components/MusicProjects/useMusicItemContextMenu.tsx`, `src/components/MusicProjects/MusicItemContextMenuPopover.tsx`, `src/components/MusicProjects/MusicItemRenamePopover.tsx`, `src/utils/shareUrls.ts`, `src/utils/glassPaperStyles.ts`
- Invariants: Menu order fixed as above; Delete icon uses error color; glass popovers use mode-aware paper alpha (~0.82 light / ~0.78 dark) + 10px blur; rename prefills from `MusicItemMenuTarget.name`; share popover is not opened from this menu
- Updated: 2026-10-03

### Discreet scrollbar
- Status: evolving
- What: Thin capsule scrollbar with a transparent track on every scroll area, via the theme.
- Paths: `src/utils/discreetScrollbarStyles.ts`, `src/components/ThemeProvider.tsx`, `src/components/Sidebar.tsx`
- Invariants: ~6px thumb; no red debug border; applied globally through CssBaseline; sidebar list still uses a light-on-dark thumb
- Updated: 2026-10-09

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
