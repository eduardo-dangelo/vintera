'use client';

import type { ListFolderCardSize, ListViewMode } from '@/utils/listViewPrefs';
import {
  ViewModule as FolderIcon,
  ViewModule as LargeIcon,
  ViewList as ListIcon,
  ViewModule as MediumIcon,
  ViewModule as SmallIcon,
} from '@mui/icons-material';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useTheme,
} from '@mui/material';
import { getButtonGroupSx } from '@/utils/buttonGroupStyles';

type ListViewControlsProps = {
  viewMode: ListViewMode;
  cardSize: ListFolderCardSize;
  onViewModeChange: (mode: ListViewMode) => void;
  onCardSizeChange: (size: ListFolderCardSize) => void;
};

export function ListViewControls({
  viewMode,
  cardSize,
  onViewModeChange,
  onCardSizeChange,
}: ListViewControlsProps) {
  const theme = useTheme();
  const buttonGroupSx = getButtonGroupSx(theme);

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ListViewMode | null) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };

  const handleCardSizeChange = (_event: React.MouseEvent<HTMLElement>, newSize: ListFolderCardSize | null) => {
    if (newSize !== null) {
      onCardSizeChange(newSize);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {viewMode === 'folder' && (
        <>
          <ToggleButtonGroup
            value={cardSize}
            exclusive
            onChange={handleCardSizeChange}
            size="small"
            sx={buttonGroupSx}
          >
            <Tooltip title="Small cards">
              <ToggleButton value="small" aria-label="small cards">
                <SmallIcon sx={{ fontSize: 16 }} />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Medium cards">
              <ToggleButton value="medium" aria-label="medium cards">
                <MediumIcon sx={{ fontSize: 18 }} />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Large cards">
              <ToggleButton value="large" aria-label="large cards">
                <LargeIcon sx={{ fontSize: 20 }} />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <Box
            sx={{
              height: 20,
              bgcolor: 'grey.300',
              mx: 1,
            }}
          />
        </>
      )}

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewModeChange}
        size="small"
        sx={buttonGroupSx}
      >
        <Tooltip title="Folder view">
          <ToggleButton value="folder" aria-label="folder view">
            <FolderIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="List view">
          <ToggleButton value="list" aria-label="list view">
            <ListIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
}
