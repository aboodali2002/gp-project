"use client";

import { useState } from "react";

interface VestingScheduleProps {
  isDark: boolean;
}

interface VestingEntry {
  date: string;
  month: number;
  vestingPercentage: number;
  shares: number;
  cumulativeShares: number;
}

interface PartnerVestingData {
  partner: {
    id: string;
    name: string;
    email: string;
  };
  vestingPeriod: number;
  vestingStartDate: string;
  vestingMethod: string;
  totalShares: number;
  partnerShares: number;
  capitalEquity: number;
  effortEquity: number;
  totalEquity: number;
  effortBreakdown: Array<{
    departmentName: string;
    departmentWeight: number;
    taskCount: number;
    totalTaskWeight: number;
    effortContribution: number;
    effortPercentage: number;
  }>;
  schedule: VestingEntry[];
}

// Mock data for demonstration - in real app this would come from API
const mockVestingData: PartnerVestingData[] = [
  {
    partner: {
      id: "1",
      name: "Mohammed Alojayan",
      email: "mohammed.alojayan@example.com"
    },
    vestingPeriod: 48,
    vestingStartDate: "2024-01-01",
    vestingMethod: "MONTHLY",
    totalShares: 1000000,
    partnerShares: 350000,
    capitalEquity: 0.15, // 15% from capital contribution
    effortEquity: 0.20, // 20% from effort/tasks
    totalEquity: 0.35, // 35% total equity
    effortBreakdown: [
      {
        departmentName: "Engineering",
        departmentWeight: 40,
        taskCount: 3,
        totalTaskWeight: 8,
        effortContribution: 0.12,
        effortPercentage: 12
      },
      {
        departmentName: "Product",
        departmentWeight: 20,
        taskCount: 2,
        totalTaskWeight: 4,
        effortContribution: 0.08,
        effortPercentage: 8
      }
    ],
    schedule: [
      { date: "2024-01-01", month: 0, vestingPercentage: 0, shares: 0, cumulativeShares: 0 },
      { date: "2024-02-01", month: 1, vestingPercentage: 2.08, shares: 7292, cumulativeShares: 7292 },
      { date: "2024-03-01", month: 2, vestingPercentage: 4.17, shares: 7292, cumulativeShares: 14583 },
      { date: "2024-06-01", month: 6, vestingPercentage: 12.5, shares: 21875, cumulativeShares: 43750 },
      { date: "2024-12-01", month: 12, vestingPercentage: 25, shares: 43750, cumulativeShares: 87500 },
      { date: "2025-12-01", month: 24, vestingPercentage: 50, shares: 87500, cumulativeShares: 175000 },
      { date: "2026-12-01", month: 36, vestingPercentage: 75, shares: 87500, cumulativeShares: 262500 },
      { date: "2027-12-01", month: 48, vestingPercentage: 100, shares: 87500, cumulativeShares: 350000 }
    ]
  },
  {
    partner: {
      id: "2",
      name: "Ali Bohulaiqa",
      email: "ali.bohulaiqa@example.com"
    },
    vestingPeriod: 48,
    vestingStartDate: "2024-01-01",
    vestingMethod: "QUARTERLY",
    totalShares: 1000000,
    partnerShares: 250000,
    capitalEquity: 0.10, // 10% from capital contribution
    effortEquity: 0.15, // 15% from effort/tasks
    totalEquity: 0.25, // 25% total equity
    effortBreakdown: [
      {
        departmentName: "Marketing",
        departmentWeight: 30,
        taskCount: 2,
        totalTaskWeight: 3,
        effortContribution: 0.09,
        effortPercentage: 9
      },
      {
        departmentName: "Sales",
        departmentWeight: 10,
        taskCount: 1,
        totalTaskWeight: 2,
        effortContribution: 0.06,
        effortPercentage: 6
      }
    ],
    schedule: [
      { date: "2024-01-01", month: 0, vestingPercentage: 0, shares: 0, cumulativeShares: 0 },
      { date: "2024-04-01", month: 3, vestingPercentage: 6.25, shares: 15625, cumulativeShares: 15625 },
      { date: "2024-07-01", month: 6, vestingPercentage: 12.5, shares: 15625, cumulativeShares: 31250 },
      { date: "2024-10-01", month: 9, vestingPercentage: 18.75, shares: 15625, cumulativeShares: 46875 },
      { date: "2025-01-01", month: 12, vestingPercentage: 25, shares: 15625, cumulativeShares: 62500 },
      { date: "2026-01-01", month: 24, vestingPercentage: 50, shares: 62500, cumulativeShares: 125000 },
      { date: "2027-01-01", month: 36, vestingPercentage: 75, shares: 62500, cumulativeShares: 187500 },
      { date: "2028-01-01", month: 48, vestingPercentage: 100, shares: 62500, cumulativeShares: 250000 }
    ]
  },
  {
    partner: {
      id: "3",
      name: "Abdullah Alsaeed",
      email: "abdullah.alsaeed@example.com"
    },
    vestingPeriod: 48,
    vestingStartDate: "2024-01-01",
    vestingMethod: "ANNUAL",
    totalShares: 1000000,
    partnerShares: 200000,
    capitalEquity: 0.08, // 8% from capital contribution
    effortEquity: 0.12, // 12% from effort/tasks
    totalEquity: 0.20, // 20% total equity
    effortBreakdown: [
      {
        departmentName: "Operations",
        departmentWeight: 15,
        taskCount: 1,
        totalTaskWeight: 2,
        effortContribution: 0.06,
        effortPercentage: 6
      },
      {
        departmentName: "Finance",
        departmentWeight: 10,
        taskCount: 1,
        totalTaskWeight: 1,
        effortContribution: 0.06,
        effortPercentage: 6
      }
    ],
    schedule: [
      { date: "2024-01-01", month: 0, vestingPercentage: 0, shares: 0, cumulativeShares: 0 },
      { date: "2025-01-01", month: 12, vestingPercentage: 25, shares: 50000, cumulativeShares: 50000 },
      { date: "2026-01-01", month: 24, vestingPercentage: 50, shares: 50000, cumulativeShares: 100000 },
      { date: "2027-01-01", month: 36, vestingPercentage: 75, shares: 50000, cumulativeShares: 150000 },
      { date: "2028-01-01", month: 48, vestingPercentage: 100, shares: 50000, cumulativeShares: 200000 }
    ]
  },
  {
    partner: {
      id: "4",
      name: "Mohammed Dhabab",
      email: "mohammed.dhabab@example.com"
    },
    vestingPeriod: 48,
    vestingStartDate: "2024-01-01",
    vestingMethod: "MONTHLY",
    totalShares: 1000000,
    partnerShares: 200000,
    capitalEquity: 0.05, // 5% from capital contribution
    effortEquity: 0.15, // 15% from effort/tasks
    totalEquity: 0.20, // 20% total equity
    effortBreakdown: [
      {
        departmentName: "Product",
        departmentWeight: 20,
        taskCount: 2,
        totalTaskWeight: 5,
        effortContribution: 0.10,
        effortPercentage: 10
      },
      {
        departmentName: "Engineering",
        departmentWeight: 40,
        taskCount: 1,
        totalTaskWeight: 3,
        effortContribution: 0.05,
        effortPercentage: 5
      }
    ],
    schedule: [
      { date: "2024-01-01", month: 0, vestingPercentage: 0, shares: 0, cumulativeShares: 0 },
      { date: "2024-02-01", month: 1, vestingPercentage: 2.08, shares: 4167, cumulativeShares: 4167 },
      { date: "2024-03-01", month: 2, vestingPercentage: 4.17, shares: 4167, cumulativeShares: 8333 },
      { date: "2024-06-01", month: 6, vestingPercentage: 12.5, shares: 12500, cumulativeShares: 25000 },
      { date: "2024-12-01", month: 12, vestingPercentage: 25, shares: 25000, cumulativeShares: 50000 },
      { date: "2025-12-01", month: 24, vestingPercentage: 50, shares: 50000, cumulativeShares: 100000 },
      { date: "2026-12-01", month: 36, vestingPercentage: 75, shares: 50000, cumulativeShares: 150000 },
      { date: "2027-12-01", month: 48, vestingPercentage: 100, shares: 50000, cumulativeShares: 200000 }
    ]
  }
];

