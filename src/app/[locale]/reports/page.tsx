
"use client";

import { useDarkMode } from "../_components/dark-mode-provider";
import { useTranslations } from 'next-intl';
import VestingSchedule from "../../_components/vesting-schedule";
import { AuthenticatedNavigation } from "../_components/authenticated-navigation";
import { api } from "~/trpc/react";
import { useAuth } from "../../_components/auth-context";
import { useState, useEffect } from "react";

export default function Reports() {
  const { isDark } = useDarkMode();
  const t = useTranslations('reports');
  const { user } = useAuth();
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

  const { data: companies, isLoading: isLoadingCompanies } = api.company.getAllByUser.useQuery({
    userId: user?.id ?? "",
  }, { enabled: !!user });

  const companyId = companies?.[0]?.id;

  const { data: reportData, isLoading: isLoadingReportData } = api.report.getReportData.useQuery({
    companyId: companyId ?? "",
  }, { enabled: !!companyId });

  if (isLoadingCompanies || isLoadingReportData) {
    return <div>Loading...</div>;
  }

  // Use dashboard data if available, otherwise fall back to API data
  const dataToUse = dashboardData || reportData;

  if (!dataToUse) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <AuthenticatedNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please add some data in the Dashboard first to see reports here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Process dashboard data for reports
  const departmentData = dashboardData ? 
    dashboardData.departments?.map((dept: any) => ({ name: dept.name, weight: dept.weight, value: dept.weight })) || [] :
    (reportData as any)?.departmentData || [];

  const partnerEquityData = dashboardData ?
    dashboardData.partners?.map((partner: any, index: number) => ({
      name: partner.name,
      equity: Math.round((partner.capitalAmount || 0) / Math.max(dashboardData.partners.reduce((sum: number, p: any) => sum + (p.capitalAmount || 0), 1), 1) * 100),
      color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"][index % 4]
    })) || [] :
    (reportData as any)?.partnerEquityData || [];

  const detailedData = dashboardData ?
    dashboardData.partners?.map((partner: any) => ({
      partner: partner.name,
      department: partner.departments?.[0] || "Unassigned",
      capitalAmount: partner.capitalAmount || 0,
      capitalPercent: Math.round((partner.capitalAmount || 0) / Math.max(dashboardData.partners.reduce((sum: number, p: any) => sum + (p.capitalAmount || 0), 1), 1) * 100),
      effortEquity: Math.round(100 / Math.max(dashboardData.partners.length, 1)),
      totalEquity: Math.round((partner.capitalAmount || 0) / Math.max(dashboardData.partners.reduce((sum: number, p: any) => sum + (p.capitalAmount || 0), 1), 1) * 100) + Math.round(100 / Math.max(dashboardData.partners.length, 1))
    })) || [] :
    (reportData as any)?.detailedData || [];

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
    (reportData as any)?.partnerTasks || [];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <AuthenticatedNavigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('description')}</p>
        </div>

        {/* Visualizations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Department Weights Treemap */}
          <div className={`rounded-2xl border-2 p-6 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h2 className="text-2xl font-bold mb-6">{t('departmentWeights')}</h2>
            <div className="space-y-4">
              {departmentData.map((dept: any, index: number) => (
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
            <h2 className="text-2xl font-bold mb-6">{t('partnerEquityDistribution')}</h2>
            <div className="space-y-4">
              {partnerEquityData.map((partner: any) => (
                <div key={partner.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: partner.color }}
                    ></div>
                    <span className="font-medium">{partner.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{partner.equity.toFixed(2)}%</div>
                    <div className="text-sm text-gray-500">{t('equityShare')}</div>
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
                  className="text-gray-200 dark:text-gray-700"
                />
                
                {partnerEquityData.reduce((acc: any, partner: any) => {
                  const offset = acc.offset;
                  const dashArray = `${partner.equity * 2.51} 251`;
                  acc.offset += partner.equity * 2.51;
                  acc.circles.push(
                    <circle
                      key={partner.name}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={partner.color}
                      strokeWidth="8"
                      strokeDasharray={dashArray}
                      strokeDashoffset={-offset}
                      className="transition-all duration-500"
                    />
                  );
                  return acc;
                }, { circles: [] as React.ReactNode[], offset: 0 }).circles}
              </svg>
            </div>
          </div>
        </div>

        {/* Partner Tasks Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">{t('partnerTasksAssignments')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {partnerTasks.map((partner: any) => (
              <div key={partner.partner} className={`rounded-2xl border-2 p-6 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{partner.partner}</h3>
                    <p className="text-sm text-gray-500">{partner.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{partner.tasks.length}</div>
                    <div className="text-xs text-gray-500">{t('totalTasks')}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {partner.tasks.map((task: any, taskIndex: number) => (
                    <div key={taskIndex} className={`p-3 rounded-lg border ${
                      isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{task.name}</div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.importance === 'HIGH' ? 'bg-red-100 text-red-800' :
                            task.importance === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.importance}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{t('weight')}: {task.weight}</span>
                        <span>{t('department')}: {partner.department}</span>
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
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold">{t('detailedEquityBreakdown')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('detailedEquityDescription')}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b border-gray-200 dark:border-gray-700 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">{t('partner')}</th>
                  <th className="px-6 py-4 text-left font-semibold">{t('department')}</th>
                  <th className="px-6 py-4 text-right font-semibold">{t('capital')}</th>
                  <th className="px-6 py-4 text-right font-semibold">{t('capitalPercent')}</th>
                  <th className="px-6 py-4 text-right font-semibold">{t('effortPercent')}</th>
                  <th className="px-6 py-4 text-right font-semibold">{t('totalPercent')}</th>
                </tr>
              </thead>
              <tbody>
                {detailedData.map((row: any, index: number) => (
                  <tr key={row.partner} className={`border-b border-gray-200 dark:border-gray-700 ${
                    index % 2 === 0 
                      ? (isDark ? 'bg-gray-800' : 'bg-white')
                      : (isDark ? 'bg-gray-700' : 'bg-gray-50')
                  }`}>
                    <td className="px-6 py-4 font-medium">{row.partner}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.department}</td>
                    <td className="px-6 py-4 text-right">${row.capitalAmount?.toFixed?.(2) ?? "0.00"}</td>
                    <td className="px-6 py-4 text-right">{row.capitalPercent.toFixed(2)}%</td>
                    <td className="px-6 py-4 text-right">{row.effortEquity.toFixed(2)}%</td>
                    <td className="px-6 py-4 text-right font-bold text-lg">{row.totalEquity.toFixed(2)}%</td>
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
            <div className="text-3xl font-bold text-blue-600 mb-2">{partnerEquityData.length}</div>
            <div className="text-sm text-gray-500">{t('totalPartners')}</div>
          </div>
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border border-gray-200 dark:border-gray-700`}>
            <div className="text-3xl font-bold text-green-600 mb-2">{departmentData.length}</div>
            <div className="text-sm text-gray-500">{t('departments')}</div>
          </div>
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border border-gray-200 dark:border-gray-700`}>
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className="text-sm text-gray-500">{t('equityAllocated')}</div>
          </div>
          <div className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } border border-gray-200 dark:border-gray-700`}>
            <div className="text-3xl font-bold text-orange-600 mb-2">48</div>
            <div className="text-sm text-gray-500">{t('vestingMonths')}</div>
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
              <h2 className="text-2xl font-bold mb-2">{t('exportReport')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('exportDescription')}</p>
            </div>
            <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
              <span>📄</span>
              <span>{t('exportToPDF')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
