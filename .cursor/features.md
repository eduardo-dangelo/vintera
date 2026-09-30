# Feature inventory

Status: `locked` = must not regress · `evolving` = still iterating

<!-- Newest first -->

### Sidebar section View more
- Status: evolving
- What: Each sidebar recents section (Projects, Songs, Albums) shows a title plus a type-specific create (+) button in the header, and a "View more" row as the last list item linking to the full list.
- Paths: `src/components/Sidebar.tsx`, `src/components/MusicProjects/NewMusicProjectButton.tsx`, `src/components/MusicProjects/NewSongButton.tsx`, `src/components/MusicProjects/NewAlbumButton.tsx`, `src/locales/en.json`, `src/locales/fr.json`
- Invariants: Section title is not a link; header + opens the matching create popover; View more is the last list row (not header); same hrefs as before (`/{locale}/projects|songs|albums`)
- Updated: 2026-09-30
