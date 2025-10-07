"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function Dashboard() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  // Mock data
  const [companyData, setCompanyData] = useState({
    name: "TechCorp Inc.",
    capitalWeight: 20,
    effortWeight: 80,
    totalShares: 1000000,
    vestingPeriod: 48,
  });

  const [departments, setDepartments] = useState([
    { id: 1, name: "Engineering", weight: 40 },
    { id: 2, name: "Marketing", weight: 25 },
    { id: 3, name: "Sales", weight: 15 },
  ]);

  const [partners, setPartners] = useState([
    { id: 1, name: "Mohammed Alojayan", email: "mohammed.alojayan@example.com", capitalAmount: 150, departments: ["Engineering"] },
    { id: 2, name: "Ali Bohulaiqa", email: "ali.bohulaiqa@example.com", capitalAmount: 50, departments: ["Marketing", "Sales"] },
    { id: 3, name: "Abdullah Alsaeed", email: "abdullah.alsaeed@example.com", capitalAmount: 0, departments: ["Sales"] },
    { id: 4, name: "Mohammed Dhabab", email: "mohammed.dhabab@example.com", capitalAmount: 0, departments: ["Sales"] },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, name: "Develop API", department: "Engineering", importance: "HIGH", weight: 3, assignedPartners: [] as number[] },
    { id: 2, name: "Market Research", department: "Marketing", importance: "MEDIUM", weight: 2, assignedPartners: [] as number[] },
    { id: 3, name: "Lead Generation", department: "Sales", importance: "HIGH", weight: 3, assignedPartners: [] as number[] },
  ]);

  // Task inline state
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", description: "", importance: "MEDIUM", department: "", assignedPartners: [] as number[] });
  const departmentNames = departments.map((d) => d.name);
  const importanceWeights = { LOW: 1, MEDIUM: 2, HIGH: 3 } as const;

  const addTask = () => {
    if (!newTask.name.trim() || !newTask.department.trim()) return;
    const nextId = Math.max(0, ...tasks.map((t) => (typeof t.id === "number" ? t.id : Number(t.id) || 0))) + 1;
    setTasks([
      ...tasks,
      {
        id: nextId,
        name: newTask.name.trim(),
        department: newTask.department,
        importance: newTask.importance as "LOW" | "MEDIUM" | "HIGH",
        weight: importanceWeights[newTask.importance as keyof typeof importanceWeights],
        assignedPartners: newTask.assignedPartners,
        ...(newTask.description ? { description: newTask.description } : {}),
      },
    ]);
    setNewTask({ name: "", description: "", importance: "MEDIUM", department: "", assignedPartners: [] });
    setShowAddTaskForm(false);
  };

  const removeTaskById = (id: number | string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const moveTaskToDepartment = (id: number | string, dept: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, department: dept } : t)));
  };

  const getAvailablePartnersForDepartment = (department: string) => {
    return partners.filter(partner => 
      partner.departments.includes(department)
    );
  };

  const togglePartnerSelection = (partnerId: number) => {
    setNewTask(prev => ({
      ...prev,
      assignedPartners: prev.assignedPartners.includes(partnerId)
        ? prev.assignedPartners.filter(id => id !== partnerId)
        : [...prev.assignedPartners, partnerId]
    }));
  };

  // Inline add forms state
  const [showAddDepartmentForm, setShowAddDepartmentForm] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: "", weight: 0 });
  const [showAddPartnerForm, setShowAddPartnerForm] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", email: "", capitalAmount: 0, departments: [] as string[] });
  const [editingPartner, setEditingPartner] = useState<number | null>(null);

  const addDepartment = () => {
    if (!newDepartment.name.trim()) return;
    const id = Math.max(0, ...departments.map((d) => Number(d.id) || 0)) + 1;
    setDepartments([...departments, { id, name: newDepartment.name.trim(), weight: newDepartment.weight }]);
    setNewDepartment({ name: "", weight: 0 });
    setShowAddDepartmentForm(false);
  };

  const removeDepartmentById = (id: number) => {
    setDepartments(departments.filter((d) => d.id !== id));
  };

  const addPartner = () => {
    if (!newPartner.name.trim() || !newPartner.email.trim()) return;
    const id = Math.max(0, ...partners.map((p) => Number(p.id) || 0)) + 1;
    setPartners([
      ...partners,
      {
        id,
        name: newPartner.name.trim(),
        email: newPartner.email.trim(),
        capitalAmount: newPartner.capitalAmount,
        departments: newPartner.departments,
      },
    ]);
    setNewPartner({ name: "", email: "", capitalAmount: 0, departments: [] });
    setShowAddPartnerForm(false);
  };

  const removePartnerById = (id: number) => {
    setPartners(partners.filter((p) => p.id !== id));
  };

  const updatePartner = (id: number, updates: any) => {
    setPartners(partners.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const togglePartnerDepartment = (partnerId: number, department: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;
    
    const currentDepartments = partner.departments || [];
    const isAssigned = currentDepartments.includes(department);
    
    const updatedDepartments = isAssigned
      ? currentDepartments.filter(d => d !== department)
      : [...currentDepartments, department];
    
    updatePartner(partnerId, { departments: updatedDepartments });
  };

  const saveStateToStorage = () => {
    try {
      const state = {
        companyData,
        departments,
        partners,
        tasks,
      };
      localStorage.setItem("cq_state", JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save state", err);
    }
  };

  const totalDepartmentWeight = departments.reduce((sum, dept) => sum + dept.weight, 0);
  const totalCapitalAmount = partners.reduce((sum, partner) => sum + (partner.capitalAmount || 0), 0);
  const isAllocationValid =
    Math.abs(totalDepartmentWeight - companyData.effortWeight) < 0.01 && (partners.length === 0 || totalCapitalAmount > 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">CorporateQuota</div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Home
            </a>
            <a href="/reports" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Reports
            </a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Management Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">All-in-one equity management platform</p>
        </div>

        {/* Bento Grid Layout - Removed fixed height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Company Setup - lg:col-span-3 */}
          <div
            className={`lg:col-span-3 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
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
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Shares</label>
                <input
                  type="number"
                  value={companyData.totalShares || ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setCompanyData({ ...companyData, totalShares: isNaN(value) ? 0 : value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vesting Period (months)</label>
                <input
                  type="number"
                  value={companyData.vestingPeriod || ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setCompanyData({ ...companyData, vestingPeriod: isNaN(value) ? 0 : value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Capital vs Effort Split - lg:col-span-6 */}
          <div
            className={`lg:col-span-6 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
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
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setCompanyData({
                        ...companyData,
                        capitalWeight: value,
                        effortWeight: 100 - value,
                      });
                    }
                  }}
                  className="w-full"
                />
              </div>

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

          {/* Quick Insights - lg:col-span-3 */}
          <div
            className={`lg:col-span-3 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
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
                <div className={`text-3xl font-bold ${isAllocationValid ? "text-green-600" : "text-red-600"}`}>
                  {isAllocationValid ? "✓" : "⚠"}
                </div>
                <div className="text-sm text-gray-500">Allocation Valid</div>
              </div>
            </div>
          </div>

          {/* Department Management - lg:col-span-6 */}
          <div
            className={`lg:col-span-6 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
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
                      value={dept.weight || ""}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setDepartments(
                          departments.map((d) => (d.id === dept.id ? { ...d, weight: isNaN(value) ? 0 : value } : d))
                        );
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                    />
                    <button
                      onClick={() => removeDepartmentById(dept.id as number)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {!showAddDepartmentForm ? (
                <button
                  onClick={() => setShowAddDepartmentForm(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  + Add Department
                </button>
              ) : (
                <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Department name"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Weight"
                      value={newDepartment.weight || ""}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setNewDepartment({ ...newDepartment, weight: isNaN(value) ? 0 : value });
                      }}
                      className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowAddDepartmentForm(false);
                        setNewDepartment({ name: "", weight: 0 });
                      }}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      Cancel
                    </button>
                    <button onClick={addDepartment} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div
                className={`text-sm p-2 rounded ${
                  Math.abs(totalDepartmentWeight - companyData.effortWeight) < 0.01
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                }`}
              >
                Total: {totalDepartmentWeight}% (Expected: {companyData.effortWeight}%)
              </div>
            </div>
          </div>

          {/* Partner Management - lg:col-span-6 */}
          <div
            className={`lg:col-span-6 rounded-2xl border-2 p-6 transition-all duration-300 ${
              isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Partner Management</h2>
              <div className="text-2xl">👥</div>
            </div>

            <div className="space-y-4">
              {partners.map((partner) => (
                <div key={partner.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{partner.name}</div>
                      <div className="text-sm text-gray-500">{partner.email}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingPartner(editingPartner === partner.id ? null : partner.id as number)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {editingPartner === partner.id ? "Cancel" : "Edit"}
                      </button>
                      <button
                        onClick={() => removePartnerById(partner.id as number)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {/* Normal Display */}
                  {editingPartner !== partner.id && (
                    <>
                      {/* Capital Amount Display */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm font-medium">${partner.capitalAmount || 0}</span>
                        <span className="text-sm text-gray-500">Capital Amount</span>
                      </div>

                      {/* Department Display */}
                      {(partner.departments || []).length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">Assigned to:</div>
                          <div className="flex flex-wrap gap-1">
                            {(partner.departments || []).map(dept => (
                              <span key={dept} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Edit Mode */}
                  {editingPartner === partner.id && (
                    <div className="space-y-3">
                      {/* Name and Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Full name"
                          value={partner.name}
                          onChange={(e) => updatePartner(partner.id as number, { name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={partner.email}
                          onChange={(e) => updatePartner(partner.id as number, { email: e.target.value })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                        />
                      </div>

                      {/* Capital Amount */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="$ Amount"
                          value={partner.capitalAmount || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            updatePartner(partner.id as number, { capitalAmount: isNaN(value) ? 0 : value });
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                        />
                        <span className="text-sm text-gray-500">Capital Amount</span>
                      </div>

                      {/* Department Assignment */}
                      <div>
                        <div className="text-sm font-medium mb-2">Assign to Departments:</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {departmentNames.map(dept => {
                            const isAssigned = (partner.departments || []).includes(dept);
                            return (
                              <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => togglePartnerDepartment(partner.id as number, dept)}
                                  className="rounded"
                                />
                                <span className="text-sm">{dept}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {!showAddPartnerForm ? (
                <button
                  onClick={() => setShowAddPartnerForm(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  + Add Partner
                </button>
              ) : (
                <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newPartner.email}
                      onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="$ Amount"
                      value={newPartner.capitalAmount || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setNewPartner({ ...newPartner, capitalAmount: isNaN(value) ? 0 : value });
                      }}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-transparent"
                    />
                  </div>
                  
                  {/* Department Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Assign to Departments:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {departmentNames.map(dept => (
                        <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newPartner.departments.includes(dept)}
                            onChange={(e) => {
                              const departments = e.target.checked
                                ? [...newPartner.departments, dept]
                                : newPartner.departments.filter(d => d !== dept);
                              setNewPartner({ ...newPartner, departments });
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowAddPartnerForm(false);
                        setNewPartner({ name: "", email: "", capitalAmount: 0, departments: [] });
                      }}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      Cancel
                    </button>
                    <button onClick={addPartner} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className="text-sm p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                Total Capital Committed: ${totalCapitalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Task Management -- MOVED OUTSIDE of the fixed grid for flexibility */}
        <section
          id="tasks"
          className={`mt-8 rounded-2xl border-2 p-6 transition-all duration-300 ${
            isDark
              ? "bg-gray-800 border-gray-700 hover:border-gray-600"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Task Management</h2>
            <div className="text-2xl">🧩</div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Total: {tasks.length} tasks · High Priority: {tasks.filter((t) => t.importance === "HIGH").length}
            </div>
            {!showAddTaskForm && (
              <button
                onClick={() => setShowAddTaskForm(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                + Add Task
              </button>
            )}
          </div>

          {showAddTaskForm && (
            <div className="p-4 mb-4 border-2 border-dashed rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="px-3 py-2 border rounded-md bg-transparent"
                />
                <select
                  value={newTask.department}
                  onChange={(e) => setNewTask({ ...newTask, department: e.target.value, assignedPartners: [] })}
                  className="px-3 py-2 border rounded-md bg-transparent"
                >
                  <option value="">Select department</option>
                  {departmentNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  value={newTask.importance}
                  onChange={(e) => setNewTask({ ...newTask, importance: e.target.value as "LOW" | "MEDIUM" | "HIGH" })}
                  className="px-3 py-2 border rounded-md bg-transparent"
                >
                  <option value="LOW">Low (Weight: 1)</option>
                  <option value="MEDIUM">Medium (Weight: 2)</option>
                  <option value="HIGH">High (Weight: 3)</option>
                </select>
              </div>
              
              {/* Partner Selection */}
              {newTask.department && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Assign Partners:</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                    {getAvailablePartnersForDepartment(newTask.department).map(partner => (
                      <label key={partner.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTask.assignedPartners.includes(partner.id as number)}
                          onChange={() => togglePartnerSelection(partner.id as number)}
                          className="rounded"
                        />
                        <span className="text-sm">{partner.name}</span>
                      </label>
                    ))}
                    {getAvailablePartnersForDepartment(newTask.department).length === 0 && (
                      <div className="text-sm text-gray-500 col-span-2">No partners available for this department</div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-3 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAddTaskForm(false);
                    setNewTask({ name: "", description: "", importance: "MEDIUM", department: "", assignedPartners: [] });
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button onClick={addTask} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {tasks.map((task) => {
              const assignedPartners = task.assignedPartners 
                ? partners.filter(p => task.assignedPartners.includes(p.id as number))
                : [];
              
              return (
                <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{task.name}</div>
                      <div className="text-xs text-gray-500">Department: {task.department}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          task.importance === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : task.importance === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.importance}
                      </span>
                      <span className="text-xs text-gray-600">Weight: {task.weight}</span>
                      <select
                        value={task.department}
                        onChange={(e) => moveTaskToDepartment(task.id as number, e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-transparent"
                      >
                        {departmentNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => removeTaskById(task.id as number)} className="text-red-600 hover:text-red-800 text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Assigned Partners */}
                  {assignedPartners.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-xs text-gray-500 mb-1">Assigned Partners:</div>
                      <div className="flex flex-wrap gap-1">
                        {assignedPartners.map(partner => (
                          <span key={partner.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {partner.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => {
              saveStateToStorage();
              alert("Draft saved successfully!");
            }}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => {
              router.push("/reports");
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}