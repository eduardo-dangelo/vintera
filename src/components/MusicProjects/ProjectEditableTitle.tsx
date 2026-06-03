'use client';

import type { ReactNode } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

const IDLE_SAVE_MS = 2500;

type ProjectEditableTitleProps = {
  name: string;
  fontFamily?: string;
  placeholder?: string;
  compact?: boolean;
  heroTitleStyle?: Record<string, unknown>;
  titleAdornments?: ReactNode;
  /** Keep font/color buttons visible while a picker popover is open. */
  keepAdornmentsVisible?: boolean;
  truncate?: boolean;
  onSave: (name: string) => Promise<void>;
};

export function ProjectEditableTitle({
  name,
  fontFamily,
  placeholder,
  compact = false,
  heroTitleStyle,
  titleAdornments,
  keepAdornmentsVisible = false,
  truncate = false,
  onSave,
}: ProjectEditableTitleProps) {
  const t = useTranslations('MusicProjects');
  const titleRef = useRef<HTMLInputElement>(null);
  const idleSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestNameRef = useRef(name);
  const [localName, setLocalName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const adornmentRowHeight = compact ? 26 : 32;
  const showAdornments = (isHovered || keepAdornmentsVisible) && !isEditing && Boolean(titleAdornments);

  useEffect(() => {
    setLocalName(name);
    latestNameRef.current = name;
  }, [name]);

  useEffect(() => {
    return () => {
      if (idleSaveTimeoutRef.current) {
        clearTimeout(idleSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isEditing) {
      const raf = window.requestAnimationFrame(() => {
        titleRef.current?.focus();
        titleRef.current?.select();
      });
      return () => window.cancelAnimationFrame(raf);
    }
    return undefined;
  }, [isEditing]);

  const exitEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async (value: string) => {
    const trimmed = value.trim();
    if (trimmed === '') {
      setLocalName(name);
      latestNameRef.current = name;
      return;
    }
    if (trimmed === name) {
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setSaving(false);
    }
  };

  const finishEdit = async (value: string) => {
    if (idleSaveTimeoutRef.current) {
      clearTimeout(idleSaveTimeoutRef.current);
      idleSaveTimeoutRef.current = null;
    }
    await handleSave(value);
    exitEdit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalName(value);
    latestNameRef.current = value;

    if (idleSaveTimeoutRef.current) {
      clearTimeout(idleSaveTimeoutRef.current);
    }
    idleSaveTimeoutRef.current = setTimeout(() => {
      idleSaveTimeoutRef.current = null;
      void finishEdit(latestNameRef.current);
      titleRef.current?.blur();
    }, IDLE_SAVE_MS);
  };

  const handleBlur = () => {
    void finishEdit(localName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void finishEdit(localName);
      titleRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (idleSaveTimeoutRef.current) {
        clearTimeout(idleSaveTimeoutRef.current);
        idleSaveTimeoutRef.current = null;
      }
      setLocalName(name);
      latestNameRef.current = name;
      exitEdit();
      titleRef.current?.blur();
    }
  };

  const handleDisplayClick = () => {
    setIsEditing(true);
  };

  const fontSize = compact
    ? { xs: '1.125rem', sm: '1.25rem' }
    : { xs: '1.5rem', sm: '2.125rem' };

  const inputSx = {
    '& .MuiInput-root': {
      fontSize,
      'fontWeight': 700,
      'lineHeight': 1,
      'color': 'text.primary',
      'fontFamily': fontFamily ?? 'inherit',
      '&:before': { borderBottom: 'none' },
      '&:after': { borderBottom: 'none' },
      '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
      ...heroTitleStyle,
    },
    '& input': {
      padding: 0,
      overflow: truncate ? 'hidden' : 'visible',
      textOverflow: truncate ? 'ellipsis' : undefined,
      whiteSpace: truncate ? 'nowrap' : undefined,
      fontFamily: fontFamily ?? 'inherit',
    },
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        minWidth: 0,
        maxWidth: isEditing && truncate ? '100%' : undefined,
        flex: isEditing && truncate ? '1 1 0' : undefined,
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 0,
          maxWidth: '100%',
          flexWrap: 'nowrap',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minHeight: adornmentRowHeight,
            minWidth: 0,
            flex: truncate ? '1 1 0' : undefined,
          }}
        >
          {isEditing
            ? (
                <TextField
                  inputRef={titleRef}
                  value={localName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder ?? t('project_name')}
                  variant="standard"
                  fullWidth={truncate}
                  sx={{
                    flex: truncate ? '1 1 0' : '0 1 auto',
                    minWidth: truncate ? 0 : { xs: 120, sm: 160 },
                    maxWidth: truncate ? '100%' : { xs: 'min(100%, 280px)', sm: 'min(100%, 480px)' },
                    ...inputSx,
                  }}
                />
              )
            : (
                <Typography
                  component="h1"
                  onClick={handleDisplayClick}
                  sx={{
                    fontSize,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'text.primary',
                    fontFamily: fontFamily ?? 'inherit',
                    cursor: 'pointer',
                    width: 'fit-content',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    ...heroTitleStyle,
                  }}
                >
                  {localName || placeholder || t('project_name')}
                </Typography>
              )}
        </Box>
        {titleAdornments && (
          <Box
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            sx={{
              'display': 'flex',
              'alignItems': 'center',
              'gap': 0.25,
              'minHeight': adornmentRowHeight,
              'opacity': showAdornments ? 1 : 0,
              'maxWidth': showAdornments ? 88 : 0,
              'overflow': 'hidden',
              'flexShrink': 0,
              'pointerEvents': showAdornments ? 'auto' : 'none',
              '@media (prefers-reduced-motion: no-preference)': {
                transition: 'opacity 0.2s ease, max-width 0.2s ease',
              },
            }}
          >
            {titleAdornments}
          </Box>
        )}
      </Box>
      {saving && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
          {t('saving')}
        </Typography>
      )}
    </Box>
  );
}