export default function VestingSchedule({ isDark }: VestingScheduleProps) {
  const [selectedPartner, setSelectedPartner] = useState<string>("1");
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  const currentPartner = mockVestingData.find(p => p.partner.id === selectedPartner);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className={`rounded-2xl border-2 p-6 ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Partner Vesting Schedules</h2>
          <p className="text-gray-600 dark:text-gray-400">View when partners will fully own their shares</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {mockVestingData.map((partner) => (
              <option key={partner.partner.id} value={partner.partner.id}>
                {partner.partner.name}
              </option>
            ))}
          </select>
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === "table"
                  ? isDark 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-100 text-gray-900'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("chart")}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === "chart"
                  ? isDark 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-100 text-gray-900'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Chart
            </button>
          </div>
        </div>
      </div>

      {currentPartner && (
        <div className="space-y-6">
          {/* Partner Info */}
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Partner</div>
                <div className="font-semibold">{currentPartner.partner.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Shares</div>
                <div className="font-semibold">{formatNumber(currentPartner.partnerShares)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Vesting Period</div>
                <div className="font-semibold">{currentPartner.vestingPeriod} months</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Vesting Method</div>
                <div className="font-semibold">{currentPartner.vestingMethod}</div>
              </div>
            </div>
          </div>

          {/* Equity Breakdown */}
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h3 className="text-lg font-semibold mb-4">Equity Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(currentPartner.capitalEquity * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Capital Equity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(currentPartner.effortEquity * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Effort Equity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(currentPartner.totalEquity * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Total Equity</div>
              </div>
            </div>

            {/* Effort Breakdown by Department */}
            {currentPartner.effortBreakdown.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2">Effort Breakdown by Department</h4>
                <div className="space-y-2">
                  {currentPartner.effortBreakdown.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{dept.departmentName}</div>
                        <div className="text-xs text-gray-600">
                          {dept.taskCount} tasks, {dept.totalTaskWeight} weight, 
                          Dept Weight: {dept.departmentWeight}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {dept.effortPercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">effort</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vesting Schedule */}
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b border-gray-200 dark:border-gray-700 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Month</th>
                    <th className="px-4 py-3 text-right font-semibold">Vested %</th>
                    <th className="px-4 py-3 text-right font-semibold">Shares This Period</th>
                    <th className="px-4 py-3 text-right font-semibold">Cumulative Shares</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPartner.schedule.map((entry, index) => (
                    <tr key={index} className={`border-b border-gray-200 dark:border-gray-700 ${
                      index % 2 === 0 
                        ? (isDark ? 'bg-gray-800' : 'bg-white')
                        : (isDark ? 'bg-gray-700' : 'bg-gray-50')
                    }`}>
                      <td className="px-4 py-3">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3">{entry.month}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {entry.vestingPercentage.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right">{formatNumber(entry.shares)}</td>
                      <td className="px-4 py-3 text-right font-bold">
                        {formatNumber(entry.cumulativeShares)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vesting Progress Chart</h3>
              <div className="space-y-3">
                {currentPartner.schedule.map((entry, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {formatDate(entry.date)} (Month {entry.month})
                      </span>
                      <span className="text-sm text-gray-500">
                        {entry.vestingPercentage.toFixed(1)}% vested
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(entry.vestingPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatNumber(entry.cumulativeShares)} shares</span>
                      <span>{formatNumber(currentPartner.partnerShares - entry.cumulativeShares)} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="text-sm text-gray-500 dark:text-gray-400">Fully Vested Date</div>
              <div className="font-bold text-lg">
                {formatDate(currentPartner.schedule[currentPartner.schedule.length - 1]?.date || '')}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Vesting Period</div>
              <div className="font-bold text-lg">{currentPartner.vestingPeriod} months</div>
            </div>
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="text-sm text-gray-500 dark:text-gray-400">Vesting Frequency</div>
              <div className="font-bold text-lg">{currentPartner.vestingMethod}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

