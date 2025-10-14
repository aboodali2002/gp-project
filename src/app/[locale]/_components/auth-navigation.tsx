"use client";

import Link from "next/link";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from "./language-switcher";
import { useDarkMode } from "./dark-mode-provider";

export function AuthNavigation() {
  const tCommon = useTranslations('common');
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-black dark:text-white">
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
        </div>
      </div>
    </nav>
  );
}
