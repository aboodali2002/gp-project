"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function Dashboard() {
  const [isDark, setIsDark] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  // Mock data
  const [companyData, setCompanyData] = useState({
    name: "TechCorp Inc.",
    capitalWeight: 20,
    effortWeight: 80,
    totalShares: 1000000,
    vestingPeriod: 48
  });

  const [departments, setDepartments] = useState([
    { id: 1, name: "Engineering", weight: 40 },
    { id: 2, name: "Marketing", weight: 25 },
    { id: 3, name: "Sales", weight: 15 }
  ]);

  const [partners, setPartners] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", capitalContribution: 30, departments: ["Engineering"] },
    { id: 2, name: "Jane Smith", email: "jane@example.com", capitalContribution: 20, departments: ["Marketing", "Sales"] }
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, name: "Develop API", department: "Engineering", importance: "HIGH", weight: 3 },
    { id: 2, name: "Market Research", department: "Marketing", importance: "MEDIUM", weight: 2 },
    { id: 3, name: "Lead Generation", department: "Sales", importance: "HIGH", weight: 3 }
  ]);

  const totalDepartmentWeight = departments.reduce((sum, dept) => sum + dept.weight, 0);
  const totalCapitalContribution = partners.reduce((sum, partner) => sum + partner.capitalContribution, 0);
  const isAllocationValid = Math.abs(totalDepartmentWeight - companyData.effortWeight) < 0.01 && totalCapitalContribution <= 100;

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
            <a href="/reports" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Reports</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Management Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">All-in-one equity management platform</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[800px]">
          {/* Company Setup - 1x1 */}
          <div className={`lg:col-span-3 rounded-2xl border-2 p-6 transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Company Setup</h2>
              <div className="text-2xl">🏢</div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Shares</label>
                <input
                  type="number"
                  value={companyData.totalShares}
                  onChange={(e) => setCompanyData({...companyData, totalShares: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vesting Period (months)</label>
                <input
                  type="number"
                  value={companyData.vestingPeriod}
                  onChange={(e) => setCompanyData({...companyData, vestingPeriod: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Capital vs Effort Split - 2x1 */}
          <div className={`lg:col-span-6 rounded-2xl border-2 p-6 transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Capital vs Effort Split</h2>
              <div className="text-2xl">⚖️</div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Capital Weight: {companyData.capitalWeight}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={companyData.capitalWeight}
                  onChange={(e) => setCompanyData({
                    ...companyData, 
                    capitalWeight: parseInt(e.target.value),
                    effortWeight: 100 - parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
              
              {/* Dual Bar Chart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Capital</span>
                  <span className="text-sm text-gray-500">{companyData.capitalWeight}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${companyData.capitalWeight}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Effort</span>
                  <span className="text-sm text-gray-500">{companyData.effortWeight}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-green-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${companyData.effortWeight}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights - 1x1 */}
          <div className={`lg:col-span-3 rounded-2xl border-2 p-6 transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Quick Insights</h2>
              <div className="text-2xl">📊</div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{departments.length}</div>
                <div className="text-sm text-gray-500">Departments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{partners.length}</div>
                <div className="text-sm text-gray-500">Partners</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isAllocationValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isAllocationValid ? '✓' : '⚠'}
                </div>
                <div className="text-sm text-gray-500">Allocation Valid</div>
              </div>
            </div>
          </div>

          {/* Department Management - 1x2 */}
          <div className={`lg:col-span-6 rounded-2xl border-2 p-6 transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Department Management</h2>
              <div className="text-2xl">🏢</div>
            </div>
            
            <div className="space-y-4">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium">{dept.name}</div>
                    <div className="text-sm text-gray-500">Weight: {dept.weight}%</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={dept.weight}
                      onChange={(e) => setDepartments(departments.map(d => 
                        d.id === dept.id ? {...d, weight: parseInt(e.target.value)} : d
                      ))}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                    />
                    <button className="text-red-600 hover:text-red-800 text-sm">×</button>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                + Add Department
              </button>
              
              <div className={`text-sm p-2 rounded ${
                Math.abs(totalDepartmentWeight - companyData.effortWeight) < 0.01 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                Total: {totalDepartmentWeight}% (Expected: {companyData.effortWeight}%)
              </div>
            </div>
          </div>

          {/* Partner Management - 1x2 */}
          <div className={`lg:col-span-6 rounded-2xl border-2 p-6 transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Partner Management</h2>
              <div className="text-2xl">👥</div>
            </div>
            
            <div className="space-y-4">
              {partners.map((partner) => (
                <div key={partner.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{partner.name}</div>
                      <div className="text-sm text-gray-500">{partner.email}</div>
                    </div>
                    <button className="text-red-600 hover:text-red-800 text-sm">×</button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={partner.capitalContribution}
                      onChange={(e) => setPartners(partners.map(p => 
                        p.id === partner.id ? {...p, capitalContribution: parseInt(e.target.value)} : p
                      ))}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                    />
                    <span className="text-sm text-gray-500">% Capital</span>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                + Add Partner
              </button>
              
              <div className={`text-sm p-2 rounded ${
                totalCapitalContribution <= 100 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                Total Capital: {totalCapitalContribution}%
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Save Draft
          </button>
          <div className="space-x-3">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Preview Equity
            </button>
            <button 
              disabled={!isAllocationValid}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate Final Equity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
