'use client';

import type { SidebarSectionFormDraft } from '@/components/MusicProjects/SidebarSectionFormPopover';
import type { MemberPermission, MusicProjectMember } from '@/types/musicPeople';
import type {
  ProjectSidebarSection,
  SidebarSectionKind,
} from '@/utils/projectSidebarSections';
import { Box, Collapse } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { ConfirmPopover } from '@/components/common/ConfirmPopover';
import { ProjectDetailGeneralInfoSection } from '@/components/MusicProjects/ProjectDetailGeneralInfoSection';
import { ProjectSidebarDividerInsert } from '@/components/MusicProjects/ProjectSidebarDividerInsert';
import { ProjectSidebarSectionItem } from '@/components/MusicProjects/ProjectSidebarSectionItem';
import {
  EMPTY_SIDEBAR_SECTION_DRAFT,
  SidebarSectionFormPopover,
} from '@/components/MusicProjects/SidebarSectionFormPopover';
import { useUpdateMusicProject } from '@/queries/hooks/music-projects/useUpdateMusicProject';
import { flipFromFirstTop, readElementTop } from '@/utils/flipListSwap';
import { mergeSidebarSections, parseMusicProjectMetadata } from '@/utils/musicProjectMetadata';
import {
  createCalendarSection,
  createMembersSection,
  resolveSidebarSections,
} from '@/utils/projectSidebarSections';

const SECTION_COLLAPSE_MS = 250;
const SECTION_FLIP_MS = 220;

type ProjectDetailSidebarProps = {
  locale: string;
  projectId: number;
  genre: string | null;
  description: string | null;
  accent: string;
  members: MusicProjectMember[];
  metadata: unknown;
  viewerPermission: 'owner' | MemberPermission;
  readOnly?: boolean;
};

type FormKind = Extract<SidebarSectionKind, 'video' | 'link' | 'text'>;

function moveSection(
  sections: ProjectSidebarSection[],
  sectionId: string,
  direction: -1 | 1,
): ProjectSidebarSection[] | null {
  const index = sections.findIndex(section => section.id === sectionId);
  if (index === -1) {
    return null;
  }
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= sections.length) {
    return null;
  }
  const next = [...sections];
  const [item] = next.splice(index, 1);
  if (!item) {
    return null;
  }
  next.splice(nextIndex, 0, item);
  return next;
}

function sectionNode(sectionId: string): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  return document.querySelector<HTMLElement>(`[data-sidebar-section-id="${sectionId}"]`);
}

