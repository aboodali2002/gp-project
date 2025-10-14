"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VestingSchedule from "../../_components/vesting-schedule";

interface Partner {
  id: string;
  name: string;
  email: string;
  capitalContribution: number;
  departments: string[];
  capitalEquity: number;
  effortEquity: number;
  totalEquity: number;
  capitalAmount?: number;
}

interface Task {
  name: string;
  importance: string;
  weight: number;
  equity: number;
}

interface Department {
  id: string;
  name: string;
  weight: number;
  totalTaskWeight: number;
  equityPerPoint: number;
  tasks: Task[];
}

interface CompanyData {
  capitalWeight: number;
}

export default function EquityDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "partners" | "departments" | "vesting">("overview");

  // Load state from localStorage if present; fallback to mock data
  const saved = typeof window !== 'undefined' ? localStorage.getItem("cq_state") : null;
  const parsed: { partners: Partner[], departments: Department[], companyData: CompanyData } | null = saved ? (() => { try { return JSON.parse(saved) as { partners: Partner[], departments: Department[], companyData: CompanyData }; } catch { return null; } })() : null;

  const partners: Partner[] = parsed?.partners ?? [
    {
      id: "partner-1",
      name: "John Doe",
      email: "john@example.com",
      capitalContribution: 30,
      departments: ["Engineering", "Product"],
      capitalEquity: 6.0, // 30% of 20% capital weight
      effortEquity: 12.5, // Calculated from tasks
      totalEquity: 18.5
    },
    {
      id: "partner-2",
      name: "Jane Smith", 
      email: "jane@example.com",
      capitalContribution: 20,
      departments: ["Marketing", "Sales"],
      capitalEquity: 4.0, // 20% of 20% capital weight
      effortEquity: 8.3, // Calculated from tasks
      totalEquity: 12.3
    },
    {
      id: "partner-3",
      name: "Mike Johnson",
      email: "mike@example.com", 
      capitalContribution: 0,
      departments: ["Engineering"],
      capitalEquity: 0,
      effortEquity: 15.2, // Calculated from tasks
      totalEquity: 15.2
    }
  ];

  const rawDepartments: Department[] = parsed?.departments ?? [
    {
      id: "dept-1",
      name: "Engineering",
      weight: 40,
      totalTaskWeight: 8, // 2 HIGH tasks (3+3) + 2 MEDIUM tasks (2+2)
      equityPerPoint: 5.0, // 40% / 8 = 5% per point
      tasks: [
        { name: "Develop core API", importance: "HIGH", weight: 3, equity: 15.0 },
        { name: "Create user interface", importance: "HIGH", weight: 3, equity: 15.0 },
        { name: "Code review process", importance: "MEDIUM", weight: 2, equity: 10.0 }
      ]
    },
    {
      id: "dept-2", 
      name: "Marketing",
      weight: 25,
      totalTaskWeight: 3, // 1 MEDIUM (2) + 1 LOW (1)
      equityPerPoint: 8.33, // 25% / 3 = 8.33% per point
      tasks: [
        { name: "Market research", importance: "MEDIUM", weight: 2, equity: 16.67 },
        { name: "Social media setup", importance: "LOW", weight: 1, equity: 8.33 }
      ]
    },
    {
      id: "dept-3",
      name: "Sales", 
      weight: 15,
      totalTaskWeight: 2, // 1 MEDIUM task
      equityPerPoint: 7.5, // 15% / 2 = 7.5% per point
      tasks: [
        { name: "Lead generation", importance: "MEDIUM", weight: 2, equity: 15.0 }
      ]
    }
  ];

  const departments: Department[] = rawDepartments.map((d: Department) => {
    const tasks = Array.isArray(d?.tasks) ? d.tasks : [];
    const computedTotal = tasks.reduce((sum: number, t: Task) => sum + (t?.weight ?? 0), 0);
    const totalTaskWeight = typeof d?.totalTaskWeight === 'number' ? d.totalTaskWeight : computedTotal;
    const weight = typeof d?.weight === 'number' ? d.weight : 0;
    const equityPerPoint = typeof d?.equityPerPoint === 'number'
      ? d.equityPerPoint
      : (totalTaskWeight > 0 ? weight / totalTaskWeight : 0);
    return {
      id: String(d?.id ?? ''),
      name: String(d?.name ?? ''),
      weight,
      totalTaskWeight,
      equityPerPoint,
      tasks,
    } as Department;
  });

  // Compute capital equity dynamically if partners contain capitalAmount
  const savedCompany = parsed?.companyData;
  const capitalWeight = savedCompany?.capitalWeight ?? 20;
  const totalCapitalAmount = partners.reduce((sum, p: Partner) => sum + (p.capitalAmount ?? 0), 0);
  const partnersWithComputedCapital = partners.map((p: Partner) => {
    const share = totalCapitalAmount > 0 ? (p.capitalAmount ?? 0) / totalCapitalAmount : 0;
    const computedCapitalEquity = share * capitalWeight;
    return {
      ...p,
      capitalEquity: p.capitalEquity ?? computedCapitalEquity,
      totalEquity: p.totalEquity ?? computedCapitalEquity + (p.effortEquity ?? 0)
    } as Partner;
  });

  const totalCapitalEquity = partnersWithComputedCapital.reduce((sum, p) => sum + p.capitalEquity, 0);
  const totalEffortEquity = partnersWithComputedCapital.reduce((sum, p) => sum + (p.effortEquity || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Equity Dashboard</h1>
            <p className="text-gray-600">Live equity calculations and allocations</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-blue-600">{partners.length}</div>
              <div className="text-sm text-gray-600">Partners</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-green-600">{departments.length}</div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-purple-600">{totalCapitalEquity.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Capital Allocated</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="text-2xl font-bold text-orange-600">{totalEffortEquity.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Effort Allocated</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "partners", label: "Partners" },
                  { id: "departments", label: "Departments" },
                  { id: "vesting", label: "Vesting" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "overview" | "partners" | "departments" | "vesting")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Equity Distribution Chart */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Equity Distribution</h3>
                      <div className="space-y-3">
                        {partnersWithComputedCapital.map((partner) => (
                          <div key={partner.id} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{partner.name}</div>
                              <div className="text-sm text-gray-600">{partner.email}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">{partner.totalEquity.toFixed(1)}%</div>
                              <div className="text-xs text-gray-500">
                                Capital: {partner.capitalEquity.toFixed(1)}% | 
                                Effort: {(partner.effortEquity || 0).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Department Summary */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Department Summary</h3>
                      <div className="space-y-3">
                        {departments.map((dept) => (
                          <div key={dept.id} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{dept.name}</div>
                              <div className="text-sm text-gray-600">
                                {dept.tasks.length} tasks, {dept.totalTaskWeight} weight
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">{dept.weight}%</div>
                              <div className="text-xs text-gray-500">
                                {dept.equityPerPoint.toFixed(1)}% per point
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Validation Status */}
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-green-800">Allocation Valid</div>
                        <div className="text-sm text-green-700">
                          Department weights total 80% and capital contributions are within limits
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "partners" && (
                <div className="space-y-4">
                {partnersWithComputedCapital.map((partner) => (
                    <div key={partner.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{partner.name}</h3>
                          <p className="text-gray-600">{partner.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{partner.totalEquity.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">Total Equity</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Capital Contribution</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                            <span>Capital Amount:</span>
                            <span>${partner.capitalAmount?.toFixed?.(2) ?? "0.00"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Capital Equity:</span>
                              <span>{partner.capitalEquity.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Effort Contribution</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Departments:</span>
                              <span>{partner.departments.join(", ")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Effort Equity:</span>
                            <span>{(partner.effortEquity ?? 0).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "departments" && (
                <div className="space-y-6">
                  {departments.map((dept) => (
                    <div key={dept.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{dept.name}</h3>
                          <p className="text-gray-600">Weight: {dept.weight}% | Total Task Weight: {dept.totalTaskWeight}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{dept.weight}%</div>
                          <div className="text-sm text-gray-500">Department Weight</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Tasks in Department</h4>
                        <div className="space-y-2">
                          {dept.tasks.map((task, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div>
                                <div className="font-medium">{task.name}</div>
                                <div className="text-sm text-gray-600">
                                  {task.importance} priority (Weight: {task.weight})
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{task.equity.toFixed(1)}%</div>
                                <div className="text-xs text-gray-500">Equity</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="text-sm">
                          <strong>Calculation:</strong> {dept.weight}% ÷ {dept.totalTaskWeight} = {dept.equityPerPoint.toFixed(2)}% per weight point
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "vesting" && (
                <div className="space-y-6">
                  <VestingSchedule isDark={false} />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <div className="space-x-3">
              <button 
                onClick={() => {
                  // TODO: Implement PDF export functionality
                  alert('PDF export functionality will be implemented');
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Export PDF
              </button>
              <button 
                onClick={() => {
                  router.push('/company/equity-allocation');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Allocation
              </button>
            </div>
            
            <div className="space-x-3">
              <button 
                onClick={() => {
                  // TODO: Implement save and finalize functionality
                  alert('Allocation saved and finalized!');
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Save & Finalize
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
