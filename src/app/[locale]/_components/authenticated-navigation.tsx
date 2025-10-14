"use client";

import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from "./language-switcher";
import { useDarkMode } from "./dark-mode-provider";
import { useAuth } from "../../_components/auth-context";

export function AuthenticatedNavigation() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { user } = useAuth();

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Redirect to login
    window.location.href = `/${locale}/login`;
  };

  return (
    <nav className={`border-b transition-colors duration-300 shadow-md ${
      isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
    }`}>
      <div className="container mx-auto px-8 py-5 flex justify-between items-center">
        <Link 
          href={`/${locale}/dashboard`} 
          className={`text-2xl font-bold transition-colors duration-300 ${
            isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'
          }`}
        >
          {tCommon('companyName')}
        </Link>
        
        <div className="flex items-center space-x-8">
          <LanguageSwitcher />
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link
            href={`/${locale}/dashboard`}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border-gray-600 hover:border-gray-500' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400'
            }`}
          >
            🏠 Dashboard
          </Link>
          <Link
            href={`/${locale}/reports`}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 ${
              isDark 
                ? 'bg-blue-600 text-white shadow-lg border-blue-500' 
                : 'bg-blue-600 text-white shadow-lg border-blue-500'
            }`}
          >
            📊 Reports
          </Link>
          {user && (
            <div className="flex items-center space-x-2">
              <span className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Welcome, {user.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
