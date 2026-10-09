'use client';

import type { DragEndEvent, Modifier } from '@dnd-kit/core';
import type { JSONContent } from '@tiptap/core';
import type { CSSProperties, MouseEvent, ReactElement } from 'react';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import type { ProjectCustomTab } from '@/utils/musicProjectMetadata';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import {
  Add as AddIcon,
  Album as AlbumIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  DragIndicator as DragIcon,
  MusicNote as SongIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_APP_ICON_ID, getAppIcon } from '@/components/common/appIcons';
import { IconPickerPopover } from '@/components/common/IconPickerPopover';
import { Popover } from '@/components/common/Popover';
import { ProjectCustomTabPage } from '@/components/MusicProjects/ProjectCustomTabPage';
import { ProjectDetailMain } from '@/components/MusicProjects/ProjectDetailMain';
import { ProjectAlbumsTab } from '@/components/MusicProjects/tabs/ProjectAlbumsTab';
import { ProjectSongsTab } from '@/components/MusicProjects/tabs/ProjectSongsTab';
import {
  getVisibleTabIds,
  isPinnedProjectTab,
} from '@/components/MusicProjects/tabs/projectTabVisibility';
import { useUpdateMusicProject } from '@/queries/hooks/music-projects/useUpdateMusicProject';
import { glassPaperSx, glassPopoverCancelButtonSx } from '@/utils/glassPaperStyles';
import {
  CUSTOM_TAB_NAME_MAX,
  mergeCustomTabs,
  parseMusicProjectMetadata,
} from '@/utils/musicProjectMetadata';
import { emptyMainPage } from '@/utils/projectMainPage';

type ProjectDetailTabsProps = {
  locale: string;
  projectId: number;
  project: MusicProjectDetail['project'];
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  canEdit: boolean;
};

type ProjectTabName = 'overview' | 'songs' | 'albums';

const SAVE_DELAY_MS = 500;

const restrictToHorizontalAxis: Modifier = ({ transform }) => ({
  ...transform,
  y: 0,
});

function pinnedTabIcon(tabId: string) {
  const iconSx = { fontSize: 18 };
  switch (tabId) {
    case 'songs':
      return <SongIcon sx={iconSx} />;
    case 'albums':
      return <AlbumIcon sx={iconSx} />;
    default:
      return <DashboardIcon sx={iconSx} />;
  }
}

function customTabIcon(iconId: string | undefined) {
  const Icon = getAppIcon(iconId);
  return <Icon sx={{ fontSize: 18 }} />;
}

function pickableIcon(icon: ReactElement, onPickIcon?: (anchor: HTMLElement) => void): ReactElement {
  if (!onPickIcon) {
    return icon;
  }
  return (
    <Box
      component="span"
      onMouseDown={event => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onPickIcon(event.currentTarget);
      }}
      onDoubleClick={event => event.stopPropagation()}
      sx={{ display: 'inline-flex', cursor: 'pointer' }}
    >
      {icon}
    </Box>
  );
}

type SortableTabProps = {
  id: string;
  label: string;
  icon: ReactElement;
  active: boolean;
  draggable: boolean;
  removable: boolean;
  editing: boolean;
  untitledLabel: string;
  onSelect: () => void;
  onStartRename: () => void;
  onCommitRename: (name: string) => void;
  onCancelRename: () => void;
  onRemove: (anchor: HTMLElement) => void;
  onPickIcon?: (anchor: HTMLElement) => void;
  removeLabel: string;
};

