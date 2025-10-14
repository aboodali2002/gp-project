"use client";

import Link from "next/link";
import { useState } from "react";

export default function RootPage() {
  const [isDark, setIsDark] = useState(false);

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Navigation */}
      <nav className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">CorporateQuota</div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link
              href="/en/login"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/en/register"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6">
            Fair Equity Management
            <span className="block text-4xl font-normal text-gray-600 dark:text-gray-400 mt-2">
              Calculate and manage fair equity splits
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Build your startup with confidence using our comprehensive equity management platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/en/register"
              className="px-8 py-4 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/en/login"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Language Selection */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Choose Your Language</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/en/welcome"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              🇺🇸 English
            </Link>
            <Link
              href="/ar/welcome"
              className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
            >
              🇸🇦 العربية
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}