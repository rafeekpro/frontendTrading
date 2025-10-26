import { useTheme } from '../ThemeProvider';

export function DisplaySettings() {
  const { theme, toggleTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    if (theme !== newTheme) {
      toggleTheme();
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={() => handleThemeChange('light')}
              className="w-4 h-4"
            />
            <span className="text-sm">Light</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={() => handleThemeChange('dark')}
              className="w-4 h-4"
            />
            <span className="text-sm">Dark</span>
          </label>
        </div>
      </div>
    </div>
  );
}
