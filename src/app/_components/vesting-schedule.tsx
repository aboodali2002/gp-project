"use client";

import { useState, useEffect } from "react";

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

export default function VestingSchedule({ isDark }: VestingScheduleProps) {
  const [vestingData, setVestingData] = useState<PartnerVestingData[]>([]);
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

  // Generate vesting data from dashboard data
  useEffect(() => {
    if (dashboardData && dashboardData.partners && dashboardData.partners.length > 0) {
      const generatedVestingData = dashboardData.partners.map((partner: any) => {
        const vestingPeriod = dashboardData.companyData?.vestingPeriod || 48;
        const totalShares = dashboardData.companyData?.totalShares || 1000000;
        const partnerShares = Math.round((partner.capitalAmount || 0) / Math.max(dashboardData.partners.reduce((sum: number, p: any) => sum + (p.capitalAmount || 0), 1), 1) * totalShares);
        
        // Generate vesting schedule
        const schedule: VestingEntry[] = [];
        const startDate = new Date();
        
        for (let month = 1; month <= vestingPeriod; month++) {
          const vestingPercentage = (month / vestingPeriod) * 100;
          const shares = Math.round((partnerShares * month) / vestingPeriod);
          const cumulativeShares = shares;
          
          const date = new Date(startDate);
          date.setMonth(date.getMonth() + month - 1);
          
          schedule.push({
            date: date.toISOString().split('T')[0],
            month,
            vestingPercentage,
            shares,
            cumulativeShares
          });
        }

        return {
          partner: {
            id: partner.id.toString(),
            name: partner.name,
            email: partner.email
          },
          vestingPeriod,
          vestingStartDate: startDate.toISOString().split('T')[0],
          vestingMethod: "Linear",
          totalShares,
          partnerShares,
          capitalEquity: Math.round((partner.capitalAmount || 0) / Math.max(dashboardData.partners.reduce((sum: number, p: any) => sum + (p.capitalAmount || 0), 1), 1) * 100),
          effortEquity: Math.round(100 / Math.max(dashboardData.partners.length, 1)),
          totalEquity: Math.round((partner.capitalAmount || 0) / Math.max(dashboardData.partners.reduce((sum: number, p: any) => sum + (p.capitalAmount || 0), 1), 1) * 100) + Math.round(100 / Math.max(dashboardData.partners.length, 1)),
          effortBreakdown: partner.departments?.map((dept: string) => ({
            departmentName: dept,
            departmentWeight: 25, // Default weight
            taskCount: dashboardData.tasks?.filter((task: any) => task.assignedPartners?.includes(partner.id)).length || 0,
            totalTaskWeight: dashboardData.tasks?.filter((task: any) => task.assignedPartners?.includes(partner.id)).reduce((sum: number, task: any) => sum + task.weight, 0) || 0,
            effortContribution: 25, // Default contribution
            effortPercentage: 25 // Default percentage
          })) || [],
          schedule
        };
      });
      
      setVestingData(generatedVestingData);
    }
  }, [dashboardData]);

  // Show empty state if no data
  if (!dashboardData || !dashboardData.partners || dashboardData.partners.length === 0) {
    return (
      <div className={`rounded-2xl border-2 p-6 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📅</div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Vesting Data</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Add partners in the Dashboard to see vesting schedules here.
          </p>
        </div>
      </div>
    );
  }

  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  // Set first partner as selected when vesting data loads
  useEffect(() => {
    if (vestingData.length > 0 && !selectedPartner) {
      setSelectedPartner(vestingData[0].partner.id);
    }
  }, [vestingData, selectedPartner]);

  const currentPartner = vestingData.find(p => p.partner.id === selectedPartner);

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
            {vestingData.map((partner) => (
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

