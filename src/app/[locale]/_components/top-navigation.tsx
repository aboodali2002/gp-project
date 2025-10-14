"use client";

import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from "./language-switcher";
import { useDarkMode } from "./dark-mode-provider";
import { useAuth } from "../../_components/auth-context";

export function TopNavigation() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { user } = useAuth();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/${locale}`} className="text-2xl font-bold text-black dark:text-white">
          {tCommon('companyName')}
        </Link>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          {!user && (
            <>
              <Link
                href={`/${locale}/login`}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {tNav('signIn')}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {tNav('getStarted')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
