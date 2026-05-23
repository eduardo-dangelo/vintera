'use client';

import {
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Logo } from '../Logo';

export const Footer = () => {
  const t = useTranslations('Index');

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        borderTop: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.06)',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Logo variant="light" />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('footer_tagline')}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.7 }}>
            ©
            {' '}
            {new Date().getFullYear()}
            {' '}
            Vintera
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
