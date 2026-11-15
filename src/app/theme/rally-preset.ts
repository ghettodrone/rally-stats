import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/** Aura, re-tuned to the RallyStats palette: court green, warm neutrals, tighter corners. */
export const RallyPreset = definePreset(Aura, {
  primitive: {
    borderRadius: { none: '0', xs: '2px', sm: '3px', md: '5px', lg: '6px', xl: '8px' },
  },
  semantic: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    focusRing: { width: '2px', style: 'solid', color: '{primary.700}', offset: '2px', shadow: 'none' },
    formField: { paddingX: '0.75rem', paddingY: '0.5rem' },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f5f7f2',
          100: '#eef1eb',
          200: '#e2e8e0',
          300: '#cbd3c8',
          400: '#a3aea2',
          500: '#6b776d',
          600: '#556057',
          700: '#3d4840',
          800: '#283229',
          900: '#17231b',
          950: '#0d150f',
        },
        primary: {
          color: '{primary.700}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.900}',
          focusColor: '{primary.900}',
        },
        formField: {
          borderColor: '{surface.300}',
          hoverBorderColor: '{surface.400}',
          focusBorderColor: '{primary.700}',
          color: '{surface.900}',
          placeholderColor: '{surface.500}',
          shadow: 'none',
        },
        text: { color: '{surface.900}', mutedColor: '{surface.500}' },
      },
    },
  },
});
