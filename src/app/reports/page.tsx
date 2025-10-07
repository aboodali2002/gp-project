"use client";

import { useState } from "react";
import VestingSchedule from "../_components/vesting-schedule";

export default function Reports() {
  const [isDark, setIsDark] = useState(false);

  // Mock data for visualizations
  const departmentData = [
    { name: "Engineering", weight: 40, value: 40 },
    { name: "Marketing", weight: 25, value: 25 },
    { name: "Sales", weight: 15, value: 15 },
    { name: "Operations", weight: 20, value: 20 }
  ];

  const partnerEquityData = [
    { name: "John Doe", equity: 35, color: "#3B82F6" },
    { name: "Jane Smith", equity: 25, color: "#10B981" },
    { name: "Mike Johnson", equity: 20, color: "#F59E0B" },
    { name: "Sarah Wilson", equity: 20, color: "#EF4444" }
  ];

  const detailedData = [
    { partner: "John Doe", department: "Engineering", capitalAmount: 150, capitalPercent: 15, effortEquity: 15, totalEquity: 30 },
    { partner: "Jane Smith", department: "Marketing", capitalAmount: 50, capitalPercent: 5, effortEquity: 5, totalEquity: 10 },
    { partner: "Mike Johnson", department: "Sales", capitalAmount: 0, capitalPercent: 0, effortEquity: 20, totalEquity: 20 },
    { partner: "Sarah Wilson", department: "Operations", capitalAmount: 0, capitalPercent: 0, effortEquity: 20, totalEquity: 20 }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
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
            <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Home</a>
            <a href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Dashboard</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive equity analysis and visualizations</p>
        </div>

        {/* Visualizations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Department Weights Treemap */}
          <div className={`rounded-2xl border-2 p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className="text-2xl font-bold mb-6">Department Weights</h2>
            <div className="space-y-4">
              {departmentData.map((dept, index) => (
                <div key={dept.name} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-sm text-gray-500">{dept.weight}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
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
            <h2 className="text-2xl font-bold mb-6">Partner Equity Distribution</h2>
            <div className="space-y-4">
              {partnerEquityData.map((partner, index) => (
                <div key={partner.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: partner.color }}
                    ></div>
                    <span className="font-medium">{partner.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{partner.equity}%</div>
                    <div className="text-sm text-gray-500">Equity Share</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Simple Pie Chart Visualization */}
            <div className="mt-6 relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-blue-600"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 35 * Math.cos(0)}% ${50 + 35 * Math.sin(0)}%)` 
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-green-600"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 35 * Math.cos(Math.PI * 0.7)}% ${50 + 35 * Math.sin(Math.PI * 0.7)}%)` 
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-yellow-600"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 35 * Math.cos(Math.PI * 0.9)}% ${50 + 35 * Math.sin(Math.PI * 0.9)}%)` 
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-red-600"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 35 * Math.cos(Math.PI * 1.1)}% ${50 + 35 * Math.sin(Math.PI * 1.1)}%)` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Vesting Schedules Section */}
        <div className="mb-8">
          <VestingSchedule isDark={isDark} />
        </div>

        {/* Export Section */}
        <div className={`rounded-2xl border-2 p-6 mb-8 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Export Report</h2>
              <p className="text-gray-600 dark:text-gray-400">Generate comprehensive equity reports in PDF format</p>
            </div>
            <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
              <span>📄</span>
              <span>Export to PDF</span>
            </button>
          </div>
        </div>

        {/* Detailed Information Table */}
        <div className={`rounded-2xl border-2 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold">Detailed Equity Breakdown</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Complete partner and department equity analysis</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b border-gray-200 dark:border-gray-700 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Partner</th>
                  <th className="px-6 py-4 text-left font-semibold">Department</th>
                  <th className="px-6 py-4 text-right font-semibold">Capital ($)</th>
                  <th className="px-6 py-4 text-right font-semibold">Capital %</th>
                  <th className="px-6 py-4 text-right font-semibold">Effort %</th>
                  <th className="px-6 py-4 text-right font-semibold">Total %</th>
                </tr>
              </thead>
              <tbody>
                {detailedData.map((row, index) => (
                  <tr key={index} className={`border-b border-gray-200 dark:border-gray-700 ${
                    index % 2 === 0 
                      ? (isDark ? 'bg-gray-800' : 'bg-white')
                      : (isDark ? 'bg-gray-700' : 'bg-gray-50')
                  }`}>
                    <td className="px-6 py-4 font-medium">{row.partner}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.department}</td>
                    <td className="px-6 py-4 text-right">${row.capitalAmount?.toFixed?.(2) ?? "0.00"}</td>
                    <td className="px-6 py-4 text-right">{row.capitalPercent}%</td>
                    <td className="px-6 py-4 text-right">{row.effortEquity}%</td>
                    <td className="px-6 py-4 text-right font-bold text-lg">{row.totalEquity}%</td>
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
          } border border-gray-200 dark:border-gray-700`}>
            <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
            <div className="text-sm text-gray-500">Total Partners</div>
          </div>
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border border-gray-200 dark:border-gray-700`}>
            <div className="text-3xl font-bold text-green-600 mb-2">4</div>
            <div className="text-sm text-gray-500">Departments</div>
          </div>
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border border-gray-200 dark:border-gray-700`}>
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className="text-sm text-gray-500">Equity Allocated</div>
          </div>
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border border-gray-200 dark:border-gray-700`}>
            <div className="text-3xl font-bold text-orange-600 mb-2">48</div>
            <div className="text-sm text-gray-500">Vesting Months</div>
          </div>
        </div>
      </div>
    </div>
  );
}

