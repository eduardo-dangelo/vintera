'use client';

import {
  ArrowBack,
  Delete as DeleteIcon,
  MoreVert,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCreateAlbum } from '@/queries/hooks/music-projects/useCreateAlbum';
import { useCreateSong } from '@/queries/hooks/music-projects/useCreateSong';
import { useDeleteMusicProject } from '@/queries/hooks/music-projects/useDeleteMusicProject';
import { useDeleteSong } from '@/queries/hooks/music-projects/useDeleteSong';
import { useMusicProject } from '@/queries/hooks/music-projects/useMusicProject';
import { useUpdateSong } from '@/queries/hooks/music-projects/useUpdateSong';

type ProjectDetailClientProps = {
  locale: string;
  projectId: number;
};

export function ProjectDetailClient({ locale, projectId }: ProjectDetailClientProps) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useMusicProject(locale, projectId);
  const deleteProject = useDeleteMusicProject(locale);
  const createAlbum = useCreateAlbum(locale);
  const createSong = useCreateSong(locale);
  const updateSong = useUpdateSong(locale);
  const deleteSong = useDeleteSong(locale);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songAlbumId, setSongAlbumId] = useState<number | ''>('');
  const [expandedSongId, setExpandedSongId] = useState<number | null>(null);
  const [highlightedAlbumId, setHighlightedAlbumId] = useState<number | null>(null);
  const [editLyrics, setEditLyrics] = useState('');
  const [editChords, setEditChords] = useState('');
  const albumNameInputRef = useRef<HTMLInputElement>(null);
  const songTitleInputRef = useRef<HTMLInputElement>(null);
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    if (albumDialogOpen) {
      albumNameInputRef.current?.focus();
    }
  }, [albumDialogOpen]);

  useEffect(() => {
    if (songDialogOpen) {
      songTitleInputRef.current?.focus();
    }
  }, [songDialogOpen]);

  useEffect(() => {
    if (!data || deepLinkHandled.current) {
      return;
    }

    const songParam = searchParams.get('song');
    const albumParam = searchParams.get('album');

    if (songParam) {
      const songId = Number.parseInt(songParam, 10);
      const song = data.songs.find(s => s.id === songId);
      if (song) {
        setExpandedSongId(song.id);
        setEditLyrics(song.lyrics || '');
        setEditChords(song.chordsOrTabs || '');
        deepLinkHandled.current = true;
        requestAnimationFrame(() => {
          document.getElementById(`song-${songId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      return;
    }

    if (albumParam) {
      const albumId = Number.parseInt(albumParam, 10);
      const album = data.albums.find(a => a.id === albumId);
      if (album) {
        setHighlightedAlbumId(album.id);
        deepLinkHandled.current = true;
        requestAnimationFrame(() => {
          document.getElementById(`album-${albumId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    }
  }, [data, searchParams]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Typography color="error">
        Project not found
      </Typography>
    );
  }

  const { project, albums, songs } = data;
  const accent = project.color || '#7c3aed';

  const handleDeleteProject = async () => {
    await deleteProject.mutateAsync(projectId);
    setDeleteDialogOpen(false);
    router.push(`/${locale}/projects`);
  };

  const handleCreateAlbum = async () => {
    if (!albumName.trim()) {
      return;
    }
    await createAlbum.mutateAsync({ projectId, name: albumName.trim() });
    setAlbumName('');
    setAlbumDialogOpen(false);
  };

  const handleCreateSong = async () => {
    if (!songTitle.trim()) {
      return;
    }
    await createSong.mutateAsync({
      projectId,
      title: songTitle.trim(),
      albumId: songAlbumId === '' ? null : songAlbumId,
    });
    setSongTitle('');
    setSongAlbumId('');
    setSongDialogOpen(false);
  };

  const handleExpandSong = (song: typeof songs[0]) => {
    if (expandedSongId === song.id) {
      setExpandedSongId(null);
    } else {
      setExpandedSongId(song.id);
      setEditLyrics(song.lyrics || '');
      setEditChords(song.chordsOrTabs || '');
    }
  };

  const handleSaveSongDetails = async (songId: number) => {
    await updateSong.mutateAsync({
      projectId,
      songId,
      data: { lyrics: editLyrics, chordsOrTabs: editChords },
    });
    setExpandedSongId(null);
  };

  const statusLabel = (status: string) => {
    const key = `status_${status}` as 'status_idea' | 'status_demo' | 'status_recording' | 'status_released' | 'status_draft';
    return t(key);
  };

  return (
    <Box>
      <Button
        component={Link}
        href={`/${locale}/projects`}
        startIcon={<ArrowBack />}
        sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}
      >
        {t('back_to_projects')}
      </Button>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton size="small" onClick={e => setMenuAnchor(e.currentTarget)}>
                <MoreVert />
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    setDeleteDialogOpen(true);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('delete')}
                </MenuItem>
              </Menu>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {project.name}
            </Typography>
            {project.genre && (
              <Chip label={project.genre} size="small" sx={{ mb: 2, bgcolor: `${accent}33`, color: accent }} />
            )}
            {project.description && (
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {project.description}
              </Typography>
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {t('album_count', { count: albums.length })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('song_count', { count: songs.length })}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('albums')}
              </Typography>
              <Button size="small" onClick={() => setAlbumDialogOpen(true)} sx={{ textTransform: 'none' }}>
                {t('add_album')}
              </Button>
            </Box>
            {albums.length === 0
              ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {t('no_albums')}
                  </Typography>
                )
              : (
                  <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                    {albums.map(album => (
                      <Box
                        id={`album-${album.id}`}
                        key={album.id}
                        sx={{
                          minWidth: 160,
                          p: 2,
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: highlightedAlbumId === album.id ? accent : 'divider',
                          bgcolor: 'background.paper',
                          transition: 'border-color 0.3s ease',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {album.name}
                        </Typography>
                        <Chip
                          label={statusLabel(album.status)}
                          size="small"
                          sx={{ mt: 1, fontSize: '0.7rem' }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('songs')}
              </Typography>
              <Button size="small" onClick={() => setSongDialogOpen(true)} sx={{ textTransform: 'none' }}>
                {t('add_song')}
              </Button>
            </Box>
            {songs.length === 0
              ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {t('no_songs')}
                  </Typography>
                )
              : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {songs.map((song) => {
                      const album = albums.find(a => a.id === song.albumId);
                      const isExpanded = expandedSongId === song.id;
                      return (
                        <Box
                          id={`song-${song.id}`}
                          key={song.id}
                          sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: isExpanded ? accent : 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              'display': 'flex',
                              'alignItems': 'center',
                              'gap': 2,
                              'p': 2,
                              'cursor': 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                            onClick={() => handleExpandSong(song)}
                          >
                            <Typography sx={{ fontWeight: 600, flex: 1 }}>
                              {song.trackNumber ? `${song.trackNumber}. ` : ''}
                              {song.title}
                            </Typography>
                            {album && (
                              <Typography variant="caption" color="text.secondary">
                                {album.name}
                              </Typography>
                            )}
                            <Chip label={statusLabel(song.status)} size="small" />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSong.mutate({ projectId, songId: song.id });
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          {isExpanded && (
                            <Box sx={{ p: 2, pt: 0, borderTop: '1px solid', borderColor: 'divider' }}>
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label={t('lyrics')}
                                value={editLyrics}
                                onChange={e => setEditLyrics(e.target.value)}
                                sx={{ mb: 2 }}
                              />
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label={t('chords_tabs')}
                                value={editChords}
                                onChange={e => setEditChords(e.target.value)}
                                sx={{ mb: 2 }}
                              />
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSaveSongDetails(song.id)}
                                disabled={updateSong.isPending}
                              >
                                {t('save')}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
          </Box>
        </Grid>
      </Grid>

      <Dialog open={albumDialogOpen} onClose={() => setAlbumDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('add_album')}</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={albumNameInputRef}
            fullWidth
            label={t('album_name')}
            value={albumName}
            onChange={e => setAlbumName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlbumDialogOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleCreateAlbum} disabled={!albumName.trim()}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('delete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('delete_confirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleDeleteProject()}
            disabled={deleteProject.isPending}
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={songDialogOpen} onClose={() => setSongDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('add_song')}</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={songTitleInputRef}
            fullWidth
            label={t('song_title')}
            value={songTitle}
            onChange={e => setSongTitle(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>{t('select_album')}</InputLabel>
            <Select
              value={songAlbumId}
              label={t('select_album')}
              onChange={e => setSongAlbumId(e.target.value as number | '')}
            >
              <MenuItem value="">{t('single')}</MenuItem>
              {albums.map(album => (
                <MenuItem key={album.id} value={album.id}>
                  {album.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSongDialogOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleCreateSong} disabled={!songTitle.trim()}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
