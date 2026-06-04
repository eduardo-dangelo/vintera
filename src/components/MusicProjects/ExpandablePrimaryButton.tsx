'use client';

import { Add as AddIcon } from '@mui/icons-material';
import { Button } from '@mui/material';

type ExpandablePrimaryButtonProps = {
  label: string;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  ariaLabel?: string;
};

export function ExpandablePrimaryButton({ label, onClick, ariaLabel }: ExpandablePrimaryButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon sx={{ fontSize: 18 }} />}
      onClick={e => onClick(e)}
      aria-label={ariaLabel ?? label}
      sx={{
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