function SortableTab({
  id,
  label,
  icon,
  active,
  draggable,
  removable,
  editing,
  untitledLabel,
  onSelect,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onRemove,
  onPickIcon,
  removeLabel,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !draggable });
  const [hovered, setHovered] = useState(false);
  const [draft, setDraft] = useState(label);
  const [draftSession, setDraftSession] = useState({ editing, label });
  const commitLock = useRef(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const showChrome = hovered && !editing && (draggable || removable);

  useEffect(() => {
    if (!editing) {
      return;
    }
    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [editing]);

  if (draftSession.editing !== editing || draftSession.label !== label) {
    setDraftSession({ editing, label });
    if (editing) {
      setDraft(label);
    }
  }

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tabSx = {
    'textTransform': 'none',
    'fontSize': '0.938rem',
    'fontWeight': 500,
    'minHeight': 48,
    'pr': showChrome ? 5 : 2,
    '& .MuiTab-iconWrapper': { mr: 0.75 },
  } as const;

  const nameInput = (
    <Box
      component="input"
      ref={nameInputRef}
      value={draft}
      placeholder={untitledLabel}
      aria-label={untitledLabel}
      onChange={event => setDraft(event.target.value)}
      onClick={event => event.stopPropagation()}
      onMouseDown={event => event.stopPropagation()}
      onBlur={() => {
        if (commitLock.current) {
          return;
        }
        onCommitRename(draft);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
          event.preventDefault();
          commitLock.current = true;
          onCommitRename(draft);
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          commitLock.current = true;
          onCancelRename();
        }
      }}
      sx={{
        border: 0,
        outline: 0,
        p: 0,
        m: 0,
        background: 'transparent',
        color: 'inherit',
        font: 'inherit',
        width: `${Math.min(28, Math.max(draft.length, untitledLabel.length, 4))}ch`,
      }}
    />
  );

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ display: 'inline-flex', position: 'relative', alignItems: 'center' }}
    >
      {editing
        ? (
            <Tab
              component="div"
              icon={pickableIcon(icon, onPickIcon)}
              iconPosition="start"
              label={nameInput}
              onClick={onSelect}
              sx={{
                ...tabSx,
                'color': 'primary.main',
                '& .MuiSvgIcon-root': {
                  color: 'primary.main',
                  WebkitTextFillColor: 'currentColor',
                },
              }}
            />
          )
        : (
            <Tab
              component="div"
              icon={pickableIcon(icon, onPickIcon)}
              iconPosition="start"
              label={label}
              onClick={onSelect}
              onDoubleClick={(event: MouseEvent) => {
                if (!removable) {
                  return;
                }
                event.preventDefault();
                onStartRename();
              }}
              sx={{
                ...tabSx,
                ...(active && {
                  'color': 'primary.main',
                  '& .MuiSvgIcon-root': {
                    color: 'primary.main',
                    WebkitTextFillColor: 'currentColor',
                  },
                }),
              }}
            />
          )}
      {draggable && (
        <Box
          ref={setActivatorNodeRef}
          component="span"
          {...attributes}
          {...listeners}
          onClick={event => event.stopPropagation()}
          sx={{
            position: 'absolute',
            right: removable ? 22 : 4,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            cursor: 'grab',
            opacity: showChrome ? 1 : 0,
            pointerEvents: showChrome ? 'auto' : 'none',
            color: 'text.secondary',
          }}
        >
          <DragIcon sx={{ fontSize: 16 }} />
        </Box>
      )}
      {removable && (
        <IconButton
          size="small"
          aria-label={removeLabel}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(event.currentTarget);
          }}
          sx={{
            width: 18,
            height: 18,
            position: 'absolute',
            right: 2,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: showChrome ? 1 : 0,
            pointerEvents: showChrome ? 'auto' : 'none',
            borderRadius: 1,
          }}
        >
          <CloseIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        </IconButton>
      )}
    </Box>
  );
}

