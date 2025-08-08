import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useSettingsStore } from '@/state/settingsStore';
import { useEffect } from 'react';

// This component syncs our Zustand store to the next-themes state
const ThemeSync = () => {
  const { theme: themeFromStore } = useSettingsStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(themeFromStore);
  }, [themeFromStore, setTheme]);

  return null;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <ThemeSync />
    </NextThemesProvider>
  );
}