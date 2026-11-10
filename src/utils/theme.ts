export interface ThemeConfig {
  hospitalName: string;
  whatsappNumber: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  gradientStart: string;
  gradientEnd: string;
}

export const getThemeConfig = (): ThemeConfig => {
  const env = (import.meta as any).env || {};
  return {
    hospitalName: env.VITE_HOSPITAL_NAME || 'Ovum Woman & Child Speciality Hospitals',
    whatsappNumber: env.VITE_WHATSAPP_NUMBER || '919686909236',
    primary: env.VITE_THEME_PRIMARY || '#00897B',
    primaryDark: env.VITE_THEME_PRIMARY_DARK || '#005B52',
    primaryLight: env.VITE_THEME_PRIMARY_LIGHT || '#E0F2F1',
    accent: env.VITE_THEME_ACCENT || '#E91E63',
    gradientStart: env.VITE_THEME_GRADIENT_START || '#00695C',
    gradientEnd: env.VITE_THEME_GRADIENT_END || '#00897B',
  };
};

export const applyThemeToDocument = (theme: ThemeConfig) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-primary-dark', theme.primaryDark);
  root.style.setProperty('--theme-primary-light', theme.primaryLight);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-gradient-start', theme.gradientStart);
  root.style.setProperty('--theme-gradient-end', theme.gradientEnd);
};
