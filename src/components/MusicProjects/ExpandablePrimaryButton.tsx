'use client';

import { Add as AddIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { primaryGradientSx } from './musicListToolbarStyles';

type ExpandablePrimaryButtonProps = {
  label: string;
  onClick: () => void;
  ariaLabel?: string;
};

export function ExpandablePrimaryButton({ label, onClick, ariaLabel }: ExpandablePrimaryButtonProps) {
  return (
    <Button
      variant="contained"
      startIcon={<AddIcon sx={{ fontSize: 18 }} />}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      sx={{
        ...primaryGradientSx,
        'textTransform': 'none',
        'fontWeight': 600,
        'fontSize': '0.875rem',
        'borderRadius': '6px',
        'boxShadow': 'none',
        '&:hover': {
          boxShadow: 'none',
          filter: 'brightness(1.05)',
        },
      }}
    >
      {label}
    </Button>
  );
}
