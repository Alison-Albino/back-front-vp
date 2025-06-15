import './custom.css';

export default {
  config: {
    theme: {
      dark: {
        colors: {
          primary100: '#f3e8ff',
          primary200: '#e9d5ff', 
          primary500: '#8A2BE2',
          primary600: '#7c3aed',
          primary700: '#6d28d9',
          
          neutral0: '#0f0f1a',
          neutral100: '#1a1a2e',
          neutral150: '#16213e',
          neutral200: '#0e3460',
          neutral300: '#1e293b',
          neutral400: '#475569',
          neutral500: '#64748b',
          neutral600: '#94a3b8',
          neutral700: '#cbd5e1',
          neutral800: '#e2e8f0',
          neutral900: '#f1f5f9',
          
          buttonPrimary500: '#8A2BE2',
          buttonPrimary600: '#7209b7',
        }
      }
    },
    auth: {
      logo: '/admin/logo.png',
    },
    tutorials: false,
    notifications: { releases: false }
  }
};