export function ProjectDetailTabs({
  locale,
  projectId,
  project,
  albums,
  songs,
  canEdit,
}: ProjectDetailTabsProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const updateProject = useUpdateMusicProject(locale);
  const metadataRef = useRef(project.metadata);
  metadataRef.current = project.metadata;
  const saveTimer = useRef<number | null>(null);
  const saveGen = useRef(0);

  const serverTabs = useMemo(
    () => parseMusicProjectMetadata(project.metadata).customTabs ?? [],
    [project.metadata],
  );
  const [draftTabs, setDraftTabs] = useState<ProjectCustomTab[] | null>(null);
  const customTabs = draftTabs ?? serverTabs;
  const customTabsRef = useRef(customTabs);
  customTabsRef.current = customTabs;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tabToRemove, setTabToRemove] = useState<ProjectCustomTab | null>(null);
  const [removeAnchor, setRemoveAnchor] = useState<HTMLElement | null>(null);
  const [iconTabId, setIconTabId] = useState<string | null>(null);
  const [iconAnchor, setIconAnchor] = useState<HTMLElement | null>(null);

  const visibleIds = useMemo(
    () => getVisibleTabIds(albums.length, songs.length, customTabs.map(tab => tab.id)),
    [albums.length, customTabs, songs.length],
  );

  const updateUrlForTab = useCallback((tabId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId) {
      params.set('tab', tabId);
    } else {
      params.delete('tab');
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const persistTabs = useCallback((next: ProjectCustomTab[]) => {
    if (saveTimer.current != null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const saved = parseMusicProjectMetadata(metadataRef.current).customTabs ?? [];
    if (JSON.stringify(saved) === JSON.stringify(next)) {
      setDraftTabs(null);
      return;
    }
    setDraftTabs(next);
    const gen = ++saveGen.current;
    updateProject.mutate({
      projectId,
      data: { metadata: mergeCustomTabs(metadataRef.current, next) },
    }, {
      onSuccess: () => {
        if (saveGen.current === gen) {
          setDraftTabs(null);
        }
      },
    });
  }, [projectId, updateProject]);

  const schedulePageSave = useCallback((next: ProjectCustomTab[]) => {
    saveGen.current += 1;
    setDraftTabs(next);
    if (saveTimer.current != null) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;
      persistTabs(customTabsRef.current);
    }, SAVE_DELAY_MS);
  }, [persistTabs]);

  useEffect(() => () => {
    if (saveTimer.current != null) {
      window.clearTimeout(saveTimer.current);
    }
  }, []);

  useEffect(() => {
    if (visibleIds.length === 0) {
      if (searchParams.has('tab')) {
        updateUrlForTab(null);
      }
      return;
    }
    const tab = searchParams.get('tab');
    if (!tab || !visibleIds.includes(tab)) {
      updateUrlForTab(visibleIds[0] ?? 'overview');
    }
  }, [searchParams, updateUrlForTab, visibleIds]);

  const tabFromUrl = searchParams.get('tab');
  const currentIndex = tabFromUrl && visibleIds.includes(tabFromUrl)
    ? visibleIds.indexOf(tabFromUrl)
    : 0;
  const activeId = visibleIds[currentIndex] ?? 'overview';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const displayName = useCallback((tab: ProjectCustomTab) => {
    return tab.name.trim() || t('custom_tab_untitled');
  }, [t]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const activeId = String(active.id);
    const overId = String(over.id);
    if (isPinnedProjectTab(activeId) || isPinnedProjectTab(overId)) {
      return;
    }
    const oldIndex = visibleIds.indexOf(activeId);
    const newIndex = visibleIds.indexOf(overId);
    const firstCustom = visibleIds.findIndex(id => !isPinnedProjectTab(id));
    if (firstCustom === -1 || oldIndex < firstCustom || newIndex < firstCustom) {
      return;
    }
    const nextIds = arrayMove(visibleIds, oldIndex, newIndex);
    const byId = new Map(customTabsRef.current.map(tab => [tab.id, tab]));
    const next = nextIds.flatMap((id) => {
      const tab = byId.get(id);
      return tab ? [tab] : [];
    });
    persistTabs(next);
  };

  const addTab = () => {
    const id = crypto.randomUUID();
    const next = [...customTabsRef.current, {
      id,
      name: '',
      page: emptyMainPage(),
      icon: DEFAULT_APP_ICON_ID,
    }];
    setEditingId(id);
    persistTabs(next);
    updateUrlForTab(id);
  };

  const commitRename = (id: string, raw: string) => {
    const name = raw.trim().slice(0, CUSTOM_TAB_NAME_MAX);
    setEditingId(null);
    const current = customTabsRef.current.find(tab => tab.id === id);
    if (!current || current.name === name) {
      return;
    }
    persistTabs(customTabsRef.current.map(tab => tab.id === id ? { ...tab, name } : tab));
  };

  const closeRemove = () => {
    setTabToRemove(null);
    setRemoveAnchor(null);
  };

  const confirmRemove = () => {
    if (!tabToRemove) {
      return;
    }
    const removedId = tabToRemove.id;
    closeRemove();
    if (editingId === removedId) {
      setEditingId(null);
    }
    if (iconTabId === removedId) {
      setIconTabId(null);
      setIconAnchor(null);
    }
    persistTabs(customTabsRef.current.filter(tab => tab.id !== removedId));
    if (activeId === removedId) {
      updateUrlForTab('overview');
    }
  };

  const onCustomPageChange = (tabId: string, page: JSONContent) => {
    schedulePageSave(customTabsRef.current.map(tab => (
      tab.id === tabId ? { ...tab, page } : tab
    )));
  };

  const mainProps = {
    locale,
    projectId,
    project,
    albums,
    songs,
    canEdit,
  } as const;

  if (visibleIds.length === 0) {
    return <ProjectDetailMain {...mainProps} />;
  }

  const activeCustom = customTabs.find(tab => tab.id === activeId) ?? null;

  const renderTabContent = () => {
    if (activeId === 'overview' || activeId === 'songs' || activeId === 'albums') {
      const tabName = activeId as ProjectTabName;
      if (tabName === 'overview') {
        return (
          <ProjectDetailMain
            {...mainProps}
            onNavigateToTab={updateUrlForTab}
          />
        );
      }
      if (tabName === 'songs') {
        return (
          <ProjectSongsTab
            locale={locale}
            projectId={projectId}
            project={project}
            songs={songs}
            albums={albums}
          />
        );
      }
      return (
        <ProjectAlbumsTab
          locale={locale}
          projectId={projectId}
          project={project}
          albums={albums}
          songs={songs}
          canEdit={canEdit}
        />
      );
    }
    if (!activeCustom) {
      return null;
    }
    return (
      <ProjectCustomTabPage
        key={activeCustom.id}
        locale={locale}
        projectId={projectId}
        project={project}
        albums={albums}
        songs={songs}
        canEdit={canEdit}
        page={activeCustom.page}
        onChange={page => onCustomPageChange(activeCustom.id, page)}
        onFlush={() => persistTabs(customTabsRef.current)}
      />
    );
  };

  const tabLabel = (tabId: string) => {
    if (isPinnedProjectTab(tabId)) {
      return t(`tabs_${tabId}`);
    }
    const custom = customTabs.find(tab => tab.id === tabId);
    return custom ? displayName(custom) : t('custom_tab_untitled');
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <SortableContext items={visibleIds} strategy={horizontalListSortingStrategy}>
            <Tabs
              value={currentIndex}
              onChange={(_event, nextIndex: number) => {
                const tabId = visibleIds[nextIndex];
                if (tabId) {
                  updateUrlForTab(tabId);
                }
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                'flex': '1 1 auto',
                'minWidth': 0,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.938rem',
                  fontWeight: 500,
                  minHeight: 48,
                },
                '& .MuiTab-root.Mui-selected .MuiSvgIcon-root': {
                  WebkitTextFillColor: 'currentColor',
                  color: theme.palette.primary.main,
                },
                '& .MuiTab-root:not(.Mui-selected) .MuiSvgIcon-root': {
                  WebkitTextFillColor: 'currentColor',
                  color: theme.palette.text.secondary,
                },
              }}
            >
              {visibleIds.map((tabId) => {
                const custom = customTabs.find(tab => tab.id === tabId);
                const pinned = isPinnedProjectTab(tabId);
                return (
                  <SortableTab
                    key={tabId}
                    id={tabId}
                    label={tabLabel(tabId)}
                    icon={pinned ? pinnedTabIcon(tabId) : customTabIcon(custom?.icon)}
                    active={tabId === activeId}
                    draggable={canEdit && !pinned}
                    removable={canEdit && !pinned}
                    editing={editingId === tabId}
                    untitledLabel={t('custom_tab_untitled')}
                    onSelect={() => updateUrlForTab(tabId)}
                    onStartRename={() => {
                      if (canEdit && !pinned) {
                        setEditingId(tabId);
                      }
                    }}
                    onCommitRename={name => commitRename(tabId, name)}
                    onCancelRename={() => setEditingId(null)}
                    removeLabel={t('delete')}
                    onPickIcon={canEdit && !pinned
                      ? (anchor) => {
                          setIconTabId(tabId);
                          setIconAnchor(anchor);
                        }
                      : undefined}
                    onRemove={(anchor) => {
                      if (custom) {
                        setTabToRemove(custom);
                        setRemoveAnchor(anchor);
                      }
                    }}
                  />
                );
              })}
            </Tabs>
          </SortableContext>
        </DndContext>
        {canEdit && (
          <Tooltip title={t('add_tab')}>
            <IconButton
              size="small"
              aria-label={t('add_tab')}
              onClick={addTab}
              sx={{
                width: 22,
                height: 22,
                flexShrink: 0,
                borderRadius: 1,
                color: theme.palette.mode === 'dark' ? 'text.secondary' : 'grey.600',
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {renderTabContent()}

      <Popover
        open={tabToRemove != null}
        anchorEl={removeAnchor}
        onClose={closeRemove}
        minWidth={240}
        maxWidth={280}
        paperSx={glassPaperSx}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="body2">
            {t('remove_tab_confirm_message')}
            {' '}
            <strong>{tabToRemove ? displayName(tabToRemove) : ''}</strong>
            ?
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            {t('remove_tab_data_warning')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={closeRemove}
              sx={glassPopoverCancelButtonSx}
            >
              {t('cancel')}
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={confirmRemove}
              sx={{ textTransform: 'capitalize' }}
            >
              {t('delete')}
            </Button>
          </Box>
        </Box>
      </Popover>
      <IconPickerPopover
        open={iconTabId != null}
        anchorEl={iconAnchor}
        value={customTabs.find(tab => tab.id === iconTabId)?.icon}
        onClose={() => {
          setIconTabId(null);
          setIconAnchor(null);
        }}
        onChange={(iconId) => {
          if (!iconTabId) {
            return;
          }
          persistTabs(customTabsRef.current.map(tab => (
            tab.id === iconTabId ? { ...tab, icon: iconId } : tab
          )));
        }}
      />
    </Box>
  );
}
