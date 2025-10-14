"use client";

import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "../_components/language-switcher";
import { useDarkMode } from "../_components/dark-mode-provider";

export default function WelcomePage() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const t = useTranslations('welcome');
  const locale = useLocale();
  const router = useRouter();

  // Debug logging
  console.log('Welcome Page - Current locale:', locale);
  console.log('Welcome Page - Register link:', `/${locale}/register`);

  const handleRegisterClick = () => {
    console.log('Register button clicked, navigating to:', `/${locale}/register`);
    router.push(`/${locale}/register`);
  };

  const handleLoginClick = () => {
    console.log('Login button clicked, navigating to:', `/${locale}/login`);
    router.push(`/${locale}/login`);
  };

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">{t('companyName')}</div>
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6">
            {t('title')}
            <span className="block text-4xl font-normal text-gray-600 dark:text-gray-400 mt-2">
              {t('subtitle')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            {t('description')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={handleRegisterClick}
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl cursor-pointer"
            >
              {t('startFreeTrial')}
            </button>
            <button
              onClick={handleLoginClick}
              className="inline-block px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {t('signIn')}
            </button>
          </div>

          {/* Free Trial Benefits */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-blue-900 dark:text-blue-100">
              {t('freeTrialBenefits')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-lg font-semibold mb-2">{t('benefit1Title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('benefit1Description')}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold mb-2">{t('benefit2Title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('benefit2Description')}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold mb-2">{t('benefit3Title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('benefit3Description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Smart Allocation */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}>
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-2xl font-bold mb-4">{t('features.smartAllocation.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('features.smartAllocation.description')}
            </p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              {t.raw('features.smartAllocation.features').map((feature: string, index: number) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>

          {/* Partner Management */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}>
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-2xl font-bold mb-4">{t('features.partnerManagement.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('features.partnerManagement.description')}
            </p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              {t.raw('features.partnerManagement.features').map((feature: string, index: number) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>

          {/* Analytics & Reporting */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-4">{t('features.analyticsReporting.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('features.analyticsReporting.description')}
            </p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              {t.raw('features.analyticsReporting.features').map((feature: string, index: number) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={`py-20 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('readyToGetStarted')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('joinThousands')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRegisterClick}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl cursor-pointer"
            >
              {t('startFreeTrial')}
            </button>
            <button
              onClick={handleLoginClick}
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {t('signIn')}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
