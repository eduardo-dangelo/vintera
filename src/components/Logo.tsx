import { Box, Typography } from '@mui/material';

type LogoProps = {
  variant: 'light' | 'dark';
  compact?: boolean;
};

export const Logo = ({ variant = 'light', compact = false }: LogoProps) => {
  const color = variant === 'light' ? 'white' : 'black';

  return (
    <Box
      sx={{
        pb: 0,
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
      }}
    >
      <Typography
        variant={compact ? 'body1' : 'h5'}
        noWrap
        sx={{
          fontWeight: 600,
          color,
          fontFamily: 'var(--font-nunito)',
          fontSize: compact ? '1rem' : undefined,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Vintera
      </Typography>
    </Box>
  );
};
