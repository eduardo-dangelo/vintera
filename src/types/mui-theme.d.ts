import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar: {
      background: string;
      textPrimary: string;
      textSecondary: string;
    };
  }
  interface PaletteOptions {
    sidebar?: {
      background?: string;
      textPrimary?: string;
      textSecondary?: string;
    };
  }
}
