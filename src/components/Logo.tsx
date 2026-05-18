import { Box, Typography } from '@mui/material';

type LogoProps = {
  variant: 'light' | 'dark';
};

export const Logo = ({ variant = 'light' }: LogoProps) => {
  return (
    <Box
      sx={{
        pb: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: '600',
          color: variant === 'light' ? 'white' : 'black',
          fontFamily: 'var(--font-nunito)',
        }}
      >
        Vintera
      </Typography>
    </Box>
  );
};
