"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700">
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
              href="/login"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
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
              for Startup Founders
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Calculate and manage fair equity splits based on roles and major tasks across stages, 
            with periodic adjustments and comprehensive reporting.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Get Started Free
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
            <h3 className="text-2xl font-bold mb-4">Smart Allocation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Dynamic capital vs effort weighting with real-time validation and visual feedback.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              <li>• Department-based equity distribution</li>
              <li>• Task importance weighting system</li>
              <li>• Instant validation and corrections</li>
            </ul>
          </div>

          {/* Partner Management */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}>
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-2xl font-bold mb-4">Partner Management</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comprehensive founder and partner management with multi-department assignments.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              <li>• Multi-department partner assignments</li>
              <li>• Capital contribution tracking</li>
              <li>• Individual equity calculations</li>
            </ul>
          </div>

          {/* Analytics & Reporting */}
          <div className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-4">Analytics & Reporting</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Advanced visualizations and comprehensive reporting with PDF export capabilities.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
              <li>• Interactive equity dashboards</li>
              <li>• Vesting schedule tracking</li>
              <li>• PDF report generation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of startups managing their equity with transparency and fairness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
