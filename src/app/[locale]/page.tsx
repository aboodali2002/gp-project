"use client";

import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useState } from "react";
import { TopNavigation } from "./_components/top-navigation";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const t = useTranslations('home');
  const tNav = useTranslations('navigation');

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Navigation */}
      <TopNavigation />

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
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            {t('getStartedFree')}
          </Link>
        </div>
      </section>

      {/* Value Proposition Grid */}
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

      {/* CTA Section */}
      <section className={`py-20 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('readyToGetStarted')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('joinThousands')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {t('startFreeTrial')}
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {tNav('signIn')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
