"use client";

import { useState, useEffect } from "react";
import VestingSchedule from "../_components/vesting-schedule";
import Link from "next/link";
import { useAuth } from "../[locale]/_components/auth-context";
import { useRouter } from "next/navigation";
import { useDarkMode } from "../[locale]/_components/dark-mode-provider";
import { LanguageSwitcher } from "../[locale]/_components/language-switcher";
import { AuthenticatedNavigation } from "../[locale]/_components/authenticated-navigation";
import { useLocale } from 'next-intl';

export default function Reports() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [user, isAuthenticated, router]);

  const [dashboardData, setDashboardData] = useState<any>(null);

  // Load data from localStorage (saved from Dashboard)
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("cq_state");
      if (savedState) {
        const parsedData = JSON.parse(savedState);
        setDashboardData(parsedData);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }, []);

  // Process dashboard data for reports
  const departmentData = dashboardData ? 
    dashboardData.departments?.map((dept: any) => ({ name: dept.name, weight: dept.weight, value: dept.weight })) || [] :
    [];

  const partnerEquityData = dashboardData ?
    dashboardData.partners?.map((partner: any, index: number) => ({
      name: partner.name,
      equity: Math.round((partner.capitalAmount || 0) / Math.max(dashboardData.partners.reduce((sum: number, p: any) => sum + (p.capitalAmount || 0), 1), 1) * 100),
      color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"][index % 4]
    })) || [] :
    [];

  const detailedData = dashboardData ?
    dashboardData.partners?.map((partner: any) => ({
      partner: partner.name,
      department: partner.departments?.[0] || "Unassigned",
      capitalAmount: partner.capitalAmount || 0,
      capitalPercent: Math.round((partner.capitalAmount || 0) / Math.max(dashboardData.partners.reduce((sum: number, p: any) => sum + (p.capitalAmount || 0), 1), 1) * 100),
      effortEquity: Math.round(100 / Math.max(dashboardData.partners.length, 1)),
      totalEquity: Math.round((partner.capitalAmount || 0) / Math.max(dashboardData.partners.reduce((sum: number, p: any) => sum + (p.capitalAmount || 0), 1), 1) * 100) + Math.round(100 / Math.max(dashboardData.partners.length, 1))
    })) || [] :
    [];

  const partnerTasks = dashboardData ?
    dashboardData.partners?.map((partner: any) => ({
      partner: partner.name,
      department: partner.departments?.[0] || "Unassigned",
      tasks: dashboardData.tasks?.filter((task: any) => 
        task.assignedPartners?.includes(partner.id)
      ).map((task: any) => ({
        name: task.name,
        importance: task.importance,
        weight: task.weight
      })) || []
    })) || [] :
    [];

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Show empty state if no dashboard data
  if (!dashboardData || (!dashboardData.departments?.length && !dashboardData.partners?.length && !dashboardData.tasks?.length)) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        {/* Navigation */}
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
              CorporateQuota
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
                    Welcome, {user.fullName}
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem('user');
                      localStorage.removeItem('token');
                      window.location.href = `/${locale}/login`;
                    }}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please add some data in the Dashboard first to see reports here.
            </p>
            <Link
              href={`/${locale}/dashboard`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Navigation */}
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
            CorporateQuota
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
                  onClick={() => {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = `/${locale}/login`;
                  }}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Reports & Analytics</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Comprehensive equity analysis and visualizations</p>
        </div>

        {/* Visualizations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Department Weights Treemap */}
          <div className={`rounded-2xl border-2 p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Department Weights</h2>
            <div className="space-y-4">
                  {departmentData.map((dept: any, index: number) => (
                <div key={dept.name} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{dept.name}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{dept.weight}%</span>
                  </div>
                  <div className={`w-full rounded-full h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-6 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-blue-600' :
                        index === 1 ? 'bg-green-600' :
                        index === 2 ? 'bg-yellow-600' : 'bg-purple-600'
                      }`}
                      style={{ width: `${dept.weight}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Equity Pie Chart */}
          <div className={`rounded-2xl border-2 p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Partner Equity Distribution</h2>
            <div className="space-y-4">
                  {partnerEquityData.map((partner: any) => (
                <div key={partner.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: partner.color }}
                    ></div>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{partner.name}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{partner.equity}%</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Equity Share</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Simple Pie Chart Visualization */}
            <div className="mt-6 relative w-48 h-48 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={isDark ? 'text-gray-700' : 'text-gray-200'}
                />
                
                {/* John Doe - 35% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  strokeDasharray={`${35 * 2.51} 251`}
                  strokeDashoffset="0"
                  className="transition-all duration-500"
                />
                
                {/* Jane Smith - 25% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray={`${25 * 2.51} 251`}
                  strokeDashoffset={`-${35 * 2.51}`}
                  className="transition-all duration-500"
                />
                
                {/* Mike Johnson - 20% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="8"
                  strokeDasharray={`${20 * 2.51} 251`}
                  strokeDashoffset={`-${(35 + 25) * 2.51}`}
                  className="transition-all duration-500"
                />
                
                {/* Sarah Wilson - 20% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="8"
                  strokeDasharray={`${20 * 2.51} 251`}
                  strokeDashoffset={`-${(35 + 25 + 20) * 2.51}`}
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Partner Tasks Section */}
        <div className="mb-8">
          <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Partner Tasks & Assignments</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {partnerTasks.map((partner: any) => (
              <div key={partner.partner} className={`rounded-2xl border-2 p-6 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{partner.partner}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{partner.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{partner.tasks.length}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Tasks</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                      {partner.tasks.map((task: any, taskIndex: number) => (
                    <div key={taskIndex} className={`p-3 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.name}</div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.importance === 'HIGH' ? (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800') :
                            task.importance === 'MEDIUM' ? (isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
                            (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                          }`}>
                            {task.importance}
                          </span>
                        </div>
                      </div>
                      <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Weight: {task.weight}</span>
                        <span>Department: {partner.department}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            ))}
          </div>
        </div>

        {/* Vesting Schedules Section */}
        <div className="mb-8">
          <VestingSchedule isDark={isDark} />
        </div>

        {/* Detailed Information Table */}
        <div className={`rounded-2xl border-2 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Detailed Equity Breakdown</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Complete partner and department equity analysis</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Partner</th>
                  <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Department</th>
                  <th className={`px-6 py-4 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Capital ($)</th>
                  <th className={`px-6 py-4 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Capital %</th>
                  <th className={`px-6 py-4 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Effort %</th>
                  <th className={`px-6 py-4 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total %</th>
                </tr>
              </thead>
              <tbody>
                    {detailedData.map((row: any, index: number) => (
                  <tr key={index} className={`border-b ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  } ${
                    index % 2 === 0 
                      ? (isDark ? 'bg-gray-800' : 'bg-white')
                      : (isDark ? 'bg-gray-700' : 'bg-gray-50')
                  }`}>
                    <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.partner}</td>
                    <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.department}</td>
                    <td className={`px-6 py-4 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>${row.capitalAmount?.toFixed?.(2) ?? "0.00"}</td>
                    <td className={`px-6 py-4 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.capitalPercent}%</td>
                    <td className={`px-6 py-4 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.effortEquity}%</td>
                    <td className={`px-6 py-4 text-right font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.totalEquity}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Partners</div>
          </div>
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-3xl font-bold text-green-600 mb-2">4</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Departments</div>
          </div>
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Equity Allocated</div>
          </div>
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-3xl font-bold text-orange-600 mb-2">48</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Vesting Months</div>
          </div>
        </div>

        {/* Export Section */}
        <div className={`rounded-2xl border-2 p-6 mt-8 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Export Report</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Generate comprehensive equity reports in PDF format</p>
            </div>
            <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
              <span>📄</span>
              <span>Export to PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