export function ProjectDetailSidebar({
  locale,
  projectId,
  genre,
  description,
  accent,
  members,
  metadata,
  viewerPermission,
  readOnly = false,
}: ProjectDetailSidebarProps) {
  const t = useTranslations('MusicProjects');
  const updateProject = useUpdateMusicProject(locale);

  const resolvedSections = useMemo(() => {
    const parsed = parseMusicProjectMetadata(metadata);
    return resolveSidebarSections(parsed.sidebarSections, parsed.externalLinks);
  }, [metadata]);

  const [displaySections, setDisplaySections] = useState(resolvedSections);

  useEffect(() => {
    setDisplaySections(resolvedSections);
  }, [resolvedSections]);

  const [formOpen, setFormOpen] = useState(false);
  const [formAnchorEl, setFormAnchorEl] = useState<HTMLElement | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formKind, setFormKind] = useState<FormKind>('link');
  const [formDraft, setFormDraft] = useState<SidebarSectionFormDraft>(EMPTY_SIDEBAR_SECTION_DRAFT);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removeAnchor, setRemoveAnchor] = useState<HTMLElement | null>(null);

  const applySections = useCallback(async (next: ProjectSidebarSection[]) => {
    setDisplaySections(next);
    const merged = mergeSidebarSections(metadata, next);
    await updateProject.mutateAsync({
      projectId,
      data: { metadata: merged },
    });
  }, [metadata, projectId, updateProject]);

  const closeForm = () => {
    setFormOpen(false);
    setFormAnchorEl(null);
    setEditingId(undefined);
    setInsertIndex(null);
    setFormDraft(EMPTY_SIDEBAR_SECTION_DRAFT);
    setUrlError(null);
  };

  const openContentForm = (
    kind: FormKind,
    mode: 'create' | 'edit',
    anchorEl: HTMLElement,
    options?: { section?: ProjectSidebarSection; atIndex?: number },
  ) => {
    setFormKind(kind);
    setFormMode(mode);
    setFormAnchorEl(anchorEl);
    setInsertIndex(options?.atIndex ?? null);
    setUrlError(null);

    const section = options?.section;
    if (section && (section.kind === 'video' || section.kind === 'link')) {
      setEditingId(section.id);
      setFormDraft({
        title: section.title ?? '',
        body: '',
        urls: [section.url],
      });
    } else if (section && section.kind === 'text') {
      setEditingId(section.id);
      setFormDraft({
        title: section.title ?? '',
        body: section.body,
        urls: [''],
      });
    } else {
      setEditingId(undefined);
      setFormDraft(EMPTY_SIDEBAR_SECTION_DRAFT);
    }
    setFormOpen(true);
  };

  const handleAddKindAt = async (
    kind: SidebarSectionKind,
    atIndex: number,
    anchorEl: HTMLElement,
  ) => {
    if (kind === 'members' || kind === 'calendar') {
      const section = kind === 'members' ? createMembersSection() : createCalendarSection();
      const next = [...displaySections];
      next.splice(atIndex, 0, section);
      await applySections(next);
      return;
    }
    openContentForm(kind, 'create', anchorEl, { atIndex });
  };

  const handleFormBuilt = async (built: ProjectSidebarSection[]) => {
    if (built.length === 0) {
      return;
    }
    if (formMode === 'edit' && editingId) {
      const [updated] = built;
      if (!updated) {
        return;
      }
      await applySections(displaySections.map(item => (item.id === editingId ? updated : item)));
      closeForm();
      return;
    }
    const next = [...displaySections];
    const index = insertIndex == null ? next.length : insertIndex;
    next.splice(index, 0, ...built);
    await applySections(next);
    closeForm();
  };

  const handleMove = async (sectionId: string, direction: -1 | 1) => {
    const index = displaySections.findIndex(section => section.id === sectionId);
    if (index === -1) {
      return;
    }
    const neighbor = displaySections[index + direction];
    const next = moveSection(displaySections, sectionId, direction);
    if (!next) {
      return;
    }

    const movedFirstTop = readElementTop(sectionNode(sectionId));
    const neighborFirstTop = neighbor ? readElementTop(sectionNode(neighbor.id)) : null;

    setDisplaySections(next);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flipFromFirstTop(sectionNode(sectionId), movedFirstTop, SECTION_FLIP_MS);
        if (neighbor) {
          flipFromFirstTop(sectionNode(neighbor.id), neighborFirstTop, SECTION_FLIP_MS);
        }
      });
    });

    const merged = mergeSidebarSections(metadata, next);
    await updateProject.mutateAsync({
      projectId,
      data: { metadata: merged },
    });
  };

  const handleHideSection = async (sectionId: string) => {
    await applySections(displaySections.filter(section => section.id !== sectionId));
  };

  const handleConfirmRemove = async () => {
    if (!removeId) {
      return;
    }
    const target = displaySections.find(section => section.id === removeId);
    if (target?.kind === 'members' || target?.kind === 'calendar') {
      setRemoveId(null);
      setRemoveAnchor(null);
      return;
    }
    await applySections(displaySections.filter(section => section.id !== removeId));
    setRemoveId(null);
    setRemoveAnchor(null);
  };

  return (
    <>
      <Box
        sx={{
          position: { md: 'sticky' },
          top: 24,
          p: 3,
          borderRadius: 4,
          background: `linear-gradient(160deg, ${accent}33 0%, transparent 60%)`,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <ProjectDetailGeneralInfoSection
          locale={locale}
          projectId={projectId}
          genre={genre}
          description={description}
          accent={accent}
          readOnly={readOnly}
        />

        <ProjectSidebarDividerInsert
          sections={displaySections}
          readOnly={readOnly}
          onAddKind={(kind, anchorEl) => {
            void handleAddKindAt(kind, 0, anchorEl);
          }}
        />

        <TransitionGroup component={null}>
          {displaySections.map((section, index) => (
            <Collapse key={section.id} timeout={SECTION_COLLAPSE_MS}>
              <Box data-sidebar-section-id={section.id}>
                <ProjectSidebarSectionItem
                  section={section}
                  locale={locale}
                  projectId={projectId}
                  accent={accent}
                  members={members}
                  viewerPermission={viewerPermission}
                  readOnly={readOnly}
                  canMoveUp={index > 0}
                  canMoveDown={index < displaySections.length - 1}
                  onEdit={(target, anchorEl) => {
                    if (target.kind === 'video' || target.kind === 'link' || target.kind === 'text') {
                      openContentForm(target.kind, 'edit', anchorEl, { section: target });
                    }
                  }}
                  onHide={(sectionId) => {
                    void handleHideSection(sectionId);
                  }}
                  onRemove={(sectionId, anchorEl) => {
                    setRemoveId(sectionId);
                    setRemoveAnchor(anchorEl);
                  }}
                  onMoveUp={(sectionId) => {
                    void handleMove(sectionId, -1);
                  }}
                  onMoveDown={(sectionId) => {
                    void handleMove(sectionId, 1);
                  }}
                />
                <ProjectSidebarDividerInsert
                  sections={displaySections}
                  readOnly={readOnly}
                  onAddKind={(kind, anchorEl) => {
                    void handleAddKindAt(kind, index + 1, anchorEl);
                  }}
                />
              </Box>
            </Collapse>
          ))}
        </TransitionGroup>
      </Box>

      <SidebarSectionFormPopover
        open={formOpen}
        anchorEl={formAnchorEl}
        mode={formMode}
        kind={formKind}
        draft={formDraft}
        editingId={editingId}
        urlError={urlError}
        isPending={updateProject.isPending}
        onDraftChange={setFormDraft}
        onBuilt={(sections) => {
          void handleFormBuilt(sections);
        }}
        onClose={closeForm}
        onUrlError={setUrlError}
      />

      <ConfirmPopover
        open={Boolean(removeId && removeAnchor)}
        anchorEl={removeAnchor}
        onClose={() => {
          setRemoveId(null);
          setRemoveAnchor(null);
        }}
        onConfirm={() => {
          void handleConfirmRemove();
        }}
        message={t('sidebar_section_remove_confirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        confirmColor="error"
        loading={updateProject.isPending}
      />
    </>
  );
}
