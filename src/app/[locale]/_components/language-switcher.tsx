"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { useCallback } from 'react';
import { useDarkMode } from './dark-mode-provider';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { isDark } = useDarkMode();

  console.log('LanguageSwitcher - Current locale:', locale, 'Pathname:', pathname);

  const switchLanguage = useCallback((newLocale: string) => {
    console.log('Language switch requested:', newLocale, 'Current locale:', locale, 'Current path:', pathname);
    
    // Don't switch if it's the same locale
    if (newLocale === locale) {
      console.log('Same locale, no switch needed');
      return;
    }
    
    // Get the current path without locale prefix
    let pathWithoutLocale = pathname;
    
    // Remove the current locale prefix if it exists
    if (pathname.startsWith(`/${locale}`)) {
      pathWithoutLocale = pathname.substring(`/${locale}`.length) || '/';
    }
    
    // Handle root path
    if (pathWithoutLocale === '' || pathWithoutLocale === '/') {
      pathWithoutLocale = '/';
    }
    
    // Ensure path starts with /
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale;
    }
    
    // Handle special cases for common pages
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = '/welcome';
    }
    
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    console.log('Path manipulation:', {
      originalPath: pathname,
      pathWithoutLocale,
      newPath,
      currentLocale: locale,
      newLocale
    });
    
    // Use a more direct approach with page reload
    startTransition(() => {
      try {
        // Force a full page reload to ensure proper locale switching and reset
        window.location.href = newPath;
      } catch (error) {
        console.error('Language switch error:', error);
        // Fallback: try to navigate to the new locale root
        window.location.href = `/${newLocale}/welcome`;
      }
    });
  }, [locale, pathname]);

  return (
    <div className="flex items-center space-x-2">
      {isPending && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      )}
      <select
        value={locale}
        onChange={(e) => switchLanguage(e.target.value)}
        disabled={isPending}
        className={`px-3 py-2 text-sm rounded-md border transition-all duration-200 ${
          isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'
        } ${
          isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500'
        } ${
          locale === 'en'
            ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : isDark 
              ? 'border-gray-600 text-gray-300' 
              : 'border-gray-300 text-gray-700'
        }`}
        style={{ minWidth: '140px' }}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        <option value="en" style={{ 
          color: isDark ? '#d1d5db' : '#374151',
          backgroundColor: isDark ? '#1f2937' : '#ffffff'
        }}>
          🇺🇸 English
        </option>
        <option value="ar" style={{ 
          color: isDark ? '#d1d5db' : '#374151',
          backgroundColor: isDark ? '#1f2937' : '#ffffff'
        }}>
          🇸🇦 العربية
        </option>
      </select>
    </div>
  );
}
