
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const RallyPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '3px',
      md: '5px',
      lg: '6px',
      xl: '8px',
    },
  },

  semantic: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },

    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.600}',
      offset: '2px',
      shadow: 'none',
    },

    formField: {
      paddingX: '0.75rem',
      paddingY: '0.5rem',
    },

    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },

        primary: {
          color: '{primary.600}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}',
        },

        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.800}',
          focusColor: '{primary.900}',
        },

        formField: {
          borderColor: '{surface.300}',
          hoverBorderColor: '{surface.400}',
          focusBorderColor: '{primary.600}',
          color: '{surface.900}',
          placeholderColor: '{surface.500}',
          shadow: 'none',
        },

        text: {
          color: '{surface.900}',
          mutedColor: '{surface.500}',
        },
      },
    },
  },
});